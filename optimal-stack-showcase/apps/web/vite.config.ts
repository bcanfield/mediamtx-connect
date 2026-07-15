import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // dev only: prod serves the built SPA from the Hono process itself
      '/rpc': 'http://localhost:3000',
    },
  },
})
