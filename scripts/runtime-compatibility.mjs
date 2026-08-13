import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root=resolve(import.meta.dirname,'..')
const manifest=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'))
const vueManifest=JSON.parse(readFileSync(resolve(root,'node_modules/vue/package.json'),'utf8'))
const workflow=readFileSync(resolve(root,'.github/workflows/ci.yml'),'utf8')
const engine='^20.19.0 || >=22.12.0'
const matrix=['20.19.0','22.12.0','24']

function assert(condition,message){if(!condition)throw new Error(message)}
function parse(version){
  const match=/^(\d+)\.(\d+)\.(\d+)/.exec(version)
  assert(match,`Invalid semantic runtime version: ${version}`)
  return match.slice(1).map(Number)
}

const [major,minor]=parse(process.versions.node)
const supported=(major===20&&minor>=19)||(major===22&&minor>=12)||major>22
assert(supported,`Node ${process.versions.node} is outside the supported runtime range ${engine}`)
assert(manifest.engines?.node===engine,`package.json engines.node must remain ${engine}`)

const [vueMajor,vueMinor]=parse(vueManifest.version)
assert(vueMajor===3&&vueMinor>=5,`Vue ${vueManifest.version} is below the supported 3.5 line`)

const expected=process.env.LAN_UI_EXPECTED_NODE?.trim()
if(expected){
  const [expectedMajor,expectedMinor]=parse(expected.includes('.')?expected:`${expected}.0.0`)
  assert(major===expectedMajor,`Expected Node ${expected}, received ${process.versions.node}`)
  if(expected.includes('.'))assert(minor===expectedMinor,`Expected Node ${expected}, received ${process.versions.node}`)
}

for(const marker of [
  'compatibility:',
  'matrix:',
  ...matrix,
  'pnpm run test:compatibility',
  'LAN_UI_EXPECTED_NODE',
])assert(workflow.includes(marker),`CI compatibility matrix is missing ${marker}`)

console.log(`RUNTIME_COMPATIBILITY PASS node=${process.versions.node} expected=${expected||'local'} engine="${engine}" vue=${vueManifest.version} matrix=${matrix.join(',')}`)
