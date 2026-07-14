# syntax=docker/dockerfile:1

# 1) Build the SPA — architecture-independent (just JS).
#    vite.config.ts writes to ../internal/web/dist, i.e. /internal/web/dist here.
FROM node:24-alpine AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
RUN npm run build

# 2) Build the Go binary, embedding the SPA. Runs natively, cross-compiles.
FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=web /internal/web/dist ./internal/web/dist
ARG TARGETOS TARGETARCH
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# 3) Runtime — the binary is the entrypoint, self-healthchecks, no shell needed.
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/server /server
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD ["/server", "healthcheck"]
ENTRYPOINT ["/server"]
