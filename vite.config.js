import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: 'src/background.js',
        content: 'src/content.js',
        popup: 'popup.html',
        options: 'options.html',
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
  },
})
