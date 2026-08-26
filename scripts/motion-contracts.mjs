import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  MOTION_PREFERENCES,
  createMotionController,
  motionPreferenceToStyle,
  normalizeMotionPreference,
  resolveMotionPreference,
} from '../src/motion.js'

assert.deepEqual(MOTION_PREFERENCES,['full','reduced','system'])
assert.equal(normalizeMotionPreference(' REDUCED '),'reduced')
assert.equal(normalizeMotionPreference('unknown',{strict:false,fallback:'full'}),'full')
assert.throws(()=>normalizeMotionPreference('instant'),/Unsupported motion preference/)
assert.equal(resolveMotionPreference('system',true),'reduced')
assert.equal(resolveMotionPreference('system',false),'full')
assert.deepEqual(motionPreferenceToStyle('full'),{})
assert.deepEqual(motionPreferenceToStyle('reduced'),{'--motion-time':'.01ms','--motion-count':1,'--motion-scroll':'auto'})
assert.ok(Object.isFrozen(motionPreferenceToStyle('reduced')))

const stored=new Map([['fixture-motion','system']])
const storage={getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)}
const mediaListeners=new Set()
const media={matches:true,addEventListener:(_type,listener)=>mediaListeners.add(listener),removeEventListener:(_type,listener)=>mediaListeners.delete(listener)}
const attributes=new Map([['data-ui-motion','legacy']])
const target={
  getAttribute:name=>attributes.get(name)??null,
  setAttribute:(name,value)=>attributes.set(name,value),
  removeAttribute:name=>attributes.delete(name),
}
const states=[]
const controller=createMotionController({preference:'full',storageKey:'fixture-motion',storage,matchMedia:()=>media,target})
controller.subscribe(state=>states.push(`${state.reason}:${state.preference}:${state.resolvedPreference}`))
assert.equal(controller.mount().resolvedPreference,'reduced')
assert.equal(attributes.get('data-ui-motion-preference'),'system')
assert.equal(attributes.get('data-ui-motion'),'reduced')
controller.setPreference('full')
assert.equal(stored.get('fixture-motion'),'full')
assert.equal(attributes.get('data-ui-motion'),'full')
controller.setPreference('system')
media.matches=false
for(const listener of mediaListeners)listener({matches:false})
assert.equal(controller.resolvedPreference,'full')
media.matches=true
for(const listener of mediaListeners)listener({matches:true})
assert.equal(controller.resolvedPreference,'reduced')
controller.toggle()
assert.equal(controller.preference,'full')
assert.equal(mediaListeners.size,1)
controller.dispose()
assert.equal(mediaListeners.size,0)
assert.equal(attributes.get('data-ui-motion'),'legacy')
assert.equal(attributes.has('data-ui-motion-preference'),false)
assert.throws(()=>controller.setPreference('reduced'),/disposed/)
assert.ok(states.includes('system:system:reduced'))

const ssr=createMotionController({preference:'system',storage:null,matchMedia:null})
assert.equal(ssr.resolvedPreference,'full')
assert.equal(ssr.mount(null).resolvedPreference,'full')
ssr.dispose()

const [css,provider,form,scope,plugin]=await Promise.all([
  readFile(new URL('../styles.css',import.meta.url),'utf8'),
  readFile(new URL('../src/components/UiConfigProvider.vue',import.meta.url),'utf8'),
  readFile(new URL('../src/components/UiForm.vue',import.meta.url),'utf8'),
  readFile(new URL('../src/theme-scope.js',import.meta.url),'utf8'),
  readFile(new URL('../src/plugin.js',import.meta.url),'utf8'),
])
assert.equal((css.match(/prefers-reduced-motion/g)||[]).length,11)
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.ui-carousel-track'))
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.ui-barcode-spinner'))
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.ui-cron-preset'))
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.ui-key-value-row'))
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.ui-tree-trigger'))
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.ui-cascader-trigger'))
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.ui-pagination .page-number'))
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.ui-table-row'))
for(const marker of [':root:not([data-ui-motion])','[data-ui-motion="full"]','[data-ui-motion="reduced"]','--motion-time','--motion-count','--motion-scroll'])assert.ok(css.includes(marker),`missing ${marker}`)
assert.equal((css.match(/animation\s*:[^;{}]*\binfinite\b/g)||[]).length,0)
for(const declaration of css.matchAll(/(?:animation|transition)\s*:\s*([^;{}]+)/g))assert.ok(declaration[1].includes('var(--motion-time'),`unscoped duration: ${declaration[0]}`)
for(const marker of ['lanUiMotionKey','data-ui-motion-preference','resolvedMotion','motionPreferenceToStyle'])assert.ok(provider.includes(marker),`provider missing ${marker}`)
assert.ok(form.includes('useReducedMotion'))
assert.ok(form.includes("reducedMotion.value&&options?.behavior==='smooth'?{...options,behavior:'auto'}:options"))
assert.ok(scope.includes("'data-ui-motion'"))
assert.ok(plugin.includes('setMotion'))

const declarations=(css.match(/(?:animation|transition)\s*:/g)||[]).length
console.log(`MOTION_CONTRACT PASS preferences=${MOTION_PREFERENCES.length} controller=storage+system+restore scopes=provider+teleport scroll=adaptive declarations=${declarations}`)
