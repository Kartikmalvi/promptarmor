import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Use VITE_API_BASE_URL if provided (for production), otherwise default to local backend
  const targetUrl = env.VITE_API_BASE_URL || 'http://localhost:8001'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
