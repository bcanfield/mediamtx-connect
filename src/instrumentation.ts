export async function register() {
  // Node built-ins (fs, path, child_process) and node-cron live in a separate
  // module so they're never pulled into the Edge Runtime bundle. instrumentation.ts
  // is compiled for every runtime; the Node-only work is imported lazily here.
  const { env } = await import('@/lib/env')
  if (env.NEXT_RUNTIME === 'nodejs') {
    const { register: registerNode } = await import('@/instrumentation-node')
    await registerNode()
  }
}
