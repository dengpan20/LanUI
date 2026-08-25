import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = resolve(root, 'dist-lib/lan-ui.d.ts')
mkdirSync(dirname(target), { recursive: true })
copyFileSync(resolve(root, 'src/index.d.ts'), target)

const registry = readFileSync(resolve(root, 'src/components.js'), 'utf8')
const components = [...registry.matchAll(/export \{ default as (Ui\w+) \}/g)].map(([, name]) => name)
const componentTypes = resolve(root, 'dist-lib/components')
mkdirSync(componentTypes, { recursive: true })
const relatedComponentTypes={
  UiFloatButton:['UiFloatButtonActionMeta','UiFloatButtonBackTopMeta','UiFloatButtonInstance','UiFloatButtonShape','UiFloatButtonSize','UiFloatButtonState','UiFloatButtonVisibilityMeta'],
  UiFloatButtonGroup:['UiFloatButtonGroupInstance','UiFloatButtonGroupOpenMeta','UiFloatButtonGroupState'],
  UiButton:['UiButtonActivationMeta','UiButtonIconPosition','UiButtonInstance','UiButtonShape','UiButtonVariant'],
  UiInput:['UiInputInstance','UiInputInvalidMeta','UiInputMeta','UiInputMode','UiInputModelModifiers','UiInputSource','UiInputType','UiInputValue'],
  UiTextarea:['UiTextareaAutoSize','UiTextareaInstance','UiTextareaInvalidMeta','UiTextareaMeta','UiTextareaModelModifiers','UiTextareaResize','UiTextareaResizeMeta','UiTextareaSource','UiTextareaSubmitMode'],
  UiCheckbox:['UiCheckboxInstance','UiCheckboxOption','UiSelectionChangeMeta','UiSelectionInvalid','UiSelectionSource','UiSelectionValue'],
  UiCheckboxGroup:['UiCheckboxGroupInstance','UiCheckboxOption','UiSelectionChangeMeta','UiSelectionInvalid','UiSelectionSource','UiSelectionValue'],
  UiRadio:['UiRadioInstance','UiRadioOption','UiSelectionChangeMeta','UiSelectionInvalid','UiSelectionSource','UiSelectionValue'],
  UiRadioGroup:['UiRadioGroupInstance','UiRadioOption','UiSelectionChangeMeta','UiSelectionInvalid','UiSelectionSource','UiSelectionValue'],
  UiSwitch:['UiSelectionInvalid','UiSelectionSource','UiSelectionValue','UiSwitchChangeMeta','UiSwitchInstance'],
  UiSelect:['SelectOption','SelectOptionInput','UiSelectChangeMeta','UiSelectFieldNames','UiSelectFilter','UiSelectFocusMeta','UiSelectInstance','UiSelectInvalidMeta','UiSelectOpenMeta','UiSelectRemoteContext','UiSelectRemoteMethod','UiSelectSearchMeta','UiSelectSource'],
  UiMultiSelect:['SelectOption','SelectOptionInput','UiMultiSelectChangeMeta','UiMultiSelectFilter','UiMultiSelectFocusMeta','UiMultiSelectInstance','UiMultiSelectInvalidMeta','UiMultiSelectMaxMeta','UiMultiSelectOpenMeta','UiMultiSelectRemoteMethod','UiMultiSelectSearchMeta','UiMultiSelectSource','UiSelectFieldNames','UiSelectRemoteContext'],
  UiCollapse:['UiCollapseChangeMeta','UiCollapseField','UiCollapseIconPosition','UiCollapseInstance','UiCollapseItem','UiCollapseItemScope','UiCollapseSize'],
  UiBreadcrumb:['UiBreadcrumbExpandMeta','UiBreadcrumbInstance','UiBreadcrumbItem','UiBreadcrumbNavigateMeta','UiBreadcrumbRecord'],
  UiSteps:['UiStepItem','UiStepStatus','UiStepsChangeMeta','UiStepsDirection','UiStepsField','UiStepsInstance','UiStepsItemScope','UiStepsRecordScope','UiStepsType'],
  UiCard:['UiCardActivationMeta','UiCardInstance','UiCardShadow','UiCardTitleTag','UiCardVariant'],
  UiTag:['UiTagActivationMeta','UiTagCloseMeta','UiTagInstance','UiTagSize','UiTagVariant'],
  UiTimeline:['UiTimelineActivationMeta','UiTimelineField','UiTimelineInstance','UiTimelineItem','UiTimelineItemScope','UiTimelineLine','UiTimelineOrientation','UiTimelinePlacement','UiTimelineRecordScope','UiTimelineStatus'],
  UiTooltip:['UiTooltipInstance','UiTooltipOpenMeta','UiTooltipOpenSource','UiTooltipTrigger'],
  UiPopover:['UiPopoverInstance','UiPopoverOpenMeta','UiPopoverOpenSource','UiPopoverRole','UiPopoverTrigger'],
  UiDropdown:['UiDropdownActiveMeta','UiDropdownActiveSource','UiDropdownFocusOnOpen','UiDropdownInstance','UiDropdownItem','UiDropdownItemRole','UiDropdownOpenMeta','UiDropdownOpenSource','UiDropdownSelectMeta','UiDropdownTrigger'],
  UiCarousel:['UiCarouselChangeMeta','UiCarouselInstance','UiCarouselItem','UiCarouselNavigationSource','UiCarouselState'],
  UiQueryBuilder:['UiQueryAction','UiQueryBuilderInstance','UiQueryChange','UiQueryCounts','UiQueryEditor','UiQueryError','UiQueryField','UiQueryFieldType','UiQueryGroup','UiQueryOperator','UiQueryRule','UiQueryValidationContext','UiQueryValidationResult'],
  UiCronEditor:['UiCronChangeMeta','UiCronEditorInstance','UiCronError','UiCronErrorCode','UiCronInputMeta','UiCronPreset','UiCronValidation'],
  UiKeyValueEditor:['UiKeyValueChangeMeta','UiKeyValueEditorInstance','UiKeyValueError','UiKeyValueErrorCode','UiKeyValueImportOptions','UiKeyValueItem','UiKeyValueValidation'],
  UiPageHeader:['UiPageHeaderBackMeta','UiPageHeaderBreadcrumbMeta','UiPageHeaderInstance','UiPageHeaderTitleTag'],
  UiPagination:['UiPaginationActionResult','UiPaginationChange','UiPaginationChangeMeta','UiPaginationContext','UiPaginationInstance','UiPaginationInvalid','UiPaginationPageSizeBehavior','UiPaginationSource'],
  UiDatePicker:['UiDatePickerChangeMeta','UiDatePickerComponent','UiDatePickerEmitFn','UiDatePickerFocusMeta','UiDatePickerInstance','UiDatePickerInvalid','UiDatePickerOpenMeta','UiDatePickerPreset','UiDatePickerSource','UiDatePickerState'],
  UiTable:['UiTableActionResult','UiTableClassValue','UiTableColumn','UiTableColumnResize','UiTableComponent','UiTableEmitFn','UiTableExpansionMeta','UiTableFilterChange','UiTableInstance','UiTableInvalid','UiTableRowContext','UiTableRowMeta','UiTableSelectionMeta','UiTableSlotRowScope','UiTableSortChange','UiTableSource','UiTableState','UiTableStyleValue'],
  UiTreeSelect:['UiTreeSelectChangeMeta','UiTreeSelectExpandMeta','UiTreeSelectFieldNames','UiTreeSelectInstance','UiTreeSelectInvalid','UiTreeSelectLoadContext','UiTreeSelectLoadError','UiTreeSelectLoadPayload','UiTreeSelectNodeInput','UiTreeSelectNodeScope','UiTreeSelectOpenMeta','UiTreeSelectPublicNode','UiTreeSelectSource'],
  UiCascader:['UiCascaderActivePathMeta','UiCascaderChangeMeta','UiCascaderFieldNames','UiCascaderInstance','UiCascaderInvalid','UiCascaderLoadContext','UiCascaderLoadError','UiCascaderLoadPayload','UiCascaderNodeInput','UiCascaderOpenMeta','UiCascaderPublicNode','UiCascaderSource','UiCascaderValue'],
  UiTransfer:['UiTransferDirection','UiTransferFieldNames','UiTransferInstance','UiTransferInvalidMeta','UiTransferLimitMeta','UiTransferMoveMeta','UiTransferOptionScope','UiTransferPanelScope','UiTransferPublicOption','UiTransferSearchMeta','UiTransferSelectionMeta','UiTransferSource','UiTransferTargetOrder','UiTransferText'],
}
for (const name of components) {
  const typeNames=[`${name}Props`,`${name}Emits`,`${name}Slots`,...(relatedComponentTypes[name]||[])]
  writeFileSync(
    resolve(componentTypes, `${name}.d.ts`),
    `export { ${name} as default, ${name} } from '../lan-ui.js'\nexport type { ${typeNames.join(', ')} } from '../lan-ui.js'\n`,
    'utf8',
  )
}

writeFileSync(resolve(root, 'dist-lib/config.d.ts'), [
  "export { createLocaleRegistry, createLocaleTools, defaultLocaleRegistry, defineLocale, enUS, hasLocale, lanUiConfigKey, listLocales, loadLocale, normalizeLanUiConfig, registerLocale, unregisterLocale, useComponentSize, useDirection, useLanUiConfig, useLocale, zhCN } from './lan-ui.js'",
  "export type { ComponentSize, Direction, LanUiConfig, LanUiConfigOptions, LanUiLocale, LanUiLocaleContext, LanUiLocaleTools, LanUiOptions, LocaleFallback, LocaleInput, LocaleLoader, LocaleLoadOptions, LocaleMessage, LocaleModule, LocaleName, LocaleParams, LocaleRegistry, MotionPreference, ThemeAppearance, ThemeDefinition, ThemeInput, ThemeTokens } from './lan-ui.js'",
  '',
].join('\n'), 'utf8')
writeFileSync(resolve(root, 'dist-lib/color.d.ts'), [
  "export { formatColor, getContrastRatio, getReadableTextColor, hslToRgb, hsvToRgb, isValidColor, normalizeColorState, parseColor, rgbToHsl, rgbToHsv } from './lan-ui.js'",
  "export type { ColorFormat, ColorInput, HslaColor, HsvaColor, RgbaColor } from './lan-ui.js'",
  '',
].join('\n'), 'utf8')
writeFileSync(resolve(root, 'dist-lib/date.d.ts'), [
  "export { DATE_VALUE_MODES, DATE_VALUE_TYPES, compareDateValues, dateValueToDate, formatDateValue, fromDateValue, inferDateValueType, parseDateValue, resolveTimeZone, toDateValue } from './lan-ui.js'",
  "export type { DateDisambiguation, DateInput, DatePrecision, DateValue, DateValueMode, DateValueOptions, DateValueType, ParsedDateValue, UiDateInvalid } from './lan-ui.js'",
  '',
].join('\n'), 'utf8')
writeFileSync(resolve(root, 'dist-lib/feedback.d.ts'), [
  "export { createLanUiFeedback, feedback, lanUiFeedbackKey, notification, notificationState, toast, toastState, useFeedback, useNotification, useToast } from './lan-ui.js'",
  "export type { LanUiFeedback, NotificationOptions, NotificationService, NotificationState, ToastOptions, ToastPlacement, ToastService, ToastState, UiNotice, UiToastItem } from './lan-ui.js'",
  '',
].join('\n'), 'utf8')
writeFileSync(resolve(root, 'dist-lib/icons.d.ts'), [
  "export { BUILTIN_ICONS, BUILTIN_ICON_NAMES, createIconRegistry, defaultIconRegistry, defineIcon, hasIcon, iconRegistryKey, listIcons, registerIcon, unregisterIcon, useIconRegistry } from './lan-ui.js'",
  "export type { IconDefinition, IconDefinitionInput, IconNode, IconRegistry, IconRegistryOptions, IconRegisterOptions, IconUnregisterOptions } from './lan-ui.js'",
  '',
].join('\n'), 'utf8')
writeFileSync(resolve(root, 'dist-lib/theme.d.ts'), [
  "export { THEME_APPEARANCES, THEME_TOKEN_NAMES, createThemeController, darkTheme, defineTheme, lightTheme, mergeThemes, normalizeThemeAppearance, normalizeThemeTokens, resolveThemeAppearance, themeToStyle } from './lan-ui.js'",
  "export type { ThemeAppearance, ThemeAppearanceOptions, ThemeController, ThemeControllerOptions, ThemeControllerState, ThemeDefinition, ThemeInput, ThemeMediaQuery, ThemeStorage, ThemeTarget, ThemeTokenOptions, ThemeTokens, ThemeTokenValue } from './lan-ui.js'",
  '',
].join('\n'), 'utf8')
writeFileSync(resolve(root, 'dist-lib/motion.d.ts'), [
  "export { MOTION_PREFERENCES, createMotionController, lanUiMotionKey, motionPreferenceToStyle, normalizeMotionPreference, resolveMotionPreference, useReducedMotion } from './lan-ui.js'",
  "export type { MotionController, MotionControllerOptions, MotionControllerState, MotionMediaQuery, MotionPreference, MotionPreferenceOptions, MotionResolvedPreference, MotionStorage, MotionTarget } from './lan-ui.js'",
  '',
].join('\n'), 'utf8')
writeFileSync(resolve(root, 'dist-lib/plugin.d.ts'), [
  "export { LanUi as default, LanUi, createLanUi } from './lan-ui.js'",
  "export type { LanUiOptions, LanUiPlugin } from './lan-ui.js'",
  '',
].join('\n'), 'utf8')

console.log(`TYPES_COPY dist-lib/lan-ui.d.ts components=${components.length} subpaths=color,config,date,feedback,icons,motion,plugin,theme`)
