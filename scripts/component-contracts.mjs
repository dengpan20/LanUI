import fs from 'node:fs'

const required={
  'UiAnchor.vue':['aria-current','ArrowDown','ArrowUp','scroll-start','scroll-end','useReducedMotion','useDirection','defineExpose'],
  'UiTabs.vue':['role="tablist"','role="tab"','ArrowRight','aria-controls'],
  'UiForm.vue':['provide(\'uiFormContext\'','async function validate','defineExpose'],
  'UiSchemaForm.vue':['normalizeSchema','visibleFields','resolveComponent','UiFormList','listItemContext','addListItem','list-change','list-limit','field-change','schema-error','defineExpose'],
  'UiFormList.vue':['previous = cloneValue','previous','emit(\'change\'','defineExpose'],
  'UiFormItem.vue':['useId()','provide(\'uiFormItemContext\'','controlId','describedby','group'],
  'UiCheckbox.vue':['size:{type:String','ariaLabel','size-${size}','$slots.default'],
  'UiInput.vue':['uiFormItemContext','aria-labelledby','aria-describedby','aria-invalid'],
  'UiInputTag.vue':['normalize(\'NFKC\')','compositionstart','onPaste','Backspace','useDirection','uiFormItemContext','beforeAdd','aria-busy','defineExpose'],
  'UiNumberInput.vue':['role="spinbutton"','aria-valuemin','PageUp','clampOnBlur','formatter','parser','number.increase'],
  'UiSlider.vue':['role="slider"','aria-valuemin','aria-orientation','PageUp','minDistance','slider.setValue','useDirection'],
  'UiRate.vue':['role="slider"','aria-valuetext','aria-keyshortcuts','pointerdown','PageUp','allowClear','useDirection','uiFormItemContext'],
  'UiStatistic.vue':['role="group"','<output','aria-live','aria-busy','formatNumber','positiveDirection','ariaValueText','statistic.trend.'],
  'UiCalendar.vue':['role="grid"','role="gridcell"','aria-multiselectable','selectionMode','disabledDate','firstDayOfWeek','PageDown','range-preview','useDirection','calendar.today'],
  'UiCarousel.vue':['aria-roledescription="carousel"','aria-roledescription="slide"','aria-live','inert','visibilitychange','pointerdown','useReducedMotion','useDirection','defineExpose'],
  'UiAutoComplete.vue':['role="combobox"','aria-autocomplete="list"','aria-activedescendant','compositionstart','AbortController','requestSequence','load-error','allowCustom','useFloatingPosition'],
  'UiIcon.vue':['definition?.nodes','ariaLabel','data-ui-icon','directional','is-spinning'],
  'UiImage.vue':['role="dialog"','aria-modal="true"','openOverlay','isTopOverlay','focusWithRetry(returnFocus)','previewList','fallback','zoomOnWheel','pointerdown','useDirection','image.preview'],
  'UiVirtualList.vue':["selectionMode==='none'?'list':'listbox'",'aria-activedescendant','aria-setsize','ResizeObserver','scrollToIndex','resetAfterIndex','range-change','selectionMode','typeaheadSearch'],
  'UiList.vue':["selectionMode==='none'?'list':'listbox'",'aria-activedescendant','aria-setsize','ResizeObserver','typeaheadSearch','UiPagination','page-change','page-size-change','defineExpose'],
  'UiTextarea.vue':['uiFormItemContext','aria-labelledby','aria-describedby','aria-invalid'],
  'UiUpload.vue':['AbortController','beforeUpload','beforeRemove','concurrency','onProgress','activeTokens','releaseToken','upload-error','disabled || !file.raw','aria-busy','defineExpose'],
  'UiTour.vue':['target-missing','activeMask','coordinates','scrollIntoView','useReducedMotion','useTeleportThemeScope','openOverlay','isTopOverlay','aria-modal','defineExpose'],
  'UiWatermark.vue':['MutationObserver','devicePixelRatio','drawImage','fillText','image-error','image-load','data-ui-watermark-layer','aria-hidden','defineExpose'],
  'UiAffix.vue':['position','offset','target','boundary','ResizeObserver','data-ui-affix','data-affixed','defineExpose'],
  'UiSplitter.vue':['role="separator"','aria-orientation','aria-valuenow','pointermove','ResizeObserver','useDirection','lazy','collapse','defineExpose'],
  'UiTypography.vue':['data-ui-typography','navigator.clipboard','copy-error','ResizeObserver','aria-expanded','edit-start','edit-end','edit-cancel','defineExpose'],
  'UiDatePicker.vue':['uiFormItemContext','aria-controls','aria-describedby','showPicker','fromDateValue','data-time-zone'],
  'UiTimePicker.vue':['mode="time"','value-type','time-zone','update:modelValue'],
  'UiSwitch.vue':['ariaLabel','aria-labelledby','role="switch"','aria-busy'],
  'UiSelect.vue':['useId()','aria-activedescendant','aria-controls','ArrowDown','Home','End'],
  'UiModal.vue':['openOverlay','isTopOverlay','captureFocusOrigin','focusWithRetry(returnFocus)','useId','isClient'],
  'UiPopconfirm.vue':['beforeConfirm','loading','focusWithRetry','role="alertdialog"'],
  'UiDataGrid.vue':["mode==='server'",'processedRows','searchDebounce','state-change','request','UiListToolbar','UiPagination','defineExpose'],
  'UiTable.vue':['filter-change','column-resize','virtualRange','aria-sort','import UiCheckbox','size="sm"'],
  'UiMultiSelect.vue':['aria-multiselectable="true"','aria-activedescendant','ArrowDown','Home','End'],
  'UiTreeSelect.vue':['role="tree"','aria-level','aria-activedescendant','ArrowRight','ArrowLeft'],
  'UiTree.vue':['role="tree"','role="treeitem"','aria-activedescendant','aria-checked','checkStrictly','AbortController','ResizeObserver','load-error','useDirection'],
  'UiCommandPalette.vue':['role="dialog"','role="combobox"','role="listbox"','aria-activedescendant','AbortController','requestSequence','load-error','data-error','openOverlay','isTopOverlay','focusWithRetry','useDirection'],
  'UiColorPicker.vue':['role="dialog"','role="slider"','aria-valuetext','pointerdown','formatColor','getContrastRatio','useFloatingPosition','useDirection','uiFormItemContext'],
  'UiCascader.vue':['ui-cascader-column','aria-selected','aria-activedescendant','ArrowRight','ArrowLeft'],
  'UiTransfer.vue':['moveRight','moveLeft'],
  'UiMenu.vue':['role="menu"','role="menuitem"','ArrowDown','ArrowRight'],
  'UiCollapse.vue':['aria-expanded','aria-controls','role="region"'],
  'UiDescriptions.vue':['<dl','<dt>','<dd>'],
  'UiResult.vue':['status===\'error\'?\'alert\':\'status\'','ui-result-extra'],
  'UiStatusPage.vue':['statusPage.${props.status}.title','status === \'500\' ? \'alert\' : \'region\'','ui-status-page-actions','emit(\'retry\')','useDirection'],
  'UiSpin.vue':['aria-busy','role="status"'],
  'UiSegmented.vue':['role="radiogroup"','role="radio"','ArrowRight'],
  'UiTooltip.vue':['ui-floating-panel','aria-describedby'],
  'UiPopover.vue':['ui-floating-panel','aria-controls'],
  'UiDropdown.vue':['ui-floating-panel','aria-haspopup'],
  'UiConfigProvider.vue':['lanUiConfigKey','provide(lanUiConfigKey','data-ui-locale','data-ui-density','data-ui-direction',':dir="config.direction"'],
  'UiDateRangePicker.vue':['role="group"','range-order','aria-invalid','showPicker','compareDateValues','data-time-zone'],
  'UiDrawer.vue':['openOverlay','isTopOverlay','captureFocusOrigin','focusWithRetry(returnFocus)','useId','isClient'],
}
const failures=[];for(const [file,markers] of Object.entries(required)){const source=fs.readFileSync(`src/components/${file}`,'utf8');for(const marker of markers)if(!source.includes(marker))failures.push(`${file}:${marker}`)}
const entry=fs.readFileSync('src/index.js','utf8');const componentEntry=fs.readFileSync('src/components.js','utf8');const declarations=fs.readFileSync('src/index.d.ts','utf8');for(const file of fs.readdirSync('src/components').filter(name=>/^Ui.*\.vue$/.test(name))){const name=file.slice(0,-4);if(!componentEntry.includes(`default as ${name}`))failures.push(`export:${name}`);if(!declarations.includes(`${name}:LanComponent<${name}Props`)&&!declarations.includes(`${name}:${name}Component`))failures.push(`types:${name}`);for(const suffix of ['Props','Emits','Slots'])if(!declarations.includes(`export ${suffix==='Props'?'interface':'type'} ${name}${suffix}`))failures.push(`type-contract:${name}${suffix}`)}
const tokens=fs.readFileSync('tokens.css','utf8');const styles=fs.readFileSync('styles.css','utf8');const feedback=fs.readFileSync('src/feedback.js','utf8');if(!tokens.includes('--text-tertiary: #64748b'))failures.push('contrast:text-tertiary');if(!tokens.includes('--control-icon-sm: 28px'))failures.push('target:icon-sm');if(/font-size:\s*(?:8|9|10|11)px/.test(styles))failures.push('typography:below-12px');for(const marker of ['success(input','notification.open','useToast','useNotification'])if(!feedback.includes(marker))failures.push(`feedback:${marker}`)
for(const marker of ['createLanUi','export { default','useLanUiConfig','useLocale'])if(!entry.includes(marker)&&!fs.readFileSync('src/plugin.js','utf8').includes(marker)&&!fs.readFileSync('src/config.js','utf8').includes(marker))failures.push(`config:${marker}`)
const packageJson=JSON.parse(fs.readFileSync('package.json','utf8'));for(const subpath of ['./components/*','./color','./config','./date','./feedback','./icons','./plugin'])if(!packageJson.exports?.[subpath])failures.push(`package-export:${subpath}`)
const environment=fs.readFileSync('src/env.js','utf8');const overlay=fs.readFileSync('src/components/overlayManager.js','utf8');if(!environment.includes("typeof window !== 'undefined'")||!overlay.includes('getDocument'))failures.push('ssr:environment-boundary')
const libConfig=fs.readFileSync('vite.lib.config.js','utf8');for(const marker of ['.verify/component-entries','default as ${name}','componentEntries'])if(!libConfig.includes(marker))failures.push(`component-entry:${marker}`)
const apiManifest=JSON.parse(fs.readFileSync('api-manifest.json','utf8'));if(apiManifest.schemaVersion!==3||apiManifest.components?.length!==82)failures.push(`api-manifest:schema-components:${apiManifest.schemaVersion}:${apiManifest.components?.length}`);for(const component of apiManifest.components||[])if(component.runtimeExports?.length!==2||!component.runtimeExports.includes('default')||!component.runtimeExports.includes(component.name)||!component.props?.length||!Array.isArray(component.emits)||!Array.isArray(component.slots)||component.emitsType!==`${component.name}Emits`||component.slotsType!==`${component.name}Slots`||component.propDetails?.map(item=>item.name).join('|')!==component.props.join('|')||component.emitDetails?.map(item=>item.name).join('|')!==component.emits.join('|')||component.slotDetails?.map(item=>item.name).join('|')!==component.slots.join('|')||!component.imports?.root?.includes(component.name)||!component.imports?.subpath?.includes(component.name))failures.push(`api-manifest:parity:${component.name}`)
for(const file of ['UiTabs.vue','UiSegmented.vue','UiMenu.vue','UiTreeSelect.vue','UiCascader.vue','UiTable.vue','UiCommandPalette.vue','UiColorPicker.vue','UiCalendar.vue'])if(!fs.readFileSync(`src/components/${file}`,'utf8').includes('useDirection'))failures.push(`rtl:${file}`)
const styleManifest=JSON.parse(fs.readFileSync('style-manifest.json','utf8'));if(styleManifest.components?.length!==82)failures.push(`style-manifest:components:${styleManifest.components?.length}`);if(!packageJson.exports?.['./styles/*.css']||!packageJson.exports?.['./style-manifest'])failures.push('package-export:component-styles')
if(failures.length){console.error('CONTRACT FAIL\n'+failures.join('\n'));process.exit(1)}console.log(`CONTRACT PASS components=${(componentEntry.match(/default as Ui/g)||[]).length} suites=${Object.keys(required).length}`)
