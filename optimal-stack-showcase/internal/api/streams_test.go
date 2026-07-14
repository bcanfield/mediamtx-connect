package api_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/danielgtaylor/huma/v2/humatest"

	"github.com/bcanfield/optimal-stack-showcase/internal/api"
)

func TestStreams(t *testing.T) {
	_, testAPI := humatest.New(t)
	api.Register(testAPI)

	t.Run("list seeded streams", func(t *testing.T) {
		resp := testAPI.Get("/api/streams")
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", resp.Code, resp.Body.String())
		}
		var body struct {
			Streams []api.Stream `json:"streams"`
		}
		if err := json.Unmarshal(resp.Body.Bytes(), &body); err != nil {
			t.Fatal(err)
		}
		if len(body.Streams) != 2 {
			t.Fatalf("expected 2 seeded streams, got %d", len(body.Streams))
		}
	})

	t.Run("get existing stream", func(t *testing.T) {
		resp := testAPI.Get("/api/streams/garage-cam")
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", resp.Code, resp.Body.String())
		}
	})

	t.Run("get missing stream returns 404", func(t *testing.T) {
		resp := testAPI.Get("/api/streams/nope")
		if resp.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", resp.Code)
		}
	})

	t.Run("create then get", func(t *testing.T) {
		resp := testAPI.Post("/api/streams", map[string]any{
			"name":   "porch-cam",
			"source": "rtsp://camera.local:554/stream3",
		})
		if resp.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", resp.Code, resp.Body.String())
		}
		resp = testAPI.Get("/api/streams/porch-cam")
		if resp.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.Code)
		}
	})

	t.Run("duplicate name returns 409", func(t *testing.T) {
		resp := testAPI.Post("/api/streams", map[string]any{
			"name":   "garage-cam",
			"source": "rtsp://camera.local:554/stream1",
		})
		if resp.Code != http.StatusConflict {
			t.Fatalf("expected 409, got %d: %s", resp.Code, resp.Body.String())
		}
	})

	t.Run("invalid name is rejected by schema validation", func(t *testing.T) {
		resp := testAPI.Post("/api/streams", map[string]any{
			"name":   "NOT VALID!",
			"source": "rtsp://camera.local:554/stream4",
		})
		if resp.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422, got %d: %s", resp.Code, resp.Body.String())
		}
	})
}
