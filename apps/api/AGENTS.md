# apps/api

Hono on `@hono/node-server` (Node 22). One process serves both the oRPC API
(mounted at `/rpc` via `RPCHandler`) and the SPA build (from `./public`, which
only exists in the Docker image — in dev, Vite serves the frontend).

- Handlers live in `src/router.ts` and implement `@connect/contract` via
  `implement(contract)` — adding an endpoint starts in the contract package.
- `serveStatic` root is resolved with `import.meta.url`, not CWD. Don't change
  this: distroless has no fixed working-directory guarantees.
- Build is tsdown → single ESM file `dist/server.js`; workspace packages are
  bundled in (`noExternal`), npm deps stay external and come from `pnpm deploy`.
- Env access only through `src/env.ts`.
