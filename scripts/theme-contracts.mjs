import assert from 'node:assert/strict'
import { getContrastRatio } from '../src/color.js'
import {
  THEME_APPEARANCES, THEME_TOKEN_NAMES, createThemeController, darkTheme, defineTheme, lightTheme,
  mergeThemes, normalizeThemeAppearance, normalizeThemeTokens, resolveThemeAppearance, themeToStyle,
} from '../src/theme.js'

assert.deepEqual(THEME_APPEARANCES,['light','dark','system'])
assert.equal(THEME_TOKEN_NAMES.length,102)
assert.equal(Object.keys(lightTheme.tokens).length,THEME_TOKEN_NAMES.length)
assert.equal(Object.keys(darkTheme.tokens).length,THEME_TOKEN_NAMES.length)
assert.equal(lightTheme.appearance,'light')
assert.equal(darkTheme.appearance,'dark')
assert.ok(Object.isFrozen(lightTheme)&&Object.isFrozen(lightTheme.tokens))
assert.equal(normalizeThemeAppearance('SYSTEM'),'system')
assert.equal(normalizeThemeAppearance('unknown',{strict:false,fallback:'dark'}),'dark')
assert.throws(()=>normalizeThemeAppearance('sepia'),/Unsupported theme appearance/)
assert.deepEqual(normalizeThemeTokens({'--brand-600':'#123456',space_2:'10px'}),{'brand-600':'#123456','space-2':'10px'})
assert.throws(()=>normalizeThemeTokens({applicationAccent:'#123456'}),/Unknown theme token/)
assert.throws(()=>normalizeThemeTokens({'brand-600':'red\nblue'}),/control characters/)
assert.throws(()=>defineTheme({name:'invalid-system',appearance:'system'}),/light or dark/)
assert.deepEqual(normalizeThemeTokens({applicationAccent:'#123456'},{allowUnknown:true}),{'application-accent':'#123456'})
assert.deepEqual(normalizeThemeTokens({'bad token':'red'},{allowUnknown:true,invalid:'ignore'}),{})

const tenant=defineTheme({name:'tenant-blue',appearance:'light',tokens:{'brand-600':'#1456CC'}})
const tenantDark=mergeThemes(darkTheme,{name:'tenant-dark',appearance:'dark',tokens:{'brand-600':'#6EA8FF',tenantAccent:'#223355'}})
assert.equal(tenant.tokens['brand-600'],'#1456CC')
assert.equal(tenantDark.name,'tenant-dark')
assert.equal(tenantDark.tokens['tenant-accent'],'#223355')
assert.deepEqual(themeToStyle({'brand-600':'#1456CC'}),{'--brand-600':'#1456CC'})
assert.equal(resolveThemeAppearance('system',true),'dark')
assert.equal(resolveThemeAppearance('system',false),'light')

for(const theme of [lightTheme,darkTheme]){
  assert.ok(getContrastRatio(theme.tokens['text-primary'],theme.tokens['bg-surface'])>=4.5,`${theme.name} primary text contrast`)
  assert.ok(getContrastRatio(theme.tokens['brand-text'],theme.tokens['bg-surface'])>=4.5,`${theme.name} brand text contrast`)
}

const stored=new Map([['fixture-theme','system']])
const storage={getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)}
const mediaListeners=new Set()
const media={matches:true,addEventListener:(_type,listener)=>mediaListeners.add(listener),removeEventListener:(_type,listener)=>mediaListeners.delete(listener)}
const attributes=new Map([['data-theme','legacy']])
const target={
  style:{colorScheme:'normal'},
  getAttribute:name=>attributes.get(name)??null,
  setAttribute:(name,value)=>attributes.set(name,value),
  removeAttribute:name=>attributes.delete(name),
}
const states=[]
const controller=createThemeController({appearance:'light',storageKey:'fixture-theme',storage,matchMedia:()=>media,target})
controller.subscribe(state=>states.push(`${state.reason}:${state.appearance}:${state.resolvedAppearance}`))
assert.equal(controller.mount().resolvedAppearance,'dark')
assert.equal(attributes.get('data-theme'),'dark')
assert.equal(attributes.get('data-ui-appearance'),'system')
assert.equal(target.style.colorScheme,'dark')
controller.setAppearance('light')
assert.equal(stored.get('fixture-theme'),'light')
assert.equal(attributes.get('data-theme'),'light')
controller.setAppearance('system')
media.matches=false
for(const listener of mediaListeners)listener({matches:false})
assert.equal(controller.resolvedAppearance,'light')
media.matches=true
for(const listener of mediaListeners)listener({matches:true})
assert.equal(controller.resolvedAppearance,'dark')
controller.toggle()
assert.equal(controller.appearance,'light')
assert.equal(mediaListeners.size,1)
controller.dispose()
assert.equal(mediaListeners.size,0)
assert.equal(attributes.get('data-theme'),'legacy')
assert.equal(attributes.has('data-ui-appearance'),false)
assert.equal(target.style.colorScheme,'normal')
assert.throws(()=>controller.setAppearance('dark'),/disposed/)
assert.ok(states.includes('system:system:dark'))

const ssrController=createThemeController({appearance:'system',storage:null,matchMedia:null})
assert.equal(ssrController.resolvedAppearance,'light')
assert.equal(ssrController.mount(null).resolvedAppearance,'light')
ssrController.dispose()

console.log(`THEME_CONTRACT PASS presets=2 tokens=${THEME_TOKEN_NAMES.length} appearances=${THEME_APPEARANCES.length} scoped=provider-ready controller=storage+system+restore contrast=wcag`)
