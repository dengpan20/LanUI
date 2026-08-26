import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The standalone example has one eagerly loaded entry and no modulepreload graph;
// omitting Vite's unused polyfill keeps the consumer artifact within its fixed cap.
export default defineConfig({ plugins: [vue()],build:{modulePreload:{polyfill:false}} })
