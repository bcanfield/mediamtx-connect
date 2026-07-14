// Package api defines the HTTP API: models, an in-memory store, and the Huma
// operation registrations that produce the OpenAPI spec. The store is
// in-memory to keep the showcase minimal; the real stack swaps in
// modernc.org/sqlite + sqlc behind the same handlers.
package api

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"sync"

	"github.com/danielgtaylor/huma/v2"
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

type memoryStore struct {
	mu      sync.RWMutex
	streams map[string]Stream
}

func newMemoryStore() *memoryStore {
	return &memoryStore{streams: map[string]Stream{
		"garage-cam":   {Name: "garage-cam", Source: "rtsp://camera.local:554/stream1", Ready: true, Readers: 2},
		"driveway-cam": {Name: "driveway-cam", Source: "rtsp://camera.local:554/stream2", Ready: false, Readers: 0},
	}}
}

func (s *memoryStore) list() []Stream {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Stream, 0, len(s.streams))
	for _, st := range s.streams {
		out = append(out, st)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
	return out
}

func (s *memoryStore) get(name string) (Stream, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	st, ok := s.streams[name]
	return st, ok
}

// put returns false if a stream with the same name already exists.
func (s *memoryStore) put(st Stream) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.streams[st.Name]; exists {
		return false
	}
	s.streams[st.Name] = st
	return true
}

func Register(api huma.API) {
	store := newMemoryStore()

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
	}, func(_ context.Context, _ *struct{}) (*ListStreamsOutput, error) {
		out := &ListStreamsOutput{}
		out.Body.Streams = store.list()
		return out, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "get-stream",
		Method:      http.MethodGet,
		Path:        "/api/streams/{name}",
		Summary:     "Get a stream by name",
		Tags:        []string{"Streams"},
		Errors:      []int{http.StatusNotFound},
	}, func(_ context.Context, input *struct {
		Name string `path:"name" maxLength:"64" example:"garage-cam" doc:"Stream path name"`
	}) (*GetStreamOutput, error) {
		st, ok := store.get(input.Name)
		if !ok {
			return nil, huma.Error404NotFound(fmt.Sprintf("stream %q not found", input.Name))
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
	}, func(_ context.Context, input *CreateStreamInput) (*GetStreamOutput, error) {
		st := Stream{Name: input.Body.Name, Source: input.Body.Source}
		if !store.put(st) {
			return nil, huma.Error409Conflict(fmt.Sprintf("stream %q already exists", input.Body.Name))
		}
		return &GetStreamOutput{Body: st}, nil
	})
}
