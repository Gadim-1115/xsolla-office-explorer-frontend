import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Where /api requests go. Default: the Go explorer backend on :8080.
  // To run it on another port (e.g. when the LMS backend needs :8080), put
  // EXPLORER_API_URL=http://localhost:8081 in .env.local (git-ignored).
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.EXPLORER_API_URL || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
