
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/resident-management-system/',
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses, including localhost and network IP
    port: 5173, // Explicitly set the default port
  }
})
