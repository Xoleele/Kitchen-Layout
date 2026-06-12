import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Kitchen-Layout/',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
})
