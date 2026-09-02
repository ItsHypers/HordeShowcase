import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from custom domain root (teamhorde.com), not a github.io subpath
export default defineConfig({
  base: '/',
  plugins: [react()],
})