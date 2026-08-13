import { computed, inject, unref } from 'vue'

export const lanUiTeleportScopeKey=Symbol.for('lan-ui-teleport-theme-scope')

const emptyAttributes=Object.freeze({})
const emptyStyle=Object.freeze({})

export function useTeleportThemeScope(){
  const injected=inject(lanUiTeleportScopeKey,null)
  const scope=computed(()=>unref(injected)||null)
  const portalThemeAttrs=computed(()=>{
    const value=scope.value
    if(!value)return emptyAttributes
    return {
      dir:value.direction,
      'data-theme':value.resolvedAppearance,
      'data-ui-appearance':value.appearance,
      'data-ui-resolved-appearance':value.resolvedAppearance,
      'data-ui-theme':value.themeName,
      'data-ui-locale':value.locale,
      'data-ui-size':value.size,
      'data-ui-density':value.density,
      'data-ui-direction':value.direction,
      'data-ui-teleport-scope':'',
    }
  })
  const portalThemeStyle=computed(()=>scope.value?.style||emptyStyle)
  return {portalThemeAttrs,portalThemeStyle}
}
