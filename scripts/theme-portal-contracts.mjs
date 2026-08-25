import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root=resolve(import.meta.dirname,'..')
const componentRoot=resolve(root,'src/components')
const records=readdirSync(componentRoot).filter(name=>name.endsWith('.vue')).map(name=>({name,source:readFileSync(resolve(componentRoot,name),'utf8')})).filter(record=>record.source.includes('<Teleport'))
const failures=[]
let teleportCount=0
for(const {name,source} of records){
  const teleports=source.match(/<Teleport\b/g)?.length||0
  const imports=source.match(/import \{ useTeleportThemeScope \} from '\.\.\/theme-scope\.js'/g)?.length||0
  const uses=source.match(/useTeleportThemeScope\(\)/g)?.length||0
  const attrs=source.match(/v-bind="portalThemeAttrs"/g)?.length||0
  const styles=source.match(/portalThemeStyle/g)?.length||0
  teleportCount+=teleports
  if(imports!==1)failures.push(`${name}: expected one theme-scope import, received ${imports}`)
  if(uses!==1)failures.push(`${name}: expected one theme-scope setup call, received ${uses}`)
  if(attrs!==teleports)failures.push(`${name}: expected ${teleports} portal attribute bindings, received ${attrs}`)
  if(styles<teleports+1)failures.push(`${name}: expected setup plus ${teleports} portal style bindings, received ${styles}`)
}
const scopeSource=readFileSync(resolve(root,'src/theme-scope.js'),'utf8')
const providerSource=readFileSync(resolve(componentRoot,'UiConfigProvider.vue'),'utf8')
for(const required of ["Symbol.for('lan-ui-teleport-theme-scope')",'data-ui-teleport-scope','data-ui-resolved-appearance','portalThemeStyle'])if(!scopeSource.includes(required))failures.push(`theme-scope.js: missing ${required}`)
for(const required of ['provide(lanUiTeleportScopeKey,teleportScope)','resolvedAppearance:resolvedAppearance.value',"'--ui-overlay-base':config.value.zIndex",'...themeStyle.value'])if(!providerSource.includes(required))failures.push(`UiConfigProvider.vue: missing ${required}`)
if(records.length!==20||teleportCount!==20)failures.push(`expected 20 current Teleport components, received components=${records.length} teleports=${teleportCount}`)
if(failures.length){console.error(`THEME_PORTAL_CONTRACT FAIL\n- ${failures.join('\n- ')}`);process.exit(1)}
console.log(`THEME_PORTAL_CONTRACT PASS components=${records.length} teleports=${teleportCount} scope=appearance+tokens+locale+size+density+direction`)
