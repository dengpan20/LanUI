import { darkThemeOverrides, lightThemeTokens, themeTokenSourceVersion } from './theme-tokens.js'

export const THEME_APPEARANCES=Object.freeze(['light','dark','system'])
export const THEME_TOKEN_NAMES=Object.freeze(Object.keys(lightThemeTokens))
const appearanceSet=new Set(THEME_APPEARANCES)
const knownTokens=new Set(THEME_TOKEN_NAMES)
const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key)
const isRecord=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value)

export function normalizeThemeAppearance(value='light',options={}){
  const normalized=String(value||'').trim().toLowerCase()
  if(appearanceSet.has(normalized))return normalized
  if(options.strict===false){
    const fallback=String(options.fallback||'light').trim().toLowerCase()
    return appearanceSet.has(fallback)?fallback:'light'
  }
  throw new RangeError(`Unsupported theme appearance: ${value}`)
}

function normalizeTokenName(value){
  const raw=String(value||'').trim().replace(/^--/,'')
  const normalized=raw.replace(/([a-z\d])([A-Z])/g,'$1-$2').replace(/_/g,'-').toLowerCase()
  if(!/^[a-z][a-z\d]*(?:-[a-z\d]+)*$/.test(normalized))throw new TypeError(`Invalid theme token name: ${value}`)
  return normalized
}

function normalizeTokenValue(value,name){
  if(typeof value==='number'){
    if(Number.isFinite(value))return value
    throw new TypeError(`Theme token ${name} must be finite`)
  }
  if(typeof value==='string'&&value.trim()){
    const normalized=value.trim()
    if(/[\u0000-\u001f\u007f]/.test(normalized))throw new TypeError(`Theme token ${name} contains control characters`)
    return normalized
  }
  throw new TypeError(`Theme token ${name} must be a non-empty string or finite number`)
}

export function normalizeThemeTokens(input={},options={}){
  const source=isRecord(input?.tokens)?input.tokens:input
  if(!isRecord(source))throw new TypeError('Theme tokens must be an object or a theme definition')
  const allowUnknown=options.allowUnknown===true
  const invalid=options.invalid==='ignore'?'ignore':'throw'
  const result={}
  for(const [rawName,rawValue] of Object.entries(source)){
    try{
      const name=normalizeTokenName(rawName)
      if(!allowUnknown&&!knownTokens.has(name))throw new RangeError(`Unknown theme token: ${name}`)
      result[name]=normalizeTokenValue(rawValue,name)
    }catch(error){
      if(invalid!=='ignore')throw error
    }
  }
  return result
}

export function defineTheme(input,options={}){
  if(!isRecord(input))throw new TypeError('Theme definition must be an object')
  const name=String(input.name||'').trim()
  if(!name)throw new TypeError('Theme name is required')
  const appearance=normalizeThemeAppearance(input.appearance||(/dark/i.test(name)?'dark':'light'))
  if(appearance==='system')throw new RangeError('Theme definitions require a light or dark base appearance')
  const tokens=Object.freeze(normalizeThemeTokens(input.tokens||{},options))
  return Object.freeze({name,appearance,tokens,tokenSourceVersion:themeTokenSourceVersion})
}

export const lightTheme=defineTheme({name:'light',appearance:'light',tokens:lightThemeTokens})
export const darkTheme=defineTheme({name:'dark',appearance:'dark',tokens:{...lightThemeTokens,...darkThemeOverrides}})

export function mergeThemes(base,...overrides){
  const initial=isRecord(base?.tokens)?base:defineTheme({name:'custom',appearance:'light',tokens:base||{}},{allowUnknown:true})
  let name=initial.name
  let appearance=initial.appearance
  let tokens={...initial.tokens}
  for(const override of overrides){
    if(!isRecord(override))continue
    const definition=isRecord(override.tokens)?override:null
    if(definition?.name)name=String(definition.name)
    if(definition?.appearance)appearance=normalizeThemeAppearance(definition.appearance)
    tokens={...tokens,...normalizeThemeTokens(definition?.tokens||override,{allowUnknown:true})}
  }
  return defineTheme({name,appearance,tokens},{allowUnknown:true})
}

export function themeToStyle(input={},options={}){
  const tokens=normalizeThemeTokens(input,{allowUnknown:options.allowUnknown!==false,invalid:options.invalid})
  return Object.fromEntries(Object.entries(tokens).map(([name,value])=>[`--${name}`,value]))
}

export function resolveThemeAppearance(appearance='light',prefersDark=false){
  const normalized=normalizeThemeAppearance(appearance,{strict:false})
  return normalized==='system'?(prefersDark?'dark':'light'):normalized
}

function readAttribute(target,name){
  if(typeof target?.getAttribute==='function')return target.getAttribute(name)
  const key=name.replace(/^data-/,'').replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())
  return target?.dataset&&hasOwn(target.dataset,key)?target.dataset[key]:null
}
function writeAttribute(target,name,value){
  if(typeof target?.setAttribute==='function')target.setAttribute(name,value)
  else if(target?.dataset){const key=name.replace(/^data-/,'').replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());target.dataset[key]=value}
}
function restoreAttribute(target,name,value){
  if(value===null||value===undefined){
    if(typeof target?.removeAttribute==='function')target.removeAttribute(name)
    else if(target?.dataset){const key=name.replace(/^data-/,'').replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());delete target.dataset[key]}
  }else writeAttribute(target,name,value)
}

export function createThemeController(options={}){
  let appearance=normalizeThemeAppearance(options.appearance||'system')
  let resolvedAppearance=resolveThemeAppearance(appearance,false)
  let target=null
  let media=null
  let mounted=false
  let disposed=false
  let previous=null
  const listeners=new Set()
  const storageKey=options.storageKey===false?'':String(options.storageKey||'lan-ui-appearance')
  const report=(error,operation)=>{try{options.onError?.(error,operation)}catch{}}
  const storage=()=>{
    if(hasOwn(options,'storage'))return options.storage
    try{return globalThis.localStorage||null}catch(error){report(error,'storage');return null}
  }
  const matcher=()=>{
    if(hasOwn(options,'matchMedia'))return options.matchMedia
    return typeof globalThis.matchMedia==='function'?globalThis.matchMedia.bind(globalThis):null
  }
  const snapshot=reason=>Object.freeze({appearance,resolvedAppearance,mounted,disposed,reason})
  const notify=reason=>{const state=snapshot(reason);for(const listener of [...listeners]){try{listener(state)}catch(error){report(error,'subscriber')}}return state}
  const apply=()=>{
    if(!target)return
    writeAttribute(target,'data-theme',resolvedAppearance)
    writeAttribute(target,'data-ui-appearance',appearance)
    if(target.style)target.style.colorScheme=resolvedAppearance
  }
  const sync=(reason='sync')=>{
    const next=resolveThemeAppearance(appearance,Boolean(media?.matches))
    const changed=next!==resolvedAppearance
    resolvedAppearance=next
    apply()
    return changed?notify(reason):snapshot(reason)
  }
  const mediaChange=event=>{if(media&&typeof event?.matches==='boolean'&&media.matches!==event.matches){try{media.matches=event.matches}catch{}};if(appearance==='system')sync('system')}
  const attachMedia=()=>{
    const match=matcher()
    if(typeof match!=='function')return
    try{
      media=match('(prefers-color-scheme: dark)')
      media?.addEventListener?.('change',mediaChange)
      if(!media?.addEventListener)media?.addListener?.(mediaChange)
    }catch(error){media=null;report(error,'match-media')}
  }
  const detachMedia=()=>{
    media?.removeEventListener?.('change',mediaChange)
    if(!media?.removeEventListener)media?.removeListener?.(mediaChange)
    media=null
  }
  const persist=value=>{
    if(!storageKey)return
    try{storage()?.setItem?.(storageKey,value)}catch(error){report(error,'persist')}
  }
  const setAppearance=(value,setOptions={})=>{
    if(disposed)throw new Error('Theme controller is disposed')
    const next=normalizeThemeAppearance(value)
    const changed=next!==appearance
    appearance=next
    if(setOptions.persist!==false)persist(next)
    const before=resolvedAppearance
    resolvedAppearance=resolveThemeAppearance(appearance,Boolean(media?.matches))
    apply()
    return changed||before!==resolvedAppearance?notify(setOptions.reason||'set'):snapshot(setOptions.reason||'set')
  }
  const mount=mountTarget=>{
    if(disposed)throw new Error('Theme controller is disposed')
    if(mounted)return snapshot('mount')
    target=mountTarget??options.target??globalThis.document?.documentElement??null
    previous=target?{theme:readAttribute(target,'data-theme'),appearance:readAttribute(target,'data-ui-appearance'),colorScheme:target.style?.colorScheme??''}:null
    if(storageKey){
      try{
        const saved=storage()?.getItem?.(storageKey)
        if(saved&&appearanceSet.has(String(saved).toLowerCase()))appearance=String(saved).toLowerCase()
      }catch(error){report(error,'restore')}
    }
    attachMedia()
    resolvedAppearance=resolveThemeAppearance(appearance,Boolean(media?.matches))
    mounted=true
    apply()
    return notify('mount')
  }
  const toggle=toggleOptions=>setAppearance(resolvedAppearance==='dark'?'light':'dark',{...toggleOptions,reason:toggleOptions?.reason||'toggle'})
  const subscribe=(listener,subscribeOptions={})=>{
    if(typeof listener!=='function')throw new TypeError('Theme subscriber must be a function')
    if(disposed)throw new Error('Theme controller is disposed')
    listeners.add(listener)
    if(subscribeOptions.immediate)listener(snapshot('subscribe'))
    return ()=>{listeners.delete(listener)}
  }
  const dispose=(disposeOptions={})=>{
    if(disposed)return snapshot('dispose')
    detachMedia()
    if(target&&disposeOptions.restore!==false&&previous){
      restoreAttribute(target,'data-theme',previous.theme)
      restoreAttribute(target,'data-ui-appearance',previous.appearance)
      if(target.style)target.style.colorScheme=previous.colorScheme
    }
    mounted=false
    disposed=true
    const state=notify('dispose')
    listeners.clear()
    target=null
    return state
  }
  return Object.freeze({
    mount,setAppearance,toggle,subscribe,dispose,
    get appearance(){return appearance},
    get resolvedAppearance(){return resolvedAppearance},
    get mounted(){return mounted},
    get disposed(){return disposed},
    get state(){return snapshot('read')},
  })
}
