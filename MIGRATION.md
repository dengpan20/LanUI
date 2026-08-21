# Lan UI migration and compatibility policy

## 1.62 dropdown compatibility

There are no breaking changes. Existing `<UiDropdown v-model="open" :items="items">...</UiDropdown>`, `placement`, `disabled`, `closeOnOutside` and Click behavior remain valid:

```vue
<UiDropdown v-model="open" v-model:active-index="activeIndex" :items="actions" placement="bottom-start">...</UiDropdown>
```

- `modelValue` remains controlled and omitted models now support `defaultOpen`; `activeIndex` / `defaultActiveIndex` provide the same controlled/uncontrolled split for roving focus.
- `trigger` accepts Click, Hover, Focus, Contextmenu, Manual or an array. Independent Hover/Focus reasons and cancellable delays keep the menu open while moving between trigger and teleported panel.
- Arrow Up/Down, Home/End, PageUp/PageDown, incremental Typeahead, Enter/Space, Escape and logical Tab navigation skip headings, dividers and disabled items. `loop` can be disabled for bounded navigation.
- Items may declare stable keys, descriptions, shortcuts, danger styling, links and `menuitemcheckbox` / `menuitemradio` checked state. Existing label/icon/divider records continue to render unchanged.
- Outside, Escape and selection dismissal are independent; trigger ARIA attributes merge and restore on unmount. Portal target, width bounds, logical placement, collision handling, RTL, SSR and exposed focus/select/position methods have matching root and subpath declarations.

## 1.61 popover compatibility

There are no breaking changes. Existing `<UiPopover v-model="open">...</UiPopover>`, `placement`, `width`, `title`, `offset` and `closeOnOutside` usage remains valid; Click stays the default trigger:

```vue
<UiPopover v-model="open" title="Release actions" placement="bottom-start" auto-focus trap-focus>...</UiPopover>
```

- `modelValue` is controlled; an omitted model uses `defaultOpen`. `trigger` accepts Click, Hover, Focus, Manual or an array, and Hover/Focus reasons remain active while moving between the trigger and teleported panel.
- `showDelay` and `hideDelay` cancel stale timers. Outside pointer, Escape and optional content-click dismissal publish a stable source and resolved placement through `open-change`, `open` and `close` metadata.
- `autoFocus` moves focus to the first panel action, `trapFocus` optionally loops Tab within interactive content, and `returnFocus` restores the trigger after keyboard or explicit content dismissal. These policies remain opt-in for non-modal popovers.
- Trigger `aria-expanded`, `aria-controls`, `aria-haspopup` and disabled semantics merge with consumer attributes and restore on unmount. Panel title or `ariaLabel`, busy state and role provide explicit assistive-technology relationships.
- `arrow`, width bounds, logical placement, custom Portal target, inline rendering, z-index, title/footer/arrow Slots and exposed show/hide/toggle/focus/update methods have matching root and component-subpath declarations.

## 1.60 tooltip compatibility

There are no breaking changes. Existing `<UiTooltip content="Help">...</UiTooltip>`, `placement`, `disabled` and `offset` usage remains valid; Hover + Focus stay the default triggers:

```vue
<UiTooltip v-model:open="open" trigger="click" placement="bottom-start" wrap :max-width="240">...</UiTooltip>
```

- `trigger` accepts Hover, Focus, Click, Manual or an array. Hover and Focus reasons are tracked independently, so moving between pointer and keyboard interaction does not flicker or close prematurely.
- `open` is controlled; `defaultOpen` is uncontrolled. `update:open`, `open-change`, `show` and `hide` publish source and resolved-placement metadata without changing the existing default Slot.
- `showDelay` and `hideDelay` cancel stale timers on re-entry. Click mode can dismiss on outside pointer actions; every visible mode can dismiss with Escape unless explicitly disabled.
- `arrow`, `wrap`, `maxWidth`, `appendToBody`, `teleportTo`, `tooltipId` and `zIndex` are presentation/integration controls. Logical start/end placements coexist with the legacy top-left/top-right values.
- The component attaches `aria-describedby` only while visible, preserves consumer descriptions, and suppresses disabled or empty content. `content` and `arrow` Slots plus show/hide/toggle/focus/update instance methods have matching root and component-subpath declarations.

## 1.59 breadcrumb compatibility

There are no breaking changes. Existing `<UiBreadcrumb :items="items" />`, `separator`, `ariaLabel` and `navigate(item)` handlers remain valid; long-path behavior is opt-in:

```vue
<UiBreadcrumb v-model:expanded="expanded" :items="path" :max-items="4" truncate />
```

- Stable keys default to `item.key`; key, label, href, icon, disabled and current values accept string or function field adapters. A string `to` remains a native-link fallback for existing router-oriented records.
- The last item remains the default current page. `currentKey` or an item current field can select another record without mutating consumer data.
- Native anchors retain their href and secure `_blank`; callback or opt-in interactive items use native buttons. Disabled/current items remain readable but leave the navigation and activation path.
- `navigate` keeps the item as its first argument and appends stable metadata plus the source event. `item-click`, `item-focus`, `update:expanded` and `expand-change` let consumers separate routing, analytics, focus and disclosure state.
- `maxItems` values of three or more enable a disclosure item. `itemsBeforeCollapse` and `itemsAfterCollapse` retain path context; `expanded` is controlled and `defaultExpanded` is uncontrolled. Focus moves to the first revealed actionable item after keyboard expansion.
- `sm`/`md`/`lg`, icon/text/custom separators, wrapping, horizontal overflow, truncation, loading and empty states are presentation choices. Root and `components/UiBreadcrumb` imports expose matching Props, Emits, Slots and instance types with isolated styling at `styles/UiBreadcrumb.css`.

## 1.58 steps compatibility

There are no breaking changes. Existing `<UiSteps :items="items" :current="current" />` usage remains valid; navigation is opt-in:

```vue
<UiSteps v-model="current" :items="steps" type="navigation" linear />
```

- `current` remains a supported controlled compatibility prop. `modelValue` takes precedence when supplied; otherwise an omitted `current` uses `defaultCurrent` and updates internal state.
- Stable keys default to `item.key`; item key, title, description, subtitle, status, icon and disabled field adapters accept existing domain records without reshaping them.
- `interactive` or `type="navigation"` renders native buttons. `change`, `item-click` and `item-focus` publish stable index/key/item/source metadata; exposed focus, previous, next and go-to methods support application workflows.
- `linear` permits completed/current stages and the next available stage while rejecting later jumps. Roving Arrow/Home/End navigation skips disabled stages, loops only when requested and follows RTL logical direction.
- Dedicated connector elements no longer depend on remaining title width. Horizontal, vertical, responsive and label-placement choices preserve ordered-list identity. Root and `components/UiSteps` imports expose matching Props, Emits, Slots and instance types with isolated styling at `styles/UiSteps.css`.

## 1.57 timeline compatibility

There are no breaking changes. Existing `<UiTimeline :items="items" />` usage remains valid; richer state and interaction are opt-in:

```vue
<UiTimeline v-model="stage" :items="stages" selectable time-position="opposite" pending />
```

- Stable keys default to `item.key`; `itemKey` and the title, description, time, datetime, status, color, icon, link and disabled field adapters support existing domain records without data reshaping.
- `selectable` supports controlled `modelValue` or uncontrolled `defaultValue`. `change`, `activate`, `item-click` and `item-focus` publish stable item/source metadata, while exposed focus/select methods support application workflows.
- Vertical and horizontal direction, start/end/alternate placement, opposite/content time and solid/dashed/dotted/hidden connectors are presentation choices that do not alter item identity. Arrow keys and Home/End use roving focus, skip disabled records and respect RTL.
- Links use native anchors and protect `_blank`; selectable/interactive records use native buttons. Pending, Loading and Empty retain ordered-list semantics and localized status copy. Root and `components/UiTimeline` imports expose matching Props, Emits, Slots and instance types with isolated styling at `styles/UiTimeline.css`.

## 1.56 tag compatibility

There are no breaking changes. Existing `<UiTag color="green" dot>Ready</UiTag>` usage and direct `.tag` styling keep their current markup contract; richer behavior is opt-in:

```vue
<UiTag checkable :checked="selected" @update:checked="selected = $event">Ready</UiTag>
<UiTag closable @close="removeTag">Draft</UiTag>
```

- `checkable` and `interactive` render a native button, while `href` renders a native anchor. Checkable state remains consumer controlled through `checked` and `update:checked`.
- `closable` adds a separate localized close action. Consumers remove the item after `close`; the component does not mutate application collections.
- `_blank` links receive `noopener noreferrer` unless `rel` is supplied. Disabled links lose navigation and tab order, and disabled buttons use native semantics.
- `type` remains a supported legacy color alias and takes precedence over `color`. Root and `components/UiTag` imports expose matching Props, Emits, Slots and instance types, with isolated styling at `styles/UiTag.css`.

## 1.55 card compatibility

There are no breaking changes. Existing `<UiCard title="…">…</UiCard>` and class-based card layouts keep their current structure and can adopt richer behavior incrementally:

```vue
<UiCard title="Order" variant="outlined" interactive @activate="openOrder">
  Order summary
</UiCard>
```

- `interactive` makes a non-link root keyboard operable with Enter/Space and publishes `activate` metadata. Nested links, buttons and form controls keep their own action and do not activate the card.
- `href` renders an anchor; `_blank` links receive `noopener noreferrer` unless `rel` is supplied. `disabled` and `loading` suppress activation and remove non-native cards from the tab order.
- `title`, `subtitle`, heading and description IDs provide the accessible card name and description. Custom headers should supply `ariaLabel`, `ariaLabelledby`, or a title Slot.
- Root and `components/UiCard` imports expose matching Props, Emits, Slots and instance types, with isolated styling at `styles/UiCard.css`.

## 1.54 page-header compatibility

There are no breaking changes. Existing page-specific headings can be migrated incrementally:

```vue
<UiPageHeader title="Orders" :breadcrumbs="items" show-back bordered>
  <template #actions><UiButton>Create order</UiButton></template>
</UiPageHeader>
```

- Keep exactly one page-level `h1` by default; use `titleTag` only when the surrounding document outline requires another semantic level.
- `back` emits pointer or keyboard source metadata and an optional `backHref`. Consumer routing remains explicit; a disabled back control is removed from tab order.
- `stickyOffset` accepts a number in pixels or a CSS length. Reduced-motion contexts change the exposed default `scrollIntoView` behavior from smooth to immediate.
- Breadcrumb landmarks receive a page-specific accessible label. Root and `components/UiPageHeader` imports expose matching Props, Emits, Slots and instance types, with isolated styling at `styles/UiPageHeader.css`.

## 1.53 key-value editor compatibility

There are no breaking changes. Configuration, integration and deployment forms can adopt the component incrementally:

```vue
<UiKeyValueEditor v-model="headers" name="headers" :max-rows="12" require-value />
```

- The public model remains an array of consumer-owned records. `keyField`, `valueField`, `enabledField` and `itemKey` adapt existing domain shapes without rewriting them, while every update returns fresh records.
- Duplicate comparison is case-insensitive by default. `allowDuplicateKeys`, `allowEmptyKey`, `requireValue`, `caseSensitive` and `keyPattern` make validation policy explicit; invalid input remains editable and emits structured row/field errors.
- `importText` parses dotenv-style lines using the configurable separator and either replaces or appends. Malformed lines and min/max violations preserve the current model and emit typed invalid/limit metadata.
- `name` renders indexed nested controls for native submission. Root and `components/UiKeyValueEditor` imports expose matching Props, Emits, Slots and instance types, with isolated styling at `styles/UiKeyValueEditor.css`.

## 1.52 Cron editor compatibility

There are no breaking changes. Scheduler, reporting and automation forms can adopt the component incrementally:

```vue
<UiCronEditor v-model="schedule" time-zone="UTC" name="schedule" />
```

- `modelValue` remains a plain five-field Unix Cron string. Default or custom presets emit the same serialized value through controlled updates.
- Syntax validation covers wildcard, number, list, range and step fields. Unsupported aliases, Quartz fields or out-of-range values stay visible and emit a structured `invalid` payload.
- `timeZone` is deliberately limited to `local` or `UTC`; applications that require an IANA-zone scheduler should calculate server execution policy separately rather than infer it from a browser preview.
- Root and `components/UiCronEditor` imports expose matching Props, Emits, Slots and instance types, with isolated styling at `styles/UiCronEditor.css`.

## 1.51 barcode compatibility

There are no breaking changes. Asset, inventory, logistics and ticket workflows can add the new component incrementally:

```vue
<UiBarcode value="LAN-UI-151" format="CODE128" status="active" downloadable />
```

- `value` is encoded into a real scanner-ready module stream. Select the symbology required by the receiving system and preserve an adequate `margin` quiet zone.
- `status` controls lifecycle presentation. Expired refresh stays consumer-controlled; invalid content produces a localized alert and `error` event.
- SVG download serializes the same module path. Root and `components/UiBarcode` imports expose matching Props, Emits, Slots and instance types, with isolated styling at `styles/UiBarcode.css`.

## 1.50 QR code compatibility

There are no breaking changes. Products can add the new component incrementally:

```vue
<UiQRCode
  value="https://example.com/release/1.50.0"
  level="H"
  status="active"
  downloadable
/>
```

- `value` is encoded into a real byte-mode matrix. Choose `Q` or `H` when a center icon obscures modules, and preserve a quiet-zone `margin` for reliable scanning.
- `status` changes presentation only; `expired` emits `refresh`, while the application remains responsible for issuing and replacing the encoded value. `download` exports deterministic SVG rather than rasterizing the screen.
- Existing image, canvas and barcode implementations are unaffected. Root and `components/UiQRCode` imports expose matching Props, Emits, Slots and instance types, with isolated styling at `styles/UiQRCode.css`.

## 1.49 date-time adapter compatibility

There are no breaking changes. Existing `UiDatePicker mode="datetime"`, `UiDateRangePicker mode="datetime"` and Schema Form `datetime` / `datetime-range` consumers retain their behavior. New direct forms can use discoverable adapters:

```vue
<UiDateTimePicker v-model="publishAt" time-zone="UTC" />
<UiDateTimeRangePicker v-model="releaseWindow" :step="900" />
```

- Both adapters retain the strict shared `string`, `Date` and timestamp model, local/UTC/IANA zones, DST disambiguation, precision, Min/Max, clear, focus and validation contracts.
- The range component defaults to opposite-end constraints; set `constrain=false` when an inverted intermediate value must remain observable through `change.valid=false` and `invalid.code='range-order'`.
- Root and `components/UiDateTimePicker` / `components/UiDateTimeRangePicker` imports expose matching Props, Emits and Slots. Isolated styles are available under the corresponding `styles/*.css` subpaths.

## 1.48 time-range compatibility

There are no breaking changes. Existing `UiDateRangePicker mode="time"` consumers continue to work; new scheduling forms can use the dedicated public wrapper:

```vue
<UiTimeRangePicker v-model="serviceWindow" :step="900" min="08:00" max="22:00" />
```

- The value remains a two-entry array and keeps the same `string`, `Date` or timestamp representation selected by `valueType`.
- `constrain=true` narrows each endpoint using the opposite value. Set it to `false` when temporarily inverted input should be emitted with `change.valid=false` and `invalid.code='range-order'`.
- Schema Form accepts `time-range`, `datetime` and `datetime-range` as built-ins. Existing `date`, `time` and `date-range` definitions retain their behavior.
- Root and `components/UiTimeRangePicker` imports expose matching Props, Emits and Slots; isolated styling is available at `styles/UiTimeRangePicker.css`.

## 1.47 carousel compatibility

There are no breaking changes. Announcement, onboarding, media and release-summary screens can add the new carousel incrementally:

```vue
<UiCarousel v-model="active" :items="slides" indicators="lines" autoplay />
```

- The model is a zero-based numeric index. Use `defaultIndex` for uncontrolled usage; controlled consumers update `modelValue` from `update:modelValue` as with the rest of the library.
- Existing item records are retained in `change` metadata. Provide `itemKey` when records do not expose `key`, `value` or `id`, and use the `item` Slot for application rendering.
- Autoplay pauses on hover, focus, document visibility and Reduced Motion by default. Keep `showPlayControl` enabled whenever automatic rotation is requested so users can stop it explicitly.
- RTL mirrors logical horizontal Arrow and swipe direction. Vertical mode uses Up/Down; Home/End select the first/last slide in either orientation.
- Root and `components/UiCarousel` imports expose matching Props, Emits, Slots, instance, item, change and state types; isolated styling is available at `styles/UiCarousel.css`.

## 1.46 query builder compatibility

There are no breaking changes. Search, reporting and policy screens can add the recursive builder directly or through Schema Form:

```vue
<UiQueryBuilder v-model="filters" :fields="fields" show-not :max-depth="3" />
```

- The public value is a `UiQueryGroup` containing rules or nested groups. Updates are immutable; keep stable optional IDs when a server or audit log addresses individual nodes.
- Built-in two-value operators store their bounds in `value` and `value2`. Multi-value operators store an array in `value`.
- Field `type` chooses the default editor. Limit an individual field with `operators`, or pass component-level custom operators with an optional `test` function for `matches(record)`.
- Set `emitIds=false` when persistence must omit internal IDs. Use `name` for native form submission and `type:'query-builder'` for built-in Schema Form resolution.
- Root and `components/UiQueryBuilder` imports expose matching Props, Emits and Slots. The component subpath additionally exports the related query field, rule, group, operator, validation and instance types; isolated styling is available at `styles/UiQueryBuilder.css`.

## 1.45 input tag compatibility

There are no breaking changes. Multi-value form fields can add the new token editor directly or through Schema Form:

```vue
<UiInputTag v-model="capabilities" editable clearable :separators="[',', '，', ';', '；']" />
```

- The public model is always a string array. Candidates are normalized with Unicode NFKC, trimmed by default and compared case-insensitively unless `caseSensitive` is enabled.
- `validate` and `beforeAdd` may return booleans, localized error strings or Promises. Add requests are serialized, so asynchronous rules retain the original input and paste order.
- Backspace selects a tag before removal; Delete removes the current selection; Enter/F2 edits when `editable` is set. Horizontal Arrow behavior follows logical direction under RTL.
- Use `name` to submit one hidden control per tag. FormItem association and Schema Form `type:'input-tag'` resolution are built in.
- Root and `components/UiInputTag` imports expose matching Props, Emits and Slots declarations, and isolated styling is available at `styles/UiInputTag.css`.

## 1.44 mentions compatibility

There are no breaking changes. Collaboration, issue and document flows can add the new multiline mention editor:

```vue
<UiMentions v-model="comment" :options="options" :triggers="['@', '#']" @select="trackMention" />
```

- Existing textarea models remain plain strings. The component replaces only the active trigger/query range and appends one space by default; set `suffix` or `formatMention` when a product stores another token format.
- Rich options may scope themselves to a trigger. Async loaders receive `{ trigger, signal }`; honor the AbortSignal when possible, although stale completions are ignored even when a transport does not cancel.
- Query recognition requires whitespace or an opening delimiter before a trigger, preventing ordinary email addresses from opening the menu. Use `allowSpaces`, `minChars` and `validateSearch` for product-specific token rules.
- The native textarea keeps textbox semantics inside a labelled combobox owner. Do not override its generated ARIA ownership; provide `aria-label` only when no `UiFormItem` label is present.
- Root and `components/UiMentions` imports expose matching Props, Emits and Slots declarations, and isolated styling is available at `styles/UiMentions.css`.

## 1.43 OTP input compatibility

There are no breaking changes. Verification, MFA and approval flows can add the new segmented input:

```vue
<UiOtpInput v-model="code" :length="6" mode="numeric" autocomplete="one-time-code" @complete="verify" />
```

- The public model is always a string. Full-width input is normalized with NFKC, filtered by `mode` and limited to `length` before events are emitted.
- Keep `autocomplete="one-time-code"` for mobile code suggestions. Only the first visual cell receives that value; use `name` when native form submission needs one canonical successful control.
- Pasting or autofilling multiple characters distributes them from the active cell. Arrow direction mirrors in RTL; Home/End, Backspace and Delete follow ordinary segmented-input editing behavior.
- `mask` affects presentation only. `complete` fires when every segment is filled; `input` and `change` also report the source and active index.
- Root and `components/UiOtpInput` imports expose matching Props, Emits and Slots declarations, and isolated styling is available at `styles/UiOtpInput.css`.

## 1.41 typography compatibility

There are no breaking changes. Applications can consolidate semantic release notes, configuration values and instructional text:

```vue
<UiTypography v-model:content="summary" variant="paragraph" :ellipsis="{ rows:2, expandable:true }" :editable="{ trigger:'both' }" copyable />
```

- `content` works with the default Slot; use `copyable:{ text }` when the copied canonical value differs from rendered text.
- `ellipsis` defaults to one line for text and two for paragraphs; expansion is rendered only when measurement finds overflow. Controlled `expanded` and `editing` continue to emit their update events.
- Single-line editing saves with Enter, paragraph editing with Ctrl/Cmd+Enter; Escape restores the original value. Optional `submitOnBlur` is disabled by default.
- Root and `components/UiTypography` imports expose matching Props, Emits and Slots declarations and the component-specific stylesheet is available at `styles/UiTypography.css`.

## 1.40 splitter compatibility

There are no breaking changes. Resizable editor and workbench layouts can add the new public component:

```vue
<UiSplitter v-model="sizes" :panels="panels" lazy>
  <template #panel="{ panel }">{{ panel.label }}</template>
</UiSplitter>
```

- `modelValue` and update events use normalized percentages. Panel default and constraint fields accept numeric pixels, pixel strings or percentage strings.
- Use stable panel keys. Resizing changes only adjacent panels; `resizable:false` locks a pair and `disabled` locks the entire component.
- Keyboard users can resize on separators with Arrow keys and Home/End. Enter and double click toggle the nearest `collapsible` panel.
- `lazy=true` changes only commit state on pointer release. The `resize` event still reports preview sizes for overlays or status text.
- Horizontal behavior mirrors under RTL. SSR emits deterministic markup, and print output hides the resize controls while retaining content.

## 1.39 affix compatibility

There are no breaking changes. Long pages and bounded work areas can add sticky actions with the new public component:

```vue
<UiAffix :target="() => scrollArea" position="top" :offset="12">
  <UiButton variant="primary">Save changes</UiButton>
</UiAffix>
```

- Omitting `target` binds to the window. A selector, Element or factory binds to a custom scroll container; an invalid target emits `error` and falls back to the window.
- A custom scroll target is also the default `boundary`. Set a distinct `boundary` to stop the fixed content at another container edge.
- `position="top"` and `position="bottom"` use viewport-relative offsets. The placeholder preserves layout while the child is fixed, and `disabled` immediately restores normal document flow.
- Width, left position, height and boundary geometry refresh on resize and observed size changes. Call `update()` after programmatic layout changes or `updateRoot()` after replacing target nodes.
- SSR emits the stable wrapper and slot content without resolving selectors, installing listeners or touching browser globals.

## 1.38 watermark compatibility

There are no breaking changes. Protected content regions can use the new public component:

```vue
<UiWatermark
  :content="['Lan UI', 'INTERNAL']"
  :gap="[80, 64]"
  :font="{ fontSize:14, color:'rgba(37,99,235,.16)' }"
>
  <article>Release evidence</article>
</UiWatermark>
```

- `image` has priority; when loading or Canvas export fails, supplied `content` remains as the fallback mark.
- The overlay always uses `pointer-events:none`. Existing links, controls, focus order and selection inside the default Slot remain available.
- `observe=true` restores a removed or modified overlay and emits `remove` with `removed` or `modified`; set it to `false` only when the host owns DOM integrity.
- SSR produces the stable container and protected content. Canvas and MutationObserver work begins after client mount.
- Component refs may use `UiWatermarkInstance` for `update`, `patternUrl` and the resolved render `mode`.

## 1.37 product tour compatibility

There are no breaking changes. Applications can add target-aware onboarding with the new public component:

```vue
<script setup>
import { ref } from 'vue'
import { UiTour } from 'lan-ui-design-system'
const open = ref(false)
const current = ref(0)
const steps = [{ target:'#create', title:'Create', description:'Start a draft.' }]
</script>
<template><UiTour v-model="open" v-model:current="current" :steps="steps" /></template>
```

- A masked step is modal and locks document scrolling; `mask=false` leaves the page non-modal and scrollable.
- Targets accept selectors, Elements, Vue public instances or factories. A missing target emits `target-missing` and centers the panel.
- If an application previously called the internal overlay manager, its third argument is now an optional `{ lockScroll }` object; existing two-argument calls retain modal locking.
- Component refs may use `UiTourInstance` for `next`, `previous`, `goTo`, `finish`, `close` and `update`.

## 1.36 runtime and release compatibility

There are no component API or runtime breaking changes. Independent projects gain an explicit runtime and release boundary:

- Use Node `^20.19.0 || >=22.12.0`; CI validates 20.19.0, 22.12.0 and the current 24 line.
- The repository pins pnpm `10.34.0`, whose supported Node range includes all three tested lines; avoid selecting pnpm 11 when running this compatibility floor.
- Run `pnpm run test:compatibility` to repeat unit, library-build and isolated packed-consumer checks on a supported runtime.
- Run `pnpm run test:release` before tagging. A release tag must exactly equal `v` plus `package.json.version`.
- `v1.36.0` builds `lan-ui-design-system-1.36.0.tgz`, a SHA-256 sidecar and an artifact attestation before creating the GitHub Release.
- npm publication remains a separate maintainer decision; the release workflow publishes GitHub artifacts only.

## 1.35 packed distribution boundary

There are no component runtime breaking changes. Source/workspace consumers can move to the exact artifact used by release validation:

```bash
pnpm run pack:artifact
pnpm add ./artifacts/lan-ui-design-system-1.35.0.tgz
```

- Replace internal `dist-lib/*` imports with root or documented component/utility/style Package Exports.
- `lan-ui-design-system/tokens.css` is now a supported Token-only stylesheet export.
- The package is MIT licensed and carries public registry/provenance metadata. Publication is still an explicit maintainer action.

## 1.33 generated API documentation

There are no component runtime breaking changes in this release.

- API manifest consumers should accept schema 3. Existing `props`, `emits` and `slots` name arrays remain available; use `propDetails`, `emitDetails`, `slotDetails` and `imports` for documentation tooling.
- Run `pnpm run api:generate` after changing a public declaration, runtime prop/default, event, slot, component registry entry or documentation category. Commit `api-manifest.json`, `COMPONENT-API.md`, `src/generated/component-api.json` and `public/component-api.json` together.
- Run `pnpm run api:check` in downstream validation when generated documentation is mirrored. The command is deterministic and exits non-zero on byte drift.
- The showcase route `#/api?component=UiButton` is a stable documentation deep link. Custom hash routers should resolve the path before the query, matching the updated host shell.

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

## 1.32 motion preferences

The release is additive and keeps existing transition Token names. Applications can opt into a persistent document-level preference and still override individual subtrees:

```ts
import { createMotionController } from 'lan-ui-design-system/motion'

const motion = createMotionController({ preference: 'system', storageKey: 'app-motion' })
motion.mount(document.documentElement)
```

```vue
<UiConfigProvider motion="reduced">
  <UiPopover title="Settings">This portal inherits reduced motion.</UiPopover>
  <UiConfigProvider motion="full">A deliberate nested override</UiConfigProvider>
</UiConfigProvider>
```

- `system` follows `prefers-reduced-motion`; SSR resolves deterministically to `full` until mounted.
- The controller writes `data-ui-motion-preference` and `data-ui-motion`, persists changes, subscribes to system updates and restores previous attributes on disposal.
- Avoid application-wide `transition: none !important` rules. Lan UI uses cascading duration, iteration and scroll-behavior variables so a nested `motion="full"` scope can intentionally restore motion.
- Custom application Teleports should forward the nearest provider scope; all Lan UI Teleport components already do so.

## 1.31 scoped Teleport themes

This release is behavior-compatible and removes the need to copy theme variables onto `body` for overlays owned by a local `UiConfigProvider`:

```vue
<UiConfigProvider appearance="dark" :theme="tenantTheme" size="sm" density="compact">
  <UiPopover v-model="open" title="Tenant settings">
    <template #trigger><UiButton>Open</UiButton></template>
    The panel is rendered under body and keeps this provider scope.
  </UiPopover>
</UiConfigProvider>
```

- Teleported roots receive `data-ui-teleport-scope`, requested/resolved appearance, theme name, locale, size, density and direction attributes plus the provider's normalized custom properties and overlay base.
- The bridge is reactive. Changing provider Tokens, switching light/dark, or changing the resolved system preference updates an already-open overlay.
- Modal, Drawer, Toast, Notification, Tooltip, Dropdown, Popover, Popconfirm, AutoComplete, ColorPicker, CommandPalette and Image preview use the same internal contract.
- Applications should remove page-local Token-copy watchers previously added only for these components. Custom application portals still need their own scope boundary.
- A component outside `UiConfigProvider` keeps document-level CSS inheritance and receives no bridge attributes, preserving existing global-theme behavior.

## 1.30 theme runtime

This release is additive. Existing `theme` Token objects on `UiConfigProvider` and existing light/dark CSS selectors remain compatible. Applications can incrementally adopt the typed runtime:

```ts
import { createThemeController, defineTheme } from 'lan-ui-design-system/theme'

const tenantTheme = defineTheme({
  name: 'tenant',
  appearance: 'light',
  tokens: { 'brand-600': '#7c3aed' },
})
const appearance = createThemeController({ appearance: 'system', storageKey: 'app-theme' })
appearance.mount(document.documentElement)
```

- Use `UiConfigProvider appearance="system"` for a subtree that follows the operating-system preference. Its `data-ui-appearance` records the request and `data-ui-resolved-appearance` records the effective light/dark value.
- Use `defineTheme` for validated, immutable definitions. Token names accept CSS spelling with or without `--`; unknown names and unsafe values are rejected by default.
- Call `dispose()` when a host controller is no longer owned; it restores the previous target attributes and `color-scheme` by default. Pass `{ restore: false }` only when the last appearance should remain on a long-lived host.
- The controller accepts injected storage, `matchMedia` and target adapters for SSR and tests. Without browser globals it remains deterministic and resolves `system` to light until mounted.
- Prefer the `theme` package subpath when only theme utilities are needed. Root exports remain available for application-wide installation.

## 1.29 package and style boundaries

This release keeps every documented import path and component API compatible. The changes affect generated package internals and remove undocumented application/showcase selectors from `style.css`.

- Applications using public component classes, root component imports or `components/UiXxx` imports require no source migration.
- Import `lan-ui-design-system/style.css` for the complete public component theme. Admin shell, component-center and static-preview classes are example assets and should come from the application's own styles.
- Import `lan-ui-design-system/styles/UiXxx.css` for an explicit component stylesheet; it still imports the shared Token/core baseline exactly once through normal CSS import processing.
- Direct component imports start with the Chinese built-in only. Import `enUS` from `lan-ui-design-system/config`, install the plugin, or render `UiConfigProvider` when English is required; these documented paths activate the protected English built-in before component rendering.
- `style-manifest.json` advances to schema 2 and adds `root.bytes`, `root.rules` and `root.source: "component-union"`. Consumers parsing the manifest should ignore unknown fields and read entries by name.
- Generated files under `dist-lib/` remain private build details. Do not depend on chunk file names, locale chunk placement or unminified whitespace/comments.

## 1.28 production upload queues

This release is additive. Existing `v-model`, `accept`, size/count validation, `change`, `error` and removal behavior remains compatible when `request` is omitted.

To enable asynchronous uploads, provide a request function and report transport progress through its context:

```ts
const request = async ({ file, signal, onProgress }: UiUploadRequestContext) => {
  return client.upload(file, { signal, onProgress })
}
```

- Do not mutate the supplied item. Update application-owned metadata by replacing the controlled `modelValue` received from `update:modelValue` or `change`.
- Treat `upload-error` as the transport/preflight failure channel. The legacy string `error` event remains the concise validation feedback channel.
- `abort` invalidates the active run before aborting the signal, so late transport completion cannot convert a canceled or removed item to success.
- A custom `file` slot owns its visible controls. Preserve the slot-provided retry, abort and remove operations plus equivalent accessible names and progress feedback.
- `beforeUpload` may return a transformed `File`; it is checked against `accept` and `maxSize` again. Returning `false` rejects only that candidate.
- Controlled queues should preserve each emitted file `id`. Replacing IDs during progress updates discards active request association.

## 1.27 repeatable Schema Form nodes

This release is additive. Existing standalone `UiFormList` and P30 `UiSchemaForm` definitions keep their behavior. Use `type: 'list'` only when the schema should own the repeated layout and actions.

```js
const schema = [{
  name: 'reviewers',
  type: 'list',
  min: 1,
  max: 5,
  columns: 2,
  defaultValue: ({ index }) => ({ name: `Reviewer ${index + 1}`, email: '' }),
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'email', label: 'Email', rules: [{ type: 'email' }] },
  ],
}]
```

- Child names are relative to each item by default. Prefix a dependency with `$root` when it intentionally targets the root model.
- Item resolvers receive `(model, context)`; `context` contains `list`, `item`, `index`, `relativeName` and `getItemFieldValue` in addition to the normal Schema Form helpers.
- Successful `UiFormList` payloads now include `previous`. Code that narrows payloads structurally should accept this additive property.
- Listen to `list-change` for structural operations and inspect `payload.change`; use `field-change` when one unified value-change channel is preferable.
- Prefer the exposed list methods for programmatic actions. They apply the same min/max, disabled, event and validation contract as the rendered controls.

## 1.26 schema-driven forms

This release is additive. Existing `UiForm`, `UiFormItem` and `UiFormList` usage remains valid; adopt `UiSchemaForm` only where field metadata should own orchestration.

```vue
<UiSchemaForm :model="model" :schema="schema" show-error-summary @submit="save" />
```

- The application continues to own a reactive object. Field `name` accepts the same dot/bracket/array paths as managed forms.
- Prefer built-in `type` names for standard controls. Register application controls with `components`, or set a field-level `component`.
- Resolver callbacks receive `(model, context)` and should remain pure. Callback failures preserve rendering and emit `schema-error` for telemetry.
- Conditional fields are mounted only while `visible` resolves true, so hidden controls leave registration, validation and error-summary state.
- Keep `UiForm` primitives for highly bespoke layouts; Schema Form is an orchestration layer, not a replacement for them.

## 1.25 dynamic form arrays and dependencies

The release is additive. Existing array fields and custom validators keep their behavior; applications can move repeated field orchestration into `UiFormList` incrementally.

```vue
<UiForm :model="model">
  <UiFormList v-slot="{ fields, add, remove, move }" name="contacts" :min="1" :max="5">
    <div v-for="(field, index) in fields" :key="field.key">
      <UiFormItem :name="[...field.name, 'email']" label="Email" :rules="[{ required: true }, { type: 'email' }]">
        <UiInput v-model="model.contacts[index].email" />
      </UiFormItem>
      <UiButton type="button" @click="remove(index)">Remove</UiButton>
    </div>
    <UiButton type="button" @click="add({ email: '' })">Add contact</UiButton>
  </UiFormList>
</UiForm>
```

- Render rows with `field.key`, not the array index. Keys stay attached to the same object when rows move.
- Nested item names come from `field.name`; this keeps registration, validation, error summaries and partial reset synchronized after reindexing.
- Set `min`/`max` for structural limits. Guarded operations emit `limit`; successful operations emit typed `change`, `add`, `remove` or `move` payloads.
- Use `dependencies` on a `UiFormItem` to revalidate a touched field when related values change. Set `validateOnDependencyChange=false` when the application schedules validation itself.
- Conditional rules may define `when(model, context)`. Validator context now includes `getFieldValue` and `getFieldsValue` alongside the abort signal, trigger and field name.

## 1.24 managed-form orchestration

The release is additive for field rules and exposed methods. Existing `submit(model, event)` handlers remain valid; `invalid` now additionally receives a third `errors` argument and `reset` receives a state payload.

```vue
<UiForm ref="form" :model="model" :rules="rules" show-error-summary>
  <UiFormItem name="account.email" label="Account email" required>
    <UiInput v-model="model.account.email" />
  </UiFormItem>
  <UiButton type="submit">Save</UiButton>
</UiForm>
```

- Dot and bracket paths are supported without flattening the domain model. Use stable paths for field registration and server errors.
- Use `resetFields('account.email')` for partial reset and `reset()`/native reset for the initial snapshot. Pass `initialValues` when reset state differs from the first model value.
- Map API errors with `setFieldError(path, message)` or `setFields([{ name, errors }])`; do not duplicate server errors in a parallel page-local store.
- Async validators receive `{ signal, trigger, name }`. Forward `signal` to network requests so superseded validation is cancelled; stale results are ignored even when a transport does not abort.
- `showErrorSummary` appears only after a failed submit. Each summary item focuses its registered field; `focusOnError` and `scrollToError` can be configured independently.
- Built-in rules now include `type`, `len`, `enum`, `whitespace` and `transform`. Existing required/min/max/pattern/custom-validator semantics remain supported.

## 1.23 DataGrid and list orchestration

The release is additive. Existing `UiTable`, `UiListToolbar` and `UiPagination` compositions remain supported.

- Adopt `UiDataGrid` when a page currently duplicates query/filter/sort/page coordination. All state remains controllable through matching `update:*` events.
- Client mode processes the supplied `rows`; server mode never mutates or slices them and uses external `total` for pagination.
- Handle the single `request` event in server mode and branch on `payload.reason`. Search requests are debounced; other state requests are immediate.
- `UiPagination.ariaLabel` is optional. Supply it whenever more than one pagination landmark appears on a page; DataGrid supplies a unique composed label automatically.
- Table selection checkboxes now expose a 24px pointer target. Check custom cell layout if it previously assumed the native 13px checkbox footprint.
- `UiListToolbar` popup semantics changed from a menu pattern to a labelled checkbox group, matching its actual interaction model.

## 1.22 status-page and virtual-list contracts

Both components are additive. Existing application routes and list components continue to work unchanged.

```vue
<UiStatusPage status="500" embedded @retry="reload" @home="goHome" />
<UiVirtualList v-model="selectedKey" :items="records" :item-size="48" selection-mode="single" />
```

- Replace duplicated 403/404/500 page markup with `UiStatusPage`; route ownership remains in the application and actions are emitted rather than navigating implicitly.
- For large collections, `UiVirtualList` keys must be stable. Prefer a domain identifier through `itemKey`; index fallback is intended only for immutable ordering.
- `modelValue` contains keys, not record objects. Multiple mode emits keys in current item order. Echo update events when the application owns controlled selection or active index.
- Fixed height is the lowest-cost mode. Enable `measure` only when actual row height differs from the estimate; call `resetAfterIndex` after external content changes that bypass ResizeObserver.
- Consumer item slots keep presentation ownership, while the component-owned wrapper retains option semantics and positioning. Do not add competing `role=option` nodes inside the slot.
- The initial SSR window uses `height` and estimates. Keep these values identical during hydration; live measurement begins after mount.
- Infinite-loading consumers can subscribe to `reach-end`; the event is edge-triggered and becomes eligible again after scrolling away from the boundary.

## 1.21 image and preview contract

`UiImage` is additive. Use it for content images that need loading, fallback or preview behavior; keep plain `<img>` for fully static decorative assets and `UiAvatar` for identity thumbnails.

```vue
<UiImage
  src="/thumbnail.jpg"
  fallback="/image-fallback.jpg"
  alt="Release architecture"
  preview
  :preview-list="gallery"
/>
```

- `alt` is forwarded to both inline and preview images. Keep meaningful content concise; use an empty string for decorative images.
- `fallback` is attempted once after the primary source fails. Terminal failure exposes localized retry UI or the typed `error` slot; consumer retry handlers do not need to rebuild the component.
- `previewOpen` and `previewIndex` support controlled use. Echo `update:previewOpen` and `update:previewIndex` when application state owns the preview.
- Arrow Left/Right navigates the gallery and mirrors in RTL. `+`/`-` zoom, `R`/`Shift+R` rotate, `0` resets and Escape closes. Focus remains trapped and returns to the opener.
- Wheel zoom and double-click zoom are enabled by default. Pointer panning activates only above 100% scale and remains bounded to the preview canvas.
- Preview participates in the shared overlay stack and restores prior body overflow. Nested dialogs close only when their own overlay is topmost.
- Custom `preview` and `toolbar` slots own their visual rendering; preserve equivalent accessible controls and feedback when replacing defaults.

## 1.20 calendar contract

`UiCalendar` is additive. Use it when dates must remain visible for planning or range selection; retain `UiDatePicker` for compact single-field input and `UiDateRangePicker` for compact start/end entry.

```vue
<UiCalendar v-model="releaseRange" selection-mode="range" show-week-numbers />
```

- `selectionMode="single"` emits one value; `multiple` and `range` emit arrays. A range with one item is an in-progress selection and a two-item range is always normalized in ascending wall-date order.
- `valueType="auto"` follows the first non-empty model value. Set `string`, `date` or `timestamp` explicitly when an empty model must still emit a specific representation.
- `viewDate` initializes or controls the displayed month. Update it from `update:viewDate` when the surrounding application owns calendar navigation; `view-change` includes previous value and source metadata.
- `min`, `max` and `disabledDate(date, context)` affect pointer, keyboard and accessible unavailable state. Consumer callback failures are contained and treated as enabled dates.
- `firstDayOfWeek="auto"` uses platform Locale week information with a deterministic locale fallback. Set `0–6` to enforce an application-specific week convention.
- Horizontal Arrow behavior mirrors in RTL. Up/Down, Home/End, Page keys, selection and model ordering remain chronological.
- The component owns the ARIA grid, roving tab stop and date buttons. Custom `cell`, `year`, `header` and `footer` slots should not add nested focusable controls inside component-owned grid cells.
- Pass `today` for deterministic SSR snapshots or time-frozen tests. Runtime applications may omit it to use the current date in the configured time zone.

## 1.19 statistic contract

`UiStatistic` is additive. Use it for a single KPI or dashboard metric; retain `UiProgress` for bounded completion and `UiTable` for comparable record sets.

```vue
<UiStatistic title="Revenue" :value="2864000" prefix="¥" :trend="12.6" />
```

- Numeric values are formatted with the active locale. `precision` sets both minimum and maximum fraction digits; `formatOptions` exposes the remaining `Intl.NumberFormat` contract.
- String values are preserved as consumer-formatted display values. `null`, non-finite numeric input and empty strings use `placeholder` or the localized em dash.
- `trend` stores the signed change while the visual number is its absolute magnitude. Configure `positiveDirection="down"` when decreases are beneficial, or `none` for neutral change semantics.
- `loading` replaces the value and trend with a stable skeleton and sets `aria-busy`. Choose `live="polite"` only for values that update after the initial render.
- Prefix and suffix are included in the accessible value even though their visual nodes are decorative. When a custom `value` slot changes the spoken meaning, provide matching `ariaValueText`.
- Formatter errors and invalid `Intl` options fall back to the normal value rather than aborting the render.

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


## Finite list composition in 1.42

Version 1.42 is additive. Use `UiList` for finite records that need semantic rich content, selection, grid adaptation or pagination. Existing `UiTable`, `UiDataGrid`, `UiListToolbar` and `UiVirtualList` contracts are unchanged.

```vue
<UiList v-model="selected" :items="records" item-key="id" selection-mode="multiple" bordered />
```

Choose `UiTable` for column comparison, `UiDataGrid` for coordinated search/filter/sort orchestration and `UiVirtualList` when the rendered record count must be windowed. `UiList` client pagination slices its `items`; set `server` and control `page`, `pageSize` and `total` when data is already paged remotely. Nested buttons and links are ignored by row selection; add `data-ui-list-action` to custom interactive roots that do not use native interactive elements.
