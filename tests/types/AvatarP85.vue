<script setup lang="ts">
import { ref } from 'vue'
import UiAvatar, { UiAvatar as NamedAvatar } from 'lan-ui-design-system/components/UiAvatar'
import type { UiAvatarFallbackMeta, UiAvatarInstance, UiAvatarLoadMeta, UiAvatarProps, UiAvatarRetryMeta, UiAvatarShape, UiAvatarSlotScope, UiAvatarState } from 'lan-ui-design-system'
const props:UiAvatarProps={src:'avatar.svg',alt:'Admin',name:'Admin User',size:0,color:'var(--brand-500)',shape:'circle',initials:'AU',fallbackSrc:'fallback.svg',fit:'cover',loading:'lazy',decoding:'async',crossorigin:'anonymous',ariaLabel:'Account owner',decorative:false}
const instance=ref<UiAvatarInstance|null>(null)
const state:UiAvatarState={initials:'AU',status:'loading',label:'Account owner',usingFallback:false,src:'avatar.svg',loading:true}
const shape:UiAvatarShape='square'
const load=(event:Event,meta:UiAvatarLoadMeta)=>[event,meta.src,meta.fallback]
const fallback=(meta:UiAvatarFallbackMeta)=>meta.failedSrc
const retry=(meta:UiAvatarRetryMeta)=>meta.src
const formatScope=(value:UiAvatarSlotScope)=>`${value.initials}:${value.status}:${value.usingFallback}`
void [NamedAvatar,props,instance,state,shape,load,fallback,retry,formatScope]
// @ts-expect-error invalid avatar shape is rejected.
const invalidShape:UiAvatarProps={shape:'rounded'}
// @ts-expect-error invalid image fit is rejected.
const invalidFit:UiAvatarProps={fit:'stretch'}
// @ts-expect-error invalid image loading is rejected.
const invalidLoading:UiAvatarProps={loading:'instant'}
</script>
<template>
  <UiAvatar ref="instance" v-bind="props" @load="load" @fallback="fallback" @retry="retry">
    <template #default="scope"><span>{{ formatScope(scope) }}</span></template>
    <template #fallback="scope"><span>{{ formatScope(scope) }}</span></template>
    <template #placeholder="scope"><span>{{ formatScope(scope) }}</span></template>
  </UiAvatar>
</template>
