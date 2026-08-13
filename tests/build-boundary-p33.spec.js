import { readFileSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'

const root=resolve(import.meta.dirname,'..')

describe('P33 package build boundaries',()=>{
  it('keeps English locale data outside a component-only runtime until the public config facade is loaded',()=>{
    const script=`
      const runtime=await import('./src/config-runtime.js')
      const before=runtime.listLocales().map(locale=>locale.name)
      const config=await import('./src/config.js')
      const after=runtime.listLocales().map(locale=>locale.name)
      const protectedEnglish=config.unregisterLocale('en-US')
      console.log(JSON.stringify({before,after,protectedEnglish,enName:config.enUS.name}))
    `
    const result=spawnSync(process.execPath,['--input-type=module','--eval',script],{cwd:root,encoding:'utf8'})
    expect(result.status,result.stderr).toBe(0)
    expect(JSON.parse(result.stdout.trim())).toEqual({before:['zh-CN'],after:['zh-CN','en-US'],protectedEnglish:false,enName:'en-US'})
  })

  it('routes public components through the lean runtime while the provider owns the full config facade',()=>{
    const componentDirectory=resolve(root,'src/components')
    const files=readdirSync(componentDirectory).filter(name=>name.endsWith('.vue'))
    const facade=[]
    const runtime=[]
    for(const file of files){
      const source=readFileSync(resolve(componentDirectory,file),'utf8')
      if(source.includes("from '../config.js'"))facade.push(file)
      if(source.includes("from '../config-runtime.js'"))runtime.push(file)
    }
    expect(facade).toEqual(['UiConfigProvider.vue'])
    expect(runtime.length).toBeGreaterThanOrEqual(50)
  })

  it('keeps the schema and form-list component styles inside the lan-ui cascade layer',()=>{
    const css=postcss.parse(readFileSync(resolve(root,'styles.css'),'utf8'))
    const rules=[]
    css.walkRules(rule=>{if(rule.selector.includes('.ui-schema-form')||rule.selector.includes('.form-list-row'))rules.push(rule)})
    expect(rules.length).toBeGreaterThan(4)
    expect(rules.every(rule=>{
      let parent=rule.parent
      while(parent){if(parent.type==='atrule'&&parent.name==='layer'&&parent.params.trim()==='lan-ui')return true;parent=parent.parent}
      return false
    })).toBe(true)
  })
})
