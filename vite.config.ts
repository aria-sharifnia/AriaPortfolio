import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/react/')) return 'react'
          if (id.includes('react-dom')) return 'react'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('@tanstack/')) return 'tanstack'
          if (id.includes('lucide-react')) return 'icons'
          return 'vendor'
        },
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:1338',
      '/uploads': 'http://localhost:1338',
    },
  },
})
