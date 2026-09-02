import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path must match the GitHub Pages repo name: https://<user>.github.io/HordeShowcase/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/HordeShowcase/' : '/',
  plugins: [react()],
})