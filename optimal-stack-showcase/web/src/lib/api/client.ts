import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import type { paths } from './schema'

// Same-origin in both dev (Vite proxies /api -> :8080) and prod (the Go
// binary serves the SPA and the API from one port).
const fetchClient = createFetchClient<paths>({ baseUrl: '/' })

export const $api = createClient(fetchClient)
