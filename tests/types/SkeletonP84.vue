<script setup lang="ts">
import { ref } from 'vue'
import UiSkeleton, { UiSkeleton as NamedSkeleton } from 'lan-ui-design-system/components/UiSkeleton'
import type { UiSkeletonAvatarShape, UiSkeletonInstance, UiSkeletonProps, UiSkeletonState, UiSkeletonWidth } from 'lan-ui-design-system'

const width:UiSkeletonWidth=0
const props:UiSkeletonProps={rows:3,loading:true,width,title:true,titleWidth:'38%',rowWidths:[0,'64%'],avatarSize:38,avatarShape:'square',round:false,ariaLabel:'Loading content'}
const instance=ref<UiSkeletonInstance|null>(null)
const state:UiSkeletonState={loading:true,rows:3,avatar:false,animated:true,title:false,width:'100%',titleWidth:'38%',rowWidths:[],avatarSize:'38px',avatarShape:'circle',round:false}
const shape:UiSkeletonAvatarShape='circle'
void [NamedSkeleton,props,instance,state,shape]
// @ts-expect-error invalid avatar shape is rejected.
const invalidShape:UiSkeletonProps={avatarShape:'oval'}
// @ts-expect-error row widths cannot contain objects.
const invalidWidth:UiSkeletonProps={rowWidths:[{value:1}]}
</script>
<template>
  <UiSkeleton ref="instance" v-bind="props">
    <template #default><span>loaded</span></template>
    <template #template="scope"><span>{{ scope.loading }}{{ scope.rows }}{{ scope.avatar }}{{ scope.animated }}{{ scope.title }}{{ scope.width }}{{ scope.titleWidth }}{{ scope.rowWidths }}{{ scope.avatarSize }}{{ scope.avatarShape }}{{ scope.round }}</span></template>
    <template #avatar="scope"><span>{{ scope.size }}{{ scope.shape }}{{ scope.loading }}</span></template>
    <template #title="scope"><span>{{ scope.width }}{{ scope.loading }}</span></template>
    <template #row="scope"><span>{{ scope.index }}{{ scope.width }}{{ scope.size }}{{ scope.shape }}{{ scope.loading }}</span></template>
  </UiSkeleton>
</template>
