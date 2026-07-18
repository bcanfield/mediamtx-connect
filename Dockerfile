# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# Prune the monorepo to just what web + api need (out/json = manifests only,
# out/full = source), so installs cache independently of source changes.
FROM base AS pruner
WORKDIR /repo
COPY . .
RUN pnpm dlx turbo@2 prune @connect/api @connect/web --docker

FROM base AS builder
WORKDIR /repo
COPY --from=pruner /repo/out/json/ .
# hardlinks can't cross the build boundary; a BuildKit cache mount persists the pnpm store
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo build
# hand the SPA build to Hono's serveStatic root
RUN cp -r apps/web/dist apps/api/public
# --legacy: without it, deploy may symlink deps into the store, which the
# runtime image doesn't have (pnpm #9883). Alternative: inject-workspace-packages.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter @connect/api deploy --legacy --prod /prod/api

# node:22-slim instead of distroless: the app shells out to ffmpeg for
# recording thumbnails, and slim gives us a real distro package for it
# (see MIGRATION.md §5 / docs/debt docker-runtime-choice).
FROM node:22-bookworm-slim AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /prod/api /app
# mount points for the MediaMTX recordings/screenshots shares and app data
RUN mkdir -p /recordings /screenshots /data \
  && chown node:node /recordings /screenshots /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "dist/server.mjs"]
