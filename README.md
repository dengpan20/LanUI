# Lan UI · 企业后台 Design System

基于 Vue 3 + Vite 的企业后台设计系统，包含设计 Token、89 个可复用组件、交互规范、完整后台示例和独立消费项目。

## P60 可交互标签词汇

`UiTag` 在兼容原有 `color`、`dot`、默认插槽与 `.tag` 类名的基础上，补齐 Soft / Solid / Outlined 外观、三种尺寸、圆角、自定义颜色、受控选择、关闭、链接、禁用与结构化插槽。可选择标签使用原生 Button 与 `aria-pressed`，链接使用原生 Anchor 并自动保护 `_blank`，关闭按钮拥有本地化名称；键盘、RTL、forced-colors、SSR、类型和三浏览器回归保持同步。

```vue
<UiTag checkable :checked="selected" @update:checked="selected = $event">
  Ready filter
</UiTag>
<UiTag color="red" closable @close="removeTag">Failed build</UiTag>
<UiTag href="/release" target="_blank" variant="outlined">Release notes</UiTag>
```

## P59 成熟卡片容器

`UiCard` 在兼容原有 `title`、`header`、`action` 和默认内容用法的基础上，补齐结构化区域、标题/描述关联、封面/页脚/操作区、尺寸、外观、阴影、选择、禁用、加载、链接与可交互模式。非原生交互卡片支持 Enter/Space，嵌套按钮不会误触发卡片；Reduced Motion、forced-colors、RTL、SSR、类型和三浏览器回归保持同步。

```vue
<UiCard
  title="Release evidence"
  subtitle="Review the generated package contract."
  variant="elevated"
  interactive
  :selected="selected"
  @activate="selected = !selected"
>
  <p>All required checks passed.</p>
  <template #footer>Published moments ago</template>
</UiCard>
```

## P58 语义化页面标题

`UiPageHeader` 统一后台页面的面包屑、返回入口、标题、描述、元信息、操作区和页内导航，覆盖可配置标题层级、返回来源元数据、加载、吸顶偏移、响应式折叠、RTL、Reduced Motion、SSR、类型与三浏览器交互。Dashboard、工作台、数据页、AI、甘特图和组件中心均已迁移到同一公共契约。

```vue
<UiPageHeader
  title="Release evidence"
  description="Review package contracts before publishing."
  :breadcrumbs="[{ label:'Workspace', href:'#/workbench' }, { label:'Release' }]"
  show-back
  bordered
>
  <template #actions><UiButton>Publish</UiButton></template>
</UiPageHeader>
```

## P57 键值配置编辑器

`UiKeyValueEditor` 为 HTTP Headers、环境变量、标签和元数据提供统一的受控键值编辑体验，覆盖稳定行身份、增删、排序、启停、dotenv 文本导入、重复/空值/格式/数量校验、表单命名、响应式布局、RTL、SSR、类型与三浏览器交互。

## 项目内容

- `src/components/`：Vue 组件源码。
- `src/pages/`：登录、退出、403、404、500、看板、工作台、数据管理、AI、甘特图和组件中心。
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
import { UiButton, UiCommandPalette, UiFormList, UiIcon, UiInput, UiKeyValueEditor, UiQueryBuilder, UiSteps, UiTable } from 'lan-ui-design-system'
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

键值配置采用数组模型并保留消费者附加字段；通过 `name` 可生成后端可直接解析的嵌套表单字段：

```vue
<UiKeyValueEditor
  v-model="headers"
  name="headers"
  :min-rows="1"
  :max-rows="12"
  key-pattern="^[A-Za-z][A-Za-z0-9-]*$"
  require-value
/>
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

## Calendar

`UiCalendar` provides single, multiple and range date selection without depending on a third-party date library. It supports controlled view dates, localized month and weekday labels, configurable first weekday, optional week numbers, fixed or natural week rows, outside-day visibility, minimum/maximum bounds and consumer-defined disabled dates.

```vue
<UiCalendar
  v-model="releaseRange"
  selection-mode="range"
  view-date="2026-08-01"
  show-week-numbers
  :disabled-date="date => [0, 6].includes(date.getUTCDay())"
/>
```

Arrow keys move by day or week, `Home/End` move within the active week, `PageUp/PageDown` change month, `Shift+PageUp/PageDown` change year, `Enter/Space` select and `Delete/Backspace` clear. Range preview, year selection, RTL horizontal movement, roving focus, forced-colors styling and `string / Date / timestamp` value output are built in. Pass a stable `today` value when deterministic SSR snapshots are required.

## Image and gallery preview

`UiImage` standardizes content-image loading, fallback and preview behavior. It preserves native `alt`, lazy/eager loading, decoding, cross-origin and referrer controls while adding responsive dimensions, aspect ratio, fit and position.

```vue
<UiImage
  src="/release-thumbnail.jpg"
  fallback="/image-fallback.jpg"
  alt="Release architecture"
  fit="contain"
  preview
  :preview-list="releaseGallery"
/>
```

The preview supports controlled visibility/index, looping or bounded galleries, adjacent preloading, zoom, rotation, reset, wheel/double-click zoom and pointer panning. Arrow Left/Right navigates, `+`/`-` zooms, `R` rotates, `0` resets and Escape closes. RTL mirrors only horizontal navigation; focus remains trapped and returns to the thumbnail trigger.

## 状态页与大数据列表

`UiStatusPage` 统一 403、404、500 页面骨架，支持完整页面或 `embedded` 内容区使用；默认标题、说明和返回/首页/重试动作均由 Locale 提供。`UiVirtualList` 为大数据集合提供固定高度、函数估算、动态测量、Overscan、键盘选择和公开滚动方法，同时只渲染可见窗口。

```vue
<UiStatusPage status="404" @back="router.back()" @home="router.push('/')" />

<UiVirtualList
  v-model="selectedKey"
  :items="records"
  :item-size="record => record.detail ? 68 : 48"
  :estimated-item-size="52"
  height="360"
  selection-mode="single"
  measure
  bordered
>
  <template #item="{ item, selected }">
    <RecordRow :record="item" :selected="selected" />
  </template>
</UiVirtualList>
```

- `UiVirtualList` 支持 Arrow、Home/End、Page、Enter/Space、Ctrl/Cmd+A（多选）与字符前缀检索。
- `scrollToIndex / scrollToKey / resetAfterIndex / getVisibleRange` 通过组件 Ref 公开。
- 加载、空、错误和重试状态均可通过具名插槽品牌化；Listbox 语义包含位置、总量、选中态与活动项。
- 403、404、500 独立路由分别为 `#/403`、`#/404`、`#/500`，可直接复制为新项目的异常路由边界。

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

`pnpm ci` 会执行 Token 导出、源码检查、74 个组件契约测试、后台构建、组件库构建及独立项目构建。

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

内置语言包覆盖 202 个消息键。Alert、Badge、Breadcrumb、Calendar、Cascader、Descriptions、Drawer、FormItem、Image、ListToolbar、Menu、Modal、MultiSelect、Notification、Popover、StatusPage、Steps、Tabs、ToastHost、Transfer、TreeSelect、VirtualList 等组件的默认文案与无障碍名称也会随 Locale 响应式切换。显式传入的 Placeholder、Title、ARIA Label 和校验 Message 始终优先。

```js
const lanUi = createLanUi({ locale: 'zh-CN' })
app.use(lanUi)

lanUi.setLocale('en-US') // 已显示的默认文案和生成式表单错误同步更新
```

`pnpm run test:locale` 会校验中英文键集合、插值参数、组件引用以及 72 个公开组件中的硬编码中文，防止新组件重新出现中英混排。

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
- 所有 74 个组件均从统一入口导出，并在 `src/index.d.ts` 提供 Props、Emits 与 Slots 类型。
- CI 连续验证 Token、Lint、单元测试、组件契约、后台构建、组件库构建、72 个子路径导出、最小消费者 Bundle 和独立消费项目。

## SSR 与 Hydration

- 组件包在模块加载阶段不读取 `window`、`document` 或浏览器存储。
- Modal、Drawer、Popover 和日期范围组件可在 Vue SSR 中渲染；客户端挂载后再注册事件、焦点和滚动锁。
- Modal 与 Drawer 使用 Vue `useId()`，同构渲染时生成稳定的 Label/Overlay ID，避免随机 ID 导致 Hydration 不一致。
- 服务端请求中应为每个应用实例调用 `createLanUi({ isolated:true })`，避免跨请求共享可变配置、消息状态和计时器；渲染完成后调用该 Plugin 的 `dispose()`。

## API 稳定性与升级

- `api-manifest.json` 使用 Schema 3 记录根入口、稳定子路径，以及 74 个组件的 Props、Emits、Slots、签名、默认值与实际运行时导出。
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

每份组件样式自动导入 `styles/core.css`。`style-manifest.json` 记录 74 个组件样式入口、规则数和体积；完整主题仍可使用 `style.css`。最小 UiButton 消费 CSS 约 8KB，且不包含 Table、Modal、Calendar、ColorPicker、Statistic、StatusPage 或 Transfer 样式。

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

Axe 4.11.4 runs WCAG 2.0/2.1/2.2 A/AA and Best Practice audits in a real Chromium DOM. The 25-case matrix includes light, dark RTL, mobile, overlays, advanced controls, tables, status pages, managed forms, dynamic arrays, Schema Form and repeatable schema nodes; detected `violations` must remain zero.

## 浏览器交互回归与性能预算

```powershell
pnpm run test:interaction
pnpm run test:interaction:cross-browser
pnpm run test:performance
```

- The default real-Chromium interaction gate exercises 45 flows, including recursive query composition, repeatable Schema orchestration, form arrays, dependency validation, virtualized collections, data grids, status boundaries, overlays, data entry and keyboard navigation.
- `test:interaction:cross-browser` runs the same 45-scenario matrix on Chromium, Firefox and WebKit for 135 browser cases; `--browser=firefox` or `--browser=chromium,webkit` can select engines.
- 所有场景启用 `prefers-reduced-motion: reduce`，确保关闭动效后焦点与键盘行为仍然成立；结果写入 `.verify/interaction/<platform>/report.json`。
- 每个引擎的明细写入 `.verify/interaction/<platform>/<browser>.json`；聚合报告同时记录引擎、用例、耗时与失败信息。
- macOS Safari 的焦点语义由 Playwright WebKit 门禁覆盖；发布前仍应在目标系统执行关键业务流程的设备级验收。
- `UiFormItem` 可通过 `reserve-message-space` 预留帮助/错误信息行；默认保持紧凑布局，`UiForm` 会保护提交点击过程，修正错误后首次点击即可提交。
- `performance-budgets.json` 对组件包 JS/CSS、最大 Chunk、最大组件样式、UiButton 最小消费项目、独立示例及 Theme/Motion 子路径设置 18 项 Raw/Gzip 上限。
- 预算报告写入 `.verify/performance/report.json`；预算提高必须与变更说明一并审查，不能通过静默放宽门禁处理回归。

## Managed forms and validation (P28)

UiForm and UiFormItem now manage production form state without requiring a second validation store:

~~~vue
<UiForm ref="form" :model="account" :rules="rules" show-error-summary @submit="save">
  <template #default="{ dirty, validating, errors }">
    <UiFormItem name="profile.email" label="Email" required show-success>
      <UiInput v-model="account.profile.email" />
    </UiFormItem>
    <UiButton type="submit" :loading="validating">Save ({{ errors.length }})</UiButton>
  </template>
</UiForm>
~~~

- Field names accept dot/bracket paths for nested objects and arrays. Validation, value inspection, partial reset, focus and server-error APIs all use the same canonical path.
- Rules support required, whitespace, type, exact length, range, enum, pattern, transform and custom async validators. Async contexts carry an AbortSignal; superseded results never overwrite newer input.
- validate, validateField, submit, clearValidate, resetFields, setFields, setFieldError, value/state getters, focusField and scrollToField are public methods described by UiFormInstance.
- Error summaries are localized and link back to registered controls. Form-level slot state exposes aggregate errors, dirty/touched and validation progress; item slots expose status and field state.
- Root/subpath Props/Emits/Slots declarations, component center, standalone consumer, static preview and SSR fixtures remain in parity for 67 components and 216 locale keys.
- CI requires 4 visual baselines, 22 Axe scenarios and 26 interaction cases per Chromium/Firefox/WebKit engine for the P28 delivery evidence.

## Dynamic form arrays and dependencies (P29)

`UiFormList` coordinates repeatable nested fields without requiring page-local key or reindex bookkeeping:

~~~vue
<UiForm :model="model">
  <UiFormList v-slot="{ fields, add, remove, move }" name="contacts" :min="1" :max="5">
    <div v-for="(field, index) in fields" :key="field.key">
      <UiFormItem :name="[...field.name, 'email']" label="Email" :rules="[{ required: true }, { type: 'email' }]">
        <UiInput v-model="model.contacts[index].email" />
      </UiFormItem>
      <UiButton type="button" @click="move(index, index - 1)">Move up</UiButton>
      <UiButton type="button" @click="remove(index)">Remove</UiButton>
    </div>
    <UiButton type="button" @click="add({ email: '' })">Add contact</UiButton>
  </UiFormList>
</UiForm>
~~~

- Stable row keys follow object identity through add, move and remove operations; nested `field.name` paths keep registration and error links aligned after reindexing.
- Standalone `v-model` and form-bound `name` modes share guarded `min`/`max`, `add`, `remove`, `move`, `replace`, `getValue` and structured event contracts.
- `UiFormItem.dependencies` revalidates touched related fields. Rules can use `when(model, context)` and validators can inspect related values through typed getters.
- Root/subpath declarations, component center, standalone/static previews and SSR fixtures remain in parity for 68 components and 216 locale keys.
- CI requires 5 visual baselines, 23 Axe scenarios and 27 interaction cases per Chromium/Firefox/WebKit engine for the P29 delivery evidence.

## Schema-driven form orchestration (P30)

`UiSchemaForm` turns application-owned field metadata into a managed `UiForm` without replacing the model or hiding the lower-level primitives:

~~~vue
<UiSchemaForm :model="account" :schema="schema" show-error-summary @submit="save">
  <template #actions="{ validating, errors }">
    <UiButton type="submit" :loading="validating">Save ({{ errors.length }})</UiButton>
  </template>
</UiSchemaForm>
~~~

- Flat fields and grouped sections support nested paths, per-section columns, field spans and full-width rows.
- Built-in mappings cover input, textarea, number, select, autocomplete, checkbox, switch, date, time, date range, slider and segmented controls; `components` and `component` register application controls.
- `visible`, `required`, `disabled`, `readonly`, `props`, `options` and `placeholder` accept values or model-aware resolvers. Hidden fields unmount and unregister before the next validation pass.
- `normalize` controls model writes. `field-change` returns immutable previous/next values, while contained consumer callback failures emit a deduplicated `schema-error` event.
- Dynamic `field-*` and `section-*-header` slots override targeted rendering. The actions/default scopes and exposed methods preserve the full managed-form contract.
- Root/subpath declarations, component center, standalone/static previews and SSR fixtures remain in parity for 69 components and 216 locale keys.
- CI requires 6 visual baselines, 24 Axe scenarios and 28 interaction cases per Chromium/Firefox/WebKit engine for the P30 delivery evidence.

## Repeatable Schema Form nodes (P31)

`UiSchemaForm` can now own a repeated group without page-local `UiFormList` markup:

~~~js
const schema = [{
  name: 'reviewers', type: 'list', label: 'Reviewers', min: 1, max: 4, columns: 2,
  defaultValue: ({ index }) => ({ name: `Reviewer ${index + 1}`, email: '' }),
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'email', label: 'Email', rules: [{ required: true }, { type: 'email' }] },
  ],
}]
~~~

- Child paths are item-relative, while `$root` dependencies intentionally address the root model. Visibility, props, disabled/readonly state and action policies receive typed item context.
- List rows expose localized add/remove/move controls, deterministic headings and responsive grids. Item/empty/child slots support targeted domain rendering without replacing the complete form.
- `list-change` forwards the full `UiFormList` change under `payload.change`; successful changes contain immutable current and `previous` arrays. `list-limit` reports guarded operations.
- `addListItem`, `removeListItem`, `moveListItem`, `replaceListItems` and `getListValue` expose the same behavior programmatically.
- P31 remains at 69 public components and advances to 223 locale keys. CI requires 7 visual baselines, 25 Axe scenarios and 29 interaction cases per Chromium/Firefox/WebKit engine.

## Production upload orchestration (P32)

`UiUpload` can now own an asynchronous queue while the application keeps controlled ownership of the rendered file list:

~~~vue
<UiUpload
  v-model="files"
  multiple
  accept=".pdf,image/*"
  :concurrency="2"
  :request="({ file, signal, onProgress }) => uploadAsset(file, { signal, onProgress })"
  :before-upload="inspectAsset"
  :before-remove="confirmRemoval"
  @success="handleSuccess"
  @upload-error="handleFailure"
/>
~~~

- `request` receives the raw file, normalized queue item, `AbortSignal` and clamped `onProgress` callback. Failures are isolated per file and never block the next worker.
- `autoUpload=false` creates a manual queue. Public `upload`, `abort`, `retry`, `remove`, `clear`, `select` and `open` methods support orchestration outside the default controls.
- `beforeUpload` may reject or transform a file asynchronously; transformed results are revalidated. `beforeRemove` may guard removal without exposing partial state.
- `change` keeps its compatible first list argument and adds structured reason/previous/file metadata. Dedicated select/reject/exceed/start/progress/success/upload-error/abort/retry/remove events avoid payload guessing.
- Default rendering exposes native progress semantics, localized ready/uploading/success/error/canceled states and file-specific accessible controls. Trigger, tip and file slots receive the equivalent queue methods and state.
- P32 remains at 69 public components and advances to 235 locale keys. CI requires 8 visual baselines, 26 zero-violation Axe scenarios and 30 interaction cases per Chromium/Firefox/WebKit engine.

## Package boundary and delivery optimization (P33)

The generated package now separates reusable component contracts from the admin showcase:

- `style.css` contains Tokens, the shared baseline and the union of selectors rooted at the 69 public components. Page shell, documentation, preview and demo selectors are excluded automatically.
- `styles/UiXxx.css` files split safe selector lists, retain only component-rooted branches, import `styles/core.css` and are minified deterministically. `style-manifest.json` schema 2 records the root/component rule counts and exact bytes.
- Direct component subpaths use the lean configuration runtime. The public `config` facade, plugin and `UiConfigProvider` retain compatible Chinese/English built-ins and locale-registry identity.
- The build minifies every emitted ESM entry/chunk after Vite output and reopens all root/subpath exports in package tests, including SSR and named/default identity.
- Performance reports compare all 14 metrics with the frozen 1.28.0 release. A metric that no longer improves fails even when it remains below its absolute budget.

Measured P33 outputs reduce aggregate package JS by roughly 104KB raw, aggregate package CSS by roughly 96KB raw, root CSS by roughly 55KB raw and the minimal UiButton consumer by roughly 8.6KB JS. Visual, Axe and three-browser behavior gates remain unchanged.

## Theme runtime and scoped appearance (P34)

Lan UI now exposes a reusable theme boundary rather than requiring every host application to manipulate document attributes itself:

```ts
import { createThemeController, defineTheme } from 'lan-ui-design-system/theme'

const tenantTheme = defineTheme({
  name: 'tenant-violet',
  appearance: 'dark',
  tokens: { 'brand-600': '#7c3aed', 'brand-text': '#c4b5fd' },
})

const controller = createThemeController({ appearance: 'system', storageKey: 'lan-theme' })
controller.mount(document.documentElement)
const unsubscribe = controller.subscribe(state => console.log(state.resolvedAppearance))
```

- `lightTheme` and `darkTheme` are immutable generated presets covering all 102 public CSS Tokens; `defineTheme`, `mergeThemes`, `normalizeThemeTokens` and `themeToStyle` validate and compose tenant overrides.
- `UiConfigProvider` accepts `appearance="light | dark | system"` and a named or raw Token theme. Nested providers inherit configuration, resolve system changes live and scope all custom properties to the provider subtree.
- `createThemeController` owns persistence, `prefers-color-scheme` listeners, target attributes, subscriptions, teardown and optional restoration. Injected adapters keep the same contract in SSR and unit tests.
- `createLanUi` exposes `setAppearance` and `setTheme`, and `lan-ui-design-system/theme` is a typed, independently importable public subpath.
- P34 keeps 69 public components and 235 locale keys. CI requires 9 visual baselines, 27 zero-violation Axe scenarios, 31 interactions per Chromium/Firefox/WebKit engine and 16 performance ceilings including the full theme-subpath dependency closure.

## Scoped Teleport theme bridge (P35)

Floating components can remain logically inside a tenant provider while Vue renders their panel below `body`:

~~~vue
<UiConfigProvider appearance="dark" :theme="tenantTheme" size="sm" density="compact">
  <UiPopover v-model="open" title="Tenant settings">
    <template #trigger><UiButton>Open settings</UiButton></template>
    The teleported panel keeps the nearest provider contract.
  </UiPopover>
</UiConfigProvider>
~~~

- A private provider context serializes the effective appearance, normalized Tokens, locale, size, density, direction, color scheme and overlay base onto the actual Teleport root.
- Modal, Drawer, Toast, Notification, Tooltip, Dropdown, Popover, Popconfirm, AutoComplete, ColorPicker, CommandPalette and Image preview share the same bridge instead of maintaining component-specific theme copies.
- The bridge updates an open portal when a provider changes appearance or Tokens and when `appearance="system"` receives a new media-query result.
- Roots expose `data-ui-teleport-scope` plus requested/resolved appearance metadata for diagnostics and browser assertions. Without a local provider, no bridge metadata is emitted and document theme inheritance remains authoritative.
- A source-discovery contract rejects any future Teleport component that omits the shared bridge. P35 keeps 69 public components and 235 locale keys; CI requires 10 visual baselines, 28 zero-violation Axe scenarios and 32 interactions per Chromium/Firefox/WebKit engine.

## Adaptive motion preferences (P36)

Lan UI now treats motion as a first-class runtime preference rather than a single global media-query override:

```ts
import { createMotionController } from 'lan-ui-design-system/motion'

const controller = createMotionController({ preference: 'system', storageKey: 'app-motion' })
controller.mount(document.documentElement)
controller.subscribe(({ resolvedPreference }) => console.log(resolvedPreference))
```

~~~vue
<UiConfigProvider motion="reduced">
  <UiPopover title="Settings">The Teleport panel also settles immediately.</UiPopover>
  <UiConfigProvider motion="full">Nested full-motion scope</UiConfigProvider>
</UiConfigProvider>
~~~

- Public preferences are `full`, `reduced` and `system`; `system` follows `prefers-reduced-motion` live and resolves to `full` during SSR.
- `createMotionController` owns persistence, media listeners, target metadata, subscriptions, disposal and optional restoration. `useReducedMotion` exposes the nearest resolved provider state to components.
- Component transitions, loading indicators, skeletons, decorative orbits and smooth scrolling consume cascading motion variables. Nested providers can therefore override a reduced root without `!important` conflicts.
- The existing Teleport bridge now carries requested/resolved motion and reduced-motion variables to Modal, Drawer, Toast, Notification, Tooltip, Dropdown, Popover, Popconfirm, AutoComplete, ColorPicker, CommandPalette and Image preview.
- P36 keeps 69 public components and 235 locale keys. CI requires 11 visual baselines, 29 zero-violation Axe scenarios, 33 interactions per Chromium/Firefox/WebKit engine and 18 performance ceilings including full theme and motion subpath closures.

### Compact table selection controls

`UiCheckbox` accepts `size="sm | md | lg"` and `aria-label`. `UiTable` uses the `sm` variant for select-all and row selection, keeping the visible checkmark at 14px while preserving a minimum 24px interaction target. Icon-only usage omits the empty label span, so alignment is stable in compact table columns.

## Generated Component API reference (P37)

Lan UI turns its public TypeScript and Vue runtime contracts into deterministic documentation rather than maintaining a second handwritten API source:

```bash
pnpm run api:generate # write schema 3 manifest and documentation outputs
pnpm run api:check    # reject declaration/runtime/category/documentation drift
```

- `api-manifest.json` schema 3 retains compact member lists and adds full prop/event/slot signatures, required flags, runtime constructor names, defaults and both import forms.
- `COMPONENT-API.md` is a portable reference; `public/component-api.json` is the machine-readable web output; `src/generated/component-api.json` powers the showcase without runtime parsing.
- The lazy-loaded `#/api` admin route searches component names and every public contract, filters six stable categories, copies imports and exposes direct links such as `#/api?component=UiUpload`.
- Category generation requires exact one-to-one coverage of all 69 public components. A missing, duplicate or unknown component fails generation before documentation can ship.
- P37 keeps runtime component behavior unchanged. Release gates now require 12 visual baselines, 30 zero-violation Axe scenarios and 34 interactions per Chromium/Firefox/WebKit engine in addition to generated-output drift checks.

## Scroll-aware anchor navigation and route boundaries (P38)

`UiAnchor` turns the component center's former private outline into a reusable navigation contract:

~~~vue
<UiAnchor
  v-model="activeSection"
  :items="[{ key: 'start', href: '#start', title: 'Start' }]"
  :container="scrollContainer"
  :offset-top="72"
  @change="handleSectionChange"
/>
~~~

- Window and element scroll containers share offset/bounds calculations, scroll-spy updates, pointer lifecycle events and exposed `scrollTo` / `update` methods.
- Vertical, horizontal, sticky and inline layouts support nested levels, disabled items, item slots, visible focus, roving Home/End/arrow keys and RTL arrow mirroring.
- Smooth navigation consumes scoped motion preferences and settles immediately under reduced motion; server rendering remains deterministic and DOM-free.
- All showcase pages now load through route-level async boundaries. The production app entry falls from roughly 548KB to 331KB raw while the 89KB component catalog and business pages load only when requested.
- The standalone consumer no longer combines local component imports with a redundant full-plugin installation; it demonstrates the public icon subpath and preserves tree-shaking while package tests continue to validate full plugin installation.
- P38 advances to 70 public components and 236 locale keys. Release gates require 13 visual baselines, 31 zero-violation Axe scenarios, 35 interactions per Chromium/Firefox/WebKit engine, 25 negative type assertions and 18 performance ceilings.


## Publishable package and external installation (P39)

A release candidate can be materialized without relying on `workspace:*`:

```bash
pnpm run build:lib
pnpm run pack:artifact
pnpm add ./artifacts/lan-ui-design-system-1.35.0.tgz
```

Consumers can choose the complete stylesheet, the Token layer, or explicit component CSS through documented Package Exports:

```ts
import { UiAnchor } from 'lan-ui-design-system'
import UiButton from 'lan-ui-design-system/components/UiButton'
import 'lan-ui-design-system/tokens.css'
import 'lan-ui-design-system/styles/core.css'
import 'lan-ui-design-system/styles/UiAnchor.css'
import 'lan-ui-design-system/styles/UiButton.css'
```

- The package carries MIT licensing, repository/issue/homepage links, public npm access and provenance metadata. Publishing remains a deliberate release action; CI never publishes.
- `pnpm run test:packed-consumer` creates the archive twice and requires an identical SHA-256, then installs the `.tgz` into an isolated non-workspace consumer in offline mode and verifies runtime root/subpath imports, TypeScript declarations, SSR rendering and a Vite browser build.
- The allow-list requires README, license, changelog, API documentation, manifests, Tokens, root builds and every component runtime/type/style entry. Source, tests, scripts, examples, CI files and dependency trees are rejected from the archive.
- Distribution budgets cap the package at 340 files, 320,000 compressed bytes and 1,800,000 unpacked bytes. P39 keeps 70 public components, 236 locale keys, 13 visual baselines, 31 zero-violation Axe scenarios and 35 interactions per browser.

## Runtime matrix and auditable GitHub releases (P40)

Independent projects now have an executable compatibility and release contract rather than only a documented engine range:

```bash
pnpm run test:runtime
pnpm run test:compatibility
pnpm run test:release
```

- Supported Node runtimes are `^20.19.0 || >=22.12.0`. The repository pins pnpm 10.34.0 (the pnpm line supporting Node 20), and CI repeats the unit suite, library build and isolated packed-consumer install on Node 20.19.0, 22.12.0 and 24.
- `test:release` binds `package.json.version`, `CHANGELOG.md`, the exact `v<version>` tag and workflow permissions/actions. The packed-consumer gate additionally validates the exact tarball name, SHA-256, 70 public runtime/type/style triplets and distribution budgets; it resolves and prefetches an isolated lockfile before proving the actual frozen install with `--offline`.
- Pushing an exact version tag such as `v1.36.0` runs all prepack gates, uploads `lan-ui-design-system-1.36.0.tgz` plus its `.sha256`, records an artifact attestation and creates a GitHub Release. Manual dispatch performs the same validation and artifact upload without creating a tag release.
- Verify a downloaded artifact with `sha256sum -c lan-ui-design-system-1.36.0.tgz.sha256`; repository owners can additionally use `gh attestation verify lan-ui-design-system-1.36.0.tgz --repo dengpan20/LanUI`.
- npm publication remains an explicit follow-up action. The workflow never writes to a package registry.

P40 retains the 70-component public API and all P39 consumer guarantees while adding three runtime compatibility jobs and one version-bound release contract.


## Target-aware product onboarding (P41)

- `UiTour` adds controlled open/current state, selector/Element/factory targets, 12 placements, viewport flip/shift, centered missing-target fallback and per-step mask overrides.
- Modal tours lock scrolling and trap focus; mask-free tours remain non-modal and preserve page scrolling. Closing restores the trigger focus and every target's prior `aria-describedby`.
- Escape closes the top overlay. Home/End and directional keys navigate the focused panel, with left/right behavior mirrored in RTL. Reduced-motion scopes change target scrolling from smooth to immediate.
- The component center, static HTML preview, visual fixture and standalone package consumer all use the same public contract. Generated API docs expose 16 Props, seven Events, four Slots and the `UiTourInstance` methods.
- P41 advances to 71 public components, 242 locale keys and 13 theme-scoped Teleport families, with 14 visual baselines, 32 zero-violation Axe scenarios, 36 interactions per Chromium/Firefox/WebKit engine and 26 negative type assertions. The 18 performance ceilings receive bounded headroom only for the new component and stylesheet.

## Resilient document watermark (P42)

`UiWatermark` adds a protected visual mark without replacing or intercepting the semantic content in its default Slot:

```vue
<UiWatermark :content="['Lan UI','INTERNAL']" :gap="[80,64]" :font="{ fontSize:14, color:'rgba(37,99,235,.16)' }">
  <article>Release evidence</article>
</UiWatermark>
```

- Text and image rendering uses logical geometry plus a device-pixel-aware Canvas; multi-line text remains available as an SVG fallback when a 2D context is unavailable.
- `image` has priority and emits typed load/error diagnostics. Supplying text at the same time preserves a visible fallback for failed URLs, CORS restrictions or Canvas export errors.
- The visual layer uses `pointer-events:none`, is decorative by default and accepts an explicit `ariaLabel` when the mark itself conveys information.
- Mutation recovery distinguishes removal from presentation changes, restores the retained layer without virtual-DOM drift and ignores ordinary content mutations.
- Root and stable subpath imports, Props/Events/Slots declarations, component CSS, generated API documentation, SSR, static/standalone examples and the installed tarball consumer are release-gated together.

P42 advances to 72 public components and keeps 242 locale keys and 13 theme-scoped Teleport families. CI requires 15 visual baselines, 33 zero-violation Axe scenarios, 37 interactions per Chromium/Firefox/WebKit engine, 27 negative type assertions and 18 performance ceilings.

## Container-aware sticky actions (P43)

`UiAffix` keeps page-level or container-level actions visible without removing their original layout space:

```vue
<UiAffix :target="() => scrollArea" :offset="12" position="top">
  <UiButton variant="primary">Save changes</UiButton>
</UiAffix>
```

- Window and custom Element scroll targets share one typed contract. A selector or factory may resolve either target; invalid targets emit `error` once and use the window fallback.
- Top and bottom positioning measure the rendered width and height, preserve a placeholder, align fixed content to the source column and stop at an explicit or implicit boundary.
- Scroll and change events include current scroll position and fixed geometry. `ResizeObserver`, window resize and the exposed `update` / `updateRoot` methods cover responsive or programmatic layout changes.
- `disabled` releases the content immediately, print styles restore document flow, and SSR renders deterministic semantic content without accessing browser APIs.
- The component center, standalone package consumer and one-page preview demonstrate real sticky action bars. Root/subpath exports, generated API records, CSS, declarations and packed installation remain release-gated together.
- The frozen P33 comparison still requires improvement for 13 of 14 historical metrics. Aggregate package JS gzip receives a narrowly bounded 0.25% additive tolerance for the new public component while remaining below its independent 172KB ceiling.

P43 advances to 73 public components and keeps 242 locale keys and 13 theme-scoped Teleport families. CI requires 16 visual baselines, 34 zero-violation Axe scenarios, 38 interactions per Chromium/Firefox/WebKit engine, 28 negative type assertions and 18 performance ceilings.

## Responsive resizable workspace layout (P44)

`UiSplitter` provides a data-driven, multi-panel layout primitive for admin shells, editors and workbenches:

```vue
<UiSplitter v-model="sizes" :panels="panels" lazy>
  <template #panel="{ panel, size }">{{ panel.label }} · {{ size }}%</template>
</UiSplitter>
```

- Horizontal and vertical layouts accept any number of keyed panels. `size`, `defaultSize`, `min`, `max` and `collapsedSize` accept pixels or percentages, while emitted model values are normalized responsive percentages.
- Pointer movement changes only the adjacent pair and clamps both panel constraints. `lazy` displays a live guide and commits the model only at pointer release.
- Each separator implements the ARIA Separator pattern with orientation, controlled panel IDs and live value bounds. Arrow keys resize, Home/End move to constraints, and Enter or double click toggles a collapsible neighbor.
- Horizontal deltas mirror in RTL. Disabled or non-resizable pairs leave the tab sequence, collapsed panels become inert, print restores ordinary document flow, and SSR renders deterministic ratios without browser geometry.
- `reset`, `setSizes`, `collapse`, `expand` and `toggleCollapse` are exposed for workspace commands. Root/subpath imports, isolated CSS, declarations, generated API, static and standalone consumers, SSR and packed installation are release-gated together.
- The frozen 1.28 performance guard keeps 13 metrics strictly improving. Package JS gzip receives a transparent 1KB allowance per public component added after the 69-component baseline, while the independent 175KB absolute ceiling remains mandatory.

P44 advances to 74 public components and keeps 242 locale keys and 13 theme-scoped Teleport families. CI requires 17 visual baselines, 35 zero-violation Axe scenarios, 39 interactions per Chromium/Firefox/WebKit engine, 29 negative type assertions and 18 performance ceilings.


## Semantic typography (P45)

`UiTypography` keeps title, text and paragraph semantics together with copy, inline editing and controlled ellipsis behavior:

```vue
<UiTypography
  v-model:content="releaseNote"
  variant="paragraph"
  :ellipsis="{ rows:2, expandable:true }"
  :editable="{ trigger:'both', submitOnBlur:true }"
  copyable
/>
```

- `title`, `text` and `paragraph` choose semantic tags; `level`, `tone`, alignment, size, emphasis and inline code/key treatments remain composable.
- Copy uses the Async Clipboard API with a scoped fallback and emits `copy` or `copy-error`; action labels and status announcements are localized.
- Editable text supports icon/text triggers, max length, Escape cancellation, Enter or Ctrl/Cmd+Enter submission and optional blur submission.
- Ellipsis observes resizing and loaded fonts; expandable text has a labelled `aria-expanded` action and a stable SSR fallback.

P45 keeps the frozen 1.28 comparison strict for every historic metric and uses a 1.5KB gzip allowance per public component only for aggregate package JavaScript.

P45 advances to 75 public components and 251 locale keys. CI requires 18 visual baselines, 36 zero-violation Axe scenarios, 40 interactions per Chromium/Firefox/WebKit engine, 30 negative type assertions and 18 performance ceilings.


## Semantic finite-data lists (P46)

`UiList` covers ordinary finite business collections without forcing teams to assemble list semantics, selection and paging independently:

```vue
<UiList
  v-model="selectedKeys"
  :items="records"
  selection-mode="multiple"
  :grid="{ columns: 1, md: 2, gap: 12 }"
  :pagination="{ position: 'end', compact: true }"
  bordered
  hoverable
/>
```

- Built-in title, description and avatar fields provide a zero-template path; item, avatar, title, description, actions, extra, header, footer and state Slots cover rich products.
- None, single and multiple selection support disabled keys, deselection, active-index control and pointer isolation for nested actions. Arrow/Home/End, typeahead, Enter/Space and Ctrl/Cmd+A are included; horizontal movement mirrors in RTL.
- Numeric or breakpoint grids use container width rather than viewport width. Finite client paging slices records locally, while server mode keeps caller-owned items and publishes page metadata with global ARIA positions.
- Loading skeletons, retryable errors and empty output use locale keys. SSR, isolated CSS, declarations, API records, the standalone app and the packed consumer share the same public contract.
- Locale contracts additionally reject replacement glyphs and runs of question marks, preventing corrupted labels from entering a release.

P46 keeps the frozen 1.28 comparison strict for every historic metric and retains the 2KB aggregate JavaScript gzip allowance per public component.

P46 advances to 76 public components and 257 locale keys. CI requires 19 visual baselines, 37 zero-violation Axe scenarios, 41 interactions per Chromium/Firefox/WebKit engine, 31 negative type assertions and 18 performance ceilings.


## One-time code input (P47)

`UiOtpInput` provides a complete segmented verification-code contract for sign-in, step-up authentication and approval flows:

```vue
<UiOtpInput
  v-model="code"
  :length="6"
  mode="numeric"
  separator="–"
  :separator-every="3"
  name="verificationCode"
  @complete="verify"
/>
```

- `numeric`, `alphanumeric` and `text` modes share NFKC normalization, so full-width codes from messages and mobile keyboards are accepted consistently. `uppercase` and `transform` support product-specific canonicalization.
- A complete code pasted or delivered through `autocomplete="one-time-code"` is distributed across cells. Ordinary entry advances focus; Backspace/Delete, Home/End and Arrow keys provide predictable editing, with directional arrows mirrored in RTL.
- Masked, invalid, readonly and disabled states retain visible focus and forced-colors treatment. Each cell receives a localized position label and completion is announced through a polite live region.
- `name` renders one hidden canonical form value while visible cells remain presentation inputs. `UiFormItem` IDs, descriptions and invalid state are inherited automatically.
- `input`, `change`, `complete`, `focus`, `blur` and `invalid` events include typed source/index metadata; refs expose focus, blur, clear and programmatic value updates.

P47 advances to 77 public components and 260 locale keys. CI requires 20 visual baselines, 38 zero-violation Axe scenarios, 42 interactions per Chromium/Firefox/WebKit engine, 32 negative type assertions and 18 performance ceilings.

## Contextual mentions (P48)

`UiMentions` adds a production-ready multiline mention editor for reviewers, topics and product-specific tokens:

```vue
<UiMentions
  v-model="comment"
  :options="mentionOptions"
  :triggers="['@', '#']"
  :auto-size="{ minRows:3, maxRows:6 }"
  show-count
  maxlength="160"
  @select="handleMention"
/>
```

- The suggestion panel follows the active caret, filters per trigger and mirrors logical start/end placement under RTL. Arrow keys, Ctrl+Home/End, Enter, Tab and Escape provide complete keyboard operation.
- Local options and debounced `fetchSuggestions` share one contract with AbortSignal cancellation, stale-response suppression, query cache, loading, empty and retryable error presentation.
- IME composition is deferred until completion. Token boundary validation, spaced queries, custom filtering, validation, formatting and insertion suffixes cover common chat, issue and document workflows.
- The multiline textbox supports controlled values, FormItem IDs/errors, autosize, maxlength/count, disabled, readonly and invalid states. The owned combobox/listbox structure exposes active-descendant state without assigning an invalid combobox role to a native textarea.
- Typed Props, Emits, Slots and instance methods are identical through root and component subpath imports; static preview, component center and the standalone package consumer use the same behavior.

P48 advances to 78 public components, 265 locale keys and 14 theme-scoped Teleport families. CI requires 21 visual baselines, 39 zero-violation Axe scenarios, 43 interactions per Chromium/Firefox/WebKit engine, 33 negative type assertions and 18 performance ceilings. The frozen 1.28 comparison uses explicit per-additive-component allowances of 500 B package JS raw, 2.75 KB package JS gzip and 800 B standalone JS raw; all remaining historical metrics retain zero allowance.

## Tokenized multi-value input (P49)

`UiInputTag` turns compact multi-value fields such as capabilities, recipients and labels into one governed component:

```vue
<UiInputTag
  v-model="capabilities"
  editable
  clearable
  :max-tags="8"
  :validate="validateCapability"
  :before-add="confirmCapability"
/>
```

- Enter, configurable submit keys, Western/CJK comma and semicolon separators, and multiline paste share Unicode NFKC normalization, optional transformation and case-aware duplicate detection.
- Maximum tag count and code-point length are enforced before synchronous or asynchronous `validate` and `beforeAdd` hooks. Add operations are serialized so delayed rules preserve source order and expose a stable busy state.
- Backspace selects then removes, Delete removes the active item, F2/Enter starts inline editing, and logical Arrow navigation mirrors under RTL. IME composition is deferred until completion.
- Editable, collapsible, clearable, readonly, disabled, invalid and loading states are covered. Named hidden inputs preserve native form submission while `UiFormItem` supplies label, help and invalid associations.
- Root/subpath exports, component CSS, generated API docs, built-in Schema Form resolution, component center, one-page preview, standalone consumer, SSR and isolated packed installation remain synchronized.

P49 advances to 79 public components, 285 locale keys and 14 theme-scoped Teleport families. CI requires 22 visual baselines, 40 zero-violation Axe scenarios, 44 interactions per Chromium/Firefox/WebKit engine, 34 negative type assertions and 18 performance ceilings. The frozen 1.28 comparison uses explicit per-additive-component allowances of 1.9 KB package JS raw, 2.9 KB package JS gzip, 400 B package CSS raw, 450 B largest component CSS raw and 2.2 KB standalone JS raw; every remaining historical metric retains zero allowance.

## Recursive query composition (P50)

`UiQueryBuilder` turns enterprise filters, reports and policy rules into one typed, serializable condition tree:

```vue
<UiQueryBuilder
  ref="queryBuilder"
  v-model="filters"
  :fields="queryFields"
  show-not
  :max-depth="3"
  name="releaseFilters"
/>
```

- Field metadata selects text, number, date, single-select, multi-select, tag or boolean editors. Built-in operators declare zero, one or two values; custom operators may provide an evaluator.
- AND/OR groups can nest, negate, duplicate, reorder and delete without mutating the caller's previous tree. Per-group depth and item limits keep large filters governed.
- Ctrl/Cmd+D duplicates, Ctrl/Cmd+Enter appends, Alt+Arrow reorders and Alt+Backspace removes the focused node. Every selector, editor and icon action has a localized accessible name and visible focus treatment.
- Validation covers missing metadata, empty values, inverted ranges and custom field/global rules. The exposed instance supplies `validate`, `getValue`, `matches`, mutation methods, counts and errors.
- `name` serializes the canonical tree into a hidden successful form control. Schema Form resolves `type:'query-builder'`; root and component subpaths expose matching runtime, Props/Emits/Slots and related query types.
- Component center, static preview, standalone consumer, SSR, isolated CSS and packed installation remain synchronized. Visual and Axe fixtures cover recursive layout and target sizing, while all three browser engines verify the keyboard and evaluation contract.

P50 advances to 80 public components, 349 locale keys and 14 theme-scoped Teleport families. CI requires 23 visual baselines, 41 zero-violation Axe scenarios, 45 interactions per Chromium/Firefox/WebKit engine, 35 negative type assertions and 18 performance ceilings. The frozen 1.28 comparison uses explicit additive byte allowances for the recursive typed-editor dependency closure; absolute package and consumer ceilings remain mandatory.

## Accessible content rotation (P51)

`UiCarousel` provides one reusable presentation primitive for release highlights, onboarding summaries, product announcements and media-led cards:

```vue
<UiCarousel
  v-model="activeSlide"
  :items="slides"
  effect="slide"
  indicators="lines"
  autoplay
  aria-label="Product highlights"
>
  <template #item="{ item }"><ReleaseHighlight :item="item" /></template>
</UiCarousel>
```

- Slide and fade effects support horizontal or vertical orientation, finite or looping navigation, inside/outside dot, line or numbered indicators, customizable arrow/indicator Slots and lazy slide rendering.
- Arrow keys follow the configured text direction; vertical mode uses Up/Down, while Home and End select boundaries. Previous/next controls, indicators and pointer swipe share the same structured change contract.
- Automatic rotation uses a restartable timer and stops for hover, focus-within, hidden documents, pointer drag and the library's Reduced Motion setting. An explicit play/pause control always lets users stop motion.
- The root exposes a named carousel region; slides expose group and slide semantics, inactive content becomes inert, picker controls identify their target, and a polite live region announces manual changes.
- `change`, reach-boundary, play/pause and drag lifecycle events include source metadata. The public instance exposes `previous`, `next`, `to`, `play`, `pause`, `getState`, active index and effective playback state.
- Root and component subpaths expose matching runtime, Props/Emits/Slots and related carousel types. Component center, static preview, standalone consumer, SSR, isolated CSS and packed installation remain synchronized.

P51 advances to 81 public components, 359 locale keys and generated coverage of 917 Props, 323 Events and 160 Slots. CI requires 24 visual baselines, 42 zero-violation Axe scenarios, 46 interactions per Chromium/Firefox/WebKit engine, 36 negative type assertions and 18 absolute performance ceilings.

## Time-range form orchestration (P52)

`UiTimeRangePicker` gives scheduling, service-window and availability forms a discoverable public component instead of requiring consumers to remember a range-picker mode:

```vue
<UiTimeRangePicker
  v-model="serviceWindow"
  :step="900"
  min="08:00"
  max="22:00"
  value-type="string"
/>
```

- The component specializes the strict date adapter in `time` mode while retaining string, `Date` and timestamp models, local/UTC/IANA time zones, DST disambiguation and minute/second/millisecond precision.
- Start/end native controls share a labelled group, FormItem description/error linkage, focus styling, Min/Max boundaries, optional cross-field constraints, one clear action and an announced inverted-range error.
- Controlled updates retain both values and emit structured `{ value, valid }` changes. Focus and blur identify the active endpoint; invalid events distinguish parsing from range-order errors.
- Schema Form now resolves `time-range` directly. It also presets `datetime` and `datetime-range`, while explicit field props may override preset mode where appropriate.
- Root/subpath runtime, Props/Emits/Slots, isolated CSS, generated API, component center, static preview, standalone consumer, SSR and packed installation stay synchronized.

P52 advances to 82 public components, 365 locale keys and generated coverage of 934 Props, 329 Events and 160 Slots. CI requires 25 visual baselines, 43 zero-violation Axe scenarios, 47 interactions per Chromium/Firefox/WebKit engine, 37 negative type assertions and 18 absolute performance ceilings.

## Discoverable date-time adapters (P53)

`UiDateTimePicker` and `UiDateTimeRangePicker` expose complete-instant form controls directly while reusing the mature strict date adapter:

```vue
<UiDateTimePicker v-model="publishAt" time-zone="UTC" precision="second" />
<UiDateTimeRangePicker v-model="releaseWindow" :step="900" />
```

- String, `Date` and timestamp representations round-trip with local, UTC or IANA time zones, explicit DST disambiguation and minute/second/millisecond precision.
- The range owns a labelled group, endpoint-specific focus metadata, shared Min/Max constraints, optional opposite-end constraint propagation, structured validity and accessible order-error feedback.
- Existing `mode="datetime"` and Schema Form mappings remain compatible; the dedicated components improve imports, generated API discovery and isolated-style consumption.
- Root/component subpaths, Props/Emits/Slots, component CSS, component center, static preview, standalone application, SSR and packed installation stay synchronized.

P53 advances to 84 public components, 365 locale keys and generated coverage of 965 Props, 341 Events and 160 Slots. CI requires 26 visual baselines, 44 zero-violation Axe scenarios, 48 interactions per Chromium/Firefox/WebKit engine, 39 negative type assertions and 18 absolute performance ceilings.

## Encoded QR lifecycle and SVG export (P54)

`UiQRCode` provides one reusable QR primitive for release links, login handoff, device pairing, payments and expiring credentials:

```vue
<UiQRCode
  :value="releaseUrl"
  level="H"
  color="#155EEF"
  status="expired"
  downloadable
  @refresh="issueNewReleaseUrl"
/>
```

- The matrix is generated from the real byte payload with standard L, M, Q or H error correction. SVG output uses crisp integer modules and a configurable quiet-zone margin rather than a decorative placeholder.
- Size, foreground/background color, border, caption and optional center icon are application controlled. Icon dimensions are capped; Q/H is recommended whenever modules are covered.
- Active, loading, expired, scanned and encoder-invalid states share localized live feedback. The expired action emits `refresh` without silently mutating consumer data.
- `download` emits the exact filename and serialized SVG; refs expose `refresh`, `download` and deterministic `toSvg`. Overlay, caption and actions Slots can replace presentation without replacing encoding.
- Accessible image naming, SSR-safe generation, root/subpath exports, isolated component CSS, generated API, component center, static preview, standalone application and installed-tarball consumption remain synchronized.

P54 advances to 85 public components, 372 locale keys and generated coverage of 979 Props, 344 Events and 163 Slots. CI requires 27 visual baselines, 45 zero-violation Axe scenarios, 49 interactions per Chromium/Firefox/WebKit engine, 41 negative type assertions and 18 absolute performance ceilings.
## Scanner-ready barcode lifecycle (P55)

- `UiBarcode` encodes real scanner-ready one-dimensional symbols for CODE128/39, EAN, UPC, ITF, MSI, Pharmacode and Codabar.
- Bounded geometry, quiet zones, human-readable text and deterministic crisp-edge SVG work in browsers and SSR. Active, loading, expired, scanned and invalid lifecycle states include localized feedback, refresh, download and typed instance contracts.
- Root/subpath exports, isolated CSS, generated API, component center, static preview, standalone consumer, installed tarball and browser test fixtures stay synchronized.

P55 advances to 86 public components and 379 locale keys. CI requires 28 visual baselines, 46 zero-violation Axe scenarios, 50 interactions per Chromium/Firefox/WebKit engine, 43 negative type assertions and 18 absolute performance ceilings.

## Validated Unix Cron scheduling (P56)

`UiCronEditor` supplies one reusable scheduling field for automation, report delivery and maintenance jobs:

```vue
<UiCronEditor
  v-model="schedule"
  time-zone="UTC"
  :from="releaseInstant"
  name="releaseSchedule"
/>
```

- Five-field Unix syntax accepts wildcard, lists, ranges and steps. Validation returns structured codes and the affected field instead of relying on a generic regular expression.
- Common presets remain controlled Cron strings. Custom presets can be supplied without changing form serialization or event contracts.
- The component previews bounded future runs in local time or UTC, applies Unix day-of-month/day-of-week OR semantics, and never mutates the source date.
- FormItem label/help/error associations, visible focus and invalid states, disabled/readonly modes, responsive container layout and localized live feedback are built in.
- Header, preset, preview and action Slots plus `validate`, `nextRuns`, `setExpression`, `applyPreset`, `focus` and `blur` instance methods cover product-specific composition.
- Root/subpath runtime, Props/Emits/Slots, isolated CSS, generated API, component center, static preview, standalone application, deterministic SSR and installed-tarball consumption remain synchronized.

P56 advances to 87 public components, 406 locale keys and generated coverage of 1,008 Props, 354 Events and 170 Slots. CI requires 29 visual baselines, 47 zero-violation Axe scenarios, 51 interactions per Chromium/Firefox/WebKit engine, 45 negative type assertions and 18 absolute performance ceilings.

## Structured key-value configuration (P57)

`UiKeyValueEditor` consolidates request headers, environment variables and record metadata into one controlled array contract. Consumers may remap the key/value/enabled/identity fields, keep unrelated domain metadata and receive immutable previous/current values for every add, remove, move, toggle, replace or import operation.

Validation covers empty and duplicate keys, key patterns, required values and row limits. Dotenv-style import supports replace/append modes while malformed input preserves the current value. FormItem association, native indexed names, container-responsive presentation, RTL, forced colors, reduced motion, Slots and the typed instance API work from both root and component subpath imports.

P57 advances to 88 public components, 431 locale keys and generated coverage of 1,035 Props, 366 Events and 174 Slots. CI requires 30 visual baselines, 48 zero-violation Axe scenarios, 52 interactions per Chromium/Firefox/WebKit engine, 47 negative type assertions, deterministic SSR, isolated installed-tarball consumption and 18 absolute performance ceilings.
