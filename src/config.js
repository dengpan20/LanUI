import { computed, inject, unref } from 'vue'

export const zhCN={
  name:'zh-CN',
  messages:{
    'common.confirm':'确认','common.cancel':'取消','common.clear':'清除','common.loading':'加载中','common.later':'稍后处理','common.reload':'重新加载','common.all':'全部',
    'alert.close':'关闭提示','badge.dot':'有新消息','badge.count':'{count} 条消息','breadcrumb.label':'面包屑导航',
    'cascader.placeholder':'请选择层级','cascader.level':'第 {level} 级选项','descriptions.label':'详情信息','drawer.close':'关闭抽屉',
    'form.field':'此字段','form.required':'{label}为必填项','form.min':'{label}不能少于 {min}','form.max':'{label}不能超过 {max}','form.pattern':'{label}格式不正确','form.invalid':'{label}校验未通过',
    'list.density.compact':'紧凑','list.density.default':'默认','list.density.comfortable':'宽松','list.selected':'已选择 {count} 项','list.total':'共 {total} 条','list.density':'表格密度','list.columns':'显示列','list.refresh':'刷新列表',
    'menu.label':'功能菜单','modal.close':'关闭弹窗','multiselect.placeholder':'请选择','multiselect.search':'搜索选项','multiselect.remove':'移除 {label}','multiselect.empty':'没有匹配项',
    'notification.close':'关闭通知','popover.label':'弹出内容','steps.label':'步骤进度','tabs.close':'关闭 {label}',
    'toast.title.success':'操作成功','toast.title.info':'提示信息','toast.title.warning':'请注意','toast.title.error':'操作失败','toast.close':'关闭消息',
    'transfer.available':'可选项','transfer.selected':'已选项','transfer.count':'{count} 项','transfer.search':'搜索 {title}','transfer.searchPlaceholder':'搜索','transfer.empty':'暂无数据','transfer.add':'添加到已选项','transfer.remove':'移回可选项',
    'tree.placeholder':'请选择节点','tree.expand':'展开','tree.collapse':'收起','tree.expandNode':'展开 {label}','tree.collapseNode':'收起 {label}','tree.checkNode':'勾选 {label}','tree.uncheckNode':'取消勾选 {label}','tree.loading':'正在加载','tree.retry':'重试','tree.retryNode':'重新加载 {label}','tree.empty':'暂无树节点',
    'select.placeholder':'请选择','select.empty':'没有匹配选项','select.search':'搜索选项','select.clear':'清除选择','autocomplete.placeholder':'请输入并选择','autocomplete.clear':'清除输入','autocomplete.loading':'正在加载建议','autocomplete.empty':'没有匹配建议','autocomplete.error':'建议加载失败','autocomplete.suggestions':'输入建议',
    'input.clear':'清除输入','input.showPassword':'显示密码','input.hidePassword':'隐藏密码','number.increase':'\u589e\u52a0\u6570\u503c','number.decrease':'\u51cf\u5c11\u6570\u503c','slider.value':'滑块值','slider.start':'区间起始值','slider.end':'区间结束值','slider.setValue':'设置为 {value}',
    'date.placeholder':'请选择日期','date.timePlaceholder':'请选择时间','date.datetimePlaceholder':'请选择日期和时间','date.clear':'清除日期或时间','date.open':'打开日期或时间选择器','date.start':'开始日期','date.end':'结束日期','date.rangeLabel':'日期范围','date.separator':'至','date.invalidOrder':'结束时间不能早于开始时间','date.invalidValue':'日期或时间在指定时区中无效',
    'empty.title':'暂无数据','empty.description':'当前条件下没有可展示的内容',
    'pagination.label':'列表分页','pagination.total':'显示 {start}–{end} 条，共 {total} 条记录','pagination.size':'每页显示条数','pagination.previous':'上一页','pagination.next':'下一页',
    'upload.input':'选择上传文件','upload.hint':'支持点击或拖拽文件到此处','upload.dragging':'释放以上传文件','upload.limit':'单个文件不超过 {size}MB，最多 {count} 个','upload.maxCount':'最多上传 {count} 个文件','upload.typeInvalid':'{name} 的文件类型不符合要求','upload.sizeInvalid':'{name} 超过 {size}MB','upload.remove':'移除 {name}',
    'popconfirm.title':'确认执行此操作？','notification.later':'稍后处理','spin.loading':'加载中','switch.label':'开关','progress.label':'进度',
    'table.caption':'数据列表','table.expandColumn':'展开行','table.selectAll':'选择当前页全部记录','table.filter':'筛选 {label}','table.resize':'调整 {label} 列宽','table.errorTitle':'列表加载失败','table.expand':'展开 {id}','table.collapse':'收起 {id}','table.select':'选择 {id}',
  },
}

export const enUS={
  name:'en-US',
  messages:{
    'common.confirm':'Confirm','common.cancel':'Cancel','common.clear':'Clear','common.loading':'Loading','common.later':'Later','common.reload':'Reload','common.all':'All',
    'alert.close':'Close alert','badge.dot':'New message','badge.count':'Messages: {count}','breadcrumb.label':'Breadcrumb',
    'cascader.placeholder':'Select a hierarchy','cascader.level':'Level {level} options','descriptions.label':'Details','drawer.close':'Close drawer',
    'form.field':'This field','form.required':'{label} is required','form.min':'{label} must be at least {min}','form.max':'{label} must not exceed {max}','form.pattern':'{label} has an invalid format','form.invalid':'{label} did not pass validation',
    'list.density.compact':'Compact','list.density.default':'Default','list.density.comfortable':'Comfortable','list.selected':'Selected: {count}','list.total':'Total: {total}','list.density':'Table density','list.columns':'Display columns','list.refresh':'Refresh list',
    'menu.label':'Navigation menu','modal.close':'Close dialog','multiselect.placeholder':'Select options','multiselect.search':'Search options','multiselect.remove':'Remove {label}','multiselect.empty':'No matching options',
    'notification.close':'Close notification','popover.label':'Popover content','steps.label':'Step progress','tabs.close':'Close {label}',
    'toast.title.success':'Success','toast.title.info':'Information','toast.title.warning':'Warning','toast.title.error':'Operation failed','toast.close':'Close message',
    'transfer.available':'Available','transfer.selected':'Selected','transfer.count':'Items: {count}','transfer.search':'Search {title}','transfer.searchPlaceholder':'Search','transfer.empty':'No data','transfer.add':'Add to selected','transfer.remove':'Move back to available',
    'tree.placeholder':'Select a node','tree.expand':'Expand','tree.collapse':'Collapse','tree.expandNode':'Expand {label}','tree.collapseNode':'Collapse {label}','tree.checkNode':'Check {label}','tree.uncheckNode':'Uncheck {label}','tree.loading':'Loading','tree.retry':'Retry','tree.retryNode':'Reload {label}','tree.empty':'No tree nodes',
    'select.placeholder':'Select an option','select.empty':'No matching options','select.search':'Search options','select.clear':'Clear selection','autocomplete.placeholder':'Type to search','autocomplete.clear':'Clear input','autocomplete.loading':'Loading suggestions','autocomplete.empty':'No matching suggestions','autocomplete.error':'Suggestions failed to load','autocomplete.suggestions':'Input suggestions',
    'input.clear':'Clear input','input.showPassword':'Show password','input.hidePassword':'Hide password','number.increase':'Increase value','number.decrease':'Decrease value','slider.value':'Slider value','slider.start':'Range start','slider.end':'Range end','slider.setValue':'Set value to {value}',
    'date.placeholder':'Select date','date.timePlaceholder':'Select time','date.datetimePlaceholder':'Select date and time','date.clear':'Clear date or time','date.open':'Open date or time picker','date.start':'Start date','date.end':'End date','date.rangeLabel':'Date range','date.separator':'to','date.invalidOrder':'End must not be earlier than start','date.invalidValue':'Date or time is invalid in the selected time zone',
    'empty.title':'No data','empty.description':'There is no content for the current criteria',
    'pagination.label':'Pagination','pagination.total':'Showing {start}–{end} of {total}','pagination.size':'Items per page','pagination.previous':'Previous page','pagination.next':'Next page',
    'upload.input':'Choose files','upload.hint':'Click or drag files here','upload.dragging':'Release to upload','upload.limit':'Up to {size}MB each, {count} files maximum','upload.maxCount':'Upload up to {count} files','upload.typeInvalid':'{name} has an unsupported file type','upload.sizeInvalid':'{name} exceeds {size}MB','upload.remove':'Remove {name}',
    'popconfirm.title':'Confirm this action?','notification.later':'Later','spin.loading':'Loading','switch.label':'Switch','progress.label':'Progress',
    'table.caption':'Data table','table.expandColumn':'Expand row','table.selectAll':'Select all rows on this page','table.filter':'Filter {label}','table.resize':'Resize {label} column','table.errorTitle':'Failed to load list','table.expand':'Expand {id}','table.collapse':'Collapse {id}','table.select':'Select {id}',
  },
}

export const lanUiConfigKey=Symbol.for('lan-ui-config')
const builtInLocales={'zh-CN':zhCN,'en-US':enUS,zh:zhCN,en:enUS}
const formatterCaches={number:new Map(),date:new Map(),relative:new Map(),list:new Map(),plural:new Map()}

function mergeLocale(locale,defaultLocale=zhCN,registry=null){
  if(!locale)return defaultLocale
  if(typeof locale==='string')return registry?.get(locale)||builtInLocales[locale]||{name:locale,messages:{}}
  const name=locale.name||defaultLocale.name
  const base=registry?.get(name)||builtInLocales[name]||(defaultLocale.name===name?defaultLocale:null)
  return {...(base||{}),...locale,name,messages:{...(base?.messages||{}),...(locale.messages||{})}}
}

function localeModule(value){return value?.default||value?.locale||value}
function normalizeAliases(aliases){return [...new Set((Array.isArray(aliases)?aliases:[aliases]).filter(Boolean).map(String))]}
function localeLookupKey(value){
  const name=String(value||'').trim()
  if(!name)return ''
  try{return Intl.getCanonicalLocales(name)[0].toLowerCase()}catch{return name.toLowerCase()}
}

export function createLocaleRegistry(initialLocales=[]){
  const entries=new Map()
  const aliases=new Map()
  const pending=new Map()
  const protectedKeys=new Set([localeLookupKey(zhCN.name),localeLookupKey(enUS.name)])
  const get=name=>{
    if(!name)return undefined
    const key=localeLookupKey(name)
    return entries.get(key)||entries.get(aliases.get(key))
  }
  const register=(locale,localeAliases=[])=>{
    const raw=localeModule(locale)
    if(!raw||typeof raw!=='object')throw new TypeError('Locale must be an object or an ES module with a default locale export')
    const name=String(raw.name||'').trim()
    if(!name)throw new TypeError('Locale name is required')
    const normalized=mergeLocale({...raw,name},get(name)||{name,messages:{}},null)
    const key=localeLookupKey(name)
    const nameTarget=aliases.get(key)
    if(nameTarget&&nameTarget!==key)throw new Error(`Locale name already registered as an alias: ${name}`)
    const aliasRecords=normalizeAliases(localeAliases).map(alias=>({alias,key:localeLookupKey(alias)}))
    for(const {alias,key:aliasKey} of aliasRecords){
      const directTarget=entries.has(aliasKey)?aliasKey:null
      const aliasTarget=aliases.get(aliasKey)
      if((directTarget&&directTarget!==key)||(aliasTarget&&aliasTarget!==key))throw new Error(`Locale alias already registered: ${alias}`)
    }
    entries.set(key,normalized)
    for(const {key:aliasKey} of aliasRecords)aliases.set(aliasKey,key)
    return normalized
  }
  const unregister=name=>{
    const key=localeLookupKey(name)
    const resolved=entries.has(key)?key:aliases.get(key)
    if(!resolved)return false
    if(protectedKeys.has(resolved))return false
    for(const [alias,target] of aliases)if(target===resolved)aliases.delete(alias)
    return entries.delete(resolved)
  }
  const load=(name,loader,options={})=>{
    const requestedName=String(name||'').trim()
    const key=localeLookupKey(requestedName)
    if(!key)return Promise.reject(new TypeError('Locale name is required'))
    if(typeof loader!=='function')return Promise.reject(new TypeError('Locale loader must be a function'))
    const current=get(key)
    if(current&&!options.force)return Promise.resolve(current)
    if(pending.has(key))return pending.get(key)
    const task=Promise.resolve().then(()=>loader()).then(module=>{
      const raw=localeModule(module)
      const locale=raw&&typeof raw==='object'?{...raw,name:raw.name||requestedName}:raw
      return register(locale,[requestedName,...normalizeAliases(options.aliases)])
    }).finally(()=>pending.delete(key))
    pending.set(key,task)
    return task
  }
  const registry={register,unregister,get,has:name=>Boolean(get(name)),list:()=>[...entries.values()],load}
  register(zhCN,['zh'])
  register(enUS,['en'])
  for(const locale of initialLocales)register(locale)
  return registry
}

export const defaultLocaleRegistry=createLocaleRegistry()
export const registerLocale=(locale,aliases=[])=>defaultLocaleRegistry.register(locale,aliases)
export const unregisterLocale=name=>defaultLocaleRegistry.unregister(name)
export const hasLocale=name=>defaultLocaleRegistry.has(name)
export const listLocales=()=>defaultLocaleRegistry.list()
export const loadLocale=(name,loader,options={})=>defaultLocaleRegistry.load(name,loader,options)

const fallback={locale:zhCN,fallbackLocale:zhCN,fallbackLocales:[zhCN],localeRegistry:defaultLocaleRegistry,size:'md',density:'default',direction:'ltr',zIndex:300,theme:{}}

export function defineLocale(locale){return mergeLocale(locale,zhCN,defaultLocaleRegistry)}
function normalizeFallbackLocales(input,registry){
  if(input===false||input===null)return []
  const values=Array.isArray(input)?input:[input||zhCN]
  const seen=new Set()
  return values.map(value=>mergeLocale(value,zhCN,registry)).filter(locale=>{
    const key=localeLookupKey(locale.name)
    if(seen.has(key))return false
    seen.add(key)
    return true
  })
}
export function normalizeLanUiConfig(options={},parent=fallback,registryInput=null){
  const localeRegistry=options.localeRegistry||registryInput||parent.localeRegistry||defaultLocaleRegistry
  const direction=options.direction==='rtl'||options.direction==='ltr'?options.direction:parent.direction||'ltr'
  const hasFallbackLocales=Object.prototype.hasOwnProperty.call(options,'fallbackLocales')&&options.fallbackLocales!==undefined
  const hasFallback=Object.prototype.hasOwnProperty.call(options,'fallbackLocale')&&options.fallbackLocale!==undefined
  const fallbackInput=hasFallbackLocales?options.fallbackLocales:hasFallback?options.fallbackLocale:parent.fallbackLocales||parent.fallbackLocale
  const fallbackLocales=normalizeFallbackLocales(fallbackInput,localeRegistry)
  const fallbackLocale=fallbackLocales[0]||null
  return {locale:mergeLocale(options.locale||parent.locale,parent.locale||zhCN,localeRegistry),fallbackLocale,fallbackLocales,localeRegistry,size:options.size||parent.size||'md',density:options.density||parent.density||'default',direction,zIndex:Number(options.zIndex||parent.zIndex||300),theme:{...(parent.theme||{}),...(options.theme||{})}}
}

function canonicalLocale(locale,fallbackLocales){
  for(const candidate of [locale?.name,...fallbackLocales.map(item=>item?.name),'en-US']){
    try{return Intl.getCanonicalLocales(candidate)[0]}catch{}
  }
  return 'en-US'
}
function optionsKey(options={}){return JSON.stringify(Object.entries(options).sort(([left],[right])=>left.localeCompare(right)))}
function formatter(kind,Constructor,locale,fallbackLocales,options={}){
  const name=canonicalLocale(locale,fallbackLocales)
  const key=`${name}|${optionsKey(options)}`
  let instance=formatterCaches[kind].get(key)
  if(!instance){instance=new Constructor(name,options);formatterCaches[kind].set(key,instance)}
  return instance
}
function interpolate(template,params={}){return String(template).replace(/\{(\w+)\}/g,(_,name)=>params[name]??`{${name}}`)}
function resolveMessage(locale,fallbackLocales,key){
  if(locale?.messages?.[key]!==undefined)return locale.messages[key]
  for(const fallbackLocale of fallbackLocales)if(fallbackLocale?.messages?.[key]!==undefined)return fallbackLocale.messages[key]
  return undefined
}
function defaultTemplate(message){
  if(typeof message==='string')return message
  if(message&&typeof message==='object')return message.other??message.one??Object.values(message)[0]
  return undefined
}
function choiceTemplate(message,count,category){
  if(message&&typeof message==='object')return message[`=${count}`]??message[category]??message.other??message.one??Object.values(message)[0]
  if(typeof message!=='string')return undefined
  const choices=message.split('|').map(value=>value.trim())
  if(choices.length===1)return message
  if(choices.length===2)return category==='one'?choices[0]:choices[1]
  return count===0?choices[0]:category==='one'?choices[1]:choices.at(-1)
}
function normalizedDate(value){const date=value instanceof Date?value:new Date(value);return Number.isNaN(date.getTime())?null:date}

export function createLocaleTools(localeInput=zhCN,fallbackInput=zhCN,localeRegistry=defaultLocaleRegistry){
  const locale=mergeLocale(localeInput,zhCN,localeRegistry)
  const fallbackLocales=normalizeFallbackLocales(fallbackInput,localeRegistry)
  const fallbackLocale=fallbackLocales[0]||null
  const formatNumber=(value,options={})=>formatter('number',Intl.NumberFormat,locale,fallbackLocales,options).format(value)
  const formatDate=(value,options={})=>{const date=normalizedDate(value);return date?formatter('date',Intl.DateTimeFormat,locale,fallbackLocales,options).format(date):''}
  const formatRelativeTime=(value,unit='second',options={})=>formatter('relative',Intl.RelativeTimeFormat,locale,fallbackLocales,options).format(value,unit)
  const formatList=(values,options={})=>formatter('list',Intl.ListFormat,locale,fallbackLocales,options).format([...values].map(String))
  const t=(key,params={})=>interpolate(defaultTemplate(resolveMessage(locale,fallbackLocales,key))??key,params)
  const tc=(key,count,params={})=>{
    const category=formatter('plural',Intl.PluralRules,locale,fallbackLocales,params.pluralOptions||{}).select(count)
    const template=choiceTemplate(resolveMessage(locale,fallbackLocales,key),count,category)??key
    const values={...params,count:params.count??formatNumber(count)}
    delete values.pluralOptions
    return interpolate(template,values)
  }
  return {locale,fallbackLocale,fallbackLocales,localeRegistry,t,tc,formatNumber,formatDate,formatRelativeTime,formatList}
}

export function useLanUiConfig(){
  const injected=inject(lanUiConfigKey,null)
  return computed(()=>normalizeLanUiConfig(unref(injected)||{},fallback))
}
export function useLocale(){
  const config=useLanUiConfig()
  const locale=computed(()=>config.value.locale)
  const fallbackLocale=computed(()=>config.value.fallbackLocale)
  const fallbackLocales=computed(()=>config.value.fallbackLocales)
  const localeRegistry=computed(()=>config.value.localeRegistry)
  const tools=computed(()=>createLocaleTools(locale.value,fallbackLocales.value,localeRegistry.value))
  return {
    locale,
    fallbackLocale,
    fallbackLocales,
    localeRegistry,
    t:(...args)=>tools.value.t(...args),
    tc:(...args)=>tools.value.tc(...args),
    formatNumber:(...args)=>tools.value.formatNumber(...args),
    formatDate:(...args)=>tools.value.formatDate(...args),
    formatRelativeTime:(...args)=>tools.value.formatRelativeTime(...args),
    formatList:(...args)=>tools.value.formatList(...args),
  }
}
export function useComponentSize(value){const config=useLanUiConfig();return computed(()=>unref(value)||config.value.size||'md')}
export function useDirection(){const config=useLanUiConfig();return computed(()=>config.value.direction||'ltr')}
