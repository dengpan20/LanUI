const FIELD_DEFINITIONS=[
  {key:'minute',min:0,max:59},
  {key:'hour',min:0,max:23},
  {key:'dayOfMonth',min:1,max:31},
  {key:'month',min:1,max:12},
  {key:'dayOfWeek',min:0,max:7},
]

function failure(code,message,field=null,value=''){
  return {valid:false,error:{code,message,field,value}}
}

function parseNumber(value,definition){
  if(!/^\d+$/.test(value))return null
  const number=Number(value)
  return number>=definition.min&&number<=definition.max?number:null
}

function addRange(target,start,end,step,definition){
  for(let value=start;value<=end;value+=step){
    target.add(definition.key==='dayOfWeek'&&value===7?0:value)
  }
}

export function parseCronField(source,definition){
  const input=String(source??'').trim()
  if(!input)return failure('empty-field','Cron fields cannot be empty.',definition.key,input)
  const values=new Set()
  for(const segment of input.split(',')){
    if(!segment)return failure('invalid-token','Empty list item.',definition.key,input)
    const parts=segment.split('/')
    if(parts.length>2)return failure('invalid-step','A field can contain at most one step.',definition.key,segment)
    const [rangeSource,stepSource]=parts
    const step=stepSource===undefined?1:Number(stepSource)
    if(!Number.isInteger(step)||step<=0||step>definition.max-definition.min+1)return failure('invalid-step','Step is outside the supported range.',definition.key,segment)
    if(rangeSource==='*'){
      addRange(values,definition.min,definition.max,step,definition)
      continue
    }
    const range=rangeSource.split('-')
    if(range.length>2)return failure('invalid-range','Range syntax is invalid.',definition.key,segment)
    const start=parseNumber(range[0],definition)
    const end=range.length===2?parseNumber(range[1],definition):start
    if(start===null||end===null)return failure('out-of-range','Field value is outside the supported range.',definition.key,segment)
    if(start>end)return failure('invalid-range','Range start must not exceed range end.',definition.key,segment)
    addRange(values,start,end,step,definition)
  }
  return {valid:true,values,wildcard:input==='*',source:input}
}

export function parseCronExpression(source){
  const expression=String(source??'').trim().replace(/\s+/g,' ')
  if(!expression)return failure('empty','Cron expression is required.',null,'')
  const parts=expression.split(' ')
  if(parts.length!==5)return failure('field-count','Unix cron expressions require exactly five fields.',null,expression)
  const parsed=[]
  for(let index=0;index<FIELD_DEFINITIONS.length;index+=1){
    const result=parseCronField(parts[index],FIELD_DEFINITIONS[index])
    if(!result.valid)return {...result,expression}
    parsed.push(result)
  }
  return {valid:true,expression,fields:Object.fromEntries(FIELD_DEFINITIONS.map((definition,index)=>[definition.key,parsed[index]])),error:null}
}

function dateParts(date,timeZone){
  if(timeZone==='UTC')return {minute:date.getUTCMinutes(),hour:date.getUTCHours(),dayOfMonth:date.getUTCDate(),month:date.getUTCMonth()+1,dayOfWeek:date.getUTCDay()}
  return {minute:date.getMinutes(),hour:date.getHours(),dayOfMonth:date.getDate(),month:date.getMonth()+1,dayOfWeek:date.getDay()}
}

export function cronMatches(parsed,date,timeZone='local'){
  if(!parsed?.valid||!(date instanceof Date)||Number.isNaN(date.getTime()))return false
  const current=dateParts(date,timeZone)
  const fields=parsed.fields
  if(!fields.minute.values.has(current.minute)||!fields.hour.values.has(current.hour)||!fields.month.values.has(current.month))return false
  const dayOfMonth=fields.dayOfMonth.values.has(current.dayOfMonth)
  const dayOfWeek=fields.dayOfWeek.values.has(current.dayOfWeek)
  const dayMatch=fields.dayOfMonth.wildcard?dayOfWeek:fields.dayOfWeek.wildcard?dayOfMonth:dayOfMonth||dayOfWeek
  return dayMatch
}

export function getNextCronRuns(source,{count=5,from=new Date(),timeZone='local',maxMinutes=527040}={}){
  const parsed=typeof source==='string'?parseCronExpression(source):source
  if(!parsed?.valid)return []
  const limit=Math.min(20,Math.max(1,Math.trunc(Number(count)||5)))
  const cursor=new Date(from instanceof Date?from.getTime():from)
  if(Number.isNaN(cursor.getTime()))return []
  cursor.setSeconds(0,0)
  cursor.setMinutes(cursor.getMinutes()+1)
  const results=[]
  for(let offset=0;offset<maxMinutes&&results.length<limit;offset+=1){
    if(cronMatches(parsed,cursor,timeZone))results.push(new Date(cursor.getTime()))
    cursor.setMinutes(cursor.getMinutes()+1)
  }
  return results
}

export const CRON_FIELD_DEFINITIONS=Object.freeze(FIELD_DEFINITIONS.map(item=>Object.freeze({...item})))
