import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { RPCHandler } from '@orpc/server/fetch'
import { Hono } from 'hono'
import { bootstrapConfig, getAppConfig } from './config-store'
import { env } from './env'
import { startJobs } from './jobs'
import { logger } from './logger'
import { media } from './media'
import { router } from './router'

const app = new Hono()

// Plain-HTTP health endpoint for the Docker HEALTHCHECK; the config file
// stands in for the old DB connectivity check.
app.get('/api/health', async (c) => {
  try {
    await getAppConfig()
    return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
  }
  catch (error) {
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 503)
  }
})

const rpcHandler = new RPCHandler(router)

app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
  })
  if (matched)
    return c.newResponse(response.body, response)
  await next()
})

app.route('/media', media)

// resolves to apps/api/public in dev (tsx) and /app/public in the image —
// both are dist|src/../public, independent of CWD
const staticRoot = fileURLToPath(new URL('../public', import.meta.url))
app.use('*', serveStatic({ root: staticRoot }))
// SPA fallback: unknown paths get index.html so client-side routes resolve
app.get(
  '*',
  serveStatic({ root: staticRoot, rewriteRequestPath: () => '/index.html' }),
)

async function main() {
  await bootstrapConfig()
  startJobs()
  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    logger.info(`api listening on http://localhost:${info.port}`)
  })
}

main().catch((error) => {
  logger.error({ err: error }, 'Failed to start server')
  process.exit(1)
})
