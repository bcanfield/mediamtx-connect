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
		// Client-side route (e.g. /streams/garage-cam) — let the router handle it.
		http.ServeFileFS(w, r, dist, "index.html")
	})
}
