// @vitest-environment node
import { mkdtempSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { packedFilesFromTree, resolvePnpmRunner, resolveRunner } from '../scripts/pnpm-runner.mjs'

function collectFiles(folder){
  const files=[]
  for(const entry of readdirSync(folder,{withFileTypes:true})){
    const path=join(folder,entry.name)
    if(entry.isDirectory())files.push(...collectFiles(path))
    else files.push(path)
  }
  return files
}

describe('packed consumer P82 runner contracts',()=>{
  it('dispatches JS runners through Node and Windows wrappers through ComSpec',()=>{
    expect(resolveRunner('/opt/pnpm/bin/pnpm.mjs',{platform:'linux',execPath:'/node'})).toMatchObject({kind:'node',command:'/node',prefix:['/opt/pnpm/bin/pnpm.mjs'],shell:false})
    expect(resolveRunner('/opt/pnpm/bin/pnpm.cjs',{platform:'linux',execPath:'/node'})).toMatchObject({kind:'node',command:'/node',shell:false})
    expect(resolveRunner(String.raw`C:\pnpm\pnpm.js`,{platform:'win32',execPath:String.raw`C:\node\node.exe`}).kind).toBe('node')
    expect(resolveRunner(String.raw`C:\pnpm\pnpm.cmd`,{platform:'win32',comSpec:String.raw`C:\Windows\System32\cmd.exe`})).toMatchObject({kind:'cmd',command:String.raw`C:\Windows\System32\cmd.exe`,prefix:['/d','/s','/c'],shell:true})
  })

  it('executes POSIX and other true executables directly',()=>{
    expect(resolveRunner('/usr/local/bin/pnpm',{platform:'linux'})).toMatchObject({kind:'direct',command:'/usr/local/bin/pnpm',prefix:[],shell:false})
    expect(resolveRunner(String.raw`C:\tools\pnpm.exe`,{platform:'win32'})).toMatchObject({kind:'direct',command:String.raw`C:\tools\pnpm.exe`,prefix:[],shell:false})
  })

  it('uses the existing npm runner first and platform fallback second',()=>{
    const npmRunner=resolvePnpmRunner({npmExecPath:'/cache/pnpm.cjs',platform:'linux',execPath:'/node',exists:path=>path==='/cache/pnpm.cjs'})
    expect(npmRunner).toMatchObject({kind:'node',command:'/node',prefix:['/cache/pnpm.cjs']})
    const bundled=resolvePnpmRunner({npmExecPath:'',platform:'linux',execPath:process.execPath,exists:path=>path.replaceAll('\\','/').endsWith('node_modules/pnpm/bin/pnpm.mjs')})
    expect(bundled).toMatchObject({kind:'node',command:process.execPath})
    expect(resolvePnpmRunner({npmExecPath:'',platform:'win32',execPath:'C:/node/node.exe',comSpec:'C:/Windows/System32/cmd.exe',exists:()=>false})).toMatchObject({kind:'cmd',command:'C:/Windows/System32/cmd.exe',target:'pnpm.cmd'})
    expect(resolvePnpmRunner({npmExecPath:'',platform:'linux',execPath:'/node',exists:()=>false})).toMatchObject({kind:'direct',command:'pnpm'})
  })

  it('derives packed files from the real extracted tree when pack stdout is not JSON',()=>{
    const workspace=mkdtempSync(join(tmpdir(),'lan-ui-pack-p82-'))
    try{
      const source=join(workspace,'package');const archive=join(workspace,'package.tgz');const extracted=join(workspace,'extracted','package')
      mkdirSync(join(source,'dist-lib','components'),{recursive:true});writeFileSync(join(source,'package.json'),'{}\n');writeFileSync(join(source,'README.md'),'packed\n');writeFileSync(join(source,'dist-lib','components','UiFloatButton.js'),'export default {}\n')
      const packed=spawnSync('tar',['-czf',archive,'-C',workspace,'package'],{encoding:'utf8'});expect(packed.status).toBe(0);expect(statSync(archive).size).toBeGreaterThan(0)
      mkdirSync(join(workspace,'extracted'),{recursive:true});const unpacked=spawnSync('tar',['-xzf',archive,'-C',join(workspace,'extracted')],{encoding:'utf8'});expect(unpacked.status).toBe(0)
      const files=packedFilesFromTree(extracted,collectFiles)
      expect(files).toEqual(new Set(['package.json','README.md','dist-lib/components/UiFloatButton.js']))
      const nonJsonPackOutput='pnpm notice package: lan-ui-design-system@1.77.0\nnot-json metadata\n'
      expect(nonJsonPackOutput.includes('{')).toBe(false)
      expect(files.has('package.json')).toBe(true)
    }finally{rmSync(workspace,{recursive:true,force:true})}
  })
})
