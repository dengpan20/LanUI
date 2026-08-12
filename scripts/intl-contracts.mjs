import { createLocaleTools, defineLocale, enUS, normalizeLanUiConfig } from '../src/config.js'

function assert(condition,message){if(!condition)throw new Error(message)}

const french=defineLocale({
  name:'fr-FR',
  messages:{
    greeting:'Bonjour {name}',
    items:{'=0':'Aucun article',one:'{count} article',other:'{count} articles'},
  },
})
const fr=createLocaleTools(french,enUS)
assert(fr.locale.name==='fr-FR','Custom locale name was not preserved')
assert(fr.fallbackLocale?.name==='en-US','Fallback locale was not preserved')
assert(fr.t('greeting',{name:'Lan'})==='Bonjour Lan','Active message interpolation failed')
assert(fr.t('empty.title')==='No data','Per-key fallback resolution failed')
assert(fr.tc('items',0)==='Aucun article','Exact plural choice failed')
assert(fr.tc('items',1)==='1 article','Singular plural choice failed')
assert(fr.tc('items',2)==='2 articles','Other plural choice failed')

const en=createLocaleTools(enUS,false)
assert(en.t('missing.key')==='missing.key','Disabled fallback did not return the key')
assert(en.formatNumber(1234567.89,{maximumFractionDigits:2})==='1,234,567.89','Number formatting failed')
assert(en.formatDate('2026-08-12T00:00:00Z',{dateStyle:'medium',timeZone:'UTC'})==='Aug 12, 2026','Date formatting failed')
assert(en.formatRelativeTime(-1,'day',{numeric:'auto'})==='yesterday','Relative-time formatting failed')
assert(en.formatList(['Alpha','Beta','Gamma'])==='Alpha, Beta, and Gamma','List formatting failed')
assert(en.formatDate('not-a-date')==='','Invalid date contract failed')

const unknown=normalizeLanUiConfig({locale:'ar-EG',fallbackLocale:'en-US'})
assert(unknown.locale.name==='ar-EG','Unknown locale collapsed to a built-in locale')
assert(Object.keys(unknown.locale.messages).length===0,'Unknown locale unexpectedly inherited built-in messages')
assert(unknown.fallbackLocale?.name==='en-US','Configured fallback was not normalized')

console.log('INTL_CONTRACT PASS fallback=per-key plural=exact+categories number=pass date=pass relative=pass list=pass unknown-locale=preserved')
