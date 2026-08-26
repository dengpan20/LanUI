import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  closeHttpServerResource,
  closeNodeHttpServer,
  cleanupStaticFixtureOutput,
  combineBrowserErrors,
  startStaticInteractionFixtureServer,
  startStaticFixtureServer,
} from './browser-runtime.mjs'

const root=process.cwd()
const outputDir=resolve(root,'.verify','browser-cleanup-regression-output')
mkdirSync(outputDir,{recursive:true})
cleanupStaticFixtureOutput(outputDir)
assert.equal(existsSync(outputDir),false,'cleanupStaticFixtureOutput removes output directories')

let callbackType=''
const callbackServer={
  listening:true,
  address:()=>({port:1}),
  close(callback){callbackType=typeof callback;queueMicrotask(()=>callback())},
}
await closeNodeHttpServer(callbackServer,{timeout:100})
assert.equal(callbackType,'function','Node close receives its callback signature')

const actualServer=createServer((_,response)=>response.end('ok'))
await new Promise((resolvePromise,reject)=>{
  actualServer.once('error',reject)
  actualServer.listen({host:'127.0.0.1',port:0},resolvePromise)
})
await closeNodeHttpServer(actualServer,{timeout:1000})
assert.equal(actualServer.listening,false,'listening server is closed')

const startingServer=createServer((_,response)=>response.end('ok'))
const starting= new Promise((resolvePromise,reject)=>{
  startingServer.once('error',reject)
  startingServer.listen({host:'127.0.0.1',port:0},resolvePromise)
})
await closeNodeHttpServer(startingServer,{timeout:1000})
await starting
assert.equal(startingServer.listening,false,'server closing during listen leaves no listener')

const stuckServer={listening:true,address:()=>({port:2}),close(){}}
const timeoutError=await closeHttpServerResource(stuckServer,'cleanup-timeout',{timeout:25})
assert.match(timeoutError?.message||'',/BROWSER_CLEANUP_FAIL/)
assert.match(timeoutError?.cause?.message||'',/BROWSER_TIMEOUT stage=close:node-http-server/)

const aggregate=combineBrowserErrors(new Error('primary-failure'),[new Error('cleanup-failure')],'cleanup-regression')
assert.equal(aggregate instanceof AggregateError,true)
assert.equal(aggregate.errors.length,2)

const fixture=await startStaticInteractionFixtureServer(root)
await fixture.server.close()
assert.equal(existsSync(resolve(root,'.verify','interaction-fixture-dist')),false,'successful static close removes build output')

const visualFixture=await startStaticFixtureServer(root,{entry:'visual-regression.html',outputDirName:'cleanup-visual-fixture-dist'})
assert.match(visualFixture.origin,/^http:\/\/127\.0\.0\.1:\d+$/)
await visualFixture.server.close()
assert.equal(existsSync(resolve(root,'.verify','cleanup-visual-fixture-dist')),false,'visual output is removed')

const previewFixture=await startStaticFixtureServer(root,{entry:'component-preview.html',outputDirName:'cleanup-preview-fixture-dist'})
assert.match(previewFixture.origin,/^http:\/\/127\.0\.0\.1:\d+$/)
await previewFixture.server.close()
assert.equal(existsSync(resolve(root,'.verify','cleanup-preview-fixture-dist')),false,'preview output is removed')

console.log('BROWSER_CLEANUP_REGRESSION PASS entries=interaction,visual,preview callback=function listening=closed starting=closed timeout=bounded aggregate=preserved output_removed=3/3 residual=0')
