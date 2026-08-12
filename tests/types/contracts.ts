import {
  UiButton,
  UiAutoComplete,
  UiDateRangePicker,
  UiDropdown,
  UiInput,
  UiIcon,
  UiModal,
  UiNumberInput,
  UiSlider,
  UiTable,
  UiTabs,
  UiTimePicker,
  dateValueToDate,
  formatDateValue,
  createLanUiFeedback,
  createLanUi,
  createLocaleRegistry,
  createLocaleTools,
  createIconRegistry,
  useFeedback,
} from 'lan-ui-design-system'
import { dateValueToDate as subpathDateValueToDate } from 'lan-ui-design-system/date'
import { createIconRegistry as createSubpathIconRegistry } from 'lan-ui-design-system/icons'
import { createLanUiFeedback as createSubpathFeedback } from 'lan-ui-design-system/feedback'
import SubpathInput, { UiInput as NamedSubpathInput } from 'lan-ui-design-system/components/UiInput'
import SubpathAutoComplete, { UiAutoComplete as NamedSubpathAutoComplete } from 'lan-ui-design-system/components/UiAutoComplete'
import SubpathNumberInput, { UiNumberInput as NamedSubpathNumberInput } from 'lan-ui-design-system/components/UiNumberInput'
import SubpathSlider, { UiSlider as NamedSubpathSlider } from 'lan-ui-design-system/components/UiSlider'
import type {
  UiInputEmits,
  UiInputProps,
  UiInputSlots,
} from 'lan-ui-design-system/components/UiInput'
import type { UiAutoCompleteEmits, UiAutoCompleteProps, UiAutoCompleteSlots } from 'lan-ui-design-system/components/UiAutoComplete'
import type { UiNumberInputEmits, UiNumberInputProps, UiNumberInputSlots } from 'lan-ui-design-system/components/UiNumberInput'
import type { UiSliderEmits, UiSliderProps, UiSliderSlots } from 'lan-ui-design-system/components/UiSlider'
import type {
  UiDateRangeChange,
  UiTableColumn,
  UiTableSortChange,
  LanUiLocale,
  LocaleRegistry,
  DateValueOptions,
  UiTimePickerProps,
  IconDefinitionInput,
  IconRegistry,
  UiIconProps,
} from 'lan-ui-design-system'
import type { DateDisambiguation } from 'lan-ui-design-system/date'

const plugin = createLanUi({ locale: 'en-US', direction: 'rtl', density: 'compact' })
plugin.setLocale('zh-CN')
plugin.setFallbackLocale(['fr-FR','en-US'])
const localeRegistry:LocaleRegistry = createLocaleRegistry([{ name:'fr-FR', messages:{ fallback:'Repli' } }])
const localeTools = createLocaleTools({ name:'fr-CA', messages:{ items:{ one:'{count} item', other:'{count} items' } } }, ['fr-FR','en-US'], localeRegistry)
const localizedCount:string = localeTools.tc('items', 2)
const localizedDate:string = localeTools.formatDate(new Date(), { dateStyle:'medium' })
const fallbackNames:string[] = localeTools.fallbackLocales.map(item=>item.name)
const registeredLocale:LanUiLocale = plugin.registerLocale({ name:'de-DE', messages:{ greeting:'Hallo' } }, 'de')
const loadedLocale:Promise<LanUiLocale> = plugin.loadLocale('ja-JP', async()=>({ default:{ name:'ja-JP', messages:{ greeting:'こんにちは' } } }), { aliases:'ja', activate:true })
const registeredNames:string[] = plugin.listLocales().map(item=>item.name)
const isolatedFeedback = createLanUiFeedback()
const isolatedPlugin = createLanUi({ isolated: true, feedback: isolatedFeedback })
isolatedPlugin.feedback.toast.success('Typed feedback', { placement: 'top-end' })
const feedbackParity: typeof createLanUiFeedback = createSubpathFeedback
const injectedFeedback = useFeedback

const inputProps: InstanceType<typeof UiInput>['$props'] = {
  modelValue: 'Lan UI',
  clearable: true,
  'onUpdate:modelValue': value => value.toUpperCase(),
  onFocus: event => event.preventDefault(),
}
const dropdownOffset: InstanceType<typeof UiDropdown>['$props']['offset'] = 8
const inputEmit: InstanceType<typeof UiInput>['$emit'] = null as never
inputEmit('update:modelValue', 'next')
inputEmit('focus', new FocusEvent('focus'))

// @ts-expect-error UiInput model updates always emit the native string value.
inputEmit('update:modelValue', true)
// @ts-expect-error Component sizes are limited to sm, md and lg.
const invalidButton: InstanceType<typeof UiButton>['$props'] = { size: 'xl' }

const modalFooter: NonNullable<InstanceType<typeof UiModal>['$slots']['footer']> = ({ close }) => {
  close()
  return 'footer'
}
const tableCell: NonNullable<InstanceType<typeof UiTable>['$slots'][`cell-${string}`]> = ({ column, rowIndex }) => `${column.key}:${rowIndex}`
const tabPanel: NonNullable<InstanceType<typeof UiTabs>['$slots'][`panel-${string}`]> = ({ item }) => typeof item === 'object' ? item.label : String(item)
const dateChange: Parameters<NonNullable<InstanceType<typeof UiDateRangePicker>['$props']['onChange']>>[0] = { value: ['2026-08-12'], valid: true }
const sortChange: UiTableSortChange = { key: 'name', order: 'asc' }
const column: UiTableColumn = { key: 'name', label: 'Name', fixed: 'start', sortable: true }

const subpathProps: UiInputProps = inputProps
const subpathEmits: keyof UiInputEmits = 'update:modelValue'
const subpathSlots: keyof UiInputSlots | 'none' = 'none'
const inputParity: typeof SubpathInput = NamedSubpathInput
const autoCompleteProps:InstanceType<typeof UiAutoComplete>['$props']&UiAutoCompleteProps={modelValue:'hangzhou',options:[{label:'Hangzhou',value:'hangzhou',keywords:['hz']}],matchMode:'startsWith',placement:'bottom-start',fetchSuggestions:async(query,{signal})=>signal?.aborted?[]:[query]}
const autoCompleteEmit:InstanceType<typeof UiAutoComplete>['$emit']=null as never
autoCompleteEmit('change','hangzhou',{source:'option',option:{label:'Hangzhou',value:'hangzhou'},index:0})
const autoCompleteSubpathParity:typeof SubpathAutoComplete=NamedSubpathAutoComplete
const autoCompleteEvent:keyof UiAutoCompleteEmits='load-error'
const autoCompleteSlot:keyof UiAutoCompleteSlots='option'
const numberInputProps:InstanceType<typeof UiNumberInput>['$props']&UiNumberInputProps={modelValue:12.5,min:0,max:100,step:.25,precision:2,controlsPosition:'sides',formatter:value=>`$${value}`,parser:text=>text.slice(1)}
const numberInputEmit:InstanceType<typeof UiNumberInput>['$emit']=null as never
numberInputEmit('change',13,{source:'keyboard',previous:12.5})
const numberInputSubpathParity:typeof SubpathNumberInput=NamedSubpathNumberInput
const numberInputEvent:keyof UiNumberInputEmits='step'
const numberInputSlot:keyof UiNumberInputSlots='suffix'
const sliderProps:InstanceType<typeof UiSlider>['$props']&UiSliderProps={modelValue:[20,80],range:true,min:0,max:100,step:5,minDistance:10,tooltip:'always',marks:[{value:50,label:'Half'}],ariaLabel:['Start','End']}
const sliderEmit:InstanceType<typeof UiSlider>['$emit']=null as never
sliderEmit('change',[25,80],{source:'keyboard',thumb:0})
const sliderSubpathParity:typeof SubpathSlider=NamedSubpathSlider
const sliderEvent:keyof UiSliderEmits='input'
const sliderSlot:keyof UiSliderSlots|'none'='none'
const dateContract: UiDateRangeChange = dateChange
const dateOptions:DateValueOptions={mode:'datetime',valueType:'date',timeZone:'Asia/Shanghai',disambiguation:'reject',precision:'second'}
const zonedDate:Date|null=dateValueToDate('2026-08-12T09:30',dateOptions)
const formattedDate:string=formatDateValue(zonedDate||0,{mode:'datetime',timeZone:'UTC'})
const dateSubpathParity:typeof dateValueToDate=subpathDateValueToDate
const dateDisambiguation:DateDisambiguation='later'
const timePickerProps:InstanceType<typeof UiTimePicker>['$props']&UiTimePickerProps={modelValue:new Date(),valueType:'date',timeZone:'UTC',precision:'second',step:1}
const iconDefinition:IconDefinitionInput={body:'<path d="M4 4h16v16H4Z"/>',viewBox:'0 0 24 24'}
const iconRegistry:IconRegistry=createIconRegistry({tenantMark:iconDefinition})
const iconRegistryParity:typeof createIconRegistry=createSubpathIconRegistry
const iconProps:InstanceType<typeof UiIcon>['$props']&UiIconProps={name:'tenantMark',size:20,directional:true,flip:'horizontal',ariaLabel:'Tenant mark'}
plugin.registerIcon('pluginMark',iconDefinition)
const iconNames:string[]=plugin.listIcons()

// @ts-expect-error Date picker value types are constrained to the public adapter contract.
const invalidDateValueType:UiTimePickerProps={valueType:'moment'}
// @ts-expect-error Icon flips use the constrained transform contract.
const invalidIconFlip:UiIconProps={flip:'diagonal'}
// @ts-expect-error Number input controls use the documented sides or right placement.
const invalidNumberControls:UiNumberInputProps={controlsPosition:'vertical'}
// @ts-expect-error Slider tooltip visibility is constrained to auto, always or never.
const invalidSliderTooltip:UiSliderProps={tooltip:'hover'}
// @ts-expect-error AutoComplete match modes are constrained to documented filtering semantics.
const invalidAutoCompleteMatch:UiAutoCompleteProps={matchMode:'fuzzy'}

console.log(plugin, localeTools, localeRegistry, localizedCount, localizedDate, fallbackNames, registeredLocale, loadedLocale, registeredNames, isolatedPlugin, feedbackParity, injectedFeedback, dropdownOffset, invalidButton, modalFooter, tableCell, tabPanel, sortChange, column, subpathProps, subpathEmits, subpathSlots, inputParity, autoCompleteProps, autoCompleteEmit, autoCompleteSubpathParity, autoCompleteEvent, autoCompleteSlot, invalidAutoCompleteMatch, numberInputProps, numberInputEmit, numberInputSubpathParity, numberInputEvent, numberInputSlot, sliderProps, sliderEmit, sliderSubpathParity, sliderEvent, sliderSlot, invalidSliderTooltip, invalidNumberControls, dateContract, dateOptions, zonedDate, formattedDate, dateSubpathParity, dateDisambiguation, timePickerProps, invalidDateValueType, iconDefinition, iconRegistry, iconRegistryParity, iconProps, iconNames, invalidIconFlip)
