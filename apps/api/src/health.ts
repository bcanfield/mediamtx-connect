import { Hono } from 'hono'
import { getAppConfig } from './config-store'

// Plain-HTTP health endpoint for the Docker HEALTHCHECK; the config file stands
// in for the old DB connectivity check. Its own module so a unit test can call
// it without booting the server (server.ts runs main() at import).
export const health = new Hono()

health.get('/health', async (c) => {
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
