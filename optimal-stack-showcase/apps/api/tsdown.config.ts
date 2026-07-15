import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/server.ts'],
  platform: 'node',
  dts: false,
  deps: {
    // workspace packages export raw .ts, so they must be bundled in;
    // everything else stays external and comes from node_modules
    alwaysBundle: [/^@showcase\//],
    onlyBundle: [/^@showcase\//],
  },
})
