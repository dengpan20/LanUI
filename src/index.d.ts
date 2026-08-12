import type { App, ComponentOptionsMixin, ComputedRef, DefineComponent, EmitsOptions, EmitsToProps, InjectionKey, PublicProps, SlotsType, VNodeChild } from 'vue'

export type Key = string | number
export type ComponentSize = 'sm' | 'md' | 'lg'
export type Direction = 'ltr' | 'rtl'
export type Placement = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right' | 'left' | 'right'
export type ToastPlacement = 'top-center'|'top-end'|'bottom-end'|'top-right'|'bottom-right'
export type LocaleName = 'zh-CN'|'en-US'|string
export type DateValueMode = 'date'|'time'|'datetime'
export type DateValueType = 'auto'|'string'|'date'|'timestamp'
export type DatePrecision = 'minute'|'second'|'millisecond'
export type DateDisambiguation = 'compatible'|'earlier'|'later'|'reject'
export type DateInput = string|Date|number|null|undefined
export type DateValue = string|Date|number|null
export type CalendarSelectionMode = 'single'|'multiple'|'range'
export type CalendarPanel = 'month'|'year'
export type ImageFit = 'fill'|'contain'|'cover'|'none'|'scale-down'
export type VirtualListSelectionMode = 'none'|'single'|'multiple'
export type ColorFormat = 'hex'|'rgb'|'hsl'
export interface RgbaColor { r:number; g:number; b:number; a:number }
export interface HsvaColor { h:number; s:number; v:number; a:number }
export interface HslaColor { h:number; s:number; l:number; a:number }
export type ColorInput = string|RgbaColor
export interface DateValueOptions { mode?:DateValueMode; valueType?:Exclude<DateValueType,'auto'>; timeZone?:'local'|'UTC'|string; disambiguation?:DateDisambiguation; precision?:DatePrecision; step?:string|number; referenceDate?:DateInput }
export interface ParsedDateValue { mode:DateValueMode; year:number; month:number; day:number; hour:number; minute:number; second:number; millisecond:number; precision:'date'|DatePrecision; value:string }
export interface IconNode { readonly tag:'path'|'rect'|'circle'|'line'|'polyline'|'polygon'|'ellipse'; readonly attrs:Readonly<Record<string,string>> }
export interface IconDefinition { readonly viewBox:string; readonly nodes:readonly IconNode[] }
export type IconDefinitionInput = string|{body:string;viewBox?:string}
export interface IconRegisterOptions { override?:boolean }
export interface IconUnregisterOptions { force?:boolean }
export interface IconRegistryOptions { includeBuiltIns?:boolean }
export interface IconRegistry { readonly size:number; register:(name:string,definition:IconDefinitionInput,options?:IconRegisterOptions)=>IconDefinition; unregister:(name:string,options?:IconUnregisterOptions)=>boolean; get:(name:string)=>IconDefinition|undefined; has:(name:string)=>boolean; isBuiltin:(name:string)=>boolean; list:()=>string[]; resolve:(name:string,fallback?:string)=>IconDefinition|null }
export type LocaleMessage = string|Record<string,string>
export type LocaleParams = Record<string,unknown>
export interface LanUiLocale { name:LocaleName; messages:Record<string,LocaleMessage> }
export type LocaleInput = LocaleName|Partial<LanUiLocale>
export type LocaleFallback = LocaleInput|LocaleInput[]|false|null
export type LocaleModule = LanUiLocale|{default:LanUiLocale}|{locale:LanUiLocale}
export type LocaleLoader = ()=>LocaleModule|Promise<LocaleModule>
export interface LocaleLoadOptions { aliases?:string|string[]; force?:boolean; activate?:boolean }
export interface LocaleRegistry { register:(locale:LocaleModule,aliases?:string|string[])=>LanUiLocale; unregister:(name:string)=>boolean; get:(name:string)=>LanUiLocale|undefined; has:(name:string)=>boolean; list:()=>LanUiLocale[]; load:(name:string,loader:LocaleLoader,options?:LocaleLoadOptions)=>Promise<LanUiLocale> }
export interface LanUiConfig { locale:LanUiLocale; fallbackLocale?:LanUiLocale|null; fallbackLocales:LanUiLocale[]; localeRegistry:LocaleRegistry; size:ComponentSize; density:'compact'|'default'|'comfortable'; direction:Direction; zIndex:number; theme:Record<string,string|number> }
export interface LanUiConfigOptions { locale?:LocaleInput; fallbackLocale?:LocaleFallback; fallbackLocales?:LocaleInput[]; localeRegistry?:LocaleRegistry; size?:ComponentSize; density?:LanUiConfig['density']; direction?:Direction; zIndex?:number; theme?:LanUiConfig['theme'] }
export interface LanUiOptions extends LanUiConfigOptions { isolated?:boolean; feedback?:LanUiFeedback; icons?:Record<string,IconDefinitionInput>|Map<string,IconDefinitionInput>; iconRegistry?:IconRegistry }
export interface LanUiPlugin { install:(app:App)=>void; config:LanUiConfig; feedback:LanUiFeedback; localeRegistry:LocaleRegistry; iconRegistry:IconRegistry; setLocale:(locale:LocaleInput)=>void; setFallbackLocale:(locale:LocaleFallback)=>void; registerLocale:LocaleRegistry['register']; unregisterLocale:LocaleRegistry['unregister']; hasLocale:LocaleRegistry['has']; listLocales:LocaleRegistry['list']; loadLocale:(name:string,loader:LocaleLoader,options?:LocaleLoadOptions)=>Promise<LanUiLocale>; registerIcon:IconRegistry['register']; unregisterIcon:IconRegistry['unregister']; hasIcon:IconRegistry['has']; listIcons:IconRegistry['list']; dispose:()=>void }
export interface LanUiLocaleTools { locale:LanUiLocale; fallbackLocale:LanUiLocale|null; fallbackLocales:LanUiLocale[]; localeRegistry:LocaleRegistry; t:(key:string,params?:LocaleParams)=>string; tc:(key:string,count:number,params?:LocaleParams&{pluralOptions?:Intl.PluralRulesOptions})=>string; formatNumber:(value:number|bigint,options?:Intl.NumberFormatOptions)=>string; formatDate:(value:Date|number|string,options?:Intl.DateTimeFormatOptions)=>string; formatRelativeTime:(value:number,unit?:Intl.RelativeTimeFormatUnit,options?:Intl.RelativeTimeFormatOptions)=>string; formatList:(values:Iterable<string|number>,options?:Intl.ListFormatOptions)=>string }
export interface LanUiLocaleContext { locale:ComputedRef<LanUiLocale>; fallbackLocale:ComputedRef<LanUiLocale|null>; fallbackLocales:ComputedRef<LanUiLocale[]>; localeRegistry:ComputedRef<LocaleRegistry>; t:LanUiLocaleTools['t']; tc:LanUiLocaleTools['tc']; formatNumber:LanUiLocaleTools['formatNumber']; formatDate:LanUiLocaleTools['formatDate']; formatRelativeTime:LanUiLocaleTools['formatRelativeTime']; formatList:LanUiLocaleTools['formatList'] }
export interface SelectOption { label:string; value:Key; disabled?:boolean }
export type SelectOptionInput = SelectOption | Key
export interface UiTreeNode { label:string; value:Key; disabled?:boolean; disableCheckbox?:boolean; selectable?:boolean; checkable?:boolean; isLeaf?:boolean; icon?:string; children?:UiTreeNode[]; [key:string]:unknown }
export interface UiTreeDataNode { label?:string; value?:Key; disabled?:boolean; disableCheckbox?:boolean; selectable?:boolean; checkable?:boolean; isLeaf?:boolean; icon?:string; children?:UiTreeDataNode[]; [key:string]:unknown }
export interface UiFormRule { required?:boolean; min?:number; max?:number; pattern?:RegExp; message?:string; trigger?:string|string[]; validator?:(value:unknown,model:Record<string,unknown>)=>boolean|string|Promise<boolean|string> }
export type UiFormRules = Record<string,UiFormRule|UiFormRule[]|UiFormRule['validator']>

export interface UiAlertProps { type?:'info'|'success'|'warning'|'error'; title?:string; description?:string; closable?:boolean; showIcon?:boolean; banner?:boolean }
export interface UiAutoCompleteOption { label:string; value:Key; disabled?:boolean; keywords?:string[]; description?:string }
export interface UiAutoCompleteFetchContext { signal?:AbortSignal }
export interface UiAutoCompleteProps { modelValue?:Key; options?:Array<UiAutoCompleteOption|Key>; fetchSuggestions?:(query:string,context:UiAutoCompleteFetchContext)=>Array<UiAutoCompleteOption|Key>|Promise<Array<UiAutoCompleteOption|Key>>; debounce?:number; minChars?:number; placeholder?:string; size?:ComponentSize; disabled?:boolean; readonly?:boolean; invalid?:boolean; clearable?:boolean; allowCustom?:boolean; openOnFocus?:boolean; highlightFirst?:boolean; matchMode?:'contains'|'startsWith'; emptyText?:string; loadingText?:string; placement?:'top-start'|'top-end'|'bottom-start'|'bottom-end'; appendToBody?:boolean; cache?:boolean }
export interface UiAvatarProps { src?:string; alt?:string; name?:string; size?:ComponentSize|number|string; color?:'blue'|'green'|'orange'|'purple'|'gray'|string; square?:boolean }
export interface UiBadgeProps { value?:Key; max?:number; dot?:boolean; status?:'danger'|'success'|'warning'|'info'; show?:boolean }
export interface UiBreadcrumbItem { label:string; href?:string; to?:string; current?:boolean; disabled?:boolean }
export interface UiBreadcrumbProps { items?:UiBreadcrumbItem[]; separator?:string }
export interface UiButtonProps { variant?:'primary'|'secondary'|'outline'|'text'|'danger'|'danger-outline'; size?:ComponentSize; icon?:string; loading?:boolean; disabled?:boolean; type?:'button'|'submit'|'reset' }
export interface UiCalendarDisabledContext { date:string; currentMonth:boolean }
export interface UiCalendarRangeState { start:boolean; end:boolean; inRange:boolean; preview:boolean }
export interface UiCalendarCell { date:string; label:number; currentMonth:boolean; today:boolean; selected:boolean; disabled:boolean; weekend:boolean; hidden:boolean; range:UiCalendarRangeState }
export interface UiCalendarChangeMeta { source:'pointer'|'keyboard'|'today'|'button'|string; selectionMode:CalendarSelectionMode; date:string }
export interface UiCalendarViewChange { value:string; previous:string; source:'api'|'button'|'keyboard'|'today'|'year-range'|'year-select'|string }
export interface UiCalendarProps { modelValue?:DateValue|DateValue[]; selectionMode?:CalendarSelectionMode; valueType?:DateValueType; timeZone?:'local'|'UTC'|string; disambiguation?:DateDisambiguation; viewDate?:DateInput; defaultViewDate?:DateInput; today?:DateInput; min?:DateInput; max?:DateInput; firstDayOfWeek?:'auto'|0|1|2|3|4|5|6; weekdayFormat?:'narrow'|'short'|'long'; fixedWeeks?:boolean; showOutsideDays?:boolean; showWeekNumbers?:boolean; maxSelections?:number; disabledDate?:(date:Date,context:UiCalendarDisabledContext)=>boolean; size?:ComponentSize; bordered?:boolean; readonly?:boolean; disabled?:boolean; allowClear?:boolean; ariaLabel?:string }
export interface UiCardProps { title?:string; titleTag?:'h2'|'h3'|'h4'|'h5'|'h6'; mark?:boolean; bodyClass?:string }
export interface UiCascaderProps { modelValue?:Key[]; options?:UiTreeNode[]; placeholder?:string; disabled?:boolean; invalid?:boolean }
export interface UiCommandPaletteCommand { key:Key; label:string; description?:string; group?:string; keywords?:string[]; icon?:string; shortcut?:string|string[]; disabled?:boolean; hidden?:boolean; [key:string]:unknown }
export interface UiCommandPaletteFetchContext { signal?:AbortSignal }
export interface UiCommandPaletteProps { modelValue?:boolean; defaultOpen?:boolean; query?:string; defaultQuery?:string; commands?:UiCommandPaletteCommand[]; fetchCommands?:(query:string,context:UiCommandPaletteFetchContext)=>UiCommandPaletteCommand[]|Promise<UiCommandPaletteCommand[]>; debounce?:number; minChars?:number; cache?:boolean; maxResults?:number; title?:string; placeholder?:string; emptyText?:string; loadingText?:string; errorText?:string; hotkeys?:string[]; globalShortcut?:boolean; closeOnSelect?:boolean; closeOnEsc?:boolean; closeOnMask?:boolean; clearOnClose?:boolean; loop?:boolean; disabled?:boolean; width?:string|number }
export interface UiCollapseItem { key:Key; label:string; content?:string; extra?:string; disabled?:boolean }
export interface UiCollapseProps { items?:UiCollapseItem[]; modelValue?:Key|Key[]; accordion?:boolean; bordered?:boolean; disabled?:boolean }
export interface UiColorPickerPreset { label?:string; value:string; disabled?:boolean }
export interface UiColorPickerProps { modelValue?:string; open?:boolean; defaultOpen?:boolean; format?:ColorFormat; alpha?:boolean; presets?:Array<string|UiColorPickerPreset>; fallbackColor?:string; size?:ComponentSize; disabled?:boolean; readonly?:boolean; invalid?:boolean; clearable?:boolean; showInput?:boolean; showContrast?:boolean; contrastColor?:string; closeOnSelect?:boolean; placement?:'top-start'|'top-end'|'bottom-start'|'bottom-end'; appendToBody?:boolean }
export interface UiCheckboxProps { modelValue?:boolean|Key[]; value?:Key|boolean; label?:string; disabled?:boolean; indeterminate?:boolean }
export interface UiColProps { span?:number; offset?:number; order?:number }
export interface UiConfigProviderProps extends LanUiConfigOptions { iconRegistry?:IconRegistry; tag?:string }
export interface UiDatePickerProps { modelValue?:DateValue; mode?:DateValueMode; valueType?:DateValueType; timeZone?:'local'|'UTC'|string; disambiguation?:DateDisambiguation; precision?:DatePrecision; step?:string|number; referenceDate?:DateInput; icon?:string; placeholder?:string; min?:DateInput; max?:DateInput; size?:ComponentSize; clearable?:boolean; invalid?:boolean; disabled?:boolean }
export interface UiDateRangePickerProps { modelValue?:DateValue[]; mode?:DateValueMode; valueType?:DateValueType; timeZone?:'local'|'UTC'|string; disambiguation?:DateDisambiguation; precision?:DatePrecision; step?:string|number; referenceDate?:DateInput; startPlaceholder?:string; endPlaceholder?:string; separator?:string; min?:DateInput; max?:DateInput; size?:ComponentSize; clearable?:boolean; constrain?:boolean; invalid?:boolean; disabled?:boolean }
export interface UiTimePickerProps { modelValue?:DateValue; valueType?:DateValueType; timeZone?:'local'|'UTC'|string; disambiguation?:DateDisambiguation; precision?:DatePrecision; step?:string|number; referenceDate?:DateInput; placeholder?:string; min?:DateInput; max?:DateInput; size?:ComponentSize; clearable?:boolean; invalid?:boolean; disabled?:boolean }
export interface UiDividerProps { vertical?:boolean; dashed?:boolean; label?:string }
export interface UiDescriptionItem { key?:Key; label:string; value?:unknown; span?:number }
export interface UiDescriptionsProps { items?:UiDescriptionItem[]; title?:string; columns?:number; bordered?:boolean; size?:ComponentSize }
export interface UiDrawerProps { modelValue?:boolean; title?:string; width?:string|number; placement?:'left'|'right'|'start'|'end'; closeOnMask?:boolean; closeOnEsc?:boolean }
export interface UiDropdownItem { label?:string; value?:Key; icon?:string; disabled?:boolean; divider?:boolean; shortcut?:string; danger?:boolean }
export interface UiDropdownProps { modelValue?:boolean; items?:UiDropdownItem[]; placement?:'bottom-left'|'bottom-right'; disabled?:boolean; offset?:number }
export interface UiEmptyProps { title?:string; description?:string; icon?:string; compact?:boolean }
export interface UiFloatButtonProps { icon?:string; label?:string; variant?:'default'|'primary'|'danger'; badge?:Key; active?:boolean; disabled?:boolean }
export interface UiFormProps<Model extends Record<string,unknown>=Record<string,unknown>> { model:Model; rules?:UiFormRules; validateOnSubmit?:boolean }
export interface UiFormItemProps { label?:string; name?:string; required?:boolean; error?:string; help?:string; forId?:string; group?:boolean; composite?:boolean; reserveMessageSpace?:boolean; rules?:UiFormRule|UiFormRule[]|UiFormRule['validator'] }
export interface UiGridProps { columns?:number|string; gap?:number|string; min?:number|string; align?:'start'|'center'|'end'|'stretch' }
export interface UiIconProps { name?:string; fallback?:string; size?:number|string; strokeWidth?:number|string; color?:string; fill?:string; rotate?:number; flip?:'none'|'horizontal'|'vertical'|'both'; directional?:boolean; spin?:boolean; ariaLabel?:string }
export interface UiImageProps { src?:string; alt?:string; fallback?:string; width?:string|number; height?:string|number; aspectRatio?:string|number; fit?:ImageFit; position?:string; radius?:string|number; loading?:'eager'|'lazy'; decoding?:'sync'|'async'|'auto'; crossorigin?:''|'anonymous'|'use-credentials'; referrerpolicy?:string; preview?:boolean; previewOpen?:boolean; previewSrc?:string; previewList?:string[]; previewIndex?:number; loop?:boolean; minScale?:number; maxScale?:number; scaleStep?:number; zoomOnWheel?:boolean; closeOnMask?:boolean; closeOnEsc?:boolean; toolbar?:boolean; disabled?:boolean; teleportTo?:string|HTMLElement; previewZIndex?:number }
export interface UiVirtualListRange { start:number; end:number; visibleStart:number; visibleEnd:number; total:number }
export interface UiVirtualListScrollMeta { scrollTop:number; scrollHeight:number; viewportHeight:number; range:UiVirtualListRange }
export interface UiVirtualListSelectionMeta<T=unknown> { key:Key; index:number; item:T; selected:boolean; source:string }
export interface UiVirtualListProps { items?:unknown[]; itemKey?:string|((item:unknown,index:number)=>Key); itemSize?:number|((item:unknown,index:number)=>number); estimatedItemSize?:number; height?:string|number; width?:string|number; overscan?:number; measure?:boolean; selectionMode?:VirtualListSelectionMode; modelValue?:Key|Key[]; activeIndex?:number; defaultActiveIndex?:number; disabledKeys?:Key[]; textField?:string|((item:unknown,index:number)=>string); ariaLabel?:string; tabindex?:number; loop?:boolean; deselectable?:boolean; bordered?:boolean; striped?:boolean; loading?:boolean; error?:string|boolean; emptyText?:string; loadingText?:string; errorText?:string }
export interface UiInputProps { modelValue?:string|number; type?:string; placeholder?:string; icon?:string; size?:ComponentSize; clearable?:boolean; passwordToggle?:boolean; disabled?:boolean; readonly?:boolean; invalid?:boolean; loading?:boolean; maxlength?:string|number }
export interface UiLayoutProps { tag?:string; direction?:'horizontal'|'vertical'; gap?:string|number; contained?:boolean }

export interface UiTableColumn { key:string; label:string; width?:string|number; minWidth?:string|number; maxWidth?:string|number; align?:'left'|'center'|'right'|'start'|'end'; fixed?:'left'|'right'|'start'|'end'; left?:string|number; right?:string|number; start?:string|number; end?:string|number; sortable?:boolean; filterable?:boolean; filterOptions?:SelectOptionInput[]; resizable?:boolean; configurable?:boolean; hidden?:boolean; class?:string; headerClass?:string }
export interface UiListToolbarProps { total?:number; selectedCount?:number; density?:'compact'|'default'|'comfortable'; columns?:UiTableColumn[]; visibleColumns?:string[]; loading?:boolean }
export interface UiModalProps { modelValue?:boolean; title?:string; width?:string|number; closeOnMask?:boolean; closeOnEsc?:boolean; destroyOnClose?:boolean }
export interface UiMenuItem { key:Key; label:string; icon?:string; disabled?:boolean; badge?:Key; children?:UiMenuItem[] }
export interface UiMenuProps { items?:UiMenuItem[]; modelValue?:Key; collapsed?:boolean; accordion?:boolean; defaultOpenKeys?:Key[] }
export interface UiMultiSelectProps { modelValue?:Key[]; options?:SelectOptionInput[]; placeholder?:string; searchable?:boolean; disabled?:boolean; invalid?:boolean; maxTagCount?:number }
export interface UiNumberInputProps { modelValue?:number|null; min?:number; max?:number; step?:number; precision?:number; placeholder?:string; size?:ComponentSize; controls?:boolean; controlsPosition?:'sides'|'right'; disabled?:boolean; readonly?:boolean; invalid?:boolean; clampOnBlur?:boolean; wheel?:boolean; formatter?:(value:number)=>string|number|null|undefined; parser?:(text:string)=>number|string|null|undefined }
export interface UiNotice { type?:'info'|'success'|'warning'|'error'; title:string; message:string }
export interface UiNotificationProps { notification?:UiNotice|null; actionText?:string; secondaryText?:string; feedback?:LanUiFeedback }
export interface UiPaginationProps { page?:number; pageSize?:number; total?:number; pageSizeOptions?:number[]; showSizeChanger?:boolean; compact?:boolean }
export interface UiPopconfirmProps { title?:string; message?:string; confirmText?:string; cancelText?:string; danger?:boolean; beforeConfirm?:()=>unknown|Promise<unknown>; placement?:Placement; offset?:number }
export interface UiPopoverProps { modelValue?:boolean; placement?:Placement; width?:string|number; closeOnOutside?:boolean; title?:string; offset?:number }
export interface UiProgressProps { value?:number; max?:number; status?:'normal'|'success'|'warning'|'error'; showText?:boolean; size?:ComponentSize; label?:string }
export interface UiRadioProps { modelValue?:Key|boolean; value?:Key|boolean; label?:string; name?:string; disabled?:boolean }
export interface UiRateProps { modelValue?:number; max?:number; step?:number; allowClear?:boolean; clearValue?:number; size?:ComponentSize; disabled?:boolean; readonly?:boolean; invalid?:boolean; showText?:boolean; texts?:Array<string|number>; formatter?:(value:number,max:number)=>string|number|null|undefined; color?:string; voidColor?:string; disabledColor?:string; ariaLabel?:string }
export interface UiResultProps { status?:'success'|'error'|'warning'|'info'|'404'; title?:string; description?:string; icon?:string }
export interface UiStatusPageProps { status?:'403'|'404'|'500'; title?:string; description?:string; icon?:string; embedded?:boolean }
export interface UiSelectProps { modelValue?:Key; options?:SelectOptionInput[]; placeholder?:string; size?:ComponentSize; disabled?:boolean; invalid?:boolean; clearable?:boolean; searchable?:boolean; emptyText?:string }
export interface UiSkeletonProps { rows?:number; avatar?:boolean; animated?:boolean; width?:string|number }
export interface UiStatisticFormatterContext { numericValue:number|null; localeOptions:Intl.NumberFormatOptions }
export interface UiStatisticTrendContext { direction:'up'|'down'|'flat'; tone:'positive'|'negative'|'neutral' }
export interface UiStatisticProps { value?:number|string|null; title?:string; precision?:number|null; formatOptions?:Intl.NumberFormatOptions; formatter?:(value:number|string|null,context:UiStatisticFormatterContext)=>string|number|null|undefined; prefix?:string; suffix?:string; placeholder?:string; trend?:number|null; trendSuffix?:string; trendFormatOptions?:Intl.NumberFormatOptions; trendFormatter?:(value:number|null,context:UiStatisticTrendContext)=>string|number|null|undefined; positiveDirection?:'up'|'down'|'none'; status?:'default'|'success'|'warning'|'danger'; size?:ComponentSize; loading?:boolean; loadingText?:string; ariaLabel?:string; ariaValueText?:string; live?:'off'|'polite'|'assertive' }
export interface UiSliderMark { value:number; label?:string|number }
export interface UiSliderProps { modelValue?:number|number[]; min?:number; max?:number; step?:number; range?:boolean; minDistance?:number; vertical?:boolean; reverse?:boolean; disabled?:boolean; readonly?:boolean; invalid?:boolean; tooltip?:'auto'|'always'|'never'; formatter?:(value:number)=>string|number|null|undefined; marks?:UiSliderMark[]|Record<string|number,string|number>; ariaLabel?:string|string[] }
export interface UiSegmentedOption { label:string; value:Key|boolean; icon?:string; disabled?:boolean }
export interface UiSegmentedProps { modelValue?:Key|boolean; options?:Array<UiSegmentedOption|Key>; size?:ComponentSize; block?:boolean; disabled?:boolean; name?:string }
export interface UiSpaceProps { size?:string|number; direction?:'horizontal'|'vertical'; align?:'start'|'center'|'end'|'stretch'; wrap?:boolean }
export interface UiSpinProps { spinning?:boolean; text?:string; fullscreen?:boolean; delay?:number; size?:ComponentSize }
export interface UiStepItem { title:string; description?:string; status?:'wait'|'process'|'finish'|'error' }
export interface UiStepsProps { items?:UiStepItem[]; current?:number; direction?:'horizontal'|'vertical'; ariaLabel?:string }
export interface UiSwitchProps { modelValue?:boolean; disabled?:boolean; loading?:boolean; size?:ComponentSize; checkedText?:string; uncheckedText?:string; ariaLabel?:string }
export interface UiTableProps<Row=Record<string,unknown>> { columns?:UiTableColumn[]; rows?:Row[]; rowKey?:string; selectedRows?:Key[]; expandedRows?:Key[]; selectable?:boolean; expandable?:boolean; loading?:boolean; error?:string; sortKey?:string; sortOrder?:''|'asc'|'desc'; density?:'compact'|'default'|'comfortable'; stickyHeader?:boolean; emptyTitle?:string; emptyText?:string; loadingRows?:number; filters?:Record<string,unknown>; resizable?:boolean; maxHeight?:string|number; virtual?:boolean; rowHeight?:number; viewportHeight?:number; overscan?:number }
export interface UiTabsItem { label:string; value:Key; icon?:string; disabled?:boolean; closable?:boolean }
export interface UiTabsProps { modelValue?:Key; items?:Array<UiTabsItem|Key>; orientation?:'horizontal'|'vertical'; size?:ComponentSize; panels?:boolean }
export interface UiTagProps { color?:'blue'|'green'|'orange'|'red'|'gray'|string; dot?:boolean }
export interface UiTextareaProps { modelValue?:string; placeholder?:string; rows?:number; maxlength?:string|number; showCount?:boolean; disabled?:boolean; readonly?:boolean; invalid?:boolean }
export interface UiTimelineItem { title:string; description?:string; time?:string; status?:'normal'|'success'|'warning'|'error' }
export interface UiTimelineProps { items?:UiTimelineItem[] }
export interface UiToastItem extends UiNotice { id:Key; placement?:ToastPlacement; out?:boolean; duration?:number }
export interface UiToastHostProps { items?:UiToastItem[]; feedback?:LanUiFeedback }
export interface UiTooltipProps { content?:string; placement?:Placement; disabled?:boolean; offset?:number }
export interface UiTransferProps { modelValue?:Key[]; options?:SelectOptionInput[]; titles?:[string,string]; searchable?:boolean }
export interface UiTreeLoadContext { signal?:AbortSignal }
export interface UiTreeProps { data?:UiTreeDataNode[]; modelValue?:Key|Key[]; expandedKeys?:Key[]; checkedKeys?:Key[]; defaultValue?:Key|Key[]; defaultExpandedKeys?:Key[]; defaultCheckedKeys?:Key[]; multiple?:boolean; selectable?:boolean; checkable?:boolean; checkStrictly?:boolean; defaultExpandAll?:boolean; accordion?:boolean; disabled?:boolean; invalid?:boolean; filter?:string; filterMethod?:(query:string,node:UiTreeDataNode)=>boolean; loadData?:(node:UiTreeDataNode,context:UiTreeLoadContext)=>UiTreeDataNode[]|Promise<UiTreeDataNode[]>; showIcon?:boolean; showLine?:boolean; bordered?:boolean; expandOnClickNode?:boolean; checkOnClickNode?:boolean; virtual?:boolean; height?:number|string; itemHeight?:number; overscan?:number; indent?:number; nodeKey?:string; labelKey?:string; childrenKey?:string; emptyText?:string; size?:ComponentSize }
export interface UiTreeSelectProps { modelValue?:Key; options?:UiTreeNode[]; placeholder?:string; disabled?:boolean; invalid?:boolean }
export interface UiUploadFile { id:Key; name:string; size:number; sizeText?:string; type?:string; status?:'ready'|'uploading'|'success'|'error'; percent?:number; error?:string }
export interface UiUploadProps { modelValue?:UiUploadFile[]; accept?:string; multiple?:boolean; disabled?:boolean; maxSize?:number; maxCount?:number; hint?:string }

export interface UiDateRangeChange { value:DateValue[]; valid:boolean }
export interface UiDateRangeInvalid { code:'range-order'|'invalid-date-value'; message:string; value:DateValue[] }
export interface UiDateInvalid { code:'invalid-date-value'; value:string }
export interface UiDateRangeFocusPayload { index:number; event:FocusEvent }
export interface UiNumberInputChangeMeta { source:'blur'|'enter'|'keyboard'|'control'|'wheel'; previous:number|null|undefined }
export interface UiNumberInputStepMeta { direction:-1|1; step:number; source:'keyboard'|'control'|'wheel' }
export interface UiNumberInputInvalid { reason:'parse'; input:string }
export interface UiSliderChangeMeta { source:'pointer'|'keyboard'|'mark'; thumb:number }
export interface UiSliderFocusMeta { thumb:number }
export interface UiRateChangeMeta { source:'pointer'|'keyboard'; previous:number }
export interface UiAutoCompleteChangeMeta { source:'option'|'clear'|'enter'|'blur'|'tab'; option?:UiAutoCompleteOption; index?:number }
export interface UiAutoCompleteLoadError { error:unknown; query:string }
export interface UiPaginationChange { page:number; pageSize:number }
export interface UiTableSortChange { key:string; order:''|'asc'|'desc' }
export interface UiTableColumnResize { key:string; width:number }
export interface UiTreeSelectMeta { selected:boolean; source:'pointer'|'keyboard' }
export interface UiTreeExpandMeta { expanded:boolean; source:'pointer'|'keyboard' }
export interface UiTreeCheckMeta { node:UiTreeDataNode; checked:boolean; halfCheckedKeys:Key[]; source:'pointer'|'keyboard'|'load' }
export interface UiTreeLoadPayload { node:UiTreeDataNode; children:UiTreeDataNode[] }
export interface UiTreeLoadError { error:unknown; node:UiTreeDataNode }
export interface UiTreeDataError { errors:Array<{code:'missing-key'|'duplicate-key';key?:Key;node:UiTreeDataNode}> }
export interface UiImageLoadMeta { src:string; fallback:boolean }
export interface UiImageFallbackMeta { failedSrc:string; fallbackSrc:string; event:Event }
export interface UiImagePreviewMeta { index:number; src:string; source:string }
export interface UiImagePreviewEventMeta { index:number; src:string }
export interface UiImageTransform { scale:number; rotation:number; offsetX:number; offsetY:number; source:string }

export type UiAlertEmits = { close:()=>void }
export type UiAutoCompleteEmits = { 'update:modelValue':(value:Key)=>void; input:(value:string)=>void; change:(value:Key,meta:UiAutoCompleteChangeMeta)=>void; select:(option:UiAutoCompleteOption)=>void; search:(query:string)=>void; 'open-change':(open:boolean)=>void; clear:()=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void; 'load-error':(payload:UiAutoCompleteLoadError)=>void }
export type UiAvatarEmits = {}
export type UiBadgeEmits = {}
export type UiBreadcrumbEmits = { navigate:(item:UiBreadcrumbItem)=>void }
export type UiButtonEmits = {}
export type UiCalendarEmits = { 'update:modelValue':(value:DateValue|DateValue[])=>void; change:(value:DateValue|DateValue[],meta:UiCalendarChangeMeta)=>void; clear:(meta:{source:string})=>void; 'update:viewDate':(value:string)=>void; 'view-change':(meta:UiCalendarViewChange)=>void; 'panel-change':(panel:CalendarPanel)=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiCardEmits = {}
export type UiCascaderEmits = { 'update:modelValue':(value:Key[])=>void; change:(value:Key[],path:UiTreeNode[])=>void; 'open-change':(open:boolean)=>void }
export interface UiCommandPaletteOpenMeta { source:'programmatic'|'trigger'|'shortcut'|'select'|'escape'|'mask'|'close-button' }
export interface UiCommandPaletteSelectMeta { source:'pointer'|'keyboard'; query:string }
export interface UiCommandPaletteLoadError { error:unknown; query:string }
export interface UiCommandPaletteDataError { errors:Array<{code:'missing-key'|'duplicate-key';key?:Key;index:number;command:unknown}> }
export type UiCommandPaletteEmits = { 'update:modelValue':(value:boolean)=>void; 'update:query':(value:string)=>void; open:(meta:UiCommandPaletteOpenMeta)=>void; close:(meta:UiCommandPaletteOpenMeta)=>void; select:(command:UiCommandPaletteCommand,meta:UiCommandPaletteSelectMeta)=>void; search:(query:string)=>void; 'load-error':(payload:UiCommandPaletteLoadError)=>void; 'data-error':(payload:UiCommandPaletteDataError)=>void }
export interface UiColorPickerChangeMeta { source:'plane'|'keyboard'|'hue'|'alpha'|'input'|'preset'|'clear'; previous:string }
export interface UiColorPickerInvalid { reason:'parse'; input:string }
export type UiColorPickerEmits = { 'update:modelValue':(value:string)=>void; 'update:open':(value:boolean)=>void; input:(value:string,meta:Pick<UiColorPickerChangeMeta,'source'>)=>void; change:(value:string,meta:UiColorPickerChangeMeta)=>void; clear:()=>void; 'open-change':(open:boolean)=>void; invalid:(payload:UiColorPickerInvalid)=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiCheckboxEmits = { 'update:modelValue':(value:boolean|Key[])=>void; change:(value:boolean|Key[])=>void }
export type UiColEmits = {}
export type UiCollapseEmits = { 'update:modelValue':(value:Key|Key[])=>void; change:(value:Key|Key[])=>void }
export type UiConfigProviderEmits = {}
export type UiDatePickerEmits = { 'update:modelValue':(value:DateValue)=>void; change:(value:DateValue)=>void; clear:()=>void; invalid:(payload:UiDateInvalid)=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiDateRangePickerEmits = { 'update:modelValue':(value:DateValue[])=>void; change:(payload:UiDateRangeChange)=>void; clear:()=>void; invalid:(payload:UiDateRangeInvalid)=>void; focus:(payload:UiDateRangeFocusPayload)=>void; blur:(payload:UiDateRangeFocusPayload)=>void }
export type UiTimePickerEmits = { 'update:modelValue':(value:DateValue)=>void; change:(value:DateValue)=>void; clear:()=>void; invalid:(payload:UiDateInvalid)=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiDescriptionsEmits = {}
export type UiDividerEmits = {}
export type UiDrawerEmits = { 'update:modelValue':(value:boolean)=>void; open:()=>void; close:()=>void }
export type UiDropdownEmits = { 'update:modelValue':(value:boolean)=>void; select:(item:UiDropdownItem)=>void; 'open-change':(open:boolean)=>void }
export type UiEmptyEmits = {}
export type UiFloatButtonEmits = {}
export type UiFormEmits = { submit:(model:Record<string,unknown>,event:SubmitEvent)=>void; invalid:(model:Record<string,unknown>,event:SubmitEvent)=>void; reset:()=>void }
export type UiFormItemEmits = {}
export type UiGridEmits = {}
export type UiIconEmits = {}
export type UiImageEmits = { load:(event:Event,meta:UiImageLoadMeta)=>void; error:(event:Event,meta:UiImageLoadMeta)=>void; fallback:(meta:UiImageFallbackMeta)=>void; retry:(meta:{src:string})=>void; 'update:previewOpen':(value:boolean)=>void; 'update:previewIndex':(value:number)=>void; 'preview-open':(meta:Omit<UiImagePreviewMeta,'source'>)=>void; 'preview-close':(meta:UiImagePreviewMeta)=>void; 'preview-change':(meta:UiImagePreviewMeta)=>void; 'preview-load':(event:Event,meta:UiImagePreviewEventMeta)=>void; 'preview-error':(event:Event,meta:UiImagePreviewEventMeta)=>void; transform:(meta:UiImageTransform)=>void }
export type UiVirtualListEmits = { 'update:modelValue':(value:Key|Key[]|undefined)=>void; change:(value:Key|Key[]|undefined,meta:UiVirtualListSelectionMeta|{source:string;selected:boolean})=>void; 'update:activeIndex':(value:number)=>void; 'active-change':(meta:{index:number;key:Key;item:unknown;source:string})=>void; 'item-click':(item:unknown,index:number,event:MouseEvent)=>void; scroll:(meta:UiVirtualListScrollMeta)=>void; 'range-change':(range:UiVirtualListRange)=>void; 'reach-start':(meta:UiVirtualListScrollMeta)=>void; 'reach-end':(meta:UiVirtualListScrollMeta)=>void; retry:()=>void }
export type UiInputEmits = { 'update:modelValue':(value:string)=>void; input:(value:string)=>void; clear:()=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiLayoutEmits = {}
export type UiListToolbarEmits = { 'update:density':(value:'compact'|'default'|'comfortable')=>void; 'update:visibleColumns':(value:string[])=>void; refresh:()=>void }
export type UiMenuEmits = { 'update:modelValue':(value:Key)=>void; select:(item:UiMenuItem)=>void; 'open-change':(keys:Key[])=>void }
export type UiModalEmits = { 'update:modelValue':(value:boolean)=>void; open:()=>void; close:()=>void }
export type UiMultiSelectEmits = { 'update:modelValue':(value:Key[])=>void; change:(value:Key[])=>void; 'open-change':(open:boolean)=>void }
export type UiNumberInputEmits = { 'update:modelValue':(value:number|null)=>void; input:(value:number|null)=>void; change:(value:number|null,meta:UiNumberInputChangeMeta)=>void; step:(value:number,meta:UiNumberInputStepMeta)=>void; invalid:(payload:UiNumberInputInvalid)=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiNotificationEmits = { close:()=>void; action:()=>void }
export type UiPaginationEmits = { 'update:page':(value:number)=>void; 'update:pageSize':(value:number)=>void; change:(payload:UiPaginationChange)=>void }
export type UiPopconfirmEmits = { confirm:()=>void; cancel:()=>void; error:(error:unknown)=>void }
export type UiPopoverEmits = { 'update:modelValue':(value:boolean)=>void; open:()=>void; close:()=>void }
export type UiProgressEmits = {}
export type UiRadioEmits = { 'update:modelValue':(value:Key|boolean)=>void; change:(value:Key|boolean)=>void }
export type UiRateEmits = { 'update:modelValue':(value:number)=>void; input:(value:number,meta:Pick<UiRateChangeMeta,'source'>)=>void; change:(value:number,meta:UiRateChangeMeta)=>void; 'hover-change':(value:number|null)=>void; clear:()=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiResultEmits = {}
export type UiStatusPageEmits = { home:()=>void; back:()=>void; retry:()=>void }
export type UiSelectEmits = { 'update:modelValue':(value:Key)=>void; change:(value:Key)=>void; clear:()=>void; 'open-change':(open:boolean)=>void }
export type UiSkeletonEmits = {}
export type UiSliderEmits = { 'update:modelValue':(value:number|number[])=>void; input:(value:number|number[],meta:UiSliderChangeMeta)=>void; change:(value:number|number[],meta:UiSliderChangeMeta)=>void; focus:(event:FocusEvent,meta:UiSliderFocusMeta)=>void; blur:(event:FocusEvent,meta:UiSliderFocusMeta)=>void }
export type UiSegmentedEmits = { 'update:modelValue':(value:Key|boolean)=>void; change:(value:Key|boolean)=>void }
export type UiSpaceEmits = {}
export type UiSpinEmits = {}
export type UiStatisticEmits = {}
export type UiStepsEmits = {}
export type UiSwitchEmits = { 'update:modelValue':(value:boolean)=>void; change:(value:boolean)=>void }
export type UiTableEmits = { 'update:selectedRows':(value:Key[])=>void; 'update:expandedRows':(value:Key[])=>void; 'update:sortKey':(value:string)=>void; 'update:sortOrder':(value:''|'asc'|'desc')=>void; 'update:filters':(value:Record<string,unknown>)=>void; 'sort-change':(payload:UiTableSortChange)=>void; 'filter-change':(value:Record<string,unknown>)=>void; 'column-resize':(payload:UiTableColumnResize)=>void; 'row-click':(row:Record<string,unknown>)=>void; retry:()=>void }
export type UiTabsEmits = { 'update:modelValue':(value:Key)=>void; change:(value:Key)=>void; close:(value:Key)=>void }
export type UiTagEmits = {}
export type UiTextareaEmits = { 'update:modelValue':(value:string)=>void; input:(value:string)=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiTimelineEmits = {}
export type UiToastHostEmits = { remove:(id:Key)=>void; pause:(id:Key)=>void; resume:(id:Key)=>void }
export type UiTooltipEmits = {}
export type UiTransferEmits = { 'update:modelValue':(value:Key[])=>void; change:(value:Key[])=>void }
export type UiTreeEmits = { 'update:modelValue':(value:Key|Key[])=>void; 'select-change':(value:Key|Key[],node:UiTreeDataNode,meta:UiTreeSelectMeta)=>void; 'node-click':(node:UiTreeDataNode,event:MouseEvent)=>void; 'update:expandedKeys':(value:Key[])=>void; 'expand-change':(value:Key[],node:UiTreeDataNode,meta:UiTreeExpandMeta)=>void; 'update:checkedKeys':(value:Key[])=>void; 'check-change':(value:Key[],meta:UiTreeCheckMeta)=>void; load:(payload:UiTreeLoadPayload)=>void; 'load-error':(payload:UiTreeLoadError)=>void; 'data-error':(payload:UiTreeDataError)=>void; focus:(event:FocusEvent)=>void; blur:(event:FocusEvent)=>void }
export type UiTreeSelectEmits = { 'update:modelValue':(value:Key)=>void; change:(value:Key,node:UiTreeNode)=>void; 'open-change':(open:boolean)=>void }
export type UiUploadEmits = { 'update:modelValue':(value:UiUploadFile[])=>void; change:(value:UiUploadFile[])=>void; error:(message:string)=>void }

export type UiAlertSlots = { default?:()=>VNodeChild }
export type UiAutoCompleteSlots = { option?:(scope:{option:UiAutoCompleteOption;index:number;active:boolean;selected:boolean;segments:Array<{text:string;match:boolean}>})=>VNodeChild; loading?:()=>VNodeChild; error?:(scope:{error:unknown})=>VNodeChild; empty?:()=>VNodeChild }
export type UiAvatarSlots = { default?:()=>VNodeChild }
export type UiBadgeSlots = { default?:()=>VNodeChild }
export type UiBreadcrumbSlots = {}
export type UiButtonSlots = { default?:()=>VNodeChild }
export type UiCalendarSlots = { header?:(scope:{label:string;viewDate:string;panel:CalendarPanel;previous:()=>void;next:()=>void;setPanel:(panel:CalendarPanel)=>void})=>VNodeChild; cell?:(scope:UiCalendarCell)=>VNodeChild; year?:(scope:{year:number;selected:boolean})=>VNodeChild; footer?:(scope:{today:()=>void;clear:(source?:string)=>void})=>VNodeChild }
export type UiCardSlots = { default?:()=>VNodeChild; header?:()=>VNodeChild; action?:()=>VNodeChild }
export type UiCascaderSlots = {}
export type UiCommandPaletteSlots = { trigger?:(scope:{open:()=>void;close:()=>void;toggle:()=>void})=>VNodeChild; header?:()=>VNodeChild; command?:(scope:{command:UiCommandPaletteCommand;active:boolean;query:string})=>VNodeChild; group?:(scope:{group:string})=>VNodeChild; empty?:(scope:{query:string})=>VNodeChild; loading?:()=>VNodeChild; error?:(scope:{error:unknown;retry:()=>void})=>VNodeChild; footer?:()=>VNodeChild }
export type UiColorPickerSlots = { trigger?:(scope:{value:string;open:()=>void;close:()=>void;toggle:()=>void})=>VNodeChild }
export type UiCheckboxSlots = { default?:()=>VNodeChild }
export type UiColSlots = { default?:()=>VNodeChild }
export type UiCollapseSlots = { [name:`item-${string}`]:((props:{item:UiCollapseItem})=>VNodeChild)|undefined }
export type UiConfigProviderSlots = { default?:()=>VNodeChild }
export type UiDatePickerSlots = {}
export type UiDateRangePickerSlots = {}
export type UiDescriptionsSlots = { extra?:()=>VNodeChild; [name:`item-${string}`]:((props:{item:UiDescriptionItem})=>VNodeChild)|undefined }
export type UiDividerSlots = {}
export type UiDrawerSlots = { default?:()=>VNodeChild; header?:()=>VNodeChild; footer?:(props:{close:()=>void})=>VNodeChild }
export type UiDropdownSlots = { default?:()=>VNodeChild; trigger?:()=>VNodeChild }
export type UiEmptySlots = { default?:()=>VNodeChild }
export type UiFloatButtonSlots = {}
export type UiFormSlots = { default?:(props:{validate:(names?:string[])=>Promise<boolean>;reset:()=>void})=>VNodeChild }
export type UiFormItemSlots = { default?:(props:{controlId:string;labelledby?:string;describedby?:string;invalid:boolean;validate:(trigger?:string)=>Promise<boolean>})=>VNodeChild }
export type UiGridSlots = { default?:()=>VNodeChild }
export type UiIconSlots = { default?:()=>VNodeChild }
export type UiImageSlots = { placeholder?:()=>VNodeChild; error?:(scope:{retry:()=>void})=>VNodeChild; overlay?:(scope:{state:'loading'|'loaded'|'error';open:()=>void})=>VNodeChild; preview?:(scope:{src:string;index:number;scale:number;rotation:number})=>VNodeChild; caption?:(scope:{src:string;index:number})=>VNodeChild; toolbar?:(scope:{zoomIn:(source?:string)=>void;zoomOut:(source?:string)=>void;rotate:(delta:number,source?:string)=>void;reset:(source?:string)=>void;scale:number;rotation:number})=>VNodeChild }
export type UiVirtualListItemScope<T=unknown> = { item:T; index:number; itemKey:Key; active:boolean; selected:boolean; disabled:boolean }
export type UiVirtualListSlots = { default?:(scope:UiVirtualListItemScope)=>VNodeChild; item?:(scope:UiVirtualListItemScope)=>VNodeChild; loading?:()=>VNodeChild; error?:(scope:{error:string|boolean;retry:()=>void})=>VNodeChild; empty?:()=>VNodeChild }
export type UiInputSlots = {}
export type UiLayoutSlots = { default?:()=>VNodeChild }
export type UiListToolbarSlots = { default?:()=>VNodeChild; primary?:()=>VNodeChild }
export type UiMenuSlots = { icon?:(props:{item:UiMenuItem})=>VNodeChild }
export type UiModalSlots = { default?:()=>VNodeChild; header?:()=>VNodeChild; footer?:(props:{close:()=>void})=>VNodeChild }
export type UiMultiSelectSlots = {}
export type UiNumberInputSlots = { prefix?:()=>VNodeChild; suffix?:()=>VNodeChild }
export type UiNotificationSlots = {}
export type UiPaginationSlots = {}
export type UiPopconfirmSlots = { default?:(props:{open:boolean})=>VNodeChild }
export type UiPopoverSlots = { trigger?:(props:{open:boolean})=>VNodeChild; default?:(props:{close:()=>void})=>VNodeChild }
export type UiProgressSlots = {}
export type UiRadioSlots = { default?:()=>VNodeChild }
export type UiRateSlots = { item?:(scope:{index:number;value:number;fill:number;active:boolean})=>VNodeChild; text?:(scope:{value:number;max:number;text:string})=>VNodeChild }
export type UiResultSlots = { default?:()=>VNodeChild; icon?:()=>VNodeChild; extra?:()=>VNodeChild }
export type UiStatusPageSlots = { default?:(scope:{status:'403'|'404'|'500';title:string;description:string})=>VNodeChild; illustration?:(scope:{status:'403'|'404'|'500';icon:string})=>VNodeChild; actions?:(scope:{status:'403'|'404'|'500';home:()=>void;back:()=>void;retry:()=>void})=>VNodeChild; extra?:()=>VNodeChild }
export type UiSelectSlots = {}
export type UiSkeletonSlots = {}
export type UiSliderSlots = {}
export type UiSegmentedSlots = { option?:(props:{option:UiSegmentedOption})=>VNodeChild }
export type UiSpaceSlots = { default?:()=>VNodeChild }
export type UiSpinSlots = { default?:()=>VNodeChild }
export type UiStatisticSlots = { title?:(scope:{title:string})=>VNodeChild; prefix?:(scope:{value:number|string|null;formattedValue:string})=>VNodeChild; value?:(scope:{value:number|string|null;formattedValue:string})=>VNodeChild; suffix?:(scope:{value:number|string|null;formattedValue:string})=>VNodeChild; trend?:(scope:{value:number;direction:'up'|'down'|'flat';tone:'positive'|'negative'|'neutral';text:string})=>VNodeChild; extra?:()=>VNodeChild }
export type UiStepsSlots = {}
export type UiSwitchSlots = {}
export type UiTableSlots = { caption?:()=>VNodeChild; 'empty-action'?:()=>VNodeChild; expanded?:(props:{row:Record<string,unknown>})=>VNodeChild; [name:`cell-${string}`]:((props:{row:Record<string,unknown>;value:unknown;column:UiTableColumn;rowIndex:number})=>VNodeChild)|undefined }
export type UiTabsSlots = { default?:(props:{item:UiTabsItem|Key})=>VNodeChild; [name:`panel-${string}`]:((props:{item:UiTabsItem|Key})=>VNodeChild)|undefined }
export type UiTagSlots = { default?:()=>VNodeChild }
export type UiTextareaSlots = {}
export type UiTimelineSlots = {}
export type UiTimePickerSlots = {}
export type UiToastHostSlots = {}
export type UiTooltipSlots = { default?:(props:{describedby:string})=>VNodeChild }
export type UiTransferSlots = {}
export type UiTreeSlots = { node?:(scope:{node:UiTreeDataNode;level:number;selected:boolean;checked:boolean;indeterminate:boolean;expanded:boolean;loading:boolean})=>VNodeChild; icon?:(scope:{node:UiTreeDataNode;expanded:boolean})=>VNodeChild; suffix?:(scope:{node:UiTreeDataNode})=>VNodeChild; empty?:()=>VNodeChild }
export type UiTreeSelectSlots = {}
export type UiUploadSlots = {}

export type LanComponent<Props=Record<string,unknown>,Emits extends EmitsOptions={},Slots extends Record<string,unknown>={}> = DefineComponent<Props,{}, {}, {}, {},ComponentOptionsMixin,ComponentOptionsMixin,Emits,keyof Emits&string,PublicProps,Readonly<Props>&Readonly<EmitsToProps<Emits>>,{},SlotsType<Slots>>
export interface ToastOptions { id?:Key; message:string; title?:string; type?:UiNotice['type']; placement?:ToastPlacement; duration?:number; onClose?:()=>void }
export interface NotificationOptions extends UiNotice { id?:Key; actionText?:string; secondaryText?:string; onAction?:()=>void; onClose?:()=>void }
export interface ToastService { open:(input:string|ToastOptions,type?:UiNotice['type'],placement?:ToastOptions['placement'])=>Key; success:(input:string|ToastOptions,options?:Partial<ToastOptions>)=>Key; info:(input:string|ToastOptions,options?:Partial<ToastOptions>)=>Key; warning:(input:string|ToastOptions,options?:Partial<ToastOptions>)=>Key; error:(input:string|ToastOptions,options?:Partial<ToastOptions>)=>Key; pause:(id:Key)=>void; resume:(id:Key)=>void; close:(id:Key)=>void; clear:()=>void }
export interface NotificationService { open:(options:NotificationOptions)=>Key; success:(options:NotificationOptions)=>Key; info:(options:NotificationOptions)=>Key; warning:(options:NotificationOptions)=>Key; error:(options:NotificationOptions)=>Key; action:()=>void; close:()=>void; clear:()=>void }
export interface ToastState { items:UiToastItem[] }
export interface NotificationState { current:NotificationOptions|null }
export interface LanUiFeedback { toast:ToastService; toastState:ToastState; notification:NotificationService; notificationState:NotificationState; readonly disposed:boolean; dispose:()=>void }

export const UiAlert:LanComponent<UiAlertProps,UiAlertEmits,UiAlertSlots>; export const UiAutoComplete:LanComponent<UiAutoCompleteProps,UiAutoCompleteEmits,UiAutoCompleteSlots>; export const UiAvatar:LanComponent<UiAvatarProps,UiAvatarEmits,UiAvatarSlots>; export const UiBadge:LanComponent<UiBadgeProps,UiBadgeEmits,UiBadgeSlots>; export const UiBreadcrumb:LanComponent<UiBreadcrumbProps,UiBreadcrumbEmits,UiBreadcrumbSlots>
export const UiButton:LanComponent<UiButtonProps,UiButtonEmits,UiButtonSlots>; export const UiCalendar:LanComponent<UiCalendarProps,UiCalendarEmits,UiCalendarSlots>; export const UiCard:LanComponent<UiCardProps,UiCardEmits,UiCardSlots>; export const UiCascader:LanComponent<UiCascaderProps,UiCascaderEmits,UiCascaderSlots>; export const UiCheckbox:LanComponent<UiCheckboxProps,UiCheckboxEmits,UiCheckboxSlots>
export const UiCollapse:LanComponent<UiCollapseProps,UiCollapseEmits,UiCollapseSlots>; export const UiColorPicker:LanComponent<UiColorPickerProps,UiColorPickerEmits,UiColorPickerSlots>; export const UiCommandPalette:LanComponent<UiCommandPaletteProps,UiCommandPaletteEmits,UiCommandPaletteSlots>; export const UiDescriptions:LanComponent<UiDescriptionsProps,UiDescriptionsEmits,UiDescriptionsSlots>
export const UiCol:LanComponent<UiColProps,UiColEmits,UiColSlots>; export const UiDatePicker:LanComponent<UiDatePickerProps,UiDatePickerEmits,UiDatePickerSlots>; export const UiDivider:LanComponent<UiDividerProps,UiDividerEmits,UiDividerSlots>; export const UiDrawer:LanComponent<UiDrawerProps,UiDrawerEmits,UiDrawerSlots>
export const UiConfigProvider:LanComponent<UiConfigProviderProps,UiConfigProviderEmits,UiConfigProviderSlots>; export const UiDateRangePicker:LanComponent<UiDateRangePickerProps,UiDateRangePickerEmits,UiDateRangePickerSlots>
export const UiDropdown:LanComponent<UiDropdownProps,UiDropdownEmits,UiDropdownSlots>; export const UiEmpty:LanComponent<UiEmptyProps,UiEmptyEmits,UiEmptySlots>; export const UiFloatButton:LanComponent<UiFloatButtonProps,UiFloatButtonEmits,UiFloatButtonSlots>; export const UiForm:LanComponent<UiFormProps,UiFormEmits,UiFormSlots>
export const UiFormItem:LanComponent<UiFormItemProps,UiFormItemEmits,UiFormItemSlots>; export const UiGrid:LanComponent<UiGridProps,UiGridEmits,UiGridSlots>; export const UiIcon:LanComponent<UiIconProps,UiIconEmits,UiIconSlots>; export const UiImage:LanComponent<UiImageProps,UiImageEmits,UiImageSlots>; export const UiInput:LanComponent<UiInputProps,UiInputEmits,UiInputSlots>; export const UiLayout:LanComponent<UiLayoutProps,UiLayoutEmits,UiLayoutSlots>
export const UiListToolbar:LanComponent<UiListToolbarProps,UiListToolbarEmits,UiListToolbarSlots>; export const UiModal:LanComponent<UiModalProps,UiModalEmits,UiModalSlots>; export const UiMultiSelect:LanComponent<UiMultiSelectProps,UiMultiSelectEmits,UiMultiSelectSlots>; export const UiNumberInput:LanComponent<UiNumberInputProps,UiNumberInputEmits,UiNumberInputSlots>; export const UiNotification:LanComponent<UiNotificationProps,UiNotificationEmits,UiNotificationSlots>
export const UiMenu:LanComponent<UiMenuProps,UiMenuEmits,UiMenuSlots>
export const UiPagination:LanComponent<UiPaginationProps,UiPaginationEmits,UiPaginationSlots>; export const UiPopconfirm:LanComponent<UiPopconfirmProps,UiPopconfirmEmits,UiPopconfirmSlots>; export const UiPopover:LanComponent<UiPopoverProps,UiPopoverEmits,UiPopoverSlots>; export const UiProgress:LanComponent<UiProgressProps,UiProgressEmits,UiProgressSlots>
export const UiRadio:LanComponent<UiRadioProps,UiRadioEmits,UiRadioSlots>; export const UiRate:LanComponent<UiRateProps,UiRateEmits,UiRateSlots>; export const UiSelect:LanComponent<UiSelectProps,UiSelectEmits,UiSelectSlots>; export const UiSkeleton:LanComponent<UiSkeletonProps,UiSkeletonEmits,UiSkeletonSlots>; export const UiSlider:LanComponent<UiSliderProps,UiSliderEmits,UiSliderSlots>; export const UiSpace:LanComponent<UiSpaceProps,UiSpaceEmits,UiSpaceSlots>
export const UiResult:LanComponent<UiResultProps,UiResultEmits,UiResultSlots>; export const UiSegmented:LanComponent<UiSegmentedProps,UiSegmentedEmits,UiSegmentedSlots>; export const UiSpin:LanComponent<UiSpinProps,UiSpinEmits,UiSpinSlots>; export const UiStatistic:LanComponent<UiStatisticProps,UiStatisticEmits,UiStatisticSlots>
export const UiStatusPage:LanComponent<UiStatusPageProps,UiStatusPageEmits,UiStatusPageSlots>
export const UiVirtualList:LanComponent<UiVirtualListProps,UiVirtualListEmits,UiVirtualListSlots>
export const UiSteps:LanComponent<UiStepsProps,UiStepsEmits,UiStepsSlots>; export const UiSwitch:LanComponent<UiSwitchProps,UiSwitchEmits,UiSwitchSlots>; export const UiTable:LanComponent<UiTableProps,UiTableEmits,UiTableSlots>; export const UiTabs:LanComponent<UiTabsProps,UiTabsEmits,UiTabsSlots>
export const UiTag:LanComponent<UiTagProps,UiTagEmits,UiTagSlots>; export const UiTextarea:LanComponent<UiTextareaProps,UiTextareaEmits,UiTextareaSlots>; export const UiTimeline:LanComponent<UiTimelineProps,UiTimelineEmits,UiTimelineSlots>; export const UiTooltip:LanComponent<UiTooltipProps,UiTooltipEmits,UiTooltipSlots>
export const UiTimePicker:LanComponent<UiTimePickerProps,UiTimePickerEmits,UiTimePickerSlots>
export const UiToastHost:LanComponent<UiToastHostProps,UiToastHostEmits,UiToastHostSlots>; export const UiTransfer:LanComponent<UiTransferProps,UiTransferEmits,UiTransferSlots>; export const UiTree:LanComponent<UiTreeProps,UiTreeEmits,UiTreeSlots>; export const UiTreeSelect:LanComponent<UiTreeSelectProps,UiTreeSelectEmits,UiTreeSelectSlots>; export const UiUpload:LanComponent<UiUploadProps,UiUploadEmits,UiUploadSlots>
export const feedback:LanUiFeedback; export const lanUiFeedbackKey:symbol; export function createLanUiFeedback():LanUiFeedback; export function useFeedback():LanUiFeedback
export const toast:ToastService; export const notification:NotificationService; export const toastState:ToastState; export const notificationState:NotificationState; export function useToast():ToastService; export function useNotification():NotificationService
export const zhCN:LanUiLocale; export const enUS:LanUiLocale; export const lanUiConfigKey:symbol; export const defaultLocaleRegistry:LocaleRegistry; export function createLocaleRegistry(initialLocales?:LocaleModule[]):LocaleRegistry; export function registerLocale(locale:LocaleModule,aliases?:string|string[]):LanUiLocale; export function unregisterLocale(name:string):boolean; export function hasLocale(name:string):boolean; export function listLocales():LanUiLocale[]; export function loadLocale(name:string,loader:LocaleLoader,options?:LocaleLoadOptions):Promise<LanUiLocale>; export function defineLocale(locale:LocaleInput):LanUiLocale; export function createLocaleTools(locale?:LocaleInput,fallbackLocale?:LocaleFallback,localeRegistry?:LocaleRegistry):LanUiLocaleTools; export function normalizeLanUiConfig(options?:LanUiOptions,parent?:LanUiConfig,localeRegistry?:LocaleRegistry):LanUiConfig; export function useLanUiConfig():ComputedRef<LanUiConfig>; export function useLocale():LanUiLocaleContext; export function useComponentSize(value:unknown):ComputedRef<ComponentSize>; export function useDirection():ComputedRef<Direction>
export const DATE_VALUE_MODES:DateValueMode[]; export const DATE_VALUE_TYPES:Exclude<DateValueType,'auto'>[]; export function resolveTimeZone(input?:string):string; export function parseDateValue(input:string,options?:DateValueMode|DateValueOptions):ParsedDateValue|null; export function dateValueToDate(input:string,options?:DateValueOptions):Date|null; export function formatDateValue(input:Date|number|string,options?:DateValueOptions):string; export function toDateValue(input:DateInput,options?:DateValueOptions):string; export function fromDateValue(input:string,options?:DateValueOptions):DateValue; export function compareDateValues(left:DateInput,right:DateInput,options?:DateValueOptions):number|null; export function inferDateValueType(input:DateInput|DateInput[]):Exclude<DateValueType,'auto'>
export const BUILTIN_ICON_NAMES:readonly string[]; export const BUILTIN_ICONS:Readonly<Record<string,IconDefinition>>; export const iconRegistryKey:InjectionKey<IconRegistry>; export const defaultIconRegistry:IconRegistry; export function defineIcon(input:IconDefinitionInput):IconDefinition; export function createIconRegistry(initialIcons?:Record<string,IconDefinitionInput>|Map<string,IconDefinitionInput>,options?:IconRegistryOptions):IconRegistry; export function registerIcon(name:string,definition:IconDefinitionInput,options?:IconRegisterOptions):IconDefinition; export function unregisterIcon(name:string,options?:IconUnregisterOptions):boolean; export function hasIcon(name:string):boolean; export function listIcons():string[]; export function useIconRegistry():IconRegistry
export function normalizeColorState(input:Partial<RgbaColor>):RgbaColor|null; export function parseColor(input:ColorInput):RgbaColor|null; export function formatColor(input:ColorInput,format?:ColorFormat,includeAlpha?:boolean):string; export function isValidColor(input:unknown):boolean; export function rgbToHsv(input:ColorInput):HsvaColor|null; export function hsvToRgb(input:Partial<HsvaColor>):RgbaColor|null; export function rgbToHsl(input:ColorInput):HslaColor|null; export function hslToRgb(input:Partial<HslaColor>):RgbaColor|null; export function getContrastRatio(foreground:ColorInput,background?:ColorInput):number|null; export function getReadableTextColor(background:ColorInput,light?:ColorInput,dark?:ColorInput):string
export function createLanUi(options?:LanUiOptions):LanUiPlugin; export const LanUi:LanUiPlugin
declare const _default:LanUiPlugin
export default _default
