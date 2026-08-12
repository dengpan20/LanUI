import { computed, inject, unref } from 'vue'

export const zhCN={
  name:'zh-CN',
  messages:{
    'common.confirm':'确认','common.cancel':'取消','common.clear':'清除','common.loading':'加载中','common.later':'稍后处理','common.reload':'重新加载','common.all':'全部',
    'command.label':'命令面板','command.title':'快捷命令','command.placeholder':'搜索命令','command.empty':'没有匹配命令','command.loading':'正在加载命令','command.error':'命令加载失败','command.retry':'重新加载命令','command.close':'关闭命令面板','command.hint':'输入关键词快速查找命令','command.results':'命令结果','command.navigate':'导航','command.select':'执行',
    'color.panel':'颜色选择器','color.empty':'未选择颜色','color.plane':'饱和度与亮度','color.planeValue':'饱和度 {saturation}%，亮度 {brightness}%','color.hue':'色相','color.alpha':'透明度','color.input':'颜色值','color.presets':'预设颜色','color.select':'选择','color.contrast':'对比度','color.contrastFail':'未达到 AA','color.keyboardHint':'方向键调整，Shift 加速','color.clear':'清除颜色',
    'alert.close':'关闭提示','badge.dot':'有新消息','badge.count':'{count} 条消息','breadcrumb.label':'面包屑导航',
    'cascader.placeholder':'请选择层级','cascader.level':'第 {level} 级选项','descriptions.label':'详情信息','drawer.close':'关闭抽屉',
    'form.field':'此字段','form.required':'{label}为必填项','form.min':'{label}不能少于 {min}','form.max':'{label}不能超过 {max}','form.len':'{label}长度必须为 {len}','form.type':'{label}必须为有效的 {type}','form.enum':'{label}不是允许的值','form.whitespace':'{label}不能仅包含空格','form.pattern':'{label}格式不正确','form.invalid':'{label}校验未通过','form.errorSummary':'请修正以下表单错误',
    'schemaForm.list.group':'\u53ef\u91cd\u590d\u5b57\u6bb5\u7ec4','schemaForm.list.item':'\u7b2c {index} \u9879','schemaForm.list.add':'\u6dfb\u52a0\u4e00\u9879','schemaForm.list.remove':'\u79fb\u9664\u7b2c {index} \u9879','schemaForm.list.moveUp':'\u4e0a\u79fb\u7b2c {index} \u9879','schemaForm.list.moveDown':'\u4e0b\u79fb\u7b2c {index} \u9879','schemaForm.list.empty':'\u6682\u65e0\u5217\u8868\u9879',
    'list.density.compact':'紧凑','list.density.default':'默认','list.density.comfortable':'宽松','list.selected':'已选择 {count} 项','list.total':'共 {total} 条','list.density':'表格密度','list.columns':'显示列','list.refresh':'刷新列表',
    'list.toolbar':'\u5217\u8868\u5de5\u5177','list.columnSettings':'\u5217\u8bbe\u7f6e','dataGrid.label':'\u6570\u636e\u7f51\u683c','dataGrid.searchLabel':'\u641c\u7d22\u6570\u636e','dataGrid.searchPlaceholder':'\u641c\u7d22\u5f53\u524d\u6570\u636e','dataGrid.results':'\u5171 {count} \u6761\u5339\u914d\u6570\u636e','dataGrid.reset':'\u91cd\u7f6e\u6570\u636e\u7f51\u683c','dataGrid.requesting':'\u6b63\u5728\u52a0\u8f7d\u6570\u636e','dataGrid.caption':'\u6570\u636e\u7f51\u683c',
    'menu.label':'功能菜单','modal.close':'关闭弹窗','multiselect.placeholder':'请选择','multiselect.search':'搜索选项','multiselect.remove':'移除 {label}','multiselect.empty':'没有匹配项',
    'notification.close':'关闭通知','popover.label':'弹出内容','steps.label':'步骤进度','tabs.close':'关闭 {label}',
    'toast.title.success':'操作成功','toast.title.info':'提示信息','toast.title.warning':'请注意','toast.title.error':'操作失败','toast.close':'关闭消息',
    'transfer.available':'可选项','transfer.selected':'已选项','transfer.count':'{count} 项','transfer.search':'搜索 {title}','transfer.searchPlaceholder':'搜索','transfer.empty':'暂无数据','transfer.add':'添加到已选项','transfer.remove':'移回可选项',
    'tree.placeholder':'请选择节点','tree.expand':'展开','tree.collapse':'收起','tree.expandNode':'展开 {label}','tree.collapseNode':'收起 {label}','tree.checkNode':'勾选 {label}','tree.uncheckNode':'取消勾选 {label}','tree.loading':'正在加载','tree.retry':'重试','tree.retryNode':'重新加载 {label}','tree.empty':'暂无树节点',
    'select.placeholder':'请选择','select.empty':'没有匹配选项','select.search':'搜索选项','select.clear':'清除选择','autocomplete.placeholder':'请输入并选择','autocomplete.clear':'清除输入','autocomplete.loading':'正在加载建议','autocomplete.empty':'没有匹配建议','autocomplete.error':'建议加载失败','autocomplete.suggestions':'输入建议',
    'input.clear':'清除输入','input.showPassword':'显示密码','input.hidePassword':'隐藏密码','number.increase':'\u589e\u52a0\u6570\u503c','number.decrease':'\u51cf\u5c11\u6570\u503c','slider.value':'滑块值','slider.start':'区间起始值','slider.end':'区间结束值','slider.setValue':'设置为 {value}','rate.label':'评分','rate.value':'{value} / {max}','rate.unrated':'未评分','rate.clear':'清除评分','rate.keyboardHint':'方向键调整，Home / End 跳转，Delete 清除','statistic.label':'统计数据','statistic.empty':'—','statistic.loading':'正在加载统计数据','statistic.trend.up':'上升','statistic.trend.down':'下降','statistic.trend.flat':'持平','calendar.label':'日历','calendar.previousMonth':'上个月','calendar.nextMonth':'下个月','calendar.previousYearRange':'上一组年份','calendar.nextYearRange':'下一组年份','calendar.selectYear':'选择年份','calendar.today':'今天','calendar.clear':'清除选择','calendar.week':'第几周','calendar.weekShort':'周','calendar.selected':'已选择','calendar.rangeStart':'范围开始','calendar.rangeEnd':'范围结束','calendar.unavailable':'不可选择',
    'image.preview':'预览图片','image.dialog':'图片预览','image.close':'关闭图片预览','image.previous':'上一张图片','image.next':'下一张图片','image.zoomIn':'放大图片','image.zoomOut':'缩小图片','image.reset':'重置图片变换','image.rotateLeft':'向左旋转','image.rotateRight':'向右旋转','image.loading':'图片加载中','image.error':'图片加载失败','image.retry':'重新加载','image.toolbar':'图片预览工具栏','image.counter':'第 {current} 张，共 {total} 张',
    'virtualList.label':'虚拟列表','virtualList.empty':'暂无列表数据','virtualList.loading':'正在加载列表','virtualList.errorTitle':'列表加载失败','virtualList.error':'请稍后重试','virtualList.selectedCount':'已选择 {count} 项',
    'statusPage.403.title':'权限不足','statusPage.403.description':'当前账号没有访问此页面的权限，请联系管理员或返回可访问页面。','statusPage.404.title':'页面不存在','statusPage.404.description':'你访问的页面可能已被移动、删除，或地址输入有误。','statusPage.500.title':'服务器开小差了','statusPage.500.description':'服务暂时出现异常，请稍后重试；如果问题持续存在，请联系管理员。','statusPage.back':'返回上一页','statusPage.home':'返回首页','statusPage.retry':'重新加载',
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
    'command.label':'Command palette','command.title':'Quick commands','command.placeholder':'Search commands','command.empty':'No matching commands','command.loading':'Loading commands','command.error':'Commands failed to load','command.retry':'Reload commands','command.close':'Close command palette','command.hint':'Type to quickly find a command','command.results':'Command results','command.navigate':'Navigate','command.select':'Run',
    'color.panel':'Color picker','color.empty':'No color selected','color.plane':'Saturation and brightness','color.planeValue':'Saturation {saturation}%, brightness {brightness}%','color.hue':'Hue','color.alpha':'Opacity','color.input':'Color value','color.presets':'Preset colors','color.select':'Select','color.contrast':'Contrast','color.contrastFail':'Below AA','color.keyboardHint':'Arrow keys adjust; Shift speeds up','color.clear':'Clear color',
    'alert.close':'Close alert','badge.dot':'New message','badge.count':'Messages: {count}','breadcrumb.label':'Breadcrumb',
    'cascader.placeholder':'Select a hierarchy','cascader.level':'Level {level} options','descriptions.label':'Details','drawer.close':'Close drawer',
    'form.field':'This field','form.required':'{label} is required','form.min':'{label} must be at least {min}','form.max':'{label} must not exceed {max}','form.len':'{label} must have a length of {len}','form.type':'{label} must be a valid {type}','form.enum':'{label} is not an allowed value','form.whitespace':'{label} cannot contain only spaces','form.pattern':'{label} has an invalid format','form.invalid':'{label} did not pass validation','form.errorSummary':'Please correct the following form errors',
    'schemaForm.list.group':'Repeatable field group','schemaForm.list.item':'Item {index}','schemaForm.list.add':'Add item','schemaForm.list.remove':'Remove item {index}','schemaForm.list.moveUp':'Move item {index} up','schemaForm.list.moveDown':'Move item {index} down','schemaForm.list.empty':'No list items',
    'list.density.compact':'Compact','list.density.default':'Default','list.density.comfortable':'Comfortable','list.selected':'Selected: {count}','list.total':'Total: {total}','list.density':'Table density','list.columns':'Display columns','list.refresh':'Refresh list',
    'list.toolbar':'List tools','list.columnSettings':'Column settings','dataGrid.label':'Data grid','dataGrid.searchLabel':'Search data','dataGrid.searchPlaceholder':'Search current data','dataGrid.results':'{count} matching records','dataGrid.reset':'Reset data grid','dataGrid.requesting':'Loading data','dataGrid.caption':'Data grid',
    'menu.label':'Navigation menu','modal.close':'Close dialog','multiselect.placeholder':'Select options','multiselect.search':'Search options','multiselect.remove':'Remove {label}','multiselect.empty':'No matching options',
    'notification.close':'Close notification','popover.label':'Popover content','steps.label':'Step progress','tabs.close':'Close {label}',
    'toast.title.success':'Success','toast.title.info':'Information','toast.title.warning':'Warning','toast.title.error':'Operation failed','toast.close':'Close message',
    'transfer.available':'Available','transfer.selected':'Selected','transfer.count':'Items: {count}','transfer.search':'Search {title}','transfer.searchPlaceholder':'Search','transfer.empty':'No data','transfer.add':'Add to selected','transfer.remove':'Move back to available',
    'tree.placeholder':'Select a node','tree.expand':'Expand','tree.collapse':'Collapse','tree.expandNode':'Expand {label}','tree.collapseNode':'Collapse {label}','tree.checkNode':'Check {label}','tree.uncheckNode':'Uncheck {label}','tree.loading':'Loading','tree.retry':'Retry','tree.retryNode':'Reload {label}','tree.empty':'No tree nodes',
    'select.placeholder':'Select an option','select.empty':'No matching options','select.search':'Search options','select.clear':'Clear selection','autocomplete.placeholder':'Type to search','autocomplete.clear':'Clear input','autocomplete.loading':'Loading suggestions','autocomplete.empty':'No matching suggestions','autocomplete.error':'Suggestions failed to load','autocomplete.suggestions':'Input suggestions',
    'input.clear':'Clear input','input.showPassword':'Show password','input.hidePassword':'Hide password','number.increase':'Increase value','number.decrease':'Decrease value','slider.value':'Slider value','slider.start':'Range start','slider.end':'Range end','slider.setValue':'Set value to {value}','rate.label':'Rating','rate.value':'{value} of {max}','rate.unrated':'Not rated','rate.clear':'Clear rating','rate.keyboardHint':'Use Arrow keys to adjust, Home or End to jump, and Delete to clear','statistic.label':'Statistic','statistic.empty':'—','statistic.loading':'Loading statistic','statistic.trend.up':'Up','statistic.trend.down':'Down','statistic.trend.flat':'No change','calendar.label':'Calendar','calendar.previousMonth':'Previous month','calendar.nextMonth':'Next month','calendar.previousYearRange':'Previous years','calendar.nextYearRange':'Next years','calendar.selectYear':'Select year','calendar.today':'Today','calendar.clear':'Clear selection','calendar.week':'Week','calendar.weekShort':'Wk','calendar.selected':'Selected','calendar.rangeStart':'Range start','calendar.rangeEnd':'Range end','calendar.unavailable':'Unavailable',
    'image.preview':'Preview image','image.dialog':'Image preview','image.close':'Close image preview','image.previous':'Previous image','image.next':'Next image','image.zoomIn':'Zoom in','image.zoomOut':'Zoom out','image.reset':'Reset image transform','image.rotateLeft':'Rotate left','image.rotateRight':'Rotate right','image.loading':'Loading image','image.error':'Image failed to load','image.retry':'Reload image','image.toolbar':'Image preview toolbar','image.counter':'Image {current} of {total}',
    'virtualList.label':'Virtual list','virtualList.empty':'No list items','virtualList.loading':'Loading list','virtualList.errorTitle':'List failed to load','virtualList.error':'Try again later','virtualList.selectedCount':'Selected: {count}',
    'statusPage.403.title':'Access denied','statusPage.403.description':'You do not have permission to view this page. Contact an administrator or return to a page you can access.','statusPage.404.title':'Page not found','statusPage.404.description':'The page may have moved, been removed, or the address may be incorrect.','statusPage.500.title':'Something went wrong','statusPage.500.description':'The service is temporarily unavailable. Try again shortly or contact an administrator if the problem continues.','statusPage.back':'Go back','statusPage.home':'Back to home','statusPage.retry':'Reload',
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
