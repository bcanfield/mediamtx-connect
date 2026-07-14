package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/humacli"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/spf13/cobra"

	"github.com/bcanfield/optimal-stack-showcase/internal/api"
	"github.com/bcanfield/optimal-stack-showcase/internal/web"
)

// Options can be set via CLI flags or SERVICE_* env vars (humacli).
type Options struct {
	Port int `help:"Port to listen on" short:"p" default:"8080"`
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	// Captured so the `openapi` subcommand can dump the spec without starting the server.
	var apiInst huma.API

	cli := humacli.New(func(hooks humacli.Hooks, options *Options) {
		router := chi.NewMux()
		router.Use(middleware.Recoverer)

		apiInst = api.New(router, api.NewStore(api.DemoStreams()...))

		// Anything that isn't /api, /docs, or /openapi.* falls through to the SPA.
		router.Handle("/*", web.SPAHandler())

		server := &http.Server{
			Addr:              fmt.Sprintf(":%d", options.Port),
			Handler:           router,
			ReadHeaderTimeout: 10 * time.Second,
		}

		hooks.OnStart(func() {
			logger.Info("listening", "port", options.Port)
			if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
				logger.Error("server failed", "error", err)
				os.Exit(1)
			}
		})
		hooks.OnStop(func() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_ = server.Shutdown(ctx)
		})
	})

	cli.Root().AddCommand(&cobra.Command{
		Use:   "openapi",
		Short: "Print the OpenAPI 3.1 spec as YAML",
		Run: func(cmd *cobra.Command, args []string) {
			b, err := apiInst.OpenAPI().YAML()
			if err != nil {
				logger.Error("marshal spec", "error", err)
				os.Exit(1)
			}
			fmt.Println(string(b))
		},
	})

	cli.Root().AddCommand(&cobra.Command{
		Use:   "healthcheck",
		Short: "Exit 0 if the server on localhost is healthy (container HEALTHCHECK)",
		Run: func(cmd *cobra.Command, args []string) {
			port := os.Getenv("SERVICE_PORT")
			if port == "" {
				port = "8080"
			}
			resp, err := http.Get(fmt.Sprintf("http://127.0.0.1:%s/api/health", port))
			if err != nil || resp.StatusCode != http.StatusOK {
				os.Exit(1)
			}
			resp.Body.Close()
		},
	})

	cli.Run()
}
