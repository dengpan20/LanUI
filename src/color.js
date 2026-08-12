const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)))
const round=(value,precision=4)=>Number(Number(value).toFixed(precision))
const byte=value=>Math.round(clamp(Number.isFinite(Number(value))?Number(value):0,0,255))
const alpha=value=>round(clamp(Number.isFinite(Number(value))?Number(value):1,0,1))
const hue=value=>((Number(value)%360)+360)%360

const namedColors={
  black:'#000000',silver:'#c0c0c0',gray:'#808080',white:'#ffffff',maroon:'#800000',red:'#ff0000',purple:'#800080',
  fuchsia:'#ff00ff',green:'#008000',lime:'#00ff00',olive:'#808000',yellow:'#ffff00',navy:'#000080',blue:'#0000ff',
  teal:'#008080',aqua:'#00ffff',orange:'#ffa500',transparent:'#00000000',
}

export function normalizeColorState(input){
  if(!input||typeof input!=='object')return null
  const values=[input.r,input.g,input.b].map(Number)
  if(values.some(value=>!Number.isFinite(value)))return null
  return {r:byte(values[0]),g:byte(values[1]),b:byte(values[2]),a:alpha(input.a??1)}
}

function parseHex(value){
  const raw=value.slice(1)
  if(![3,4,6,8].includes(raw.length)||!/^[\da-f]+$/i.test(raw))return null
  const expanded=raw.length<5?[...raw].map(character=>character.repeat(2)).join(''):raw
  return normalizeColorState({
    r:parseInt(expanded.slice(0,2),16),g:parseInt(expanded.slice(2,4),16),b:parseInt(expanded.slice(4,6),16),
    a:expanded.length===8?parseInt(expanded.slice(6,8),16)/255:1,
  })
}

function splitFunctionBody(body){
  const slash=body.split('/')
  if(slash.length>2)return null
  const comma=slash[0].includes(',')
  const channels=slash[0].trim().split(comma?/\s*,\s*/:/\s+/).filter(Boolean)
  let alphaPart=slash[1]?.trim()
  if(comma&&channels.length===4&&!alphaPart)alphaPart=channels.pop()
  return {channels,alphaPart}
}
function parseAlpha(value){
  if(value===undefined)return 1
  const text=String(value).trim()
  const number=parseFloat(text)
  if(!Number.isFinite(number))return null
  return alpha(text.endsWith('%')?number/100:number)
}
function parseRgbChannel(value){
  const text=String(value).trim();const number=parseFloat(text)
  if(!Number.isFinite(number))return null
  return byte(text.endsWith('%')?number*255/100:number)
}
function parseHue(value){
  const text=String(value).trim().toLowerCase();const number=parseFloat(text)
  if(!Number.isFinite(number))return null
  if(text.endsWith('turn'))return hue(number*360)
  if(text.endsWith('rad'))return hue(number*180/Math.PI)
  if(text.endsWith('grad'))return hue(number*0.9)
  return hue(number)
}
function parsePercent(value){
  const text=String(value).trim();const number=parseFloat(text)
  if(!Number.isFinite(number)||!text.endsWith('%'))return null
  return clamp(number,0,100)
}

export function hslToRgb(input){
  if(!input||![input.h,input.s,input.l].every(value=>Number.isFinite(Number(value))))return null
  const h=hue(input.h)/360,s=clamp(input.s,0,100)/100,l=clamp(input.l,0,100)/100
  if(s===0){const value=byte(l*255);return {r:value,g:value,b:value,a:alpha(input.a??1)}}
  const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q
  const channel=offset=>{
    let t=h+offset;if(t<0)t+=1;if(t>1)t-=1
    if(t<1/6)return p+(q-p)*6*t
    if(t<1/2)return q
    if(t<2/3)return p+(q-p)*(2/3-t)*6
    return p
  }
  return {r:byte(channel(1/3)*255),g:byte(channel(0)*255),b:byte(channel(-1/3)*255),a:alpha(input.a??1)}
}

export function rgbToHsl(input){
  const color=typeof input==='string'?parseColor(input):normalizeColorState(input);if(!color)return null
  const r=color.r/255,g=color.g/255,b=color.b/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min
  let h=0
  if(delta){
    if(max===r)h=60*(((g-b)/delta)%6)
    else if(max===g)h=60*((b-r)/delta+2)
    else h=60*((r-g)/delta+4)
  }
  const l=(max+min)/2,s=delta===0?0:delta/(1-Math.abs(2*l-1))
  return {h:round(hue(h),2),s:round(s*100,2),l:round(l*100,2),a:color.a}
}

export function hsvToRgb(input){
  if(!input||![input.h,input.s,input.v].every(value=>Number.isFinite(Number(value))))return null
  const h=hue(input.h),s=clamp(input.s,0,100)/100,v=clamp(input.v,0,100)/100,c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c
  let channels
  if(h<60)channels=[c,x,0]
  else if(h<120)channels=[x,c,0]
  else if(h<180)channels=[0,c,x]
  else if(h<240)channels=[0,x,c]
  else if(h<300)channels=[x,0,c]
  else channels=[c,0,x]
  return {r:byte((channels[0]+m)*255),g:byte((channels[1]+m)*255),b:byte((channels[2]+m)*255),a:alpha(input.a??1)}
}

export function rgbToHsv(input){
  const color=typeof input==='string'?parseColor(input):normalizeColorState(input);if(!color)return null
  const r=color.r/255,g=color.g/255,b=color.b/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min
  let h=0
  if(delta){
    if(max===r)h=60*(((g-b)/delta)%6)
    else if(max===g)h=60*((b-r)/delta+2)
    else h=60*((r-g)/delta+4)
  }
  return {h:round(hue(h),2),s:round(max?delta/max*100:0,2),v:round(max*100,2),a:color.a}
}

export function parseColor(input){
  if(input&&typeof input==='object')return normalizeColorState(input)
  if(typeof input!=='string')return null
  let value=input.trim().toLowerCase();if(!value)return null
  value=namedColors[value]??value
  if(value.startsWith('#'))return parseHex(value)
  const match=value.match(/^([a-z]+)\((.*)\)$/i);if(!match)return null
  const mode=match[1],parts=splitFunctionBody(match[2]);if(!parts)return null
  const parsedAlpha=parseAlpha(parts.alphaPart);if(parsedAlpha===null)return null
  if(mode==='rgb'||mode==='rgba'){
    if(parts.channels.length!==3)return null
    const channels=parts.channels.map(parseRgbChannel);if(channels.some(channel=>channel===null))return null
    return {r:channels[0],g:channels[1],b:channels[2],a:parsedAlpha}
  }
  if(mode==='hsl'||mode==='hsla'){
    if(parts.channels.length!==3)return null
    const h=parseHue(parts.channels[0]),s=parsePercent(parts.channels[1]),l=parsePercent(parts.channels[2])
    if([h,s,l].some(channel=>channel===null))return null
    return hslToRgb({h,s,l,a:parsedAlpha})
  }
  return null
}

const hexByte=value=>byte(value).toString(16).padStart(2,'0').toUpperCase()
const alphaText=value=>String(round(value,2)).replace(/^0\./,'.')
export function formatColor(input,format='hex',includeAlpha){
  const color=parseColor(input);if(!color)return ''
  const withAlpha=includeAlpha===undefined?color.a<1:!!includeAlpha
  if(format==='rgb')return withAlpha?`rgba(${color.r}, ${color.g}, ${color.b}, ${alphaText(color.a)})`:`rgb(${color.r}, ${color.g}, ${color.b})`
  if(format==='hsl'){
    const hsl=rgbToHsl(color),h=Math.round(hsl.h),s=round(hsl.s,1),l=round(hsl.l,1)
    return withAlpha?`hsla(${h}, ${s}%, ${l}%, ${alphaText(color.a)})`:`hsl(${h}, ${s}%, ${l}%)`
  }
  return `#${hexByte(color.r)}${hexByte(color.g)}${hexByte(color.b)}${withAlpha?hexByte(color.a*255):''}`
}

export function isValidColor(input){return !!parseColor(input)}
function composite(foreground,background){
  const a=foreground.a+background.a*(1-foreground.a)
  if(!a)return {r:0,g:0,b:0,a:0}
  return normalizeColorState({
    r:(foreground.r*foreground.a+background.r*background.a*(1-foreground.a))/a,
    g:(foreground.g*foreground.a+background.g*background.a*(1-foreground.a))/a,
    b:(foreground.b*foreground.a+background.b*background.a*(1-foreground.a))/a,a,
  })
}
function luminance(color){
  const channel=value=>{const normalized=value/255;return normalized<=0.04045?normalized/12.92:((normalized+0.055)/1.055)**2.4}
  return 0.2126*channel(color.r)+0.7152*channel(color.g)+0.0722*channel(color.b)
}
export function getContrastRatio(foreground,background='#FFFFFF'){
  const front=parseColor(foreground),back=parseColor(background);if(!front||!back)return null
  const opaqueBack=back.a<1?composite(back,{r:255,g:255,b:255,a:1}):back
  const opaqueFront=front.a<1?composite(front,opaqueBack):front
  const lighter=Math.max(luminance(opaqueFront),luminance(opaqueBack)),darker=Math.min(luminance(opaqueFront),luminance(opaqueBack))
  return round((lighter+0.05)/(darker+0.05),2)
}
export function getReadableTextColor(background,light='#FFFFFF',dark='#111827'){
  const lightRatio=getContrastRatio(light,background),darkRatio=getContrastRatio(dark,background)
  if(lightRatio===null||darkRatio===null)return ''
  return lightRatio>=darkRatio?formatColor(light,'hex',false):formatColor(dark,'hex',false)
}
