import {
  createLocaleRegistry,
  createLocaleTools,
  enUS,
} from '../src/config.js'

function assert(condition,message){if(!condition)throw new Error(message)}
const locale=(name,messages={})=>({name,messages})

const registry=createLocaleRegistry([
  locale('es-ES',{active:'Activo'}),
  locale('fr-FR',{secondary:'Secondaire'}),
])
assert(registry.list().length===4,'Registry seed count failed')
registry.register(locale('pt-BR',{hello:'Olá'}),['pt'])
assert(registry.get('pt')?.name==='pt-BR','Registry alias failed')
assert(registry.get('PT-br')?.name==='pt-BR','Registry canonical lookup failed')
try{registry.register(locale('pt',{hello:'Conflict'}));throw new Error('Alias-name collision unexpectedly succeeded')}catch(error){assert(error.message==='Locale name already registered as an alias: pt','Alias-name collision contract failed')}
assert(!registry.unregister('en')&&registry.has('en-US'),'Built-in locale protection failed')
try{registry.register(locale('fixture',{hello:'Fixture'}),['zh']);throw new Error('Alias collision unexpectedly succeeded')}catch(error){assert(error.message==='Locale alias already registered: zh','Alias collision contract failed')}

let calls=0
const loader=async()=>{
  calls+=1
  await Promise.resolve()
  return {default:locale('de-DE',{hello:'Hallo'})}
}
const [first,second]=await Promise.all([
  registry.load('de-DE',loader,{aliases:'de'}),
  registry.load('de-DE',loader,{aliases:'de'}),
])
assert(calls===1&&first===second,'Concurrent load deduplication failed')
assert(registry.get('de')===first,'Lazy locale alias failed')

let attempts=0
const retry=()=>{
  attempts+=1
  if(attempts===1)throw new Error('retry fixture')
  return locale('it-IT',{hello:'Ciao'})
}
try{await registry.load('it-IT',retry);throw new Error('Failed loader unexpectedly resolved')}catch(error){assert(error.message==='retry fixture','Loader error was not preserved')}
await registry.load('it-IT',retry)
assert(attempts===2,'Failed loader did not clear pending state')

const tools=createLocaleTools('es-ES',['fr-FR',enUS],registry)
assert(tools.t('active')==='Activo','Active locale resolution failed')
assert(tools.t('secondary')==='Secondaire','Second fallback resolution failed')
assert(tools.t('empty.title')==='No data','Final fallback resolution failed')
assert(tools.fallbackLocales.map(item=>item.name).join(',')==='fr-FR,en-US','Fallback chain normalization failed')

const registryA=createLocaleRegistry()
const registryB=createLocaleRegistry()
registryA.register(locale('nl-NL',{hello:'Hallo'}),['nl'])
assert(registryA.has('nl')&&!registryB.has('nl'),'Registry instance isolation failed')

console.log('LOCALE_REGISTRY_CONTRACT PASS registry=isolated aliases=pass lazy=deduplicated retry=pass fallback-chain=2 activation=unit-covered')
