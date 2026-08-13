import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = import.meta.dirname
const registry = readFileSync(resolve(root, 'src/components.js'), 'utf8')
const componentRecords = [...registry.matchAll(/export \{ default as (Ui\w+) \} from '(.+)'/g)]
  .map(([, name, source]) => ({ name, source:resolve(root, 'src', source).replaceAll('\\','/') }))
const generatedEntries = resolve(root, '.verify/component-entries')
mkdirSync(generatedEntries, { recursive:true })
for(const {name,source} of componentRecords){
  writeFileSync(resolve(generatedEntries,`${name}.js`),`export { default, default as ${name} } from ${JSON.stringify(source)}\n`,'utf8')
}
const componentEntries = Object.fromEntries(componentRecords.map(({name}) => [`components/${name}`, resolve(generatedEntries,`${name}.js`)]))
const entries = {
  'lan-ui': resolve(root, 'src/index.js'),
  color: resolve(root, 'src/color.js'),
  config: resolve(root, 'src/config.js'),
  feedback: resolve(root, 'src/feedback.js'),
  plugin: resolve(root, 'src/plugin.js'),
  date: resolve(root, 'src/date.js'),
  icons: resolve(root, 'src/icons.js'),
  ...componentEntries,
}

export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    minify: 'oxc',
    cssMinify: 'lightningcss',
    cssCodeSplit: true,
    lib: { entry: entries, formats: ['es'], cssFileName: 'lan-ui' },
    rollupOptions: {
      external: id => id === 'vue' || id.startsWith('vue/'),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: asset => asset.name?.endsWith('.css') ? 'lan-ui.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
})
