import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Cloudflare Pages serves this app from the root path
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // SPA fallback for react-router client-side routing
  server: {
    historyApiFallback: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
