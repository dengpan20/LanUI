import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { enUS, zhCN } from '../src/config.js'

const root=resolve(import.meta.dirname,'..')
const locales=[zhCN,enUS]
const keys=Object.keys(zhCN.messages).sort()
const placeholders=value=>[...String(value).matchAll(/\{(\w+)\}/g)].map(([,name])=>name).sort()

for(const locale of locales){
  const actual=Object.keys(locale.messages).sort()
  if(JSON.stringify(actual)!==JSON.stringify(keys))throw new Error(`Locale key parity failed: ${locale.name} ${actual.length}/${keys.length}`)
  for(const key of keys){
    if(typeof locale.messages[key]!=='string'||!locale.messages[key])throw new Error(`Empty locale message: ${locale.name}:${key}`)
    const expected=placeholders(zhCN.messages[key])
    const received=placeholders(locale.messages[key])
    if(JSON.stringify(received)!==JSON.stringify(expected))throw new Error(`Locale placeholder parity failed: ${locale.name}:${key}`)
  }
}

const registry=readFileSync(resolve(root,'src/components.js'),'utf8')
const components=[...registry.matchAll(/export \{ default as (Ui\w+) \}/g)].map(([,name])=>name)
const localized=new Set([
  'UiAlert','UiAutoComplete','UiBadge','UiBreadcrumb','UiCascader','UiColorPicker','UiCommandPalette','UiDatePicker','UiDateRangePicker','UiDescriptions','UiDrawer','UiEmpty','UiFormItem','UiInput','UiListToolbar','UiMenu','UiModal','UiMultiSelect','UiNotification','UiNumberInput','UiPagination','UiPopconfirm','UiPopover','UiProgress','UiSelect','UiSlider','UiSpin','UiSteps','UiSwitch','UiTable','UiTabs','UiToastHost','UiTransfer','UiTree','UiTreeSelect','UiUpload',
])
const usedKeys=new Set()
for(const name of components){
  const source=readFileSync(resolve(root,`src/components/${name}.vue`),'utf8')
  if(/[\u3400-\u9fff]/u.test(source))throw new Error(`Public component contains hard-coded CJK copy: ${name}`)
  if(localized.has(name)&&!source.includes('useLocale'))throw new Error(`Localized component is detached from Locale context: ${name}`)
  for(const [,key] of source.matchAll(/\bt\(['"]([^'"]+)['"]/g))usedKeys.add(key)
}
for(const key of usedKeys)if(!keys.includes(key))throw new Error(`Component references a missing locale key: ${key}`)
for(const key of ['autocomplete.placeholder','autocomplete.clear','autocomplete.loading','autocomplete.empty','autocomplete.error','autocomplete.suggestions','color.panel','color.empty','color.plane','color.planeValue','color.hue','color.alpha','color.input','color.presets','color.select','color.contrast','color.contrastFail','color.keyboardHint','color.clear','command.label','command.title','command.placeholder','command.empty','command.loading','command.error','command.retry','command.close','command.hint','command.results','command.navigate','command.select','input.showPassword','input.hidePassword','number.increase','number.decrease','slider.value','slider.start','slider.end','slider.setValue','table.expand','table.collapse','tree.expand','tree.collapse','tree.expandNode','tree.collapseNode','tree.checkNode','tree.uncheckNode','tree.loading','tree.retry','tree.retryNode','tree.empty','toast.title.success','toast.title.info','toast.title.warning','toast.title.error'])if(!keys.includes(key))throw new Error(`Missing dynamic locale key: ${key}`)

console.log(`LOCALE_CONTRACT PASS locales=${locales.length} keys=${keys.length} placeholders=parity public=${components.length} localized=${localized.size} hardcoded-cjk=0 used=${usedKeys.size}`)
