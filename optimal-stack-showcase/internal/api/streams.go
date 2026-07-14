// Package api defines the HTTP API: models, the stream store, and the Huma
// operation registrations that produce the OpenAPI spec. The store is
// in-memory to keep the showcase minimal, but its methods are already
// adapter-shaped (ctx in, error out) so modernc.org/sqlite + sqlc can slot in
// behind the same handlers.
package api

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"sync"

	"github.com/danielgtaylor/huma/v2"
)

// Store outcomes the handlers translate into HTTP statuses. A future sqlite
// adapter must return these same sentinels (e.g. mapping a UNIQUE constraint
// failure to ErrExists).
var (
	ErrExists   = errors.New("stream already exists")
	ErrNotFound = errors.New("stream not found")
)

type Stream struct {
	Name    string `json:"name" example:"garage-cam" doc:"Unique stream path name"`
	Source  string `json:"source" example:"rtsp://camera.local:554/stream1" doc:"Source URL the stream ingests from" format:"uri"`
	Ready   bool   `json:"ready" doc:"Whether the source is currently publishing"`
	Readers int    `json:"readers" doc:"Number of connected readers"`
}

type HealthOutput struct {
	Body struct {
		Status string `json:"status" example:"ok" doc:"Service status"`
	}
}

type ListStreamsOutput struct {
	Body struct {
		// nullable:false — the handler always returns a non-nil slice
		Streams []Stream `json:"streams" nullable:"false" doc:"All known streams"`
	}
}

type GetStreamOutput struct {
	Body Stream
}

type CreateStreamInput struct {
	Body struct {
		Name   string `json:"name" minLength:"1" maxLength:"64" pattern:"^[a-z0-9][a-z0-9-]*$" example:"porch-cam" doc:"Unique stream path name"`
		Source string `json:"source" format:"uri" example:"rtsp://camera.local:554/stream3" doc:"Source URL to ingest from"`
	}
}

// Store is the in-memory stream store. Deliberately a concrete type: the seam
// gets a Go interface when a second adapter (sqlite + sqlc) actually exists.
type Store struct {
	mu      sync.RWMutex
	streams map[string]Stream
}

func NewStore(seed ...Stream) *Store {
	s := &Store{streams: make(map[string]Stream, len(seed))}
	for _, st := range seed {
		s.streams[st.Name] = st
	}
	return s
}

// DemoStreams is the seed data the server ships with.
func DemoStreams() []Stream {
	return []Stream{
		{Name: "garage-cam", Source: "rtsp://camera.local:554/stream1", Ready: true, Readers: 2},
		{Name: "driveway-cam", Source: "rtsp://camera.local:554/stream2", Ready: false, Readers: 0},
	}
}

func (s *Store) list(_ context.Context) ([]Stream, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Stream, 0, len(s.streams))
	for _, st := range s.streams {
		out = append(out, st)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out, nil
}

func (s *Store) get(_ context.Context, name string) (Stream, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	st, ok := s.streams[name]
	if !ok {
		return Stream{}, ErrNotFound
	}
	return st, nil
}

func (s *Store) put(_ context.Context, st Stream) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.streams[st.Name]; exists {
		return ErrExists
	}
	s.streams[st.Name] = st
	return nil
}

func Register(api huma.API, store *Store) {
	huma.Register(api, huma.Operation{
		OperationID: "health-check",
		Method:      http.MethodGet,
		Path:        "/api/health",
		Summary:     "Health check",
		Tags:        []string{"System"},
	}, func(_ context.Context, _ *struct{}) (*HealthOutput, error) {
		out := &HealthOutput{}
		out.Body.Status = "ok"
		return out, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "list-streams",
		Method:      http.MethodGet,
		Path:        "/api/streams",
		Summary:     "List streams",
		Tags:        []string{"Streams"},
	}, func(ctx context.Context, _ *struct{}) (*ListStreamsOutput, error) {
		streams, err := store.list(ctx)
		if err != nil {
			return nil, err
		}
		out := &ListStreamsOutput{}
		out.Body.Streams = streams
		return out, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "get-stream",
		Method:      http.MethodGet,
		Path:        "/api/streams/{name}",
		Summary:     "Get a stream by name",
		Tags:        []string{"Streams"},
		Errors:      []int{http.StatusNotFound},
	}, func(ctx context.Context, input *struct {
		Name string `path:"name" maxLength:"64" example:"garage-cam" doc:"Stream path name"`
	}) (*GetStreamOutput, error) {
		st, err := store.get(ctx, input.Name)
		if errors.Is(err, ErrNotFound) {
			return nil, huma.Error404NotFound(fmt.Sprintf("stream %q not found", input.Name))
		}
		if err != nil {
			return nil, err
		}
		return &GetStreamOutput{Body: st}, nil
	})

	huma.Register(api, huma.Operation{
		OperationID:   "create-stream",
		Method:        http.MethodPost,
		Path:          "/api/streams",
		Summary:       "Create a stream",
		Tags:          []string{"Streams"},
		DefaultStatus: http.StatusCreated,
		Errors:        []int{http.StatusConflict},
	}, func(ctx context.Context, input *CreateStreamInput) (*GetStreamOutput, error) {
		st := Stream{Name: input.Body.Name, Source: input.Body.Source}
		err := store.put(ctx, st)
		if errors.Is(err, ErrExists) {
			return nil, huma.Error409Conflict(fmt.Sprintf("stream %q already exists", input.Body.Name))
		}
		if err != nil {
			return nil, err
		}
		return &GetStreamOutput{Body: st}, nil
	})
}
