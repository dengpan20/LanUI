import {
  UiButton,
  UiCalendar,
  UiAutoComplete,
  UiCommandPalette,
  UiColorPicker,
  UiDateRangePicker,
  UiDataGrid,
  UiDropdown,
  UiForm,
  UiInput,
  UiIcon,
  UiImage,
  UiModal,
  UiNumberInput,
  UiRate,
  UiStatistic,
  UiStatusPage,
  UiSlider,
  UiTable,
  UiTabs,
  UiTimePicker,
  UiTree,
  UiVirtualList,
  dateValueToDate,
  formatDateValue,
  createLanUiFeedback,
  createLanUi,
  createLocaleRegistry,
  createLocaleTools,
  createIconRegistry,
  parseColor,
  formatColor,
  getContrastRatio,
  useFeedback,
} from 'lan-ui-design-system'
import { dateValueToDate as subpathDateValueToDate } from 'lan-ui-design-system/date'
import { createIconRegistry as createSubpathIconRegistry } from 'lan-ui-design-system/icons'
import { parseColor as parseSubpathColor } from 'lan-ui-design-system/color'
import { createLanUiFeedback as createSubpathFeedback } from 'lan-ui-design-system/feedback'
import SubpathInput, { UiInput as NamedSubpathInput } from 'lan-ui-design-system/components/UiInput'
import SubpathDataGrid, { UiDataGrid as NamedSubpathDataGrid } from 'lan-ui-design-system/components/UiDataGrid'
import SubpathCalendar, { UiCalendar as NamedSubpathCalendar } from 'lan-ui-design-system/components/UiCalendar'
import SubpathImage, { UiImage as NamedSubpathImage } from 'lan-ui-design-system/components/UiImage'
import SubpathVirtualList, { UiVirtualList as NamedSubpathVirtualList } from 'lan-ui-design-system/components/UiVirtualList'
import SubpathStatusPage, { UiStatusPage as NamedSubpathStatusPage } from 'lan-ui-design-system/components/UiStatusPage'
import SubpathAutoComplete, { UiAutoComplete as NamedSubpathAutoComplete } from 'lan-ui-design-system/components/UiAutoComplete'
import SubpathNumberInput, { UiNumberInput as NamedSubpathNumberInput } from 'lan-ui-design-system/components/UiNumberInput'
import SubpathSlider, { UiSlider as NamedSubpathSlider } from 'lan-ui-design-system/components/UiSlider'
import SubpathRate, { UiRate as NamedSubpathRate } from 'lan-ui-design-system/components/UiRate'
import SubpathStatistic, { UiStatistic as NamedSubpathStatistic } from 'lan-ui-design-system/components/UiStatistic'
import SubpathTree, { UiTree as NamedSubpathTree } from 'lan-ui-design-system/components/UiTree'
import SubpathCommandPalette, { UiCommandPalette as NamedSubpathCommandPalette } from 'lan-ui-design-system/components/UiCommandPalette'
import SubpathColorPicker, { UiColorPicker as NamedSubpathColorPicker } from 'lan-ui-design-system/components/UiColorPicker'
import type {
  UiInputEmits,
  UiInputProps,
  UiInputSlots,
} from 'lan-ui-design-system/components/UiInput'
import type { UiDataGridEmits, UiDataGridProps, UiDataGridSlots } from 'lan-ui-design-system/components/UiDataGrid'
import type { UiCalendarEmits, UiCalendarProps, UiCalendarSlots } from 'lan-ui-design-system/components/UiCalendar'
import type { UiImageEmits, UiImageProps, UiImageSlots } from 'lan-ui-design-system/components/UiImage'
import type { UiVirtualListEmits, UiVirtualListProps, UiVirtualListSlots } from 'lan-ui-design-system/components/UiVirtualList'
import type { UiStatusPageEmits, UiStatusPageProps, UiStatusPageSlots } from 'lan-ui-design-system/components/UiStatusPage'
import type { UiAutoCompleteEmits, UiAutoCompleteProps, UiAutoCompleteSlots } from 'lan-ui-design-system/components/UiAutoComplete'
import type { UiNumberInputEmits, UiNumberInputProps, UiNumberInputSlots } from 'lan-ui-design-system/components/UiNumberInput'
import type { UiSliderEmits, UiSliderProps, UiSliderSlots } from 'lan-ui-design-system/components/UiSlider'
import type { UiRateEmits, UiRateProps, UiRateSlots } from 'lan-ui-design-system/components/UiRate'
import type { UiStatisticEmits, UiStatisticProps, UiStatisticSlots } from 'lan-ui-design-system/components/UiStatistic'
import type { UiTreeEmits, UiTreeProps, UiTreeSlots } from 'lan-ui-design-system/components/UiTree'
import type { UiCommandPaletteEmits, UiCommandPaletteProps, UiCommandPaletteSlots } from 'lan-ui-design-system/components/UiCommandPalette'
import type { UiColorPickerEmits, UiColorPickerProps, UiColorPickerSlots } from 'lan-ui-design-system/components/UiColorPicker'
import type {
  UiDateRangeChange,
  UiDataGridChange,
  UiTableColumn,
  UiTableSortChange,
  LanUiLocale,
  LocaleRegistry,
  DateValueOptions,
  UiTimePickerProps,
  IconDefinitionInput,
  IconRegistry,
  UiIconProps,
  UiFormFieldState,
  UiFormInstance,
  UiFormProps,
  UiFormRule,
  RgbaColor,
  ColorFormat,
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
const dataGridProps:InstanceType<typeof UiDataGrid>['$props']&UiDataGridProps={columns:[{key:'name',label:'Name',sortable:true}],rows:[{id:1,name:'Lan UI'}],mode:'server',total:240,page:2,pageSize:20,query:'lan',queryFields:['name'],filters:{status:'ready'},sortKey:'name',sortOrder:'asc',visibleColumns:['name'],selectable:true,searchDebounce:200,autoRequest:true}
const dataGridEmit:InstanceType<typeof UiDataGrid>['$emit']=null as never
const dataGridRequest:UiDataGridChange={reason:'refresh',mode:'server',state:{page:2,pageSize:20,query:'lan',filters:{status:'ready'},sortKey:'name',sortOrder:'asc',density:'default',visibleColumns:['name']}}
dataGridEmit('request',dataGridRequest)
dataGridEmit('update:query','component')
const dataGridSubpathParity:typeof SubpathDataGrid=NamedSubpathDataGrid
const dataGridEvent:keyof UiDataGridEmits='state-change'
const dataGridSlot:keyof UiDataGridSlots='footer'
const formProps:InstanceType<typeof UiForm>['$props']&UiFormProps={model:{user:{email:''}},rules:{'user.email':[{required:true,type:'email'}]},initialValues:{user:{email:'owner@example.com'}},validateOnRuleChange:true,focusOnError:true,scrollToError:true,showErrorSummary:true}
const formRule:UiFormRule={type:'email',trigger:['blur','submit'],transform:value=>String(value).trim(),validator:async(value,_model,{signal,name})=>signal?.aborted?true:name==='user.email'&&Boolean(value)}
const formState:UiFormFieldState={name:'user.email',label:'Email',errors:[],status:'success',touched:true,dirty:true,validating:false}
const formInstance:UiFormInstance={validate:async()=>true,validateField:async()=>true,submit:async()=>{},clearValidate:()=>{},reset:()=>{},resetFields:()=>{},setFields:()=>{},setFieldError:()=>{},getFieldValue:()=>'',getFieldsValue:()=>({}),setFieldValue:()=>'',getFieldState:()=>formState,getFieldsState:()=>[formState],getFieldError:()=>[],getFieldsError:()=>[],focusField:()=>true,scrollToField:()=>true}
const sortChange: UiTableSortChange = { key: 'name', order: 'asc' }
const column: UiTableColumn = { key: 'name', label: 'Name', fixed: 'start', sortable: true }

const subpathProps: UiInputProps = inputProps
const subpathEmits: keyof UiInputEmits = 'update:modelValue'
const subpathSlots: keyof UiInputSlots | 'none' = 'none'
const inputParity: typeof SubpathInput = NamedSubpathInput
const calendarProps:InstanceType<typeof UiCalendar>['$props']&UiCalendarProps={modelValue:['2026-08-10','2026-08-16'],selectionMode:'range',valueType:'string',viewDate:'2026-08-01',today:'2026-08-12',firstDayOfWeek:1,weekdayFormat:'short',showWeekNumbers:true,disabledDate:(_date,{date,currentMonth})=>!currentMonth&&date.endsWith('-01')}
const calendarEmit:InstanceType<typeof UiCalendar>['$emit']=null as never
calendarEmit('change',['2026-08-10','2026-08-16'],{source:'keyboard',selectionMode:'range',date:'2026-08-16'})
calendarEmit('view-change',{value:'2026-09-01',previous:'2026-08-01',source:'keyboard'})
const calendarSubpathParity:typeof SubpathCalendar=NamedSubpathCalendar
const calendarEvent:keyof UiCalendarEmits='panel-change'
const calendarSlot:keyof UiCalendarSlots='cell'
const imageProps:InstanceType<typeof UiImage>['$props']&UiImageProps={src:'/thumb.jpg',alt:'Typed image',fallback:'/fallback.jpg',width:320,height:'180px',aspectRatio:'16/9',fit:'contain',loading:'lazy',decoding:'async',preview:true,previewList:['/a.jpg','/b.jpg'],previewIndex:1,minScale:.5,maxScale:4,scaleStep:.25,zoomOnWheel:true,teleportTo:document.body}
const imageEmit:InstanceType<typeof UiImage>['$emit']=null as never
imageEmit('preview-change',{index:1,src:'/b.jpg',source:'keyboard'})
imageEmit('transform',{scale:1.25,rotation:90,offsetX:0,offsetY:0,source:'keyboard'})
const imageSubpathParity:typeof SubpathImage=NamedSubpathImage
const imageEvent:keyof UiImageEmits='preview-error'
const imageSlot:keyof UiImageSlots='toolbar'
const virtualListProps:InstanceType<typeof UiVirtualList>['$props']&UiVirtualListProps={items:[{id:'a',label:'Alpha'}],itemKey:'id',itemSize:(_item,index)=>index%2?44:52,estimatedItemSize:48,height:'18rem',overscan:4,measure:true,selectionMode:'multiple',modelValue:['a'],disabledKeys:['disabled'],loop:true,bordered:true,striped:true}
const virtualListEmit:InstanceType<typeof UiVirtualList>['$emit']=null as never
virtualListEmit('change',['a'],{key:'a',index:0,item:{id:'a'},selected:true,source:'keyboard'})
virtualListEmit('range-change',{start:0,end:8,visibleStart:0,visibleEnd:6,total:100})
const virtualListSubpathParity:typeof SubpathVirtualList=NamedSubpathVirtualList
const virtualListEvent:keyof UiVirtualListEmits='reach-end'
const virtualListSlot:keyof UiVirtualListSlots='item'
const statusPageProps:InstanceType<typeof UiStatusPage>['$props']&UiStatusPageProps={status:'500',title:'Service unavailable',description:'Retry later',embedded:true}
const statusPageEmit:InstanceType<typeof UiStatusPage>['$emit']=null as never
statusPageEmit('retry')
const statusPageSubpathParity:typeof SubpathStatusPage=NamedSubpathStatusPage
const statusPageEvent:keyof UiStatusPageEmits='home'
const statusPageSlot:keyof UiStatusPageSlots='actions'
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
const rateProps:InstanceType<typeof UiRate>['$props']&UiRateProps={modelValue:3.5,max:5,step:.5,allowClear:true,showText:true,texts:['Poor','Fair','Good','Great','Excellent'],formatter:(value,max)=>`${value}/${max}`}
const rateEmit:InstanceType<typeof UiRate>['$emit']=null as never
rateEmit('change',4,{source:'keyboard',previous:3.5})
const rateSubpathParity:typeof SubpathRate=NamedSubpathRate
const rateEvent:keyof UiRateEmits='hover-change'
const rateSlot:keyof UiRateSlots='item'
const statisticProps:InstanceType<typeof UiStatistic>['$props']&UiStatisticProps={value:2864000,title:'Revenue',precision:0,formatOptions:{notation:'compact'},prefix:'$',trend:12.6,positiveDirection:'up',status:'success',live:'polite',formatter:(value,{numericValue})=>numericValue??value,trendFormatter:(value,{direction,tone})=>`${direction}:${tone}:${value}`}
const statisticEmit:InstanceType<typeof UiStatistic>['$emit']=null as never
const statisticSubpathParity:typeof SubpathStatistic=NamedSubpathStatistic
const statisticEvent:keyof UiStatisticEmits|'none'='none'
const statisticSlot:keyof UiStatisticSlots='trend'
const treeProps:InstanceType<typeof UiTree>['$props']&UiTreeProps={data:[{id:'root',title:'Root',nodes:[{id:'leaf',title:'Leaf',isLeaf:true}]}],nodeKey:'id',labelKey:'title',childrenKey:'nodes',modelValue:'leaf',expandedKeys:['root'],checkedKeys:['leaf'],checkable:true,showLine:true,virtual:true,height:'20rem',loadData:async(node,{signal})=>signal?.aborted?[]:[{label:String(node.title),value:'loaded'}]}
const treeEmit:InstanceType<typeof UiTree>['$emit']=null as never
treeEmit('check-change',['leaf'],{node:{id:'leaf',title:'Leaf'},checked:true,halfCheckedKeys:[],source:'keyboard'})
const treeSubpathParity:typeof SubpathTree=NamedSubpathTree
const treeEvent:keyof UiTreeEmits='load-error'
const treeSlot:keyof UiTreeSlots='node'
const commandPaletteProps:InstanceType<typeof UiCommandPalette>['$props']&UiCommandPaletteProps={defaultOpen:false,commands:[{key:'dashboard',label:'Open dashboard',keywords:['home']}],hotkeys:['Control+K'],maxResults:8,fetchCommands:async(query,{signal})=>signal?.aborted?[]:[{key:query,label:query}]}
const commandPaletteEmit:InstanceType<typeof UiCommandPalette>['$emit']=null as never
commandPaletteEmit('select',{key:'dashboard',label:'Open dashboard'},{source:'keyboard',query:'dash'})
const commandPaletteSubpathParity:typeof SubpathCommandPalette=NamedSubpathCommandPalette
const commandPaletteEvent:keyof UiCommandPaletteEmits='load-error'
const commandPaletteSlot:keyof UiCommandPaletteSlots='command'
const colorPickerProps:InstanceType<typeof UiColorPicker>['$props']&UiColorPickerProps={modelValue:'#1677FFCC',format:'hex',alpha:true,presets:['#1677FF',{label:'Success',value:'#10B981'}],showContrast:true,contrastColor:'#FFFFFF',placement:'bottom-start'}
const colorPickerEmit:InstanceType<typeof UiColorPicker>['$emit']=null as never
colorPickerEmit('change','#1677FFCC',{source:'preset',previous:'#000000'})
const colorPickerSubpathParity:typeof SubpathColorPicker=NamedSubpathColorPicker
const colorPickerEvent:keyof UiColorPickerEmits='invalid'
const colorPickerSlot:keyof UiColorPickerSlots='trigger'
const parsedColor:RgbaColor|null=parseColor('rgba(22 119 255 / 80%)')
const formattedColor:string=formatColor(parsedColor||'#1677FF','hex',true)
const colorContrast:number|null=getContrastRatio(formattedColor,'#FFFFFF')
const colorSubpathParity:typeof parseColor=parseSubpathColor
const colorFormat:ColorFormat='hsl'
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

// @ts-expect-error Data grid modes are constrained to client or server orchestration.
const invalidDataGridMode:UiDataGridProps={mode:'offline'}

// @ts-expect-error Form validation types are constrained to supported built-in validators.
const invalidFormRule:UiFormRule={type:'phone'}

// @ts-expect-error Date picker value types are constrained to the public adapter contract.
const invalidDateValueType:UiTimePickerProps={valueType:'moment'}
// @ts-expect-error Icon flips use the constrained transform contract.
const invalidIconFlip:UiIconProps={flip:'diagonal'}
// @ts-expect-error Number input controls use the documented sides or right placement.
const invalidNumberControls:UiNumberInputProps={controlsPosition:'vertical'}
// @ts-expect-error Slider tooltip visibility is constrained to auto, always or never.
const invalidSliderTooltip:UiSliderProps={tooltip:'hover'}
// @ts-expect-error Rating size uses the shared sm, md or lg component scale.
const invalidRateSize:UiRateProps={size:'xl'}
// @ts-expect-error Statistic live regions use the ARIA off, polite or assertive values.
const invalidStatisticLive:UiStatisticProps={live:'on'}
// @ts-expect-error Calendar selection mode is constrained to single, multiple or range.
const invalidCalendarMode:UiCalendarProps={selectionMode:'week'}
// @ts-expect-error Image fitting follows the native object-fit contract.
const invalidImageFit:UiImageProps={fit:'stretch'}
// @ts-expect-error Virtual list selection is constrained to none, single or multiple.
const invalidVirtualSelection:UiVirtualListProps={selectionMode:'range'}
// @ts-expect-error AutoComplete match modes are constrained to documented filtering semantics.
const invalidAutoCompleteMatch:UiAutoCompleteProps={matchMode:'fuzzy'}
// @ts-expect-error Tree model values are string or number keys, never booleans.
const invalidTreeValue:UiTreeProps={modelValue:true}
// @ts-expect-error Command palette hotkeys are expressed as normalized strings.
const invalidCommandHotkeys:UiCommandPaletteProps={hotkeys:[true]}
// @ts-expect-error Color output formats are constrained to hex, rgb or hsl.
const invalidColorFormat:UiColorPickerProps={format:'cmyk'}

console.log(dataGridProps, dataGridEmit, dataGridRequest, dataGridSubpathParity, dataGridEvent, dataGridSlot, invalidDataGridMode, plugin, localeTools, localeRegistry, localizedCount, localizedDate, fallbackNames, registeredLocale, loadedLocale, registeredNames, isolatedPlugin, feedbackParity, injectedFeedback, dropdownOffset, invalidButton, modalFooter, tableCell, tabPanel, sortChange, column, subpathProps, subpathEmits, subpathSlots, inputParity, calendarProps, calendarEmit, calendarSubpathParity, calendarEvent, calendarSlot, invalidCalendarMode, imageProps, imageEmit, imageSubpathParity, imageEvent, imageSlot, invalidImageFit, virtualListProps, virtualListEmit, virtualListSubpathParity, virtualListEvent, virtualListSlot, invalidVirtualSelection, statusPageProps, statusPageEmit, statusPageSubpathParity, statusPageEvent, statusPageSlot, autoCompleteProps, autoCompleteEmit, autoCompleteSubpathParity, autoCompleteEvent, autoCompleteSlot, invalidAutoCompleteMatch, numberInputProps, numberInputEmit, numberInputSubpathParity, numberInputEvent, numberInputSlot, sliderProps, sliderEmit, sliderSubpathParity, sliderEvent, sliderSlot, rateProps, rateEmit, rateSubpathParity, rateEvent, rateSlot, invalidRateSize, statisticProps, statisticEmit, statisticSubpathParity, statisticEvent, statisticSlot, invalidStatisticLive, treeProps, treeEmit, treeSubpathParity, treeEvent, treeSlot, commandPaletteProps, commandPaletteEmit, commandPaletteSubpathParity, commandPaletteEvent, commandPaletteSlot, colorPickerProps, colorPickerEmit, colorPickerSubpathParity, colorPickerEvent, colorPickerSlot, parsedColor, formattedColor, colorContrast, colorSubpathParity, colorFormat, invalidColorFormat, invalidCommandHotkeys, invalidTreeValue, invalidSliderTooltip, invalidNumberControls, dateContract, dateOptions, zonedDate, formattedDate, dateSubpathParity, dateDisambiguation, timePickerProps, invalidDateValueType, iconDefinition, iconRegistry, iconRegistryParity, iconProps, iconNames, invalidIconFlip)
