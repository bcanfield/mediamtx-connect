# apps/web

Vite + React 19 SPA with TanStack Router (code-based routes in `src/main.tsx`)
and TanStack Query.

- All server data goes through `src/orpc.ts` — use
  `orpc.<procedure>.queryOptions()` / `.mutationOptions()` with
  `useQuery`/`useMutation`. Invalidate with `orpc.<procedure>.key()`.
- No raw `fetch` to the API, no hand-written response types — types flow from
  `@showcase/contract`.
- Dev server proxies `/rpc` to the api app (see `vite.config.ts`); in
  production the api serves this app's `dist/` itself, so all URLs are
  same-origin relative.
