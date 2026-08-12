import { BUILTIN_ICON_BODIES } from './icon-bodies.js'

const allowedTags=new Set(['path','rect','circle','line','polyline','polygon','ellipse'])
const allowedAttributes=new Set(['d','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry','width','height','points','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','fill-rule','clip-rule','opacity','transform'])
const viewBoxPattern=/^-?\d+(?:\.\d+)?(?:\s+-?\d+(?:\.\d+)?){3}$/

function freezeNode(tag,attrs){return Object.freeze({tag,attrs:Object.freeze(attrs)})}
function parseBody(body){
  if(typeof body!=='string'||!body.trim()||body.length>32768)throw new TypeError('Icon body must be a non-empty SVG fragment under 32KB')
  const input=body.trim(),nodes=[]
  let cursor=0
  while(cursor<input.length){
    const whitespace=/\s*/y;whitespace.lastIndex=cursor;whitespace.exec(input);cursor=whitespace.lastIndex
    if(cursor>=input.length)break
    const tag=/<([A-Za-z][\w-]*)([^<>]*?)\/>/y;tag.lastIndex=cursor
    const match=tag.exec(input)
    if(!match)throw new TypeError('Icon body only accepts self-closing SVG geometry elements')
    const tagName=match[1].toLowerCase()
    if(!allowedTags.has(tagName))throw new TypeError(`Unsupported icon element: ${tagName}`)
    const attrs={},text=match[2];let attrCursor=0
    while(attrCursor<text.length){
      const gap=/\s*/y;gap.lastIndex=attrCursor;const gapMatch=gap.exec(text);attrCursor=gap.lastIndex
      if(attrCursor>=text.length)break
      const attribute=/([A-Za-z][\w:-]*)\s*=\s*"([^"]*)"/y;attribute.lastIndex=attrCursor
      const attrMatch=attribute.exec(text)
      if(!attrMatch)throw new TypeError(`Invalid attribute syntax on ${tagName}`)
      const name=attrMatch[1].toLowerCase(),value=attrMatch[2]
      if(!allowedAttributes.has(name))throw new TypeError(`Unsupported icon attribute: ${name}`)
      if(/[<>]/.test(value)||/javascript:|url\s*\(/i.test(value))throw new TypeError(`Unsafe icon attribute value: ${name}`)
      attrs[name]=value;attrCursor=attribute.lastIndex
    }
    nodes.push(freezeNode(tagName,attrs));cursor=tag.lastIndex
    if(nodes.length>64)throw new TypeError('Icon body exceeds the 64-node limit')
  }
  return Object.freeze(nodes)
}

export function defineIcon(input){
  const value=typeof input==='string'?{body:input}:input
  if(!value||typeof value!=='object')throw new TypeError('Icon definition must be an SVG fragment or definition object')
  const viewBox=value.viewBox||'0 0 24 24'
  if(typeof viewBox!=='string'||!viewBoxPattern.test(viewBox.trim()))throw new TypeError('Icon viewBox must contain four numeric values')
  return Object.freeze({viewBox:viewBox.trim(),nodes:parseBody(value.body)})
}

export const BUILTIN_ICON_NAMES=Object.freeze(Object.keys(BUILTIN_ICON_BODIES).sort((left,right)=>left<right?-1:left>right?1:0))
export const BUILTIN_ICONS=Object.freeze(Object.fromEntries(BUILTIN_ICON_NAMES.map(name=>[name,defineIcon(BUILTIN_ICON_BODIES[name])])))
