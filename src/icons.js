import { inject, shallowReactive } from 'vue'
import { BUILTIN_ICONS, BUILTIN_ICON_NAMES, defineIcon } from './icon-definitions.js'
import { iconRegistryKey } from './icon-context.js'

export { BUILTIN_ICONS, BUILTIN_ICON_NAMES, defineIcon } from './icon-definitions.js'
export { iconRegistryKey } from './icon-context.js'

const iconNamePattern=/^[A-Za-z][A-Za-z0-9_-]*$/

function iconEntries(input){
  if(!input)return []
  if(input instanceof Map)return [...input.entries()]
  if(typeof input==='object')return Object.entries(input)
  throw new TypeError('Initial icons must be an object or Map')
}
function validateName(name){
  if(typeof name!=='string'||!iconNamePattern.test(name))throw new TypeError('Icon name must start with a letter and contain only letters, numbers, underscores or hyphens')
  return name
}

export function createIconRegistry(initialIcons={},options={}){
  const includeBuiltIns=options.includeBuiltIns!==false
  const icons=shallowReactive(new Map(includeBuiltIns?Object.entries(BUILTIN_ICONS):[]))
  const builtIns=new Set(includeBuiltIns?BUILTIN_ICON_NAMES:[])
  const registry={
    register(name,definition,registerOptions={}){
      const key=validateName(name)
      if(icons.has(key)&&registerOptions.override!==true)throw new Error(`Icon already registered: ${key}`)
      const normalized=defineIcon(definition);icons.set(key,normalized);return normalized
    },
    unregister(name,unregisterOptions={}){
      const key=validateName(name)
      if(builtIns.has(key)&&unregisterOptions.force!==true)return false
      return icons.delete(key)
    },
    get(name){return icons.get(String(name))},
    has(name){return icons.has(String(name))},
    isBuiltin(name){const key=String(name);return builtIns.has(key)&&icons.get(key)===BUILTIN_ICONS[key]},
    list(){return [...icons.keys()].sort((left,right)=>left<right?-1:left>right?1:0)},
    resolve(name,fallback='circle'){return icons.get(String(name))||icons.get(String(fallback))||null},
    get size(){return icons.size},
  }
  for(const [name,definition] of iconEntries(initialIcons))registry.register(name,definition)
  return Object.freeze(registry)
}

export const defaultIconRegistry=createIconRegistry()
export function registerIcon(name,definition,options){return defaultIconRegistry.register(name,definition,options)}
export function unregisterIcon(name,options){return defaultIconRegistry.unregister(name,options)}
export function hasIcon(name){return defaultIconRegistry.has(name)}
export function listIcons(){return defaultIconRegistry.list()}
export function useIconRegistry(){return inject(iconRegistryKey,defaultIconRegistry)}
