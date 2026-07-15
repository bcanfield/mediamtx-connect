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
RUN pnpm dlx turbo@2 prune @showcase/api @showcase/web --docker

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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter @showcase/api deploy --legacy --prod /prod/api

# Distroless: glibc (matches the -slim build stage), no shell, entrypoint is node.
FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /prod/api /app
EXPOSE 3000
CMD ["dist/server.mjs"]
