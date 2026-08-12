# Changelog

All notable changes to Lan UI are documented here. The format follows Keep a Changelog and versions follow Semantic Versioning.

## [Unreleased]

## [1.18.0] - 2026-08-12

### Added

- Public `UiRate` with integer/fractional steps, pointer preview, repeat-to-clear, configurable text and colors, size/read-only/disabled/invalid states and FormItem integration.
- Slider ARIA, localized value text, RTL pointer/Arrow mapping and Arrow/Page/Home/End/Delete keyboard contracts.
- Unit, SSR, typed root/subpath, package, static-preview, visual, Axe, three-browser interaction and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 60 to 61 entries.
- Locale parity advances from 147 to 152 keys; browser interaction coverage advances from 17 to 18 scenarios per engine and Axe coverage advances from 13 to 14 cases.
- Static preview advances from 18 to 19 sections.
- The reviewed package JS gzip ceiling moves from 125000 B to 132000 B and package CSS raw from 300000 B to 310000 B for the new runtime and component-scoped rating styles; the other twelve budgets retain their previous limits.

## [1.17.0] - 2026-08-12

### Added

- Public `UiColorPicker` with HEX/RGB/HSL output, optional alpha, presets, text entry, clear/read-only/disabled/invalid states and FormItem integration.
- Pointer and keyboard two-dimensional saturation/brightness selection, native hue/alpha sliders, direction-aware floating placement, RTL mapping and focus restoration.
- SSR-safe `color` package subpath with parsing, formatting, HSV/HSL conversion, WCAG contrast and readable-text helpers.
- Unit, SSR, typed root/component/color-subpath, package, static-preview, Axe, three-browser interaction and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 59 to 60 entries; public utility subpaths advance from five to six.
- Locale parity advances from 134 to 147 keys; browser interaction coverage advances from 16 to 17 scenarios per engine and Axe coverage advances from 12 to 13 cases.
- Static preview advances from 17 to 18 sections and repairs corrupted CommandPalette/Icon headings and keyboard glyphs.
- The `packageJsRaw` release ceiling moves from 315000 B to 335000 B for the new parser, conversion utilities and production picker while retaining an independently enforced gzip ceiling.

## [1.16.0] - 2026-08-12

### Added

- Public `UiCommandPalette` with controlled/uncontrolled open and query models, global `Ctrl/Cmd + K`, fuzzy ranking, grouped commands, disabled/hidden entries and fully customizable content slots.
- Abortable debounced remote search with monotonic stale-response protection, per-query cache, contained retryable errors and deterministic duplicate/missing-key diagnostics.
- Modal dialog, combobox, listbox, group and option semantics; focus trap/restore, overlay-stack ownership, scroll locking, logical RTL behavior, reduced-motion handling and responsive mobile presentation.
- Unit, SSR, typed root/subpath, package, static-preview, Axe, three-browser interaction and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 58 to 59 entries.
- Locale parity advances from 122 to 134 keys; browser interaction coverage advances from 15 to 16 scenarios per engine and Axe coverage advances from 11 to 12 cases.
- Bounded JS/CSS budgets increase only for the new command-search runtime, overlay presentation and standalone demonstration; raw and gzip limits remain independently enforced.

## [1.15.0] - 2026-08-12

### Added

- Public `UiTree` for enterprise resource hierarchies with controlled/uncontrolled single or ordered multi-selection, checkbox cascade or strict checks, filtering, custom data keys, slots and optional virtual rendering.
- WAI-ARIA tree/treeitem semantics, active-descendant focus, LTR/RTL Arrow navigation, Home/End, sibling expansion, typeahead, Space checking and Enter selection.
- Abortable lazy child loading with stale-request guards, once-loaded caching, parent-check inheritance, busy/error/retry states and duplicate/missing-key diagnostics.
- Unit, SSR, typed root/subpath, package, static-preview, Axe, three-browser interaction and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 57 to 58 entries.
- Locale parity advances from 114 to 122 keys; browser interaction coverage advances from 14 to 15 scenarios per engine and Axe coverage advances from 10 to 11 cases.
- Tree viewport measurement now handles numeric, pixel and responsive CSS heights through `ResizeObserver` while preserving deterministic virtual ranges.
- The opt-in single-component chunk budget moves from 16,000/5,200B to 25,000/7,500B raw/gzip, aggregate JS from 270,000/108,000B to 290,000/114,000B, and standalone-example JS from 260,000B to 280,000B for Tree; the other ten package/minimal-consumer budgets retain their prior limits.

## [1.14.0] - 2026-08-12

### Added

- Public `UiAutoComplete` editable combobox with local keyword filtering, custom or select-only values, clear/read-only/disabled/invalid states and direction-aware floating suggestions.
- Debounced async suggestion loading with `AbortSignal`, stale-response protection, query caching, contained errors and `load-error` metadata.
- IME composition, Arrow/Home/End/Enter/Escape/Tab keyboard behavior, FormItem naming and help linkage, localized status copy and customizable option/loading/error/empty slots.
- Unit, SSR, typed root/subpath, package, static-preview, visual, Axe, three-browser interaction and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 56 to 57 entries.
- Locale parity advances from 108 to 114 keys and browser interaction coverage from 13 to 14 scenarios per engine.
- Deterministic package budgets are rebased with bounded headroom for the new async combobox chunk and its component-scoped styles; every raw and gzip metric remains enforced in CI.

## [1.13.0] - 2026-08-12

### Added

- Public `UiSlider` for single and range values with exact stepping, minimum range distance, marks, formatted tooltips, horizontal/vertical/reverse/RTL layouts and FormItem integration.
- Pointer, Arrow/Page/Home/End keyboard and WAI-ARIA slider contracts, including localized single/range labels and readonly/disabled/invalid states.
- Slider unit, SSR, type, package, static-preview, visual, accessibility, interaction and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 55 to 56 entries.
- Slider thumbs use a 24px target and preserve a visible focus ring across light, dark, compact and directional layouts.
- Cross-browser interaction coverage advances from 12 to 13 scenarios per engine.

## [1.12.0] - 2026-08-12

### Added

- Public `UiNumberInput` with numeric/null v-model, exact decimal stepping, min/max bounds, explicit precision, formatter/parser hooks, affix slots and side/right controls.
- Spinbutton ARIA, FormItem linkage, localized control names and Arrow/Page/Home/End/Enter/Escape keyboard contracts.
- Number-input unit, type, package, static-preview and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 54 to 55 entries.
- Explicit `aria-label`/`aria-labelledby` values now take precedence over inherited `UiFormItem` labels across text, numeric, date and advanced selection controls.
- Visual and browser interaction fixtures now exercise numeric controls in light, dark, RTL, compact and mobile layouts.
- Split-style generation normalizes source line endings, so package gates remain deterministic after patch replay on Windows and Unix checkouts.

## [1.11.0] - 2026-08-12

### Added

- Public `UiIcon` component with size, stroke, color, rotation, flipping, animation, accessible labelling, fallback and RTL-directional contracts.
- Public `icons` subpath with 46 named built-ins plus `defineIcon`, `createIconRegistry`, discovery and registration APIs.
- Application- and Provider-scoped icon registries for tenant branding, micro-frontends and SSR request isolation.

### Changed

- Existing icon-consuming components now resolve through the same injected registry while preserving all existing string icon Props.
- The standalone consumer creates and renders its own project icon; the usage center demonstrates built-ins, a scoped custom icon and RTL mirroring.
- Public component, declaration, style and API-manifest parity advances from 53 to 54 entries.

### Security and quality

- Custom definitions are parsed into whitelisted SVG geometry nodes; executable elements, event handlers, URL values, malformed markup and oversized definitions are rejected without `v-html`.
- P15 adds unit, SSR, registry-isolation, subpath, sanitizer, type, standalone-consumer and package gates to `test`, `prepack` and the project verifier.

## [1.10.0] - 2026-08-12

### Added

- Public `date` subpath with strict parsing, formatting, comparison, IANA time-zone conversion and deterministic daylight-saving disambiguation.
- `UiTimePicker` as a named component with minute, second and millisecond precision.
- `UiDatePicker` and `UiDateRangePicker` now accept string, `Date` and timestamp models through `valueType`, while preserving the existing string default.
- `timeZone`, `disambiguation`, `precision`, `step` and `referenceDate` contracts across date and time controls.

### Changed

- Date bounds and range ordering use the shared structural adapter instead of lexical component-local comparisons.
- Date inputs expose their resolved value type and time zone for inspectable application diagnostics.
- The usage center demonstrates one instant edited in Shanghai, UTC and New York without changing the stored `Date`.

### Quality

- P14 adds strict calendar, IANA zone, DST gap/overlap, typed value, stable time-reference, component, subpath and external consumer gates.
- Public component, declaration, style and API-manifest parity advances from 52 to 53 entries.
- The reviewed package JS Raw budget moves from 205,000B to 215,000B for the dependency-free date adapter; the 88,000B Gzip budget and the other 12 package/consumer budgets are unchanged.

## [1.9.0] - 2026-08-12

### Added

- `createLocaleRegistry()` provides isolated locale registration, aliases, discovery, removal and promise-based lazy loading.
- `createLanUi()` owns an application-scoped registry and exposes `registerLocale`, `unregisterLocale`, `hasLocale`, `listLocales` and `loadLocale`; lazy loads may activate the locale atomically.
- `fallbackLocale` accepts an ordered array, while `fallbackLocales` exposes the normalized, duplicate-free resolution chain.
- Root and `config` subpath convenience APIs expose a default registry for non-Vue utilities and single-application integrations.

### Changed

- Locale resolution now consults the active application registry before built-in locales, so a loaded locale name can be selected without passing its object repeatedly.
- Concurrent requests for the same missing locale share one loader promise; failed loads clear pending state and may be retried.
- Every `createLanUi()` call receives a separate locale registry by default, preventing micro-frontends and SSR requests from leaking loaded languages into one another.

### Quality

- P13 adds registry, alias, lazy-load deduplication, retry, fallback-chain, activation, Provider and isolation coverage to `test:locale` and `prepack`.
- The component usage center includes an interactive asynchronous `fr-FR` registration and multi-level fallback example.

## [1.8.0] - 2026-08-12

### Added

- Public `createLocaleTools()` and expanded `useLocale()` APIs for cached `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `Intl.ListFormat` and plural selection.
- Configurable `fallbackLocale` on `createLanUi()` and `UiConfigProvider`; `plugin.setFallbackLocale()` updates or disables the fallback at runtime.
- Locale messages accept plural-category objects and exact-number keys in addition to strings; `tc()` also accepts two/three-choice pipe syntax.
- Interactive Chinese, English and Arabic Intl examples in the component usage center.

### Changed

- Unknown locale names are preserved for Intl formatting instead of being collapsed to `zh-CN`; missing messages resolve per key through the configured fallback.
- Badge, ListToolbar, Pagination, Progress, Transfer and Upload format visible counters, page numbers, percentages and file sizes with the active Locale.

### Quality

- P12 adds deterministic fallback/plural/Intl contracts and reactive DOM coverage, bringing the suite to 56 tests across 12 files.
- `test:locale` and `prepack` execute both message-source and Intl runtime contracts.

## [1.7.0] - 2026-08-12

### Added

- Complete `zh-CN` and `en-US` messages for navigation, feedback, selection, list controls, form validation, transfer panels and accessible names.
- `test:locale` release gate checks exact locale-key parity, interpolation-placeholder parity, missing message references and hard-coded CJK copy across all 52 public components.
- Runtime coverage for application-level locale switching, Teleported feedback, generated validation errors and explicit copy overrides.

### Changed

- Cascader, MultiSelect, TreeSelect, Steps and Transfer now resolve default copy from the active Locale context instead of freezing Chinese strings in runtime Props.
- Generated `UiFormItem` validation messages retain message descriptors so an already-visible error updates when the application locale changes.
- Alert, Badge, Breadcrumb, Descriptions, Drawer, ListToolbar, Menu, Modal, Notification, Popover, Tabs and Toast accessible copy now follows the active Locale.

### Fixed

- Switching an installed application to `en-US` no longer leaves Chinese placeholders, close-button labels, Toast titles, list controls or Transfer copy in the rendered interface.
- Explicit component copy and rule-level validation messages continue to take precedence over Locale defaults.

## [1.6.0] - 2026-08-12

### Added

- `createLanUiFeedback()` creates independent Toast/Notification state and timer lifecycles for multi-app pages, micro-frontends and SSR requests.
- `createLanUi({ isolated:true })` provides a request/application-scoped feedback instance; `useFeedback()`, `useToast()` and `useNotification()` resolve that instance inside component setup.
- `UiToastHost` and `UiNotification` consume the injected instance automatically and also accept an explicit `feedback` instance.
- `LanUiPlugin.feedback` exposes the active services; owned instances are disposed automatically when the Vue application unmounts and can be explicitly released with `plugin.dispose()` after SSR rendering.

### Fixed

- Toast timers, exit timers and Notification state no longer have to be shared across independently installed applications.
- Toast placement types now include the logical `top-end` and `bottom-end` positions already supported by the runtime.
- Disposed feedback instances cancel pending timers and reject late writes, preventing stale callbacks after application teardown.

### Quality

- Multi-application DOM tests verify isolated Toast/Notification rendering and automatic teardown.
- Concurrent SSR tests verify that request messages never appear in another request's Teleport output.

## [1.5.0] - 2026-08-12

### Added

- Public `UiXxxEmits` and `UiXxxSlots` contracts for all 52 components, available from both the root package and every component subpath.
- API Manifest schema 2 records Props, Emits and Slots for each component and validates them against runtime Props/Emits and source templates.
- Strict vue-tsc consumer fixtures covering root/subpath imports, v-model payloads, event callbacks, scoped/dynamic slots and intentional negative contracts.

### Fixed

- Added the existing `UiDropdown.offset` runtime Prop to its public TypeScript contract.
- Component declarations now expose typed listener Props, `$emit` overloads and `$slots` scopes instead of Props-only `DefineComponent` declarations.

### Quality

- TypeScript 5.9.3 and vue-tsc 3.3.9 are pinned as release tooling; type checking is enforced by CI and `prepack`.
- All 52 package subpaths verify matching Props, Emits and Slots exports in addition to runtime default/named parity.

## [1.4.0] - 2026-08-12

### Added

- Cross-browser interaction runner for Chromium, Firefox and WebKit with per-engine and aggregate JSON reports.
- Linux CI job that installs Firefox/WebKit and enforces the same eleven real-browser interaction contracts outside Chromium.
- Unit contracts for WebKit-style pointer focus origins and delayed focus targets.

### Fixed

- Modal and Drawer now restore focus to the actual pointer opener in WebKit, where clicking a button does not necessarily update `document.activeElement`.
- Nested Modal + Drawer flows use shared retryable focus transfer, preserving opener restoration across asynchronous Teleport teardown.
- Popconfirm reuses the same resilient focus helper for initial action focus and trigger restoration.

### Quality

- 43 behavior tests, 27 component contract suites, three visual baselines and nine zero-violation Axe audits.
- Eleven interaction scenarios pass on each of Chromium, Firefox and WebKit: 33 browser cases in the local release matrix.

## [1.3.0] - 2026-08-12

### Added

- Eleven real-browser interaction contracts covering keyboard selection, LTR/RTL tabs, focus trapping/restoration, nested overlays, Popconfirm, pagination, upload, table, form and menu behavior.
- Versioned `performance-budgets.json` with fourteen raw/gzip package, component, minimal-consumer and standalone-example gates.
- Optional `UiFormItem.reserveMessageSpace` Prop and public performance-budget package exports.

### Fixed

- Popconfirm now focuses its first action when reduced motion disables the normal transition lifecycle.
- Corrected forms submit on the first click after an invalid field is fixed, without forcing a permanent message-space layout change.
- Form error/help space can be reserved explicitly to prevent validation layout movement in dense workflows.

### Quality

- 41 behavior tests, 27 component contract suites, three visual baselines, nine Axe audits and eleven browser interaction scenarios.
- CI and `prepack` now enforce the committed package-size budget after both consumer examples are built.

## [1.2.0] - 2026-08-12

### Added

- Axe 4.11.4 browser audits across nine light, dark RTL, mobile, composite form and dialog scenarios.
- Optional `UiCard.titleTag` and `UiProgress.label` Props.
- Semantic `brand-text`, `danger-solid` and dark status-surface Tokens.

### Fixed

- Progressbar accessible naming and value semantics.
- Tabs and composite selectors no longer reference popup or panel IDs that are absent from the DOM.
- Drawer dialog host now uses a role-compatible section element.
- Danger button, dark Alert and active brand-text contrast now meet the automated WCAG AA gate.
- Previously corrupted P5 Chinese documentation sections were restored.

### Quality

- 39 behavior tests, 27 component contract suites, three pixel-diff baselines and nine Axe scenarios.
- CI now blocks automatically detected WCAG 2.0/2.1/2.2 A/AA and Best Practice violations.

## [1.1.0] - 2026-08-11

### Added

- Windows Chromium visual regression baselines for light/LTR, dark/RTL/compact and mobile layouts.
- `direction: 'ltr' | 'rtl'` application and `UiConfigProvider` configuration with logical keyboard navigation.
- Logical `start` / `end` drawer placement and fixed table-column offsets while preserving physical aliases.
- 52 component-scoped CSS exports, shared `styles/core.css` and public `style-manifest.json`.
- Pixel-diff, RTL behavior, component-style parity and CSS bundle-budget gates.

### Changed

- Minimal UiButton consumer now imports `styles/UiButton.css`; CSS output is reduced from the full 107+ kB stylesheet to under 8 kB without leaking Table styles.

## [1.0.0] - 2026-08-11

### Added

- 52 Vue 3 enterprise components, Design Tokens, administration examples and a standalone consumer.
- Global Plugin, `createLanUi`, `UiConfigProvider`, Chinese/English locales and date range input.
- Floating collision handling, overlay stack, service Toast/Notification and complete form/table interactions.
- SSR-safe overlays with deterministic Hydration IDs.
- Independent ESM and Props-type subpaths for all 52 components.
- `config`, `feedback`, `plugin`, `style.css` and `tokens` Package Exports.
- Public `api-manifest.json`, runtime/type parity checks and minimal consumer Tree-shaking verification.

### Fixed

- Steps connector visibility and spacing.
- Select arrow alignment and open/close animation.
- Composite form-control labeling and nested interactive tab actions.
- Runtime/type mismatch for named exports on component subpaths.

### Quality

- 29 behavior tests across client and server environments.
- 27 component contract suites, package reopen tests, rollback verification and external tarball consumption.
