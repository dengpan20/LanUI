# Lan UI migration and compatibility policy

## Stable import boundary

Applications should import only documented Package Exports:

```js
import { UiButton, createLanUi } from 'lan-ui-design-system'
import UiButtonDefault, { UiButton as UiButtonNamed } from 'lan-ui-design-system/components/UiButton'
import { enUS } from 'lan-ui-design-system/config'
import { toast } from 'lan-ui-design-system/feedback'
import 'lan-ui-design-system/style.css'
```

Paths below `dist-lib/` are build details and may change without a major version. The package root and exported subpaths are the compatibility boundary.

## Moving from a source or monolithic import

1. Replace imports from `src/components/*.vue` or `dist-lib/*.js` with package exports.
2. Keep the root named import when several components are used together.
3. Use `components/UiXxx` when an application requires an explicit per-component entry.
4. Load `style.css` once at the application entry.
5. Replace page-local language and size constants with `createLanUi` or `UiConfigProvider`.

The root named export and the default/named component subpath exports reference the same runtime component.

## 1.18 rate contract

`UiRate` is additive. Use it for qualitative bounded scores; keep `UiSlider` for continuous quantities and ranges, and `UiRadio` for a small set of named choices.

```vue
<UiRate v-model="serviceRating" :step="0.5" show-text />
```

- The model is always a normalized number from zero through `max`; `step` is greater than zero and at most one.
- Pointer hover is preview-only. A click commits, and a second click on the selected value clears when `allowClear=true`.
- Arrow keys step once, Page keys step five times, Home/End jump to bounds, and Delete/Backspace clears.
- RTL mirrors horizontal Arrow and pointer direction. Up/Down remain logical increase/decrease controls.
- Use `readonly` when the rating should remain discoverable in the tab order; `disabled` removes it from keyboard navigation.
- Consumer `item` slots remain decorative. Do not add nested buttons or focusable content inside the component-owned slider target.

## 1.17 color picker and color runtime contract

`UiColorPicker` is additive. Use it for persisted theme, chart, status and brand color values; keep a closed `UiSelect` when users choose only named semantic tokens.

```vue
<UiColorPicker v-model="brandColor" format="hex" alpha show-contrast />
```

- `modelValue` is a color string. Supported input includes short/long HEX, RGB/RGBA, HSL/HSLA, percentages, alpha and the documented basic color names. The emitted model is normalized to `format`.
- `alpha=false` intentionally emits opaque output even when the incoming color contains alpha. Enable `alpha` before migrating an existing eight-digit HEX or RGBA model.
- Invalid committed text never reaches the model. Listen to `invalid` for telemetry or field-level messaging; the input restores the last valid display value.
- Pointer movement emits continuous `input`; pointer release, keyboard steps, range changes, text commit, presets and clear emit `change` with a `source` and previous model.
- The default popup is teleported and viewport-aware. Set `appendToBody=false` only when an ancestor supplies a suitable positioning/overflow context.
- Controlled popup consumers pass `open` and update it from `update:open`; `defaultOpen` is for uncontrolled initialization.
- Import pure helpers from `lan-ui-design-system/color`. They are SSR-safe and return `null`/empty output for invalid values instead of using a browser canvas as an implicit parser.

## 1.16 command palette contract

`UiCommandPalette` is additive. Use it for cross-page actions, navigation and searchable workspace commands; keep `UiAutoComplete` for form-field suggestions and `UiDropdown` for a small contextual action list.

```vue
<UiCommandPalette v-model="open" v-model:query="query" :commands="commands" @select="execute" />
```

- Every command requires a stable unique `key` and visible `label`; duplicate or missing keys emit `data-error` and are excluded from ambiguous output.
- The default `Ctrl/Cmd + K` shortcut can be replaced with normalized hotkey strings or disabled with `globalShortcut=false`.
- Remote providers receive `(query, { signal })`. Forward the signal, treat aborted work as expected cancellation and use `load-error` for operational telemetry.
- Controlled consumers must update `modelValue` and `query` from the matching update events. Selection emits the original command plus `{ source, query }` metadata.
- The palette owns dialog focus, scroll lock, overlay stacking and opener focus restoration. Avoid adding a second document-level focus trap or manual post-close focus timer.
- `closeOnSelect=false` supports multi-action workflows; `clearOnClose=false` preserves the last query. Custom command slots must retain the component-owned option button and ARIA structure.

## 1.15 tree contract

`UiTree` is additive. Use it for visible hierarchical resources, permission assignment and nested navigation; keep `UiTreeSelect` when the hierarchy belongs inside a compact form-field popup.

```vue
<UiTree v-model="selected" v-model:checked-keys="checked" :data="resources" checkable />
```

- Every node needs a stable, unique key. The defaults are `value`, `label` and `children`; set `nodeKey`, `labelKey` and `childrenKey` for an existing data model.
- Selection, expansion and checks support controlled props. When controlled, update the corresponding model from `update:*` events before the visual state changes.
- Non-strict checking cascades to enabled descendants and derives parent checked/mixed state. Set `checkStrictly=true` for independent permission toggles.
- Mark unloaded branches with `isLeaf:false`; `loadData(node, { signal })` then runs once until data changes. Existing `children` never trigger an extra request. Forward the signal to remote requests; failures emit `load-error` and expose an inline retry action.
- Filtering retains matching ancestor paths. For very large expanded trees, enable `virtual` and provide `height` plus the measured `itemHeight`.
- Arrow behavior follows inherited direction. In RTL, logical expand/collapse keys mirror while model ordering remains unchanged.

## 1.14 autocomplete contract

`UiAutoComplete` is additive. Use it for editable search fields that suggest local or remote values; keep `UiSelect` for a closed finite choice list.

```vue
<UiAutoComplete v-model="city" :options="cities" />
<UiAutoComplete v-model="project" :fetch-suggestions="searchProjects" :min-chars="1" />
```

- The default `allowCustom=true` commits typed text on Enter, Tab or blur. Set it to `false` when only an option value is valid.
- Option selection writes `option.value` while the input renders `option.label`; `change` metadata identifies option, clear and custom-text commits.
- A remote loader receives `{ signal }`; forward it to network requests. Superseded queries are aborted and late responses are ignored.
- Composition events delay search and model updates until IME text is committed.
- `appendToBody=true` is the default. The panel flips/shifts at viewport edges and inherits LTR/RTL start/end placement.

## 1.13 slider and range contract

`UiSlider` is additive. Use it when users need to select one numeric value or an ordered range visually while retaining keyboard and assistive-technology support.

```vue
<UiSlider v-model="completion" :step="5" :marks="{ 0:'0', 50:'50', 100:'100' }" />
<UiSlider v-model="budgetRange" range :min-distance="10" />
```

- Range mode emits an ordered `number[]`; `minDistance` prevents the thumbs from crossing the required gap.
- Arrow keys move one step, Page keys move ten steps, and Home/End move to bounds.
- Use an `aria-label`/`ariaLabel` array to name range thumbs when the control is outside `UiFormItem`.
- `vertical`, `reverse` and inherited RTL direction affect visual and Arrow-key direction without changing logical model ordering.

## 1.12 numeric input contract

Use `UiNumberInput` instead of `UiInput type="number"` when the value participates in calculations or needs step controls. The new component emits `number | null`, avoids binary floating-point drift during stepping and clamps finite bounds on commit by default.

```vue
<UiNumberInput v-model="amount" :min="0" :step="0.01" :precision="2" />
```

- `formatter` changes display only; pair it with `parser` so edited formatted text returns a number.
- `clampOnBlur=false` preserves out-of-range typed values, while control and keyboard stepping always respect bounds.
- The default `controlsPosition="sides"` provides full-height decrement/increment targets. Use `right` only for dense forms.
- Native number inputs previously emitted strings through `UiInput`; migrating to `UiNumberInput` intentionally changes the model to `number | null`.

## 1.11 public icons and isolated registries

String icon Props on Button, Menu, Input and other existing components remain compatible. Applications that imported the internal `AppIcon.vue` file should move to the public component boundary:

```vue
<UiIcon name="settings" :size="20" />
<UiIcon name="info" aria-label="More information" />
<UiIcon name="chevronRight" directional />
```

Use the application Plugin for tenant or product icons. Every `createLanUi()` call owns an isolated registry by default, so registering an icon on one application does not mutate another application or SSR request:

```ts
const lanUi = createLanUi({
  icons: { tenantMark: '<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/>' },
})
lanUi.registerIcon('featureMark', '<circle cx="12" cy="12" r="8"/>')
app.use(lanUi)
```

The root `registerIcon()` helper updates only the default registry used when components render without an installed Plugin. Pass `iconRegistry`, `icons`, or call `lanUi.registerIcon()` when a Plugin is installed. A nested `UiConfigProvider` may receive `iconRegistry` for a bounded override.

Custom bodies accept self-closing `path`, `rect`, `circle`, `line`, `polyline`, `polygon` and `ellipse` elements with whitelisted geometry/presentation attributes. Inline scripts, event attributes, links, styles and URL values are rejected. Existing built-ins cannot be removed unless `force:true` is explicit; replacement also requires `override:true`.

## 1.10 date/time value model

Existing string `v-model` usage remains the default and does not require migration. Applications that store domain instants can opt into typed values explicitly:

```vue
<UiDatePicker v-model="scheduledAt" mode="datetime" value-type="date" time-zone="Asia/Shanghai" />
```

`valueType='date'` emits `Date`; `valueType='timestamp'` emits Unix milliseconds; `valueType='string'` emits the native wall-time string. With `valueType='auto'`, the component infers from the first non-empty model value and preserves the legacy string behavior for empty models.

When converting `mode='time'` to a `Date` or timestamp, supply a stable `referenceDate` from the business record. The fallback `1970-01-01` is deterministic but usually not a meaningful domain date.

For IANA zones with daylight-saving transitions, choose an explicit `disambiguation`: `earlier` or `later` selects an overlap occurrence, `reject` blocks gaps and overlaps, and `compatible` follows common calendar behavior. Invalid zoned wall times emit `invalid-date-value` before mutating the model.

Utilities are available from the supported package boundary:

```ts
import { dateValueToDate, formatDateValue } from 'lan-ui-design-system/date'
```

## 1.6 application feedback isolation

Existing single-application code can continue to use the root `toast / notification` services. Multi-application, micro-frontend and SSR integrations should create an isolated Plugin and resolve services inside Vue `setup`:

```js
const lanUi = createLanUi({ isolated: true })
app.use(lanUi)

const toast = useToast()
```

Create one Plugin per SSR request and call `lanUi.dispose()` after rendering. A host-managed boundary can instead use `createLanUiFeedback()` and pass it to `createLanUi({ feedback })`; an explicitly supplied instance remains owned by the host and is not disposed by `plugin.dispose()`.

## 1.7 complete locale coverage

Default copy for Cascader, MultiSelect, TreeSelect, Steps, Transfer and accessible labels now comes from the active Locale. Existing explicit `placeholder`, `titles`, `ariaLabel`, rule `message` and business-copy Props retain precedence, so no consumer migration is required.

Custom Locale objects still merge over the named built-in base. Applications should add product-specific overrides only; omitted 1.7 keys fall back to the corresponding `zh-CN` or `en-US` message. Run `pnpm run test:locale` when maintaining a forked language pack to preserve key and interpolation parity.

## 1.8 Intl runtime and fallback chains

`createLanUi` and `UiConfigProvider` now accept `fallbackLocale`. The compatibility default remains `zh-CN`; international applications should set the intended product fallback explicitly:

```js
const lanUi = createLanUi({ locale: french, fallbackLocale: 'en-US' })
lanUi.setFallbackLocale(false) // strict missing-key behavior
```

Unknown locale strings previously normalized to the `zh-CN` locale object. They now retain their original name and an empty message map so Intl uses the requested regional rules while translation resolves through `fallbackLocale`. Code that reads `config.locale.name` for an unsupported locale should expect the requested name.

String messages remain compatible. Plural-aware messages may use an object with Intl plural categories or exact keys such as `=0`; call `tc(key,count)`. `createLocaleTools` exposes the same translation and formatting operations outside Vue setup. Visible counters in Badge, ListToolbar, Pagination, Progress, Transfer and Upload now follow the active numbering system.

## 1.9 locale registries and lazy language packs

The single `fallbackLocale` value remains valid. Applications may now provide an ordered chain; the first matching message wins:

```js
const lanUi = createLanUi({
  locale: 'fr-CA',
  fallbackLocale: ['fr-FR', 'en-US'],
})
```

Each `createLanUi()` call owns a locale registry seeded with `zh-CN` and `en-US`. Register a synchronously available pack or load a split chunk before activation:

```js
lanUi.registerLocale(french, ['fr'])
await lanUi.loadLocale(
  'ja-JP',
  () => import('./locales/ja-JP.js'),
  { aliases: ['ja'], activate: true },
)
```

Concurrent `loadLocale()` calls for the same missing name share the same Promise. A rejected loader is removed from the pending map and can be retried. Existing registered entries are returned without invoking the loader unless `{ force:true }` is used.

The default registry exported from `lan-ui-design-system/config` supports scripts and single-application utilities. Multi-app, micro-frontend and SSR code should keep the per-plugin default or pass an explicit `localeRegistry`; sharing the exported default registry across requests also shares its registered languages.

## Semantic Versioning rules

- Patch: styling or behavior correction that preserves documented Props, events, slots and exports.
- Minor: additive component, optional Prop, new event/slot, locale message or subpath.
- Major: removing or renaming an export, Prop, event or slot; changing a default that alters normal behavior; narrowing an accepted value type.
- Deprecated APIs remain available for at least one minor release and must include a replacement path in this file.

## Public API review workflow

```powershell
pnpm run api:generate
git diff -- api-manifest.json CHANGELOG.md MIGRATION.md
pnpm run ci
pnpm pack
```

`api-manifest.json` records root runtime/type exports, Package Exports, every component's Props fields and default/named runtime exports. CI fails when the built package differs from the committed manifest.

Tooling may import the published manifest from `lan-ui-design-system/api-manifest`; the `.json`-suffixed compatibility subpath is also exported.

## Direction and component-scoped styles

Direction is additive and defaults to `ltr`. Configure it globally or at a module boundary:

```js
app.use(createLanUi({ direction: 'rtl' }))
```

```vue
<UiConfigProvider direction="rtl">
  <ApplicationModule />
</UiConfigProvider>
```

Horizontal Tabs, Segmented, Menu, TreeSelect and Cascader use logical arrow-key behavior. Teleported overlays receive the configured `dir`. Drawer accepts `start` / `end`, and Table columns accept logical `fixed`, `start` and `end` fields; the existing physical `left` / `right` values remain supported.

Applications may keep the complete stylesheet or switch individual imports:

```js
import UiButton from 'lan-ui-design-system/components/UiButton'
import 'lan-ui-design-system/styles/UiButton.css'
```

Every component stylesheet imports `styles/core.css`, which includes Tokens and the minimal shared baseline. Do not combine `style.css` and component-scoped styles in the same entry unless duplicate CSS is intentionally accepted. `style-manifest.json` records every supported style subpath and its generated byte size.

Run `pnpm run visual:update` only after reviewing intentional visual changes. Normal CI uses `pnpm run test:visual` and writes differences under `.verify/visual-diff/<platform>`.

## Accessibility semantics in 1.2

Version 1.2 adds optional Props and corrects invalid references without removing an existing API:

- `UiCard.titleTag` selects the page-appropriate `h2`–`h6`; the default remains `h3`.
- `UiProgress.label` supplies the progressbar accessible name. When omitted, the active locale provides “Progress” or “进度”.
- Navigation-only `UiTabs` (`panels=false`) omits `aria-controls`. Select-family controls expose `aria-controls` only while their popup exists.
- Drawer keeps the same slots, Props and CSS classes while its dialog host changes from `aside` to role-compatible `section`.
- Text brand colors are separated from solid brand fills. Custom themes should define `brand-text`, `danger-solid` and `danger-solid-hover`, plus dark semantic surface Tokens when overriding status colors.

Run the browser-level accessibility gate after changing component markup or theme colors:

```powershell
pnpm run test:a11y
```

The gate fails on automatically determined Axe violations. Incomplete checks remain in `.verify/accessibility/<platform>` for explicit manual review.

## Interaction and performance contracts in 1.3

Version 1.3 is additive. Existing `UiFormItem` layout remains compact by default. Set `reserveMessageSpace` when a workflow should retain one message line before help or error text appears:

```vue
<UiFormItem label="Account name" name="name" reserve-message-space>
  <UiInput v-model="form.name" />
</UiFormItem>
```

`UiForm` now protects the pointer submission sequence from blur-validation layout changes. A corrected invalid form therefore submits with one click; applications no longer need to trigger submission a second time. Popconfirm focus transfer also works when `prefers-reduced-motion: reduce` is active.

Run both browser behavior and deterministic package budgets after changing interactive markup, focus timing, component dependencies or shared styles:

```powershell
pnpm run test:interaction
pnpm run test:performance
```

Interaction results are written to `.verify/interaction/<platform>/report.json`. Performance results are written to `.verify/performance/report.json`. Tooling may read the published budgets from `lan-ui-design-system/performance-budgets` or the `.json` compatibility subpath. Increasing a budget requires a reviewed `performance-budgets.json` change and corresponding release note.

## Cross-browser focus behavior in 1.4

Version 1.4 preserves all public Props, events, slots and exports. Modal, Drawer and Popconfirm now share resilient focus transfer so pointer-opened overlays restore to their real trigger in Chromium, Firefox and WebKit.

WebKit may leave `document.activeElement` on the previously focused control after a pointer click. Lan UI records the fresh pointer opener and uses it only during the immediate overlay-open window; keyboard-opened overlays continue to use the active control. Applications should not add delayed manual trigger focus after closing these overlays, because that can override a newly selected focus target.

Install the Playwright engines once, then run the full matrix:

```powershell
pnpm exec playwright install chromium firefox webkit
pnpm run test:interaction:cross-browser
```

Use `pnpm run test:interaction:non-chromium` when Chromium is already covered by a separate visual/accessibility job. Per-engine evidence is written to `.verify/interaction/<platform>/<browser>.json`, with the combined result at `report.json`.

## Typed Emits and Slots in 1.5

Version 1.5 adds type information without removing runtime APIs. Every component now exports three public contracts from both root and component subpaths:

```ts
import UiTable from 'lan-ui-design-system/components/UiTable'
import type { UiTableProps, UiTableEmits, UiTableSlots } from 'lan-ui-design-system/components/UiTable'
```

Listener callbacks, `InstanceType<typeof UiXxx>['$emit']` and scoped slots now receive their actual payload types. Existing consumers using correct runtime payloads require no changes. TypeScript may now report callbacks that previously relied on an incorrect payload, unknown component sizes, or invalid scoped-slot fields.

`api-manifest.json` advances to schema 2 and adds `emitsType`, `emits`, `slotsType` and `slots` for every component. Manifest consumers should accept schema 2 before upgrading. Dynamic slots use wildcard entries such as `cell-*`, `panel-*` and `item-*`.

`UiDropdown.offset` was already a runtime Prop and is now present in `UiDropdownProps`; this is a type-only compatibility fix. Run the strict consumer gate after extending any public component:

```powershell
pnpm run test:types
pnpm run api:check
```

## Public registry boundary

The current package is marked `private` and `UNLICENSED` for internal distribution. Before publishing to a public registry, select the intended source-code license, remove `private`, configure registry provenance and run the external tarball consumer verification documented in the release record.
