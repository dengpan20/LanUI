import { computed, inject, unref } from 'vue'
import { zhCN } from './locales/zh-CN.js'

export { zhCN }

export const lanUiConfigKey=Symbol.for('lan-ui-config')
const builtInLocales={'zh-CN':zhCN,zh:zhCN}
const builtInRecords=[{locale:zhCN,aliases:['zh']}]
const protectLocale=Symbol('lan-ui-protect-locale')
const formatterCaches={number:new Map(),date:new Map(),relative:new Map(),list:new Map(),plural:new Map()}

function mergeLocale(locale,defaultLocale=zhCN,registry=null){
  if(!locale)return defaultLocale
  if(typeof locale==='string')return registry?.get(locale)||builtInLocales[locale]||{name:locale,messages:{}}
  const name=locale.name||defaultLocale.name
  const base=registry?.get(name)||builtInLocales[name]||(defaultLocale.name===name?defaultLocale:null)
  return {...(base||{}),...locale,name,messages:{...(base?.messages||{}),...(locale.messages||{})}}
}

function localeModule(value){return value?.default||value?.locale||value}
function normalizeAliases(aliases){return [...new Set((Array.isArray(aliases)?aliases:[aliases]).filter(Boolean).map(String))]}
function localeLookupKey(value){
  const name=String(value||'').trim()
  if(!name)return ''
  try{return Intl.getCanonicalLocales(name)[0].toLowerCase()}catch{return name.toLowerCase()}
}

export function createLocaleRegistry(initialLocales=[]){
  const entries=new Map()
  const aliases=new Map()
  const pending=new Map()
  const protectedKeys=new Set()
  const get=name=>{
    if(!name)return undefined
    const key=localeLookupKey(name)
    return entries.get(key)||entries.get(aliases.get(key))
  }
  const register=(locale,localeAliases=[])=>{
    const raw=localeModule(locale)
    if(!raw||typeof raw!=='object')throw new TypeError('Locale must be an object or an ES module with a default locale export')
    const name=String(raw.name||'').trim()
    if(!name)throw new TypeError('Locale name is required')
    const normalized=mergeLocale({...raw,name},get(name)||{name,messages:{}},null)
    const key=localeLookupKey(name)
    const nameTarget=aliases.get(key)
    if(nameTarget&&nameTarget!==key)throw new Error(`Locale name already registered as an alias: ${name}`)
    const aliasRecords=normalizeAliases(localeAliases).map(alias=>({alias,key:localeLookupKey(alias)}))
    for(const {alias,key:aliasKey} of aliasRecords){
      const directTarget=entries.has(aliasKey)?aliasKey:null
      const aliasTarget=aliases.get(aliasKey)
      if((directTarget&&directTarget!==key)||(aliasTarget&&aliasTarget!==key))throw new Error(`Locale alias already registered: ${alias}`)
    }
    entries.set(key,normalized)
    for(const {key:aliasKey} of aliasRecords)aliases.set(aliasKey,key)
    return normalized
  }
  const unregister=name=>{
    const key=localeLookupKey(name)
    const resolved=entries.has(key)?key:aliases.get(key)
    if(!resolved)return false
    if(protectedKeys.has(resolved))return false
    for(const [alias,target] of aliases)if(target===resolved)aliases.delete(alias)
    return entries.delete(resolved)
  }
  const load=(name,loader,options={})=>{
    const requestedName=String(name||'').trim()
    const key=localeLookupKey(requestedName)
    if(!key)return Promise.reject(new TypeError('Locale name is required'))
    if(typeof loader!=='function')return Promise.reject(new TypeError('Locale loader must be a function'))
    const current=get(key)
    if(current&&!options.force)return Promise.resolve(current)
    if(pending.has(key))return pending.get(key)
    const task=Promise.resolve().then(()=>loader()).then(module=>{
      const raw=localeModule(module)
      const locale=raw&&typeof raw==='object'?{...raw,name:raw.name||requestedName}:raw
      return register(locale,[requestedName,...normalizeAliases(options.aliases)])
    }).finally(()=>pending.delete(key))
    pending.set(key,task)
    return task
  }
  const protect=(locale,localeAliases=[])=>{
    const normalized=register(locale,localeAliases)
    protectedKeys.add(localeLookupKey(normalized.name))
    return normalized
  }
  const registry={register,unregister,get,has:name=>Boolean(get(name)),list:()=>[...entries.values()],load}
  Object.defineProperty(registry,protectLocale,{value:protect})
  for(const record of builtInRecords)protect(record.locale,record.aliases)
  for(const locale of initialLocales)register(locale)
  return registry
}

export const defaultLocaleRegistry=createLocaleRegistry()
export function installBuiltInLocale(locale,aliases=[]){
  const raw=localeModule(locale)
  if(!raw||typeof raw!=='object'||!String(raw.name||'').trim())throw new TypeError('Built-in locale name is required')
  const name=String(raw.name).trim()
  const normalizedAliases=normalizeAliases(aliases)
  const key=localeLookupKey(name)
  const existing=builtInRecords.find(record=>localeLookupKey(record.locale.name)===key)
  if(existing){existing.locale=raw;existing.aliases=normalizedAliases}
  else builtInRecords.push({locale:raw,aliases:normalizedAliases})
  builtInLocales[name]=raw
  builtInLocales[key]=raw
  for(const alias of normalizedAliases){builtInLocales[alias]=raw;builtInLocales[localeLookupKey(alias)]=raw}
  return defaultLocaleRegistry[protectLocale](raw,normalizedAliases)
}
export const registerLocale=(locale,aliases=[])=>defaultLocaleRegistry.register(locale,aliases)
export const unregisterLocale=name=>defaultLocaleRegistry.unregister(name)
export const hasLocale=name=>defaultLocaleRegistry.has(name)
export const listLocales=()=>defaultLocaleRegistry.list()
export const loadLocale=(name,loader,options={})=>defaultLocaleRegistry.load(name,loader,options)

const themeAppearances=new Set(['light','dark','system'])
const fallback={locale:zhCN,fallbackLocale:zhCN,fallbackLocales:[zhCN],localeRegistry:defaultLocaleRegistry,size:'md',density:'default',direction:'ltr',zIndex:300,appearance:'light',themeName:'default',theme:{}}

export function defineLocale(locale){return mergeLocale(locale,zhCN,defaultLocaleRegistry)}
function normalizeFallbackLocales(input,registry){
  if(input===false||input===null)return []
  const values=Array.isArray(input)?input:[input||zhCN]
  const seen=new Set()
  return values.map(value=>mergeLocale(value,zhCN,registry)).filter(locale=>{
    const key=localeLookupKey(locale.name)
    if(seen.has(key))return false
    seen.add(key)
    return true
  })
}
export function normalizeLanUiConfig(options={},parent=fallback,registryInput=null){
  const localeRegistry=options.localeRegistry||registryInput||parent.localeRegistry||defaultLocaleRegistry
  const direction=options.direction==='rtl'||options.direction==='ltr'?options.direction:parent.direction||'ltr'
  const hasFallbackLocales=Object.prototype.hasOwnProperty.call(options,'fallbackLocales')&&options.fallbackLocales!==undefined
  const hasFallback=Object.prototype.hasOwnProperty.call(options,'fallbackLocale')&&options.fallbackLocale!==undefined
  const fallbackInput=hasFallbackLocales?options.fallbackLocales:hasFallback?options.fallbackLocale:parent.fallbackLocales||parent.fallbackLocale
  const fallbackLocales=normalizeFallbackLocales(fallbackInput,localeRegistry)
  const fallbackLocale=fallbackLocales[0]||null
  const themeDefinition=options.theme&&typeof options.theme==='object'&&!Array.isArray(options.theme)&&options.theme.tokens&&typeof options.theme.tokens==='object'?options.theme:null
  const themeTokens=themeDefinition?.tokens||options.theme||{}
  const hasTheme=Boolean(themeDefinition)||(themeTokens&&typeof themeTokens==='object'&&Object.keys(themeTokens).length>0)
  const requestedAppearance=String(options.appearance||themeDefinition?.appearance||'').toLowerCase()
  const appearance=themeAppearances.has(requestedAppearance)?requestedAppearance:parent.appearance||'light'
  const themeName=themeDefinition?.name?String(themeDefinition.name):hasTheme?'custom':parent.themeName||'default'
  return {locale:mergeLocale(options.locale||parent.locale,parent.locale||zhCN,localeRegistry),fallbackLocale,fallbackLocales,localeRegistry,size:options.size||parent.size||'md',density:options.density||parent.density||'default',direction,zIndex:Number(options.zIndex||parent.zIndex||300),appearance,themeName,theme:{...(parent.theme||{}),...(themeTokens||{})}}
}

function canonicalLocale(locale,fallbackLocales){
  for(const candidate of [locale?.name,...fallbackLocales.map(item=>item?.name),'en-US']){
    try{return Intl.getCanonicalLocales(candidate)[0]}catch{}
  }
  return 'en-US'
}
function optionsKey(options={}){return JSON.stringify(Object.entries(options).sort(([left],[right])=>left.localeCompare(right)))}
function formatter(kind,Constructor,locale,fallbackLocales,options={}){
  const name=canonicalLocale(locale,fallbackLocales)
  const key=`${name}|${optionsKey(options)}`
  let instance=formatterCaches[kind].get(key)
  if(!instance){instance=new Constructor(name,options);formatterCaches[kind].set(key,instance)}
  return instance
}
function interpolate(template,params={}){return String(template).replace(/\{(\w+)\}/g,(_,name)=>params[name]??`{${name}}`)}
function resolveMessage(locale,fallbackLocales,key){
  if(locale?.messages?.[key]!==undefined)return locale.messages[key]
  for(const fallbackLocale of fallbackLocales)if(fallbackLocale?.messages?.[key]!==undefined)return fallbackLocale.messages[key]
  return undefined
}
function defaultTemplate(message){
  if(typeof message==='string')return message
  if(message&&typeof message==='object')return message.other??message.one??Object.values(message)[0]
  return undefined
}
function choiceTemplate(message,count,category){
  if(message&&typeof message==='object')return message[`=${count}`]??message[category]??message.other??message.one??Object.values(message)[0]
  if(typeof message!=='string')return undefined
  const choices=message.split('|').map(value=>value.trim())
  if(choices.length===1)return message
  if(choices.length===2)return category==='one'?choices[0]:choices[1]
  return count===0?choices[0]:category==='one'?choices[1]:choices.at(-1)
}
function normalizedDate(value){const date=value instanceof Date?value:new Date(value);return Number.isNaN(date.getTime())?null:date}

export function createLocaleTools(localeInput=zhCN,fallbackInput=zhCN,localeRegistry=defaultLocaleRegistry){
  const locale=mergeLocale(localeInput,zhCN,localeRegistry)
  const fallbackLocales=normalizeFallbackLocales(fallbackInput,localeRegistry)
  const fallbackLocale=fallbackLocales[0]||null
  const formatNumber=(value,options={})=>formatter('number',Intl.NumberFormat,locale,fallbackLocales,options).format(value)
  const formatDate=(value,options={})=>{const date=normalizedDate(value);return date?formatter('date',Intl.DateTimeFormat,locale,fallbackLocales,options).format(date):''}
  const formatRelativeTime=(value,unit='second',options={})=>formatter('relative',Intl.RelativeTimeFormat,locale,fallbackLocales,options).format(value,unit)
  const formatList=(values,options={})=>formatter('list',Intl.ListFormat,locale,fallbackLocales,options).format([...values].map(String))
  const t=(key,params={})=>interpolate(defaultTemplate(resolveMessage(locale,fallbackLocales,key))??key,params)
  const tc=(key,count,params={})=>{
    const category=formatter('plural',Intl.PluralRules,locale,fallbackLocales,params.pluralOptions||{}).select(count)
    const template=choiceTemplate(resolveMessage(locale,fallbackLocales,key),count,category)??key
    const values={...params,count:params.count??formatNumber(count)}
    delete values.pluralOptions
    return interpolate(template,values)
  }
  return {locale,fallbackLocale,fallbackLocales,localeRegistry,t,tc,formatNumber,formatDate,formatRelativeTime,formatList}
}

export function useLanUiConfig(){
  const injected=inject(lanUiConfigKey,null)
  return computed(()=>normalizeLanUiConfig(unref(injected)||{},fallback))
}
export function useLocale(){
  const config=useLanUiConfig()
  const locale=computed(()=>config.value.locale)
  const fallbackLocale=computed(()=>config.value.fallbackLocale)
  const fallbackLocales=computed(()=>config.value.fallbackLocales)
  const localeRegistry=computed(()=>config.value.localeRegistry)
  const tools=computed(()=>createLocaleTools(locale.value,fallbackLocales.value,localeRegistry.value))
  return {
    locale,
    fallbackLocale,
    fallbackLocales,
    localeRegistry,
    t:(...args)=>tools.value.t(...args),
    tc:(...args)=>tools.value.tc(...args),
    formatNumber:(...args)=>tools.value.formatNumber(...args),
    formatDate:(...args)=>tools.value.formatDate(...args),
    formatRelativeTime:(...args)=>tools.value.formatRelativeTime(...args),
    formatList:(...args)=>tools.value.formatList(...args),
  }
}
export function useComponentSize(value){const config=useLanUiConfig();return computed(()=>unref(value)||config.value.size||'md')}
export function useDirection(){const config=useLanUiConfig();return computed(()=>config.value.direction||'ltr')}
