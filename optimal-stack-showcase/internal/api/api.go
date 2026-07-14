package api

import (
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
)

// New builds the Huma API on router and registers all operations. The OpenAPI
// title/version live here so the server and the spec-freshness test render
// the same contract.
func New(router chi.Router, store *Store) huma.API {
	a := humachi.New(router, huma.DefaultConfig("Streams API", "1.0.0"))
	Register(a, store)
	return a
}
