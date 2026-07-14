package api_test

import (
	"bytes"
	"os"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/bcanfield/optimal-stack-showcase/internal/api"
)

// Guards the type-safety seam: the committed openapi.yaml must match what the
// Go structs render, otherwise schema.d.ts — and every tsc check downstream —
// is validating a stale contract.
func TestOpenAPIYAMLIsFresh(t *testing.T) {
	want, err := os.ReadFile("../../openapi.yaml")
	if err != nil {
		t.Fatal(err)
	}
	got, err := api.New(chi.NewMux(), api.NewStore()).OpenAPI().YAML()
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(bytes.TrimSpace(got), bytes.TrimSpace(want)) {
		t.Fatal("openapi.yaml is stale — run: make gen")
	}
}
