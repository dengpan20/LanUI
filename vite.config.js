import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'index.html'),
        preview: resolve(import.meta.dirname, 'component-preview.html'),
      },
    },
  },
})
