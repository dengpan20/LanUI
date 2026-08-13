import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const root = resolve(import.meta.dirname, '..')
const registry = readFileSync(resolve(root, 'src/components.js'), 'utf8')
const components = [...registry.matchAll(/export \{ default as (Ui\w+) \}/g)].map(([, name]) => name)
const jsEntries = readdirSync(resolve(root, 'dist-lib/components')).filter(name => name.endsWith('.js'))
const typeEntries = readdirSync(resolve(root, 'dist-lib/components')).filter(name => name.endsWith('.d.ts'))
const styleEntries = readdirSync(resolve(root, 'dist-lib/styles')).filter(name => name.endsWith('.css'))

if (components.length !== 69) throw new Error(`Expected 69 public components, found ${components.length}`)
if (jsEntries.length !== components.length) throw new Error(`Component JS entry mismatch: ${jsEntries.length}/${components.length}`)
if (typeEntries.length !== components.length) throw new Error(`Component type entry mismatch: ${typeEntries.length}/${components.length}`)
if (styleEntries.length !== components.length+1) throw new Error(`Component style entry mismatch: ${styleEntries.length}/${components.length+1}`)

const styleManifest=JSON.parse(readFileSync(resolve(root,'style-manifest.json'),'utf8'))
const builtStyleManifest=JSON.parse(readFileSync(resolve(root,'dist-lib/styles/manifest.json'),'utf8'))
if(styleManifest.components?.length!==components.length||JSON.stringify(styleManifest)!==JSON.stringify(builtStyleManifest))throw new Error('Style manifest parity failed')
if(!styleManifest.components.every(item=>item.bytes>0&&item.rules>0))throw new Error('Style manifest contains empty entries')
if(styleManifest.schemaVersion!==2||styleManifest.root?.subpath!=='./style.css'||styleManifest.root?.source!=='component-union')throw new Error('Style manifest root boundary failed')

const main = await import('lan-ui-design-system')
for (const name of components) {
  const subpath = await import(`lan-ui-design-system/components/${name}`)
  if (!subpath.default) throw new Error(`Missing default export for ${name}`)
  if (subpath[name] !== subpath.default) throw new Error(`Default/named export mismatch for ${name}`)
  if (main[name] !== subpath.default) throw new Error(`Main/subpath identity mismatch for ${name}`)
  const declaration = readFileSync(resolve(root, `dist-lib/components/${name}.d.ts`), 'utf8')
  for(const suffix of ['Props','Emits','Slots'])if(!declaration.includes(`${name}${suffix}`))throw new Error(`Missing ${suffix} type export for ${name}`)
}

const color = await import('lan-ui-design-system/color')
const config = await import('lan-ui-design-system/config')
const date = await import('lan-ui-design-system/date')
const feedback = await import('lan-ui-design-system/feedback')
const icons = await import('lan-ui-design-system/icons')
const plugin = await import('lan-ui-design-system/plugin')
const theme = await import('lan-ui-design-system/theme')
if (config.enUS.name !== 'en-US') throw new Error('Config subpath failed')
for(const name of ['parseColor','formatColor','rgbToHsv','hsvToRgb','rgbToHsl','hslToRgb','getContrastRatio','getReadableTextColor'])if(typeof color[name]!=='function'||main[name]!==color[name])throw new Error(`Color utility export parity failed: ${name}`)
if(color.formatColor('rgba(22,119,255,.5)','hex',true)!=='#1677FF80'||color.getContrastRatio('#000','#fff')!==21)throw new Error('Built color utility contract failed')
for(const name of ['parseDateValue','dateValueToDate','formatDateValue','toDateValue','fromDateValue','compareDateValues','resolveTimeZone'])if(typeof date[name]!=='function'||main[name]!==date[name])throw new Error(`Date adapter export parity failed: ${name}`)
const packageInstant=date.dateValueToDate('2026-08-12T09:30',{mode:'datetime',timeZone:'Asia/Shanghai'})
if(packageInstant?.toISOString()!=='2026-08-12T01:30:00.000Z'||date.formatDateValue(packageInstant,{mode:'datetime',timeZone:'America/New_York'})!=='2026-08-11T21:30')throw new Error('Built date adapter time-zone contract failed')
if(date.dateValueToDate('2026-03-08T02:30',{mode:'datetime',timeZone:'America/New_York',disambiguation:'reject'})!==null)throw new Error('Built date adapter DST rejection failed')
for(const name of ['createLocaleRegistry','defaultLocaleRegistry','registerLocale','unregisterLocale','hasLocale','listLocales','loadLocale']){
  if(typeof config[name]!== (name==='defaultLocaleRegistry'?'object':'function')||main[name]!==config[name])throw new Error(`Locale registry export parity failed: ${name}`)
}
const packageRegistry=config.createLocaleRegistry()
let localeLoadCalls=0
const packageLoader=async()=>{localeLoadCalls+=1;return {default:{name:'fr-FR',messages:{greeting:'Bonjour'}}}}
const [packageLocaleA,packageLocaleB]=await Promise.all([packageRegistry.load('fr-FR',packageLoader,{aliases:'fr'}),packageRegistry.load('fr-FR',packageLoader,{aliases:'fr'})])
if(localeLoadCalls!==1||packageLocaleA!==packageLocaleB||packageRegistry.get('fr')!==packageLocaleA)throw new Error('Built locale registry lazy-load contract failed')
const packageTools=config.createLocaleTools({name:'fr-CA',messages:{}},['fr-FR','en-US'],packageRegistry)
if(packageTools.t('greeting')!=='Bonjour'||packageTools.t('empty.title')!=='No data'||packageTools.fallbackLocales.length!==2)throw new Error('Built fallback-chain contract failed')
if (typeof feedback.toast.success !== 'function') throw new Error('Feedback subpath failed')
for(const name of ['defineIcon','createIconRegistry','registerIcon','unregisterIcon','hasIcon','listIcons'])if(typeof icons[name]!=='function'||main[name]!==icons[name])throw new Error(`Icon registry export parity failed: ${name}`)
const packageIcons=icons.createIconRegistry({packageMark:'<path d="M4 4h16v16H4Z"/>'})
if(!packageIcons.has('packageMark')||packageIcons.list().length!==icons.BUILTIN_ICON_NAMES.length+1)throw new Error('Built icon registry contract failed')
try{icons.defineIcon('<script/>');throw new Error('Unsafe icon fragment was accepted')}catch(error){if(!String(error.message).includes('Unsupported icon element'))throw error}
if (typeof feedback.createLanUiFeedback !== 'function' || typeof feedback.useFeedback !== 'function') throw new Error('Feedback isolation exports failed')
const isolatedFeedback=feedback.createLanUiFeedback()
isolatedFeedback.toast.success('Package isolated',{duration:0,placement:'top-end'})
if(isolatedFeedback.toastState.items.length!==1||feedback.toastState.items.length!==0)throw new Error('Feedback package isolation failed')
isolatedFeedback.dispose()
if(!isolatedFeedback.disposed||isolatedFeedback.toastState.items.length!==0)throw new Error('Feedback package disposal failed')
if (typeof plugin.default.install !== 'function') throw new Error('Plugin subpath failed')
const isolatedPlugin=plugin.createLanUi({isolated:true})
if(isolatedPlugin.feedback===feedback.feedback||typeof isolatedPlugin.dispose!=='function')throw new Error('Plugin isolation failed')
await isolatedPlugin.loadLocale('ja-JP',()=>({name:'ja-JP',messages:{greeting:'こんにちは'}}),{activate:true,aliases:'ja'})
if(isolatedPlugin.config.locale.name!=='ja-JP'||!isolatedPlugin.hasLocale('ja')||isolatedPlugin.listLocales().length!==3)throw new Error('Built Plugin locale registry failed')
isolatedPlugin.dispose()
for(const name of ['defineTheme','mergeThemes','normalizeThemeTokens','themeToStyle','resolveThemeAppearance','createThemeController'])if(typeof theme[name]!=='function'||main[name]!==theme[name])throw new Error(`Theme utility export parity failed: ${name}`)
if(theme.THEME_TOKEN_NAMES.length!==102||theme.lightTheme.tokens['bg-surface']!=='#ffffff'||theme.darkTheme.tokens['bg-surface']!=='#131e2f')throw new Error('Built theme preset contract failed')
const packageTheme=theme.defineTheme({name:'package-tenant',appearance:'dark',tokens:{'brand-600':'#6EA8FF'}})
const packageThemeStyle=theme.themeToStyle(packageTheme)
if(packageThemeStyle['--brand-600']!=='#6EA8FF'||packageTheme.appearance!=='dark')throw new Error('Built theme normalization contract failed')
const packageThemeController=theme.createThemeController({appearance:'system',storage:null,matchMedia:null})
if(packageThemeController.mount(null).resolvedAppearance!=='light')throw new Error('Built theme SSR controller contract failed')
packageThemeController.dispose()

const context = {}
const app = createSSRApp({ render:() => h(main.UiModal, { modelValue:true, title:'SSR package' }, () => 'Rendered from package') })
await renderToString(app, context)
if (!context.teleports?.body?.includes('Rendered from package')) throw new Error('Built package SSR failed')

console.log(`PACKAGE_EXPORTS PASS components=${components.length} js=${jsEntries.length} types=${typeEntries.length} styles=${styleEntries.length} contracts=props+emits+slots named-default-parity=pass ssr=pass feedback-isolation=pass locale-registry=lazy+chain+activation color=parser+contrast date-adapter=iana+dst icons=isolated+sanitized theme=presets+controller subpaths=color,config,date,feedback,icons,plugin,theme`)
