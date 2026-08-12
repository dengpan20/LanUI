# Lan UI · 企业后台 Design System

基于 Vue 3 + Vite 的企业后台设计系统，包含设计 Token、62 个可复用组件、交互规范、完整后台示例和独立消费项目。

## 项目内容

- `src/components/`：Vue 组件源码。
- `src/pages/`：登录、退出、404、看板、工作台、数据管理、AI、甘特图和组件中心。
- `component-preview.html`：无需框架的一页式静态预览。
- `tokens.css` / `design-tokens.json`：亮色、暗色 Design Tokens。
- `UI-SPEC.md`：视觉、交互、无障碍与组件治理规范。
- `examples/standalone-vue/`：独立 Vue 项目消费示例。
- `dist-lib/`：ES Module 组件包、样式和类型声明。

## 本地运行

环境要求：Node.js `^20.19.0` 或 `>=22.12.0`、pnpm。

```powershell
pnpm install
pnpm dev
```

- 后台系统：`http://127.0.0.1:4173/index.html#/home`
- 组件中心：`http://127.0.0.1:4173/index.html#/components`
- 静态预览：`http://127.0.0.1:4173/component-preview.html`

## 在其他 Vue 项目中使用

工作区或本地包方式：

```json
{
  "dependencies": {
    "lan-ui-design-system": "file:../DesignSystem",
    "vue": "^3.5.0"
  }
}
```

按需导入组件，同时载入完整组件样式：

```js
import { UiButton, UiCommandPalette, UiIcon, UiInput, UiSteps, UiTable } from 'lan-ui-design-system'
import 'lan-ui-design-system/style.css'
```

只让构建器解析单个组件入口时使用子路径导入；每个入口同时提供默认导出和独立 Props 类型：

```js
import UiButton from 'lan-ui-design-system/components/UiButton'
import type { UiButtonProps } from 'lan-ui-design-system/components/UiButton'
import { enUS } from 'lan-ui-design-system/config'
import { dateValueToDate, formatDateValue } from 'lan-ui-design-system/date'
import { toast } from 'lan-ui-design-system/feedback'
import { createIconRegistry } from 'lan-ui-design-system/icons'
```

组件子路径也提供同名运行时导出，默认与命名导出指向同一组件：

```js
import UiButton, { UiButton as NamedButton } from 'lan-ui-design-system/components/UiButton'
import type { UiButtonProps, UiButtonEmits, UiButtonSlots } from 'lan-ui-design-system/components/UiButton'
```

子路径导入不会把未使用组件带入 JavaScript Bundle；组件仍共享一份 `style.css`，保证 Token、状态和动效一致。

## 日期、时间与时区

`UiDatePicker`、`UiDateRangePicker` 和 `UiTimePicker` 共用严格日期适配层。默认保持字符串 v-model 兼容；领域模型也可直接使用 `Date` 或毫秒时间戳：

```vue
<UiDatePicker
  v-model="scheduledAt"
  mode="datetime"
  value-type="date"
  time-zone="Asia/Shanghai"
  precision="second"
  :step="1"
/>
<UiTimePicker v-model="reminderAt" value-type="date" time-zone="UTC" />
```

```js
import { dateValueToDate, formatDateValue } from 'lan-ui-design-system/date'

const instant = dateValueToDate('2026-08-12T09:30', {
  mode: 'datetime',
  timeZone: 'Asia/Shanghai',
})
formatDateValue(instant, { mode: 'datetime', timeZone: 'America/New_York' })
```

- `timeZone` 接受 `local`、`UTC` 或 IANA 时区名称；`local` 由运行环境解析。
- `disambiguation` 使用 `compatible / earlier / later / reject` 明确处理夏令时空档和重叠。
- 时间值转为 Instant 时，应设置 `referenceDate`，避免时间控件隐式依赖当天日期；未设置时使用稳定的 `1970-01-01`。
- 日期适配层只使用平台 `Intl`，不引入日期库依赖；`date` 子路径可用于服务端和 Vue Setup 外的领域代码。

## 公共图标系统

`UiIcon` 与 Button、Menu、Empty 等内置组件共用同一图标注册表。默认提供 46 个内置图标；装饰图标自动对辅助技术隐藏，表达信息时应设置 `aria-label`：

```vue
<UiIcon name="settings" :size="20" />
<UiIcon name="info" aria-label="查看详情" />
<UiIcon name="chevronRight" directional />
```

独立应用、微前端与 SSR 请求可通过 Plugin 拥有隔离注册表：

```js
import { createLanUi } from 'lan-ui-design-system'
import { createIconRegistry } from 'lan-ui-design-system/icons'

const icons = createIconRegistry({
  tenantMark: '<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/>',
})
app.use(createLanUi({ iconRegistry: icons }))
```

- 自定义定义只接受白名单 SVG 几何元素与属性，`UiIcon` 不使用 `v-html`。
- 每次 `createLanUi()` 默认创建独立注册表，业务图标不在应用间泄漏。
- `directional` 在 RTL 下自动镜像；`rotate / flip / spin / color / strokeWidth` 用于可检查的视觉变体。

组件样式位于 `lan-ui` CSS Layer 中。宿主项目未分层的 CSS 会自然覆盖该 Layer，便于品牌定制；如需统一主题，可在宿主根节点覆盖 Token：

```css
:root {
  --brand-600: #4f46e5;
  --radius-md: 10px;
}
```

暗色模式在页面根节点设置：

```html
<body data-theme="dark">
```

字体方案通过根节点切换，并由组件中心保存选择：

```html
<html data-font="inter-noto">
```

支持 `inter-noto`、`noto`、`source-han`、`system` 和 `wenkai`。推荐默认使用采用 SIL OFL 1.1 的 Inter + Noto Sans SC；生产环境建议自托管所选字体的 WOFF2 文件。

只复用 Token、不加载组件样式：

```js
import tokens from 'lan-ui-design-system/tokens'
```

## Numeric input

`UiNumberInput` keeps the model numeric while supporting an editable text draft, exact decimal stepping, bounds, explicit precision, custom formatter/parser hooks and form-item labelling. Side controls are the default so both actions retain a full control-height pointer target; compact right controls are opt-in.

Use an explicit `aria-label` when several independently named numeric controls appear inside one visual group. Each control receives an SSR-stable generated ID when it is not owned by a `UiFormItem`.

```vue
<UiNumberInput v-model="quantity" :min="0" :max="100" :step="0.25" :precision="2">
  <template #suffix>items</template>
</UiNumberInput>
```

Keyboard: `ArrowUp/ArrowDown` step once, `PageUp/PageDown` step ten times, `Home/End` move to finite bounds, `Enter` commits and `Escape` restores the current model.

## AutoComplete

`UiAutoComplete` is an editable ARIA combobox for local or remote suggestions. It supports keyword matching, IME composition, keyboard selection, free-text or select-only modes, debounced requests, `AbortSignal`, stale-response guards and query caching.

```vue
<UiAutoComplete v-model="city" :options="cities" clearable />
<UiAutoComplete v-model="project" :fetch-suggestions="searchProjects" :min-chars="1" />
```

Remote loaders receive `{ signal }`. Pass the signal to `fetch` so superseded queries stop promptly; the component also ignores stale responses that finish out of order. Use `allow-custom="false"` when the model must contain a listed option value.

## Tree

`UiTree` provides an enterprise hierarchy for permissions, organizations and nested navigation. It supports controlled or uncontrolled selection, ordered multi-selection, parent-child checkbox cascade, strict checks, filtering with ancestor retention, async child loading, virtual rendering, custom node keys and LTR/RTL keyboard behavior.

```vue
<UiTree
  v-model="selected"
  v-model:checked-keys="checked"
  :data="resources"
  :load-data="loadChildren"
  checkable
  show-line
  bordered
/>
```

Keyboard: Up/Down move through visible nodes; logical Right/Left expand, enter children, collapse or return to parents; Home/End select boundaries; `*` expands siblings; Space checks and Enter selects. Lazy loaders receive `{ signal }`, duplicate or missing keys emit `data-error`, and large trees can enable `virtual` with an explicit `height` and `itemHeight`.

## Slider and range

`UiSlider` supports numeric single/range models, exact steps, minimum distance, marks, formatted tooltips, pointer gestures and horizontal/vertical/reverse/RTL layouts. FormItem labels and help text are inherited automatically.

```vue
<UiSlider v-model="completion" :step="5" :marks="{ 0:'0', 50:'50', 100:'100' }" />
<UiSlider v-model="budgetRange" range :min-distance="10" :aria-label="['Budget start','Budget end']" />
```

Keyboard: Arrow keys move one step, Page keys move ten steps, and `Home/End` move the focused thumb to its bounds. Range thumbs never cross the configured `minDistance`.

## Rate

`UiRate` is a form-ready rating control with integer or fractional steps, pointer preview, repeat-to-clear, configurable copy/colors and a single accessible slider focus target. It inherits labels, help and error state from `UiFormItem` and mirrors horizontal Arrow behavior in RTL.

```vue
<UiRate v-model="serviceRating" :step="0.5" show-text />
<UiRate v-model="quality" :texts="['Poor','Fair','Good','Great','Excellent']" />
```

Keyboard: Arrow keys move one step, Page keys move five steps, `Home/End` jump to empty/full, and `Delete` or `Backspace` clears when `allowClear` is enabled. `readonly` remains focusable for inspection; `disabled` is removed from the tab order.

## Statistic / KPI

`UiStatistic` is the dashboard data-display primitive for localized numbers, currencies, percentages, semantic trends and stable loading placeholders. It accepts numeric or preformatted string values, passes `formatOptions` to the active `Intl.NumberFormat`, and keeps screen-reader value text independent from decorative prefix/suffix slots.

```vue
<UiStatistic
  title="Monthly revenue"
  :value="2864000"
  prefix="¥"
  :precision="0"
  :trend="12.6"
  live="polite"
>
  <template #extra>Compared with last month</template>
</UiStatistic>
```

Set `positiveDirection="down"` for metrics such as latency, defect rate or cost, where a decrease is beneficial. `loading` preserves the value footprint and exposes `aria-busy`; `live="polite"` announces operational updates. Use `ariaValueText` whenever a custom `value` slot communicates something different from the formatted fallback.

## 独立项目示例

```powershell
pnpm install
pnpm build:lib
pnpm build:example
```

示例入口位于 `examples/standalone-vue/`。该目录具备独立的 `package.json`、Vite 配置和页面源码，复制到新目录后只需调整组件包依赖路径即可作为独立项目运行。

## 构建、检查与打包

```powershell
pnpm ci
pnpm pack
python scripts/verify.py
```

`pnpm ci` 会执行 Token 导出、源码检查、62 个组件契约测试、后台构建、组件库构建及独立项目构建。

组件包公开内容：

```text
dist-lib/lan-ui.js
dist-lib/lan-ui.css
dist-lib/lan-ui.d.ts
dist-lib/components/UiButton.js
dist-lib/components/UiButton.d.ts
dist-lib/config.js
dist-lib/feedback.js
design-tokens.json
tokens.css
README.md
```

## 接入边界

- 适合 Vue 3 企业后台、内部工具和管理平台。
- 组件包为 ES Module，并将 Vue 声明为 Peer Dependency。
- 完整样式包含基础 Reset 与后台视觉语言，但已置于 `lan-ui` Layer；成熟存量项目仍应在接入前执行视觉回归。
- React、Angular 或原生项目可直接复用 Token、交互规范和静态预览，Vue 组件源码需要对应框架实现。
- 示例身份验证、数据和 AI 响应均为前端演示数据；正式项目需接入真实服务、权限和持久化层。

## 全局安装

支持按需导入和 Vue Plugin 全局安装两种方式：

```js
import { createApp } from 'vue'
import LanUi from 'lan-ui-design-system'
import 'lan-ui-design-system/style.css'

createApp(App).use(LanUi).mount('#app')
```

需要初始化语言、默认尺寸、密度和品牌 Token 时使用 `createLanUi`：

```js
import { createLanUi } from 'lan-ui-design-system'

app.use(createLanUi({
  locale: 'en-US',
  size: 'sm',
  density: 'compact',
  theme: { 'brand-600': '#7c3aed' },
}))
```

## 局部配置与日期范围

`UiConfigProvider` 可以为局部模块覆盖全局配置，内置 `zh-CN` 和 `en-US`：

```vue
<UiConfigProvider locale="en-US" size="sm" density="compact">
  <UiDateRangePicker v-model="deliveryRange" mode="date" />
</UiConfigProvider>
```

`UiDateRangePicker` 支持 `date / time / datetime`、Min/Max、开始结束约束、清除、错误顺序提示以及 `UiFormItem` 标签关联。

内置语言包覆盖 101 个消息键。Alert、Badge、Breadcrumb、Cascader、Descriptions、Drawer、FormItem、ListToolbar、Menu、Modal、MultiSelect、Notification、Popover、Steps、Tabs、ToastHost、Transfer、TreeSelect 等组件的默认文案与无障碍名称也会随 Locale 响应式切换。显式传入的 Placeholder、Title、ARIA Label 和校验 Message 始终优先。

```js
const lanUi = createLanUi({ locale: 'zh-CN' })
app.use(lanUi)

lanUi.setLocale('en-US') // 已显示的默认文案和生成式表单错误同步更新
```

`pnpm run test:locale` 会校验中英文键集合、插值参数、组件引用以及 62 个公开组件中的硬编码中文，防止新组件重新出现中英混排。

### Intl、复数与语言回退

自定义语言会保留自己的 Locale 名称用于数字和日期格式化；缺失消息按键从 `fallbackLocale` 读取。默认回退仍为 `zh-CN`，需要英文回退或严格检查缺失键时可显式配置：

```js
const lanUi = createLanUi({
  locale: { name: 'fr-FR', messages: frenchMessages },
  fallbackLocale: ['fr-FR', 'en-US'], // 有序回退链，也可设为 false
})

lanUi.setFallbackLocale(false)
```

组件 `setup()` 内使用响应式上下文，组件外使用静态工具：

```js
import { createLocaleTools, useLocale, enUS } from 'lan-ui-design-system'

const { t, tc, formatNumber, formatDate, formatRelativeTime, formatList } = useLocale()
const tools = createLocaleTools({
  name: 'en-US',
  messages: {
    items: { one: '{count} item', other: '{count} items' },
  },
}, enUS)

tools.tc('items', 2) // 2 items
tools.formatNumber(286400, { style: 'currency', currency: 'CNY' })
tools.formatDate(new Date(), { dateStyle: 'medium' })
```

`tc()` 支持 `one / two / few / many / other`、`=0` 等精确数量分支及两段/三段 Pipe 文案。格式化器按 Locale 与 Options 缓存；无效日期返回空字符串，关闭回退后缺失消息返回键名。

### 按需语言包与隔离注册表

每次 `createLanUi()` 都会创建一个独立注册表并预置 `zh-CN / en-US`，适合多应用、微前端和 SSR 请求隔离。同步语言包可以直接注册；异步语言包使用动态 `import()`，并在解析成功后原子激活：

```js
const lanUi = createLanUi({
  locale: 'en-US',
  fallbackLocale: ['fr-FR', 'en-US'],
})

lanUi.registerLocale({ name: 'fr-FR', messages: frenchMessages }, ['fr'])

await lanUi.loadLocale(
  'ja-JP',
  () => import('./locales/ja-JP.js'),
  { aliases: 'ja', activate: true },
)

lanUi.hasLocale('ja')
lanUi.listLocales()
lanUi.unregisterLocale('ja-JP')
```

同一语言的并发加载只执行一次 Loader；加载失败会释放 Pending 状态，后续请求可以重试。已注册语言默认直接返回，传入 `{ force:true }` 才会重新加载。内置语言保持注册状态，冲突别名会抛出明确错误，避免业务语言包静默覆盖 `zh / en`。组件外也可从根入口或 `lan-ui-design-system/config` 使用 `createLocaleRegistry / registerLocale / loadLocale` 等 API。

## 服务式反馈

应用根节点挂载一次 Host：

```vue
<UiToastHost />
<UiNotification />
```

业务逻辑中直接调用：

```js
import { notification, toast } from 'lan-ui-design-system'

toast.success('保存成功')
notification.error({
  title: '同步失败',
  message: '部分数据尚未完成，请重试。',
  actionText: '立即重试',
  onAction: retry,
})
```

默认 Plugin 与直接导入的 `toast / notification` 保持兼容。一个页面承载多个 Vue 应用、微前端或 SSR 请求时，使用应用级隔离实例，并在组件 `setup` 中通过 Composable 获取当前应用的服务：

```js
import { createLanUi, useNotification, useToast } from 'lan-ui-design-system'

const lanUi = createLanUi({ isolated: true })
app.use(lanUi)

// Vue setup 内部
const toast = useToast()
const notification = useNotification()
```

`UiToastHost` 与 `UiNotification` 会自动绑定当前应用注入的实例。Vue 应用卸载时会清理自有实例；SSR 渲染完成后调用 `lanUi.dispose()`，也可以用 `createLanUiFeedback()` 创建并通过 `createLanUi({ feedback })` 传入一个由业务自行管理生命周期的实例。

## 成熟度与质量保障

- `pnpm test` 执行 Vitest 行为测试与源码契约测试，覆盖表单语义、组合框键盘操作、浮层碰撞定位、全局配置、本地化、服务式反馈及无 DOM 的 SSR 渲染。
- Vitest 只收集根目录 `tests/`，排除 `.verify / .baseline / dist`，避免验证副本污染结果。
- 所有 62 个组件均从统一入口导出，并在 `src/index.d.ts` 提供 Props、Emits 与 Slots 类型。
- CI 连续验证 Token、Lint、单元测试、组件契约、后台构建、组件库构建、62 个子路径导出、最小消费者 Bundle 和独立消费项目。

## SSR 与 Hydration

- 组件包在模块加载阶段不读取 `window`、`document` 或浏览器存储。
- Modal、Drawer、Popover 和日期范围组件可在 Vue SSR 中渲染；客户端挂载后再注册事件、焦点和滚动锁。
- Modal 与 Drawer 使用 Vue `useId()`，同构渲染时生成稳定的 Label/Overlay ID，避免随机 ID 导致 Hydration 不一致。
- 服务端请求中应为每个应用实例调用 `createLanUi({ isolated:true })`，避免跨请求共享可变配置、消息状态和计时器；渲染完成后调用该 Plugin 的 `dispose()`。

## API 稳定性与升级

- `api-manifest.json` 使用 Schema 2 记录根入口、稳定子路径，以及 62 个组件的 Props、Emits、Slots 与实际运行时导出。
- 每个组件子路径同时导出 `UiXxxProps`、`UiXxxEmits` 和 `UiXxxSlots`；模板事件负载、`$emit` 与作用域插槽均参与 vue-tsc 检查。
- 构建工具可通过 `lan-ui-design-system/api-manifest` 或 `lan-ui-design-system/api-manifest.json` 读取该清单。
- `pnpm run api:check` 对比已构建包与提交的 Manifest；公开 API 变化必须先运行 `pnpm run api:generate` 并审查 SemVer 影响。
- 版本变化记录在 `CHANGELOG.md`，迁移步骤与兼容性规则记录在 `MIGRATION.md`。
- `src/**` 与 `dist-lib/**` 内部路径不是消费边界；业务项目只使用 `package.json#exports` 声明的路径。

TypeScript 消费契约可独立执行：

```powershell
pnpm run test:types
```

该门禁先构建真实发布声明，再使用严格 vue-tsc Fixture 同时验证根入口、组件子路径、v-model、事件、静态/动态作用域插槽，以及通过 `@ts-expect-error` 固化的错误用法。

## RTL 与按组件样式

全局启用方向：

```js
app.use(createLanUi({ direction: 'rtl' }))
```

```vue
<UiConfigProvider direction="rtl">
  <BusinessModule />
</UiConfigProvider>
```

Tabs、Segmented、Menu、TreeSelect、Cascader、Pagination 与 Transfer 使用逻辑方向；Teleport 浮层继承 `dir`。Drawer 支持 `start / end`，Table 固定列支持 `fixed: start / end` 与逻辑偏移。

按组件加载样式：

```js
import UiButton from 'lan-ui-design-system/components/UiButton'
import 'lan-ui-design-system/styles/UiButton.css'
```

每份组件样式自动导入 `styles/core.css`。`style-manifest.json` 记录 62 个组件样式入口、规则数和体积；完整主题仍可使用 `style.css`。最小 UiButton 消费 CSS 约 8KB，且不包含 Table、Modal、ColorPicker、Statistic 或 Transfer 样式。

## Global command palette

`UiCommandPalette` provides cross-page actions and a unified search entry for administration applications:

```vue
<UiCommandPalette v-model="open" v-model:query="query" :commands="commands" @select="runCommand">
  <template #trigger="{ open }"><UiButton @click="open">Search commands (Ctrl K)</UiButton></template>
</UiCommandPalette>
```

It supports `Ctrl/Cmd + K`, fuzzy ranking, grouping, disabled items, abortable async search, query caching, keyboard selection, focus trapping/restoration, RTL and content slots. Forward the remote provider `{ signal }` to network requests so stale queries are cancelled.

## Color picker and color utilities

`UiColorPicker` provides normalized HEX/RGB/HSL models, optional alpha, presets, text entry, a two-dimensional color plane and live WCAG contrast feedback:

```vue
<UiColorPicker
  v-model="brandColor"
  alpha
  show-contrast
  :presets="['#1677FF', '#7C3AED', '#10B981']"
/>
```

The color plane supports pointer input and Arrow/Page/Home/End keyboard adjustments. The popup flips at viewport edges, mirrors logical saturation in RTL, restores trigger focus after Escape and integrates with `UiFormItem`. Pure SSR-safe helpers are available from both the root and `lan-ui-design-system/color`: `parseColor`, `formatColor`, `rgbToHsv`, `rgbToHsl`, `getContrastRatio` and `getReadableTextColor`.

## 视觉回归

```powershell
pnpm exec playwright install chromium
pnpm run test:visual
pnpm run visual:update # 仅在目视确认预期变化后执行
```

基线覆盖 Light/LTR/Default、Dark/RTL/Compact 和 390px Mobile。允许像素差比例上限为 `0.2%`，差异图写入 `.verify/visual-diff/<platform>`。可通过 `LAN_UI_BROWSER_PATH` 指定 Chrome、Edge 或 Chromium。

## 浏览器级无障碍回归

```powershell
pnpm run test:a11y
```

Axe 4.11.4 runs WCAG 2.0/2.1/2.2 A/AA and Best Practice audits in a real Chromium DOM. The 13-case matrix covers light, dark RTL, mobile, Select, AutoComplete, MultiSelect, Tree, TreeSelect, Cascader, ColorPicker, CommandPalette, Modal and Drawer states; detected `violations` must remain zero.

## 浏览器交互回归与性能预算

```powershell
pnpm run test:interaction
pnpm run test:interaction:cross-browser
pnpm run test:performance
```

- The default real-Chromium interaction gate exercises 17 flows: ColorPicker, CommandPalette, Tree, AutoComplete, Select, NumberInput, Slider, LTR/RTL Tabs, Modal focus, nested overlays, Popconfirm, Pagination/Switch, Upload, Table, Form and Menu.
- `test:interaction:cross-browser` runs the same 17-scenario matrix on Chromium, Firefox and WebKit for 51 browser cases; `--browser=firefox` or `--browser=chromium,webkit` can select engines.
- 所有场景启用 `prefers-reduced-motion: reduce`，确保关闭动效后焦点与键盘行为仍然成立；结果写入 `.verify/interaction/<platform>/report.json`。
- 每个引擎的明细写入 `.verify/interaction/<platform>/<browser>.json`；聚合报告同时记录引擎、用例、耗时与失败信息。
- macOS Safari 的焦点语义由 Playwright WebKit 门禁覆盖；发布前仍应在目标系统执行关键业务流程的设备级验收。
- `UiFormItem` 可通过 `reserve-message-space` 预留帮助/错误信息行；默认保持紧凑布局，`UiForm` 会保护提交点击过程，修正错误后首次点击即可提交。
- `performance-budgets.json` 对组件包 JS/CSS、最大 Chunk、最大组件样式、UiButton 最小消费项目和独立示例设置 14 项 Raw/Gzip 上限。
- 预算报告写入 `.verify/performance/report.json`；预算提高必须与变更说明一并审查，不能通过静默放宽门禁处理回归。
