import { computed, inject, onBeforeUnmount, onMounted, ref, unref } from 'vue'

export const MOTION_PREFERENCES=Object.freeze(['full','reduced','system'])
export const lanUiMotionKey=Symbol.for('lan-ui-motion-preference')
const preferenceSet=new Set(MOTION_PREFERENCES)
const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key)
const emptyStyle=Object.freeze({})
const reducedStyle=Object.freeze({
  '--motion-time':'.01ms',
  '--motion-count':1,
  '--motion-scroll':'auto',
})

export function normalizeMotionPreference(value='system',options={}){
  const normalized=String(value||'').trim().toLowerCase()
  if(preferenceSet.has(normalized))return normalized
  if(options.strict===false){
    const fallback=String(options.fallback||'system').trim().toLowerCase()
    return preferenceSet.has(fallback)?fallback:'system'
  }
  throw new RangeError(`Unsupported motion preference: ${value}`)
}

export function resolveMotionPreference(preference='system',prefersReduced=false){
  const normalized=normalizeMotionPreference(preference,{strict:false})
  return normalized==='system'?(prefersReduced?'reduced':'full'):normalized
}

export function motionPreferenceToStyle(preference='full',prefersReduced=false){
  return resolveMotionPreference(preference,prefersReduced)==='reduced'?reducedStyle:emptyStyle
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

export function createMotionController(options={}){
  let preference=normalizeMotionPreference(options.preference||'system')
  let resolvedPreference=resolveMotionPreference(preference,false)
  let target=null,media=null,mounted=false,disposed=false,previous=null
  const listeners=new Set()
  const storageKey=options.storageKey===false?'':String(options.storageKey||'lan-ui-motion')
  const report=(error,operation)=>{try{options.onError?.(error,operation)}catch{}}
  const storage=()=>{if(hasOwn(options,'storage'))return options.storage;try{return globalThis.localStorage||null}catch(error){report(error,'storage');return null}}
  const matcher=()=>{if(hasOwn(options,'matchMedia'))return options.matchMedia;return typeof globalThis.matchMedia==='function'?globalThis.matchMedia.bind(globalThis):null}
  const snapshot=reason=>Object.freeze({preference,resolvedPreference,reduced:resolvedPreference==='reduced',mounted,disposed,reason})
  const notify=reason=>{const state=snapshot(reason);for(const listener of [...listeners]){try{listener(state)}catch(error){report(error,'subscriber')}}return state}
  const apply=()=>{if(target){writeAttribute(target,'data-ui-motion-preference',preference);writeAttribute(target,'data-ui-motion',resolvedPreference)}}
  const sync=(reason='sync')=>{const next=resolveMotionPreference(preference,Boolean(media?.matches));const changed=next!==resolvedPreference;resolvedPreference=next;apply();return changed?notify(reason):snapshot(reason)}
  const mediaChange=event=>{if(media&&typeof event?.matches==='boolean'&&media.matches!==event.matches){try{media.matches=event.matches}catch{}};if(preference==='system')sync('system')}
  const attachMedia=()=>{const match=matcher();if(typeof match!=='function')return;try{media=match('(prefers-reduced-motion: reduce)');media?.addEventListener?.('change',mediaChange);if(!media?.addEventListener)media?.addListener?.(mediaChange)}catch(error){media=null;report(error,'match-media')}}
  const detachMedia=()=>{media?.removeEventListener?.('change',mediaChange);if(!media?.removeEventListener)media?.removeListener?.(mediaChange);media=null}
  const persist=value=>{if(storageKey)try{storage()?.setItem?.(storageKey,value)}catch(error){report(error,'persist')}}
  const setPreference=(value,setOptions={})=>{
    if(disposed)throw new Error('Motion controller is disposed')
    const next=normalizeMotionPreference(value),changed=next!==preference,before=resolvedPreference
    preference=next
    if(setOptions.persist!==false)persist(next)
    resolvedPreference=resolveMotionPreference(preference,Boolean(media?.matches));apply()
    return changed||before!==resolvedPreference?notify(setOptions.reason||'set'):snapshot(setOptions.reason||'set')
  }
  const mount=mountTarget=>{
    if(disposed)throw new Error('Motion controller is disposed')
    if(mounted)return snapshot('mount')
    target=mountTarget??options.target??globalThis.document?.documentElement??null
    previous=target?{preference:readAttribute(target,'data-ui-motion-preference'),resolved:readAttribute(target,'data-ui-motion')}:null
    if(storageKey)try{const saved=storage()?.getItem?.(storageKey);if(saved&&preferenceSet.has(String(saved).toLowerCase()))preference=String(saved).toLowerCase()}catch(error){report(error,'restore')}
    attachMedia();resolvedPreference=resolveMotionPreference(preference,Boolean(media?.matches));mounted=true;apply();return notify('mount')
  }
  const toggle=toggleOptions=>setPreference(resolvedPreference==='reduced'?'full':'reduced',{...toggleOptions,reason:toggleOptions?.reason||'toggle'})
  const subscribe=(listener,subscribeOptions={})=>{if(typeof listener!=='function')throw new TypeError('Motion subscriber must be a function');if(disposed)throw new Error('Motion controller is disposed');listeners.add(listener);if(subscribeOptions.immediate)listener(snapshot('subscribe'));return()=>listeners.delete(listener)}
  const dispose=(disposeOptions={})=>{
    if(disposed)return snapshot('dispose')
    detachMedia()
    if(target&&disposeOptions.restore!==false&&previous){restoreAttribute(target,'data-ui-motion-preference',previous.preference);restoreAttribute(target,'data-ui-motion',previous.resolved)}
    mounted=false;disposed=true;const state=notify('dispose');listeners.clear();target=null;return state
  }
  return Object.freeze({
    mount,setPreference,toggle,subscribe,dispose,
    get preference(){return preference},get resolvedPreference(){return resolvedPreference},get reduced(){return resolvedPreference==='reduced'},get mounted(){return mounted},get disposed(){return disposed},get state(){return snapshot('read')},
  })
}

export function useReducedMotion(){
  const injected=inject(lanUiMotionKey,null)
  const config=inject(Symbol.for('lan-ui-config'),null)
  const systemReduced=ref(false)
  let media=null
  const sync=event=>{systemReduced.value=Boolean(event?.matches??media?.matches)}
  onMounted(()=>{
    if(injected)return
    if(typeof globalThis.matchMedia!=='function')return
    media=globalThis.matchMedia('(prefers-reduced-motion: reduce)');sync(media)
    media.addEventListener?.('change',sync);if(!media.addEventListener)media.addListener?.(sync)
  })
  onBeforeUnmount(()=>{media?.removeEventListener?.('change',sync);if(!media?.removeEventListener)media?.removeListener?.(sync);media=null})
  return computed(()=>{
    const scope=unref(injected)
    if(scope?.resolvedPreference)return scope.resolvedPreference==='reduced'
    return resolveMotionPreference(unref(config)?.motion||'system',systemReduced.value)==='reduced'
  })
}
