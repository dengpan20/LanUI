export const DATE_VALUE_MODES=['date','time','datetime']
export const DATE_VALUE_TYPES=['string','date','timestamp']

const formatterCache=new Map()
const DAY=86400000

function optionsOf(input){return typeof input==='string'?{mode:input}:input||{}}
function pad(value,size=2){return String(value).padStart(size,'0')}
function utcEpoch(parts){
  const value=new Date(0)
  value.setUTCFullYear(parts.year,parts.month-1,parts.day)
  value.setUTCHours(parts.hour||0,parts.minute||0,parts.second||0,parts.millisecond||0)
  return value.getTime()
}
function leapYear(year){return year%4===0&&(year%100!==0||year%400===0)}
function daysInMonth(year,month){return [31,leapYear(year)?29:28,31,30,31,30,31,31,30,31,30,31][month-1]||0}
function validDate({year,month,day}){return year>=1&&year<=9999&&month>=1&&month<=12&&day>=1&&day<=daysInMonth(year,month)}
function validTime({hour,minute,second,millisecond}){return hour>=0&&hour<=23&&minute>=0&&minute<=59&&second>=0&&second<=59&&millisecond>=0&&millisecond<=999}
function normalizedMode(mode){return DATE_VALUE_MODES.includes(mode)?mode:'date'}
function normalizedType(type){return DATE_VALUE_TYPES.includes(type)?type:'string'}
function precisionOf(options){
  if(['minute','second','millisecond'].includes(options.precision))return options.precision
  const step=Number(options.step)
  if(Number.isFinite(step)&&step>0&&step<1)return 'millisecond'
  if(Number.isFinite(step)&&step>0&&step<60)return 'second'
  return 'minute'
}
function sameWall(left,right){return ['year','month','day','hour','minute','second'].every(key=>left[key]===right[key])}

export function resolveTimeZone(input='local'){
  const requested=String(input||'local').trim()
  if(requested.toLowerCase()==='local')return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'
  if(requested.toUpperCase()==='UTC'||requested==='Z')return 'UTC'
  return new Intl.DateTimeFormat('en-US',{timeZone:requested}).resolvedOptions().timeZone
}

export function parseDateValue(input,options={}){
  const mode=normalizedMode(optionsOf(options).mode)
  if(typeof input!=='string'||!input)return null
  let datePart=''
  let timePart=''
  if(mode==='date')datePart=input
  else if(mode==='time')timePart=input
  else{
    const match=input.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)$/)
    if(!match)return null
    ;[,datePart,timePart]=match
  }
  let year=1970,month=1,day=1,hour=0,minute=0,second=0,millisecond=0
  if(datePart){
    const match=datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if(!match)return null
    year=Number(match[1]);month=Number(match[2]);day=Number(match[3])
    if(!validDate({year,month,day}))return null
  }
  let precision='date'
  if(timePart){
    const match=timePart.match(/^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/)
    if(!match)return null
    hour=Number(match[1]);minute=Number(match[2]);second=Number(match[3]||0);millisecond=Number((match[4]||'').padEnd(3,'0')||0)
    if(!validTime({hour,minute,second,millisecond}))return null
    precision=match[4]?'millisecond':match[3]?'second':'minute'
  }
  return {mode,year,month,day,hour,minute,second,millisecond,precision,value:input}
}

function zonedFormatter(timeZone){
  if(!formatterCache.has(timeZone))formatterCache.set(timeZone,new Intl.DateTimeFormat('en-CA',{timeZone,calendar:'gregory',numberingSystem:'latn',hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}))
  return formatterCache.get(timeZone)
}
function instantParts(value,timeZone){
  const result={}
  for(const part of zonedFormatter(timeZone).formatToParts(value))if(part.type!=='literal')result[part.type]=Number(part.value)
  return {year:result.year,month:result.month,day:result.day,hour:result.hour,minute:result.minute,second:result.second,millisecond:value.getUTCMilliseconds()}
}
function dateParts(value,timeZone){
  const date=value instanceof Date?value:new Date(value)
  if(Number.isNaN(date.getTime()))return null
  return instantParts(date,timeZone)
}
function referenceParts(referenceDate,timeZone){
  if(typeof referenceDate==='string'){
    const parsed=parseDateValue(referenceDate,'date')
    if(parsed)return parsed
  }
  return dateParts(referenceDate??0,timeZone)||{year:1970,month:1,day:1}
}
function targetParts(parsed,options,timeZone){
  if(parsed.mode!=='time')return parsed
  const reference=referenceParts(options.referenceDate,timeZone)
  return {...parsed,year:reference.year,month:reference.month,day:reference.day}
}
function candidateOffsets(wallEpoch,timeZone){
  const offsets=new Set()
  for(const delta of [0,-2*DAY,2*DAY,-180*DAY,180*DAY]){
    const instant=new Date(wallEpoch+delta)
    const parts=instantParts(instant,timeZone)
    offsets.add(utcEpoch({...parts,millisecond:0})-Math.floor(instant.getTime()/1000)*1000)
  }
  return [...offsets]
}

export function dateValueToDate(input,options={}){
  const normalized=optionsOf(options)
  const parsed=parseDateValue(input,normalized)
  if(!parsed)return null
  let timeZone
  try{timeZone=resolveTimeZone(normalized.timeZone)}catch{return null}
  const target=targetParts(parsed,normalized,timeZone)
  const wallEpoch=utcEpoch(target)
  if(timeZone==='UTC')return new Date(wallEpoch)
  const candidates=candidateOffsets(wallEpoch,timeZone).map(offset=>new Date(wallEpoch-offset)).filter(date=>sameWall(instantParts(date,timeZone),target)).sort((left,right)=>left-right)
  const disambiguation=['earlier','later','reject','compatible'].includes(normalized.disambiguation)?normalized.disambiguation:'compatible'
  if(candidates.length){
    if(disambiguation==='reject'&&candidates.length!==1)return null
    return disambiguation==='later'?candidates.at(-1):candidates[0]
  }
  if(disambiguation==='reject')return null
  const shifted=candidateOffsets(wallEpoch,timeZone).map(offset=>new Date(wallEpoch-offset)).map(date=>({date,wall:utcEpoch(instantParts(date,timeZone))})).sort((left,right)=>left.wall-right.wall)
  const earlier=shifted.filter(item=>item.wall<wallEpoch).at(-1)
  const later=shifted.find(item=>item.wall>wallEpoch)
  return (disambiguation==='earlier'?earlier||later:later||earlier)?.date||null
}

export function formatDateValue(input,options={}){
  const normalized=optionsOf(options)
  const mode=normalizedMode(normalized.mode)
  let timeZone
  try{timeZone=resolveTimeZone(normalized.timeZone)}catch{return ''}
  const parts=dateParts(input,timeZone)
  if(!parts)return ''
  const date=`${pad(parts.year,4)}-${pad(parts.month)}-${pad(parts.day)}`
  if(mode==='date')return date
  const precision=precisionOf(normalized)
  let time=`${pad(parts.hour)}:${pad(parts.minute)}`
  if(precision==='second'||precision==='millisecond')time+=`:${pad(parts.second)}`
  if(precision==='millisecond')time+=`.${pad(parts.millisecond,3)}`
  return mode==='time'?time:`${date}T${time}`
}

export function toDateValue(input,options={}){
  if(input===null||input===undefined||input==='')return ''
  const normalized=optionsOf(options)
  if(typeof input==='string')return parseDateValue(input,normalized)?.value||''
  return formatDateValue(input,normalized)
}

export function fromDateValue(input,options={}){
  const normalized=optionsOf(options)
  const valueType=normalizedType(normalized.valueType)
  if(input===null||input===undefined||input==='')return valueType==='string'?'':null
  const parsed=parseDateValue(String(input),normalized)
  if(!parsed)return null
  if(valueType==='string')return parsed.value
  const date=dateValueToDate(parsed.value,normalized)
  return valueType==='timestamp'?date?.getTime()??null:date
}

export function compareDateValues(left,right,options={}){
  const normalized=optionsOf(options)
  const leftValue=toDateValue(left,normalized)
  const rightValue=toDateValue(right,normalized)
  const leftParts=parseDateValue(leftValue,normalized)
  const rightParts=parseDateValue(rightValue,normalized)
  if(!leftParts||!rightParts)return null
  const difference=utcEpoch(leftParts)-utcEpoch(rightParts)
  return difference===0?0:difference<0?-1:1
}

export function inferDateValueType(input){
  const value=Array.isArray(input)?input.find(item=>item!==null&&item!==undefined&&item!==''):input
  return value instanceof Date?'date':typeof value==='number'?'timestamp':'string'
}
