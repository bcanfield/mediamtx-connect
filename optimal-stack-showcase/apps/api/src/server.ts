import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { env } from './env'
import { router } from './router'

const app = new Hono()
app.use(logger())

const rpcHandler = new RPCHandler(router)

app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
  })
  if (matched)
    return c.newResponse(response.body, response)
  await next()
})

// resolves to apps/api/public in dev (tsx) and /app/public in the image —
// both are dist|src/../public, independent of CWD
const staticRoot = fileURLToPath(new URL('../public', import.meta.url))
app.use('*', serveStatic({ root: staticRoot }))
// SPA fallback: unknown paths get index.html so client-side routes resolve
app.get(
  '*',
  serveStatic({ root: staticRoot, rewriteRequestPath: () => '/index.html' }),
)

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  // eslint-disable-next-line no-console
  console.log(`api listening on http://localhost:${info.port}`)
})
