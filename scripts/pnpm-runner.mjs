import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

function nodeRunner(path,execPath){return {kind:'node',command:execPath,prefix:[path],target:path,shell:false}}

export function resolveRunner(path,{platform=process.platform,execPath=process.execPath,comSpec=process.env.ComSpec||'cmd.exe'}={}){
  const value=String(path||'')
  if(/\.(?:mjs|cjs|js)$/i.test(value))return nodeRunner(value,execPath)
  if(platform==='win32'&&/\.(?:cmd|bat)$/i.test(value))return {kind:'cmd',command:comSpec,prefix:['/d','/s','/c'],target:value,shell:true}
  return {kind:'direct',command:value,prefix:[],target:value,shell:false}
}

export function resolvePnpmRunner({npmExecPath=process.env.npm_execpath,platform=process.platform,execPath=process.execPath,comSpec=process.env.ComSpec||'cmd.exe',exists=existsSync}={}){
  if(npmExecPath&&/pnpm/i.test(npmExecPath)&&exists(npmExecPath))return resolveRunner(npmExecPath,{platform,execPath,comSpec})
  const bundledPnpm=resolve(dirname(execPath),'..','node_modules','pnpm','bin','pnpm.mjs')
  if(exists(bundledPnpm))return resolveRunner(bundledPnpm,{platform,execPath,comSpec})
  if(platform==='win32')return resolveRunner('pnpm.cmd',{platform,execPath,comSpec})
  return resolveRunner('pnpm',{platform,execPath,comSpec})
}

export function packedFilesFromTree(packageRoot,collectFiles){
  const files=collectFiles(packageRoot)
  const prefix=`${packageRoot.replaceAll('\\','/')}/`
  return new Set(files.map(path=>path.replaceAll('\\','/').startsWith(prefix)?path.replaceAll('\\','/').slice(prefix.length):path.replaceAll('\\','/')))
}
