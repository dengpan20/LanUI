import { installBuiltInLocale } from './config-runtime.js'
import { enUS } from './locales/en-US.js'

installBuiltInLocale(enUS,['en'])

export { enUS }
export { createLocaleRegistry, createLocaleTools, defaultLocaleRegistry, defineLocale, hasLocale, lanUiConfigKey, listLocales, loadLocale, normalizeLanUiConfig, registerLocale, unregisterLocale, useComponentSize, useDirection, useLanUiConfig, useLocale, zhCN } from './config-runtime.js'
