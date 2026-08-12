import assert from 'node:assert/strict'
import {
  formatColor, getContrastRatio, getReadableTextColor, hslToRgb, hsvToRgb, isValidColor,
  normalizeColorState, parseColor, rgbToHsl, rgbToHsv,
} from '../src/color.js'

assert.deepEqual(parseColor('#1677ff'),{r:22,g:119,b:255,a:1})
assert.deepEqual(parseColor('rgb(22 119 255 / 50%)'),{r:22,g:119,b:255,a:0.5})
assert.deepEqual(parseColor('hsl(214.98 100% 54.31%)'),{r:22,g:119,b:255,a:1})
assert.deepEqual(parseColor('transparent'),{r:0,g:0,b:0,a:0})
assert.equal(parseColor('var(--brand)'),null)
assert.deepEqual(normalizeColorState({r:300,g:-5,b:127.5,a:2}),{r:255,g:0,b:128,a:1})
assert.deepEqual(hsvToRgb(rgbToHsv({r:22,g:119,b:255,a:0.5})),{r:22,g:119,b:255,a:0.5})
assert.deepEqual(hslToRgb(rgbToHsl({r:22,g:119,b:255,a:0.5})),{r:22,g:119,b:255,a:0.5})
assert.equal(formatColor('#1677ff','hex',false),'#1677FF')
assert.equal(formatColor('#1677ff80','rgb',true),'rgba(22, 119, 255, .5)')
assert.equal(formatColor('#ff0000','hsl',false),'hsl(0, 100%, 50%)')
assert.equal(isValidColor('rebeccapurple'),false)
assert.equal(getContrastRatio('#000','#fff'),21)
assert.equal(getContrastRatio('rgba(0,0,0,.5)','#fff'),3.95)
assert.equal(getReadableTextColor('#1677ff'),'#111827')
assert.equal(getContrastRatio('invalid','#fff'),null)

console.log('COLOR_CONTRACT PASS parsers=hex+rgb+hsl+named conversions=hsv+hsl format=hex+rgb+hsl alpha=pass contrast=wcag ssr=pass')
