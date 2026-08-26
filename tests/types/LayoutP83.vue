<script setup lang="ts">
import { h, ref } from 'vue'
import UiLayout, { UiLayout as NamedLayout } from 'lan-ui-design-system/components/UiLayout'
import UiGrid, { UiGrid as NamedGrid } from 'lan-ui-design-system/components/UiGrid'
import UiCol, { UiCol as NamedCol } from 'lan-ui-design-system/components/UiCol'
import UiSpace, { UiSpace as NamedSpace } from 'lan-ui-design-system/components/UiSpace'
import UiDivider, { UiDivider as NamedDivider } from 'lan-ui-design-system/components/UiDivider'
import type { UiBreakpoint, UiLayoutInstance, UiGridInstance, UiColInstance, UiSpaceInstance, UiDividerInstance, UiLayoutProps, UiGridProps, UiColProps, UiSpaceProps, UiDividerProps } from 'lan-ui-design-system'

const breakpoints:UiBreakpoint[]=['xs','sm','md','lg','xl','xxl']
const layoutProps:UiLayoutProps={direction:{xs:'vertical',md:'horizontal'},gap:{xs:4,lg:'1rem'},padding:{sm:8},density:'compact'}
const gridProps:UiGridProps={columns:{xs:1,md:3},gap:[8,'1rem'],mode:'auto-fit',rowGap:12,columnGap:{md:20}}
const colProps:UiColProps={span:{xs:1,md:2},offset:{md:1},rowSpan:2,hidden:{sm:false,md:true}}
const spaceProps:UiSpaceProps={size:{xs:4,md:[8,16]},direction:'horizontal',separator:'|'}
const dividerProps:UiDividerProps={orientation:'vertical',variant:'dotted',labelPosition:'end',decorative:false}
const layout=ref<UiLayoutInstance|null>(null)
const grid=ref<UiGridInstance|null>(null)
const col=ref<UiColInstance|null>(null)
const space=ref<UiSpaceInstance|null>(null)
const divider=ref<UiDividerInstance|null>(null)
const components=[UiLayout,NamedLayout,UiGrid,NamedGrid,UiCol,NamedCol,UiSpace,NamedSpace,UiDivider,NamedDivider]
void [breakpoints,layoutProps,gridProps,colProps,spaceProps,dividerProps,layout,grid,col,space,divider,components,h]

// @ts-expect-error unknown breakpoint names are rejected.
const invalidBreakpoint:UiLayoutProps={gap:{tablet:8}}
// @ts-expect-error unsupported grid modes are rejected.
const invalidGridMode:UiGridProps={mode:'masonry'}
// @ts-expect-error gap tuples must contain lengths.
const invalidGap:UiGridProps={gap:[8,true]}
// @ts-expect-error divider variants are restricted to the documented values.
const invalidDivider:UiDividerProps={variant:'double'}
</script>
<template><UiLayout v-bind="layoutProps"><UiGrid v-bind="gridProps"><UiCol v-bind="colProps">content</UiCol></UiGrid><UiSpace v-bind="spaceProps">space</UiSpace><UiDivider v-bind="dividerProps">divider</UiDivider></UiLayout></template>
