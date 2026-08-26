// @vitest-environment happy-dom
import fs from 'node:fs'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiLayout from '../src/components/UiLayout.vue'
import UiGrid from '../src/components/UiGrid.vue'
import UiCol from '../src/components/UiCol.vue'
import UiSpace from '../src/components/UiSpace.vue'
import UiDivider from '../src/components/UiDivider.vue'
import { safeLength } from '../src/layout.js'

afterEach(()=>document.body.replaceChildren())

describe('P83 layout primitive contracts',()=>{
  it('accepts strict CSS length expressions and rejects unsafe or malformed values',()=>{
    for(const [input,expected] of [['calc(100% - 2px)','calc(100% - 2px)'],['clamp(10px,50%,100px)','clamp(10px,50%,100px)'],['auto','auto'],['fit-content(200px)','fit-content(200px)'],['100%','100%'],['1rem','1rem']])expect(safeLength(input,'fallback')).toBe(expected)
    for(const input of ['calc()','fit-content()','calc(100%','calc(100% - -2px)','url(javascript:alert(1))','expression(1)','1e999px','10px; color:red','calc(10px /*x*/ + 1px)'])expect(safeLength(input,'fallback')).toBe('0px')
    expect(safeLength('-2px','fallback')).toBe('0px')
    expect(safeLength('-2px','fallback',{allowNegative:true})).toBe('-2px')
    expect(safeLength(undefined,'1rem')).toBe('1rem')
  })
  it('keeps legacy defaults and exposes SSR-safe instance inspection',()=>{
    const wrapper=mount(UiLayout,{slots:{default:()=>h('span','content')}})
    expect(wrapper.classes()).toContain('direction-vertical')
    expect(wrapper.attributes('style')).toContain('--layout-gap: 0px')
    expect(wrapper.getComponent(UiLayout).vm.getElement()).toBe(wrapper.element)
    expect(wrapper.getComponent(UiLayout).vm.getRect()).toBeTruthy()
    const grid=mount(UiGrid,{slots:{default:()=>h(UiCol,{span:4},()=>h('b','cell'))}})
    expect(grid.classes()).toContain('mode-fixed')
    expect(grid.getComponent(UiCol).attributes('style')).toContain('--col-span: 4')
    const space=mount(UiSpace,{slots:{default:()=>[h('i','a'),h('i','b')]}})
    expect(space.classes()).toContain('direction-horizontal')
    expect(space.attributes('style')).toContain('--space-size: 8px')
  })

  it('normalizes responsive values, grid modes and actual-column offsets',()=>{
    const wrapper=mount(UiGrid,{props:{columns:4,gap:[8,16],rowGap:12,columnGap:20,mode:'fixed',autoFlow:'column'},slots:{default:()=>h(UiCol,{span:9,offset:2,rowSpan:2,order:3},()=>h('b','cell'))}})
    const col=wrapper.getComponent(UiCol)
    expect(wrapper.attributes('style')).toContain('--grid-columns: 4')
    expect(wrapper.attributes('style')).toContain('--grid-row-gap-row: 12px')
    expect(wrapper.attributes('style')).toContain('--grid-column-gap-row: 20px')
    expect(col.attributes('style')).toContain('--col-span: 4')
    expect(col.attributes('style')).toContain('--col-offset: 2')
    expect(col.attributes('style')).toContain('--col-start: 3')
    expect(col.attributes('style')).toContain('--col-row-span: 2')
    const responsive=mount(UiLayout,{props:{gap:{xs:4,md:16},padding:{sm:8,lg:'1rem'},direction:{xs:'vertical',md:'horizontal'}}})
    expect(responsive.attributes('style')).toContain('--layout-gap-xs: 4px')
    expect(responsive.attributes('style')).toContain('--layout-gap-md: 16px')
    expect(responsive.attributes('style')).toContain('--layout-padding-sm: 8px')
    expect(responsive.attributes('style')).toContain('--layout-direction-md: row')
    expect(mount(UiGrid,{props:{min:240}}).classes()).toContain('mode-auto-fit')
    expect(mount(UiGrid,{props:{min:240,mode:'auto-fill'}}).classes()).toContain('mode-auto-fill')
    const autoPlacement=mount(UiGrid,{props:{columns:4},slots:{default:()=>h(UiCol,{span:1},()=>h('b','auto'))}}).getComponent(UiCol)
    expect(autoPlacement.attributes('style')).toContain('--col-start: auto')
  })

  it('inserts only semantic-space separators and preserves plain children',async()=>{
    const wrapper=mount(UiSpace,{props:{separator:'|'},slots:{default:()=>[h('button',{class:'first'},'A'),h('span',{class:'second'},'B'),h('i',{class:'third'},'C')]}})
    expect(wrapper.findAll('.ui-space-separator')).toHaveLength(2)
    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(2)
    expect(wrapper.findAll('button')).toHaveLength(1)
    await wrapper.setProps({separator:false})
    await nextTick()
    expect(wrapper.findAll('.ui-space-separator')).toHaveLength(0)
  })

  it('supports Divider precedence, label slot and decorative semantics',()=>{
    const legacy=mount(UiDivider,{props:{vertical:true,dashed:true,orientation:'horizontal',variant:'solid',label:'Legacy'}})
    expect(legacy.classes()).toContain('vertical')
    expect(legacy.classes()).toContain('dashed')
    expect(legacy.attributes('aria-orientation')).toBe('vertical')
    const semantic=mount(UiDivider,{props:{orientation:'horizontal',variant:'dotted',labelPosition:'end'},slots:{label:()=>h('strong',{class:'custom-label'},'Custom')}})
    expect(semantic.classes()).toContain('variant-dotted')
    expect(semantic.find('.custom-label').exists()).toBe(true)
    const decorative=mount(UiDivider,{props:{decorative:true,label:'ignored'}})
    expect(decorative.attributes('aria-hidden')).toBe('true')
    expect(decorative.attributes('role')).toBeUndefined()
  })

  it('renders deterministic SSR output without reading viewport globals',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiLayout,{gap:{xs:4,md:16}},()=>h(UiGrid,{columns:{xs:1,md:3}},()=>h(UiCol,{span:{xs:1,md:2}},()=>h('span','SSR'))))}))
    expect(html).toContain('ui-layout')
    expect(html).toContain('--layout-gap-xs:4px')
    expect(html).toContain('--grid-columns-xs:1')
    expect(html).toContain('SSR')
  })

  it('keeps generated family styles logical and motion-free',()=>{
    const styles=fs.readFileSync('styles.css','utf8')
    expect(styles).toContain('margin-inline')
    expect(styles).toContain('padding-inline')
    expect(styles).toMatch(/@media\s*\(min-width:576px\)/)
    expect(styles).toContain('.ui-divider.decorative')
    expect(styles).not.toMatch(/ui-layout[^\n]*transition:/)
  })

  it('keeps the P83 showcase controls responsive and its horizontal grid flexible',()=>{
    const page=fs.readFileSync('src/pages/ComponentsPage.vue','utf8')
    const styles=fs.readFileSync('styles.css','utf8')
    expect(page).toContain('data-layout-p83-demo')
    expect(page).toContain('class="layout-primitive-stage"')
    expect(styles).toMatch(/\.layout-demo-section\s*>\s*\.demo-controls\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(4,minmax\(0,1fr\)\)\s+auto/)
    expect(page).toContain(":direction=\"{xs:'vertical',md:layoutDemoDirection}\"")
    expect(styles).toMatch(/@media\s*\(min-width:768px\)\s*\{\.layout-primitive-stage\.is-horizontal\s*>\s*\.ui-grid\s*\{[^}]*flex:\s*1 1 0/)
  })
})
