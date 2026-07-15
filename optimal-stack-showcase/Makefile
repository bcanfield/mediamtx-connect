# Dev loop: run `make dev-api` and `make dev-web` in two terminals.
# Vite proxies /api -> :8080; air hot-reloads the Go server.

.PHONY: gen gen-openapi gen-types web build dev-api dev-web test lint clean

## Regenerate the API contract: Go structs -> openapi.yaml -> schema.d.ts
gen: gen-openapi gen-types

gen-openapi:
	go run ./cmd/server openapi > openapi.yaml

gen-types: gen-openapi
	cd web && npm run gen:api

## Build the SPA into internal/web/dist (picked up by //go:embed)
web:
	cd web && npm run build
	@touch internal/web/dist/.gitkeep

## Production build: one static binary with the SPA embedded
build: web
	CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o bin/server ./cmd/server

dev-api:
	go tool air

dev-web:
	cd web && npm run dev

test:
	go test ./...

lint:
	golangci-lint run
	cd web && npm run lint

clean:
	rm -rf bin tmp web/node_modules
