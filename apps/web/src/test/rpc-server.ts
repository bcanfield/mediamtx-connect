import type { contract } from '@connect/contract'
import type { InferContractRouterInputs } from '@orpc/contract'
import { contract as appContract } from '@connect/contract'
import { implement } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// A stub API the component tests drive, wired through the SAME RPCHandler the
// real server uses. Hand-writing oRPC wire payloads in MSW handlers would be
// both fiddly and a lie — this way the client's serialization, the contract's
// Zod validation, and the procedure paths are all the real ones, and a contract
// change fails these tests at typecheck rather than silently leaving them
// asserting a shape the API no longer returns.
/**
 * Exported so a test's `toHaveBeenCalledWith` literal is checked too, not just
 *  the component that calls the procedure.
 */
export type RpcInputs = InferContractRouterInputs<typeof contract>
type Inputs = RpcInputs

const os = implement(appContract)

const APP_CONFIG = {
  mediaMtxUrl: 'http://127.0.0.1',
  mediaMtxApiPort: 9997,
  remoteMediaMtxUrl: 'http://localhost',
  recordingsDirectory: '/recordings',
  screenshotsDirectory: '/screenshots',
}

export interface StubApi {
  streamsList: () => unknown
  snapshot?: (input: Inputs['streams']['snapshot']) => void
  updatePathConfig?: (input: Inputs['config']['mediamtx']['updatePathConfig']) => void
  /** The effective config a path resolves to — `{confName, conf}`, or null. */
  pathConfig?: () => unknown
  deletePathConfig?: (input: Inputs['config']['mediamtx']['deletePathConfig']) => void
  /** One summary per stream that has recordings. Defaults to none. */
  recordingStreams?: () => unknown
  /** A page of recordings for one stream. Defaults to none. */
  recordingsForStream?: (input: Inputs['recordings']['listForStream']) => unknown
  /** Server-wide MediaMTX config, or null when it can't be read. */
  globalConfig?: () => unknown
  updateGlobalConfig?: (input: Inputs['config']['mediamtx']['updateGlobal']) => void
  pathDefaults?: () => unknown
  updatePathDefaults?: (input: Inputs['config']['mediamtx']['updatePathDefaults']) => void
  appConfig?: () => unknown
  updateAppConfig?: (input: Inputs['config']['app']['update']) => void
}

/**
 * Starts an MSW server serving `/rpc/*` from `stub`. Call in `beforeAll`;
 * the returned handle resets between tests.
 */
export function createRpcServer(stub: StubApi) {
  const router = os.router({
    health: os.health.handler(() => ({ status: 'ok' as const, uptime: 0 })),
    streams: {
      list: os.streams.list.handler(() => stub.streamsList() as never),
      snapshot: os.streams.snapshot.handler(({ input }) => {
        stub.snapshot?.(input)
      }),
    },
    recordings: {
      listStreams: os.recordings.listStreams.handler(
        () => (stub.recordingStreams?.() ?? []) as never,
      ),
      listForStream: os.recordings.listForStream.handler(
        ({ input }) =>
          (stub.recordingsForStream?.(input) ?? { recordings: [], totalCount: 0 }) as never,
      ),
    },
    config: {
      app: {
        get: os.config.app.get.handler(() => (stub.appConfig?.() ?? APP_CONFIG) as never),
        update: os.config.app.update.handler(({ input }) => {
          stub.updateAppConfig?.(input)
          return input
        }),
      },
      mediamtx: {
        getGlobal: os.config.mediamtx.getGlobal.handler(
          () => (stub.globalConfig?.() ?? null) as never,
        ),
        updateGlobal: os.config.mediamtx.updateGlobal.handler(({ input }) => {
          stub.updateGlobalConfig?.(input)
        }),
        getPathDefaults: os.config.mediamtx.getPathDefaults.handler(
          () => (stub.pathDefaults?.() ?? null) as never,
        ),
        updatePathDefaults: os.config.mediamtx.updatePathDefaults.handler(({ input }) => {
          stub.updatePathDefaults?.(input)
        }),
        getPathConfig: os.config.mediamtx.getPathConfig.handler(
          () => (stub.pathConfig?.() ?? null) as never,
        ),
        updatePathConfig: os.config.mediamtx.updatePathConfig.handler(({ input }) => {
          stub.updatePathConfig?.(input)
        }),
        deletePathConfig: os.config.mediamtx.deletePathConfig.handler(({ input }) => {
          stub.deletePathConfig?.(input)
        }),
      },
    },
  })

  const handler = new RPCHandler(router)

  return setupServer(
    http.all('*/rpc/*', async ({ request }) => {
      const { matched, response } = await handler.handle(request, { prefix: '/rpc' })
      return matched ? response : HttpResponse.json({ error: 'no match' }, { status: 404 })
    }),
  )
}
