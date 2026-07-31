import type { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

/**
 * Mount the built SPA: real files from `root`, and `index.html` for anything
 * else so client-side routes resolve on a hard refresh or a shared link.
 *
 * Extracted from server.ts so it can be exercised in-process against a fixture
 * root — server.ts runs `main()` on import, so importing it in a test starts a
 * listener and the job crons.
 *
 * Order is the whole behaviour. The static handler must come first or every
 * request gets index.html, including `/assets/index.js`, and the app boots to a
 * blank page while the server reports 200 for everything.
 */
export function mountSpa(app: Hono, root: string) {
  app.use('*', serveStatic({ root }))
  app.get('*', serveStatic({ root, rewriteRequestPath: () => '/index.html' }))
  return app
}
