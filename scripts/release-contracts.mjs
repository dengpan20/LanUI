import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { assertCanonicalTgz } from './normalize-tgz.mjs'

const root=resolve(import.meta.dirname,'..')

function assert(condition,message){if(!condition)throw new Error(message)}
function run(command,args){
  const result=spawnSync(command,args,{cwd:root,encoding:'utf8',windowsHide:true})
  if(result.status!==0)throw new Error(`${command} ${args.join(' ')} failed (${result.status})\n${result.stdout||''}\n${result.stderr||''}`)
  return result.stdout
}
function parseArgs(args){
  const options={}
  for(let index=0;index<args.length;index+=2){
    const key=args[index]?.replace(/^--/,'')
    assert(key&&index+1<args.length,`Missing value for ${args[index]||'argument'}`)
    options[key]=args[index+1]
  }
  return options
}

export function validateRelease({ref,tag=false,artifact,writeChecksum=true}={}){
  const manifest=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'))
  const budgets=JSON.parse(readFileSync(resolve(root,'performance-budgets.json'),'utf8')).distributionBudgets
  const componentNames=JSON.parse(readFileSync(resolve(root,'api-manifest.json'),'utf8')).components.map(component=>component.name)
  const changelog=readFileSync(resolve(root,'CHANGELOG.md'),'utf8')
  const workflow=readFileSync(resolve(root,'.github/workflows/release.yml'),'utf8')
  const version=manifest.version
  assert(/^\d+\.\d+\.\d+$/.test(version),`Release version is not semantic: ${version}`)
  assert(changelog.includes(`## [${version}]`),`CHANGELOG does not contain ${version}`)
  assert(manifest.private===false,'Release package must be public')
  assert(manifest.license==='MIT','Release package must retain the MIT license')
  assert(manifest.repository?.url==='git+https://github.com/dengpan20/LanUI.git','Repository metadata mismatch')
  assert(manifest.publishConfig?.access==='public'&&manifest.publishConfig?.provenance===true,'Public provenance metadata is missing')
  for(const marker of [
    'workflow_dispatch:',
    'tags:',
    'actions/upload-artifact@v7',
    'actions/attest@v4',
    'subject-path:',
    'artifact-metadata: write',
    'gh release create',
    'pnpm run prepack',
    'version: 10.34.0',
  ])assert(workflow.includes(marker),`Release workflow is missing ${marker}`)
  assert(typeof ref==='string'&&ref.length>0,'Release ref is required')
  assert(!/[\s\\]/.test(ref),'Release ref contains unsafe characters')
  if(tag)assert(ref===`v${version}`,`Tag ${ref} must exactly match package version v${version}`)

  let digest='none'
  let fileCount=0
  if(artifact){
    const absolute=resolve(artifact)
    assert(existsSync(absolute),`Release artifact is missing: ${absolute}`)
    assertCanonicalTgz(absolute)
    const expectedName=`lan-ui-design-system-${version}.tgz`
    assert(basename(absolute)===expectedName,`Artifact name must be ${expectedName}`)
    const entries=run('tar',['-tzf',absolute]).split(/\r?\n/).filter(Boolean).map(entry=>entry.replace(/\/$/,''))
    fileCount=entries.filter(entry=>entry&&entry!=='package').length
    assert(fileCount<=budgets.packedFiles,`Packed files ${fileCount} exceed ${budgets.packedFiles}`)
    assert(statSync(absolute).size<=budgets.packedTarballRaw,`Tarball exceeds ${budgets.packedTarballRaw}B`)
    const packedManifest=JSON.parse(run('tar',['-xOf',absolute,'package/package.json']))
    assert(packedManifest.name===manifest.name&&packedManifest.version===version,'Packed release identity mismatch')
    assert(packedManifest.private===false&&packedManifest.license==='MIT','Packed release metadata mismatch')
    assert(componentNames.length===91,'Public release component count mismatch')
    for(const name of componentNames){
      for(const entry of [`package/dist-lib/components/${name}.js`,`package/dist-lib/components/${name}.d.ts`,`package/dist-lib/styles/${name}.css`]){
        assert(entries.includes(entry),`Release artifact is missing ${entry}`)
      }
    }
    digest=createHash('sha256').update(readFileSync(absolute)).digest('hex')
    if(writeChecksum)writeFileSync(`${absolute}.sha256`,`${digest}  ${basename(absolute)}\n`,'utf8')
  }
  const report={mode:tag?'tag':'dry-run',ref,version,artifact:artifact?basename(artifact):'none',sha256:digest,files:fileCount,workflow:'upload+attest+github-release'}
  return report
}

export function formatReleaseReport(report){
  return `RELEASE_CONTRACT PASS mode=${report.mode} ref=${report.ref} version=${report.version} artifact=${report.artifact} sha256=${report.sha256==='none'?'none':report.sha256.slice(0,12)} files=${report.files||'none'} workflow=${report.workflow}`
}

const isCli=process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url
if(isCli){
  const options=parseArgs(process.argv.slice(2))
  const report=validateRelease({ref:options.ref,tag:/^(true|1)$/i.test(options.tag||''),artifact:options.artifact})
  console.log(formatReleaseReport(report))
}
