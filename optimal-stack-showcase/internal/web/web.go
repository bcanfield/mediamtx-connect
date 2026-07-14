// Package web embeds the built SPA (web/ -> vite build -> dist/) and serves
// it with an index.html fallback for client-side routes.
package web

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed all:dist
var distFS embed.FS

func SPAHandler() http.Handler {
	dist, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic(err)
	}
	fileServer := http.FileServerFS(dist)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path != "" {
			if _, statErr := fs.Stat(dist, path); statErr == nil {
				fileServer.ServeHTTP(w, r)
				return
			}
		}
		// API routes live on the parent router; anything /api-shaped reaching
		// this fallback is an unknown endpoint, not a client-side route.
		if r.URL.Path == "/api" || strings.HasPrefix(r.URL.Path, "/api/") {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(`{"title":"Not Found","status":404}`))
			return
		}
		// Client-side route (e.g. /streams/garage-cam) — let the router handle it.
		http.ServeFileFS(w, r, dist, "index.html")
	})
}
