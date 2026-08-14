// @vitest-environment happy-dom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import ApiReferencePage from '../src/pages/ApiReferencePage.vue'
import docs from '../src/generated/component-api.json'

const root=resolve(import.meta.dirname,'..')
const manifest=JSON.parse(readFileSync(resolve(root,'api-manifest.json'),'utf8'))
const publicDocs=JSON.parse(readFileSync(resolve(root,'public/component-api.json'),'utf8'))
const markdown=readFileSync(resolve(root,'COMPONENT-API.md'),'utf8')
const mounted=[]
afterEach(()=>{while(mounted.length)mounted.pop().unmount();history.replaceState(null,'','/')})

describe('P37 generated component API documentation',()=>{
  it('publishes schema 3 signature and runtime default details for every component',()=>{
    expect(manifest.schemaVersion).toBe(3)
    expect(manifest.components).toHaveLength(78)
    for(const component of manifest.components){
      expect(component.propDetails.map(item=>item.name)).toEqual(component.props)
      expect(component.emitDetails.map(item=>item.name)).toEqual(component.emits)
      expect(component.slotDetails.map(item=>item.name)).toEqual(component.slots)
      expect(component.imports.root).toContain(component.name)
    }
    const button=manifest.components.find(component=>component.name==='UiButton')
    expect(button.propDetails.find(prop=>prop.name==='variant')).toMatchObject({type:"'primary'|'secondary'|'outline'|'text'|'danger'|'danger-outline'",default:{kind:'literal',value:'"primary"'}})
    const tour=manifest.components.find(component=>component.name==='UiTour')
    expect(tour.props).toContain('targetClickable')
    expect(tour.emits).toContain('target-missing')
    expect(tour.slots).toEqual(['actions','description','indicator','title'])
    const watermark=manifest.components.find(component=>component.name==='UiWatermark')
    expect(watermark.props).toEqual(expect.arrayContaining(['content','font','gap','image','observe']))
    expect(watermark.emits).toEqual(['image-error','image-load','remove','render'])
    expect(watermark.slots).toEqual(['default'])
    const affix=manifest.components.find(component=>component.name==='UiAffix')
    expect(affix.props).toEqual(['boundary','disabled','observe','offset','position','target','zIndex'])
    expect(affix.emits).toEqual(['change','error','scroll'])
    expect(affix.slots).toEqual(['default'])
  })

  it('covers every component exactly once across stable documentation categories',()=>{
    expect(docs).toEqual(publicDocs)
    expect(docs.schemaVersion).toBe(1)
    expect(docs.categories).toHaveLength(6)
    expect(docs.categories.reduce((sum,category)=>sum+category.count,0)).toBe(78)
    expect(new Set(docs.components.map(component=>component.name)).size).toBe(78)
    expect(docs.components.every(component=>docs.categories.some(category=>category.id===component.category))).toBe(true)
  })

  it('generates portable Markdown with imports, props, events and slots',()=>{
    expect(markdown).toContain('Generated from `api-manifest.json` schema 3')
    expect(markdown).toContain("import { UiUpload } from 'lan-ui-design-system'")
    expect(markdown).toContain('#### Events · `UiUploadEmits`')
    expect(markdown).toContain('#### Slots · `UiUploadSlots`')
    expect(markdown).toContain("import { UiTour } from 'lan-ui-design-system'")
    expect(markdown).toContain("import { UiWatermark } from 'lan-ui-design-system'")
    expect(markdown).toContain("import { UiAffix } from 'lan-ui-design-system'")
  })

  it('filters the browser index and opens a deep-linkable API contract',async()=>{
    const wrapper=mount(ApiReferencePage,{attachTo:document.body})
    mounted.push(wrapper)
    await wrapper.get('input[aria-label="搜索组件 API"]').setValue('Upload')
    expect(wrapper.findAll('.api-reference-index nav button')).toHaveLength(1)
    await wrapper.get('.api-reference-index nav button').trigger('click')
    expect(wrapper.get('.api-reference-detail h2').text()).toBe('UiUpload')
    expect(location.hash).toBe('#/api?component=UiUpload')
    expect(wrapper.text()).toContain('autoUpload')
    expect(wrapper.text()).toContain('update:modelValue')
  })

  it('keeps generated docs behind package drift gates and app routing',()=>{
    const packageJson=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'))
    const app=readFileSync(resolve(root,'src/App.vue'),'utf8')
    expect(packageJson.scripts['api:check']).toContain('api-docs.mjs')
    expect(packageJson.scripts.prepack).toContain('api:check')
    expect(app).toContain("'/api': { title:'API 参考'")
    expect(app).toContain("split('?')[0]")
  })
})
