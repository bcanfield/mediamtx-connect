export async function register() {
  // Node built-ins (fs, path, child_process) and node-cron live in a separate module,
  // imported lazily only in the Node runtime. instrumentation.ts is compiled for every
  // runtime, so the guard keeps the Node-only work out of any non-Node runtime.
  const { env } = await import('@/lib/env')
  if (env.NEXT_RUNTIME === 'nodejs') {
    const { register: registerNode } = await import('@/instrumentation-node')
    await registerNode()
  }
}
