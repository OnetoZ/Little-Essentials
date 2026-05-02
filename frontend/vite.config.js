import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'react-vendor'
          }
          if (id.includes('/framer-motion/')) return 'motion-vendor'
          if (id.includes('/lucide-react/')) return 'ui-vendor'
          return 'vendor'
        },
      },
    },
    chunkSizeWarningLimit: 600,
    minify: 'oxc',
    sourcemap: false,
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand'],
  },
})
