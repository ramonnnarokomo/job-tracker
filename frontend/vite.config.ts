import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The Spring Boot backend runs on :8081. Proxying /api avoids CORS in development.
    proxy: {
      '/api': 'http://localhost:8081',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
