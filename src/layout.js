import { computed, inject, provide, unref } from 'vue'

export const layoutBreakpoints = Object.freeze({ xs:0, sm:576, md:768, lg:992, xl:1200, xxl:1600 })
export const layoutBreakpointNames = Object.freeze(Object.keys(layoutBreakpoints))
export const layoutGridKey = Symbol('lanUiLayoutGrid')

export function isFiniteNumber(value){return typeof value==='number'&&Number.isFinite(value)}
const CSS_LENGTH_UNITS=new Set(['px','rem','em','ch','ex','vw','vh','vmin','vmax','cm','mm','in','pt','pc','q','%'])
const CSS_LENGTH_KEYWORDS=new Set(['none','auto','min-content','max-content'])
const CSS_LENGTH_FUNCTIONS=new Set(['calc','clamp','min','max','fit-content'])
const CSS_LENGTH_TOKEN=/\s+|[()+\-*/,]|(?:\d+(?:\.\d*)?|\.\d+)(?:[a-zA-Z%]+)?|[a-zA-Z][a-zA-Z0-9-]*/y
function validLengthTokens(value,{allowNegative=false}={}){
  const input=value.trim()
  if(!input||/[;{}[\]"'`\\:=<>!&|@#]/.test(input))return false
  let cursor=0,previous=''
  const stack=[]
  while(cursor<input.length){
    CSS_LENGTH_TOKEN.lastIndex=cursor
    const match=CSS_LENGTH_TOKEN.exec(input)
    if(!match||match.index!==cursor)return false
    const token=match[0];cursor=CSS_LENGTH_TOKEN.lastIndex
    if(/^\s+$/.test(token))continue
    if(token==='('){
      if(!stack.length||!stack.at(-1).functionName)return false
      if(!stack.at(-1).opened)stack.at(-1).opened=true
      else stack.at(-1).depth+=1
      previous=token
      continue
    }
    if(token===')'){
      if(!stack.length)return false
      const frame=stack.at(-1)
      if(frame.depth>0)frame.depth-=1
      else if(frame.opened){
        if(!frame.argumentHasValue)return false
        stack.pop()
      }
      else return false
      previous=token
      continue
    }
    if(token===','){
      if(!stack.length||stack.at(-1).depth>0||!['clamp','min','max'].includes(stack.at(-1).functionName))return false
      if(previous==='('||previous===','||previous==='+'||previous==='-'||previous==='*'||previous==='/'||!stack.at(-1).argumentHasValue)return false
      stack.at(-1).argumentHasValue=false
      previous=token
      continue
    }
    if(token==='+'||token==='-'||token==='*'||token==='/'){
      if((token==='*'||token==='/')&&!stack.length)return false
      if(token==='-'&&!allowNegative&&(previous===''||previous==='('||previous===','||previous==='+'||previous==='-'||previous==='*'||previous==='/')){
        const rest=input.slice(cursor).trimStart()
        if(/^(?:\d|\.)/.test(rest))return false
      }
      if((previous===''||previous==='('||previous===',')&&token!=='+'){
        if(token==='*'||token==='/')return false
      }
      previous=token
      continue
    }
    if(/^\d|^\./.test(token)){
      const unit=(token.match(/[a-zA-Z%]+$/)||[''])[0].toLowerCase()
      const number=unit?token.slice(0,-unit.length):token
      if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(number)|| (unit&& !CSS_LENGTH_UNITS.has(unit)))return false
      if(stack.length)stack.at(-1).argumentHasValue=true
      previous='value'
      continue
    }
    const identifier=token.toLowerCase()
    const remaining=input.slice(cursor).trimStart()
    if(CSS_LENGTH_FUNCTIONS.has(identifier)){
      if(!remaining.startsWith('('))return false
      if(stack.length)stack.at(-1).argumentHasValue=true
      stack.push({functionName:identifier,depth:0,opened:false,argumentHasValue:false})
      previous='function'
      continue
    }
    return false
  }
  if(stack.length||previous==='('||previous===','||['+','-','*','/'].includes(previous))return false
  return true
}
function validLength(value,options){
  const input=String(value).trim()
  if(!input)return false
  const keyword=input.toLowerCase()
  if(CSS_LENGTH_KEYWORDS.has(keyword))return true
  if(/^fit-content\(/i.test(input)||/^(?:calc|clamp|min|max)\(/i.test(input))return validLengthTokens(input,options)
  if(!validLengthTokens(input,options))return false
  return new RegExp(`${options?.allowNegative?'[-+]?':''}(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[a-zA-Z%]+)?$`).test(input)
}
export function safeLength(value,fallback=0,{allowNegative=false}={}){
  if(isFiniteNumber(value))return `${allowNegative?value:Math.max(0,value)}px`
  if(typeof value==='string'&&validLength(value,{allowNegative}))return value.trim()
  return safeLength(fallback,0,{allowNegative})
}
export function safeInteger(value,fallback,min=0,max=999){
  const parsed=typeof value==='number'?value:typeof value==='string'&&/^[-+]?\d+(?:\.\d+)?$/.test(value.trim())?Number(value):NaN
  return Number.isFinite(parsed)?Math.min(max,Math.max(min,Math.round(parsed))):fallback
}
export function safeEnum(value,allowed,fallback){return allowed.includes(value)?value:fallback}
export function isResponsive(value){return value&&typeof value==='object'&&!Array.isArray(value)&&!('value' in value)&&Object.keys(value).some(key=>layoutBreakpointNames.includes(key))}
export function responsiveEntries(value){
  if(!isResponsive(value))return { scalar:value }
  const result={}
  for(const breakpoint of layoutBreakpointNames)if(Object.prototype.hasOwnProperty.call(value,breakpoint))result[breakpoint]=value[breakpoint]
  return result
}
export function cssVar(name,value,normalize=safeLength){
  const vars={}
  const entries=responsiveEntries(value)
  if(Object.prototype.hasOwnProperty.call(entries,'scalar'))vars[`--${name}`]=normalize(entries.scalar)
  else {
    let previous
    for(const breakpoint of layoutBreakpointNames){
      if(Object.prototype.hasOwnProperty.call(entries,breakpoint))previous=normalize(entries[breakpoint])
      else if(previous===undefined)previous=normalize(undefined)
      vars[`--${name}-${breakpoint}`]=previous
    }
  }
  return vars
}
export function cssResponsive(name,value,normalize=safeLength){return cssVar(name,value,normalize)}
export function gapValues(value,fallback=0){
  if(Array.isArray(value))return [safeLength(value[0],fallback),safeLength(value[1],value[0]??fallback)]
  return [safeLength(value,fallback),safeLength(value,fallback)]
}
export function gapVars(name,value,fallback=0){
  const entries=responsiveEntries(value),vars={}
  if(Object.prototype.hasOwnProperty.call(entries,'scalar')){const [row,column]=gapValues(entries.scalar,fallback);vars[`--${name}-row`]=row;vars[`--${name}-column`]=column}
  else {
    let previous=gapValues(undefined,fallback)
    for(const breakpoint of layoutBreakpointNames){if(Object.prototype.hasOwnProperty.call(entries,breakpoint))previous=gapValues(entries[breakpoint],fallback);vars[`--${name}-row-${breakpoint}`]=previous[0];vars[`--${name}-column-${breakpoint}`]=previous[1]}
  }
  return vars
}
export function normalizeResponsive(value,normalize,fallback){
  const entries=responsiveEntries(value),result={}
  if(Object.prototype.hasOwnProperty.call(entries,'scalar'))return normalize(entries.scalar,fallback)
  for(const [breakpoint,item] of Object.entries(entries))result[breakpoint]=normalize(item,fallback)
  return result
}
export function provideGridState(state){provide(layoutGridKey,state)}
export function useGridState(){return inject(layoutGridKey,null)}
export function unwrapped(value){return unref(value)}
export function layoutState(root,extra){
  const getElement=()=>root.value||null
  const getRect=()=>getElement()?.getBoundingClientRect?.()||null
  const getState=()=>({element:getElement(),rect:getRect(),...extra()})
  return {root,getElement,getRect,getState}
}
export function stateComputed(value){return computed(()=>typeof value==='function'?value():value)}
