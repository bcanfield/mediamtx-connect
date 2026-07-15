import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(srcDir) },
  },
  server: {
    proxy: {
      // dev only: prod serves the built SPA from the Hono process itself
      '/rpc': 'http://localhost:3000',
      '/media': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
    },
  },
})
