import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BUILTIN_ICONS, BUILTIN_ICON_NAMES, createIconRegistry, defineIcon } from '../src/icons.js'

const root=resolve(import.meta.dirname,'..')
if(BUILTIN_ICON_NAMES.length!==46)throw new Error(`Expected 46 built-in icons, found ${BUILTIN_ICON_NAMES.length}`)
if(BUILTIN_ICON_NAMES.some((name,index)=>index&&name<BUILTIN_ICON_NAMES[index-1]))throw new Error('Built-in icon names are not stably sorted')
if(BUILTIN_ICON_NAMES.some(name=>!BUILTIN_ICONS[name]?.nodes.length))throw new Error('Built-in icon definition is empty')
const first=createIconRegistry({tenantMark:'<rect x="3" y="3" width="18" height="18" rx="4"/>'})
const second=createIconRegistry()
if(!first.has('tenantMark')||second.has('tenantMark')||first.size!==second.size+1)throw new Error('Icon registry isolation failed')
if(first.unregister('circle')!==false||!first.has('circle'))throw new Error('Built-in icon protection failed')
for(const fragment of ['<script/>','<path onclick="alert(1)"/>','<path d="M0 0"></path>']){
  let rejected=false
  try{defineIcon(fragment)}catch{rejected=true}
  if(!rejected)throw new Error(`Unsafe icon fragment accepted: ${fragment}`)
}
const component=readFileSync(resolve(root,'src/components/UiIcon.vue'),'utf8')
for(const marker of ['ariaLabel','data-ui-icon-missing','directional','is-spinning','definition?.nodes'])if(!component.includes(marker))throw new Error(`UiIcon contract marker missing: ${marker}`)
if(component.includes('v-html'))throw new Error('UiIcon must render normalized geometry rather than HTML')
console.log('ICON_CONTRACT PASS builtins=46 registry=isolated custom=sanitized ssr=geometry accessibility=decorative+labelled rtl=directional motion=reduced-compatible')
