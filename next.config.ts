import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    // instrumentation-node.ts uses fs/path/child_process/node-cron. It's only ever
    // imported behind the `NEXT_RUNTIME === 'nodejs'` guard in instrumentation.ts, so
    // the Node built-ins never run in the Edge Runtime. But Next compiles an Edge
    // instrumentation bundle unconditionally and Turbopack traces the dynamic import
    // into it regardless of the guard, emitting a false-positive "not supported in the
    // Edge Runtime" warning on every request. Suppress it for this file only.
    ignoreIssue: [
      { path: '**/instrumentation-node.ts' },
    ],
  },
}

export default withNextIntl(nextConfig)
