import { computed, reactive } from 'vue'
import { createLocaleRegistry, lanUiConfigKey, normalizeLanUiConfig } from './config.js'
import { createLanUiFeedback, feedback as defaultFeedback, lanUiFeedbackKey } from './feedback.js'
import { createIconRegistry, iconRegistryKey } from './icons.js'
import * as library from './components.js'

export function createLanUi(options={}){
  const localeRegistry=options.localeRegistry||createLocaleRegistry()
  const config=reactive(normalizeLanUiConfig(options,undefined,localeRegistry))
  const provided=computed(()=>config)
  const ownsFeedback=!options.feedback&&options.isolated===true
  const feedback=options.feedback||(ownsFeedback?createLanUiFeedback():defaultFeedback)
  const iconRegistry=options.iconRegistry||createIconRegistry(options.icons)
  const installedApps=new WeakSet()
  return {
    config,
    feedback,
    localeRegistry,
    iconRegistry,
    setLocale(locale){config.locale=normalizeLanUiConfig({locale},config,localeRegistry).locale},
    setAppearance(appearance){config.appearance=normalizeLanUiConfig({appearance},config,localeRegistry).appearance},
    setTheme(theme){
      const next=normalizeLanUiConfig({theme},config,localeRegistry)
      config.theme=next.theme
      config.themeName=next.themeName
      config.appearance=next.appearance
    },
    setFallbackLocale(fallbackLocale){
      const next=normalizeLanUiConfig({fallbackLocale},config,localeRegistry)
      config.fallbackLocale=next.fallbackLocale
      config.fallbackLocales=next.fallbackLocales
    },
    registerLocale(locale,aliases=[]){return localeRegistry.register(locale,aliases)},
    unregisterLocale(name){return localeRegistry.unregister(name)},
    hasLocale(name){return localeRegistry.has(name)},
    listLocales(){return localeRegistry.list()},
    async loadLocale(name,loader,loadOptions={}){
      const locale=await localeRegistry.load(name,loader,loadOptions)
      if(loadOptions.activate)config.locale=normalizeLanUiConfig({locale},config,localeRegistry).locale
      return locale
    },
    registerIcon(name,definition,registerOptions){return iconRegistry.register(name,definition,registerOptions)},
    unregisterIcon(name,unregisterOptions){return iconRegistry.unregister(name,unregisterOptions)},
    hasIcon(name){return iconRegistry.has(name)},
    listIcons(){return iconRegistry.list()},
    dispose(){if(ownsFeedback)feedback.dispose()},
    install(app){
      app.provide(lanUiConfigKey,provided)
      app.provide(lanUiFeedbackKey,feedback)
      app.provide(iconRegistryKey,iconRegistry)
      for(const [name,component] of Object.entries(library))app.component(name,component)
      app.config.globalProperties.$lanUi=config
      if(ownsFeedback&&!installedApps.has(app)){
        installedApps.add(app)
        app.onUnmount?.(()=>feedback.dispose())
      }
    },
  }
}
export const LanUi=createLanUi()
export default LanUi
