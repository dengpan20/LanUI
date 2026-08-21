# Changelog

All notable changes to Lan UI are documented here. The format follows Keep a Changelog and versions follow Semantic Versioning.

## [Unreleased]

## [1.60.0] - 2026-08-22

### Added

- Production `UiTooltip` contract with Hover/Focus/Click/Manual triggers, controlled and uncontrolled state, cancellable show/hide delays, outside/Escape dismissal, Arrow, wrapping, custom portal/id/z-index controls, structured Slots and imperative methods.
- Component-center, one-page HTML and standalone-consumer examples plus deterministic SSR, unit, visual, zero-violation Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Existing `content`, `placement`, `disabled`, `offset` and default Hover + Focus behavior remain compatible while temporary `aria-describedby` relationships now merge and restore existing values only while visible.
- Shared floating positioning now reacts to runtime offset changes; Tooltip placement uses logical start/end values, collision flip/shift, Teleported theme scope, RTL and Reduced Motion styles.
- Absolute and frozen-baseline enhancement ceilings receive bounded headroom only for the expanded Tooltip runtime, shared floating offset reactivity, synchronized examples and tooltip styles.
- Release gates advance to 37 visual baselines, 55 Axe scenarios, 59 interactions per browser and 61 negative type assertions while retaining 443 locale keys. Generated API coverage advances to 1,173 Props, 393 Events and 214 Slots.

## [1.59.0] - 2026-08-22

### Added

- Production `UiBreadcrumb` contract with stable field adapters, explicit current-page resolution, item icons, native links/buttons, disabled context, three sizes, wrap/nowrap and truncation controls, Loading/Empty states, structured Slots and focus/navigation/disclosure instance methods.
- Controlled and uncontrolled long-path disclosure with configurable leading/trailing context, localized hidden-level labels, keyboard focus restoration and stable expand/navigation metadata.
- Component-center, one-page HTML and standalone-consumer examples plus deterministic SSR, unit, visual, zero-violation Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Existing `items`, `separator`, `ariaLabel`, last-item current-page behavior and first `navigate` argument remain compatible; the event now appends metadata/source event and item callbacks execute through the same activation path.
- PageHeader and static-preview breadcrumb markup now consume the common item, separator, current-page, focus, RTL, forced-colors and Reduced Motion style contract.
- Release gates advance to 36 visual baselines, 54 Axe scenarios, 58 interactions per browser, 59 negative type assertions and 443 locale keys. Generated API coverage advances to 1,159 Props, 389 Events and 212 Slots.

## [1.58.0] - 2026-08-22

### Added

- Production `UiSteps` contract with stable field adapters, controlled/uncontrolled current state, Default/Navigation/Inline presentation, horizontal/vertical direction and labels, three sizes, linear navigation, disabled stages, loading/empty states, structured Slots and focus/navigation instance methods.
- Dedicated connectors independent of title width, plus component-center, one-page HTML and standalone-consumer examples with deterministic SSR, unit, visual, zero-violation Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Existing `items`, `current`, `direction`, status derivation and `.ui-step-*` styling remain compatible while opt-in navigation uses native buttons, roving keyboard focus, responsive layout, RTL logical arrows, Reduced Motion and forced-colors behavior.
- `UiSelect` now teleports its listbox by default with collision-aware floating placement and theme/direction scope, avoiding clipped menus inside cards and scroll containers; `appendToBody=false` preserves explicit inline integration.
- `UiTable` empty and error rows now use class-driven full-width mobile hooks instead of relational-selector-dependent layout.
- Release gates advance to 35 visual baselines, 53 Axe scenarios, 57 interactions per browser, 57 negative type assertions and 440 locale keys. Generated API coverage advances to 1,138 Props, 385 Events and 206 Slots.

## [1.57.0] - 2026-08-20

### Added

- Production `UiTimeline` contract with field adapters, status/custom-color dots, icons, vertical/horizontal orientation, start/end/alternate placement, semantic opposite time, controlled/uncontrolled selection, native links, disabled stages, pending/loading/empty states, structured Slots and focus/select instance methods.
- Component-center, one-page HTML and standalone-consumer examples plus deterministic SSR, unit, visual, zero-violation Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Existing `items`-only timelines remain compatible while opting into semantic ordered-list output, responsive/RTL layouts, roving keyboard focus, secure `_blank` links, Reduced Motion and forced-colors behavior.
- Release gates advance to 34 visual baselines, 52 Axe scenarios, 56 interactions per browser, 55 negative type assertions and 438 locale keys. Generated API coverage advances to 1,113 Props, 380 Events and 199 Slots.

## [1.56.0] - 2026-08-20

### Added

- Production `UiTag` vocabulary with semantic and custom colors, Soft/Solid/Outlined variants, three sizes, dot and rounded presentation, controlled checkable state, removable state, native links, disabled behavior, localized close labels, structured Slots and exposed focus methods.
- Component-center, one-page HTML and standalone-consumer examples plus deterministic SSR, unit, visual, Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Existing `color`, `dot`, default Slot, passive click and `.tag` usages remain compatible; the legacy `type` alias now resolves consistently in all project examples.
- Release gates advance to 33 visual baselines, 51 Axe scenarios, 55 interactions per browser and 53 negative type assertions. Generated API coverage advances to 1,083 Props, 375 Events and 191 Slots.

## [1.55.0] - 2026-08-20

### Added

- Production `UiCard` semantics and composition: cover, subtitle, actions, footer and loading Slots; sizes, variants, borders and shadows; interactive, link, selected, disabled and loading states; accessible naming; pointer/keyboard activation metadata; exposed focus/scroll methods.
- Component-center, static-preview and standalone card examples plus deterministic SSR, unit, visual, Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Existing `UiCard` usages retain their legacy classes and Props while receiving responsive, RTL, Reduced Motion and forced-colors behavior through the common style contract.
- Release gates advance to 32 visual baselines, 50 Axe scenarios, 54 interactions per browser and 51 negative type assertions. Generated API coverage advances to 1,068 Props, 370 Events and 188 Slots.

## [1.54.0] - 2026-08-20

### Added

- `UiPageHeader`, a semantic page-level heading primitive with breadcrumb, back, title, description, metadata, actions, footer and loading composition; configurable heading level, size, border and sticky offset; pointer/keyboard source metadata; exposed focus/scroll methods; responsive, RTL, Reduced Motion, forced-colors and SSR behavior.
- A consumer-configurable `ariaLabel` for `UiBreadcrumb`, allowing multiple page-header breadcrumb landmarks to remain uniquely named.
- Component-center, static-preview and standalone examples plus deterministic SSR, unit, visual, Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Dashboard, Workbench, Data, AI, Gantt and Components pages now consume one `UiPageHeader` contract instead of maintaining six page-local heading structures.
- Release gates advance to 89 public components, 433 locale keys, 31 visual baselines, 49 Axe scenarios, 53 interactions per browser and 49 negative type assertions.
- Generated API coverage advances to 1,050 Props, 368 Events and 182 Slots; root/subpath runtime, declarations, isolated CSS and offline consumer packaging stay synchronized.

## [1.53.1] - 2026-08-20

### Fixed

- Stabilized the `UiKeyValueEditor` visual contract with an explicit fixture height so Windows CI and local Chromium captures retain identical dimensions across font-rendering environments.

## [1.53.0] - 2026-08-20

### Added

- `UiKeyValueEditor`, a controlled enterprise editor for HTTP headers, environment variables, tags and metadata with stable row identity, custom field names, add/remove/reorder/toggle operations and dotenv-style import.
- Structured empty, duplicate, pattern, required-value and row-limit validation; native form naming, FormItem linkage, responsive container layout, RTL, forced-colors, reduced-motion, Slots and a typed instance API.
- Component-center, static-preview and standalone examples plus unit, deterministic SSR, visual, Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Release gates advance to 88 public components, 431 locale keys, 30 visual baselines, 48 Axe scenarios, 52 interactions per browser and 47 negative type assertions.
- Generated API coverage advances to 1,035 Props, 366 Events and 174 Slots; root, component subpath, declarations, isolated component CSS and offline consumer packaging stay synchronized.
- Performance and distribution ceilings receive measured one-component headroom while the frozen release-baseline policy continues to reject unrelated regressions.

## [1.52.0] - 2026-08-20

### Added

- `UiCronEditor`, a controlled five-field Unix Cron form control with wildcard, list, range and step parsing, structured validation and local/UTC future-run previews.
- Five localized schedule presets, accessible field breakdown, FormItem naming/error linkage, responsive container layout, scoped Slots and exposed validation/scheduling instance methods.
- Component-center, static-preview and standalone examples plus unit, SSR, visual, Axe, negative type, installed-tarball and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Release gates advance to 87 public components, 406 locale keys, 29 visual baselines, 47 Axe scenarios, 51 interactions per browser and 45 negative type assertions.
- Generated API now covers 1,008 Props, 354 Events and 170 Slots; root, component subpath, declarations and isolated CSS remain synchronized.
- Performance and distribution ceilings receive measured one-component headroom while existing additive release-baseline policy remains enforced.

## [1.51.0] - 2026-08-20

### Added

- `UiBarcode`, a real deterministic SVG barcode encoder covering CODE128/39, EAN, UPC, ITF, MSI, Pharmacode and Codabar with configurable module width, height, quiet zone, text and colors.
- Active, loading, expired, scanned and invalid lifecycle presentation, localized live feedback, refresh/error/download events, overlay/caption/action Slots and an exposed encoding contract.
- Component-center, static-preview and standalone examples plus unit, SSR, visual, Axe, negative type, installed-tarball and Chromium/Firefox/WebKit lifecycle coverage.

### Changed

- Release gates advance to 86 public components, 379 locale keys, 28 visual baselines, 46 Axe scenarios, 50 interactions per browser and 43 negative type assertions.
- `jsbarcode` 3.12.3 is pinned as the MIT scanner-ready encoder; package root, component subpath, declarations and isolated CSS remain synchronized.
- Performance and distribution ceilings receive measured encoder and one-component headroom; existing core CSS, theme, motion and consumer-boundary gates remain enforced.

## [1.50.0] - 2026-08-15

### Added

- `UiQRCode`, a real SVG QR encoder with byte-mode content, L/M/Q/H error correction, configurable size, quiet-zone margin, colors, optional center icon and deterministic SVG serialization.
- Active, loading, expired, scanned and invalid presentation, localized live status, refresh and download events, caption/action/overlay Slots and an exposed `refresh` / `download` / `toSvg` instance contract.
- Component-center, one-page static preview and standalone-consumer examples plus unit, SSR, visual, Axe, type, installed-tarball and Chromium/Firefox/WebKit lifecycle coverage.

### Changed

- Release gates advance to 85 public components, 372 locale keys, 27 visual baselines, 45 Axe scenarios, 49 interactions per browser and 41 negative type assertions.
- Generated API coverage advances to 979 Props, 344 Events and 163 Slots.
- `qrcode-generator` 2.0.4 is pinned as the zero-runtime-dependency MIT encoder; package root and component subpaths retain matching runtime, declarations and isolated CSS.
- Nine absolute ceilings and five frozen-baseline per-component allowances receive measured QR encoder headroom; root gzip, component CSS, subpath-consumer, theme and motion ceilings remain unchanged.

## [1.49.0] - 2026-08-15

### Added

- `UiDateTimePicker` and `UiDateTimeRangePicker`, dedicated discoverable adapters for complete instants and scheduling windows without requiring consumers to remember `mode="datetime"`.
- Component-center, static-preview and standalone examples plus unit, SSR, visual, Axe, type, installed-tarball and three-browser interaction coverage for both adapters.

### Changed

- Release gates advance to 84 public components, 365 locale keys, 26 visual baselines, 44 Axe scenarios, 48 interactions per browser and 39 negative type assertions.
- Generated API coverage advances to 965 Props, 341 Events and 160 Slots.
- Existing `UiDatePicker` / `UiDateRangePicker` datetime modes and Schema Form `datetime` / `datetime-range` mappings remain compatible while the dedicated root and component-subpath APIs improve discovery.
- Four additive package ceilings and the standalone-example JS ceiling receive measured date-time adapter headroom; chunk, core CSS and all other runtime ceilings remain unchanged.
- Windows CI keeps the local `0.002` visual threshold unchanged while allowing up to `0.035` for documented cross-machine Edge text rasterization drift.

## [1.48.0] - 2026-08-15

### Added

- `UiTimeRangePicker`, a dedicated strict-adapter wrapper for service windows, appointment ranges and recurring daily availability with string, `Date` and timestamp models.
- Built-in Schema Form `time-range`, `datetime` and `datetime-range` types with deterministic mode presets and consumer-prop override precedence.
- Time-range examples in the component center, one-page static preview and standalone consumer, plus unit, SSR, visual, Axe, type, packed-consumer and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Release gates advance to 82 public components, 365 locale keys, 25 visual baselines, 43 Axe scenarios, 47 interactions per browser and 37 negative type assertions.
- Generated API coverage advances to 934 Props, 329 Events and 160 Slots.
- Root and component-subpath runtime, declarations, isolated CSS, generated API documentation and Schema Form resolution share the 1.48.0 contract.
- Absolute package and distribution ceilings plus frozen 1.28 per-component allowances receive bounded Time Range headroom; file-count, consumer, chunk and non-additive improvement gates remain unchanged.

## [1.47.0] - 2026-08-15

### Added

- `UiCarousel`, an accessible controlled/uncontrolled content carousel with slide/fade effects, horizontal/vertical orientation, loop/finite navigation, lazy rendering, arrow/indicator variants and item/indicator/icon Slots.
- Logical keyboard navigation, pointer swipe, structured change and drag events, boundary events, imperative navigation/playback methods and explicit play/pause control.
- Automatic-rotation pause reasons for hover, focus, page visibility, drag, finite endpoints and Reduced Motion, plus named carousel/slide semantics, inert inactive content and live status.
- Carousel examples in the component center, one-page static preview and standalone consumer, with unit, SSR, visual, Axe, type, packed-consumer and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Release gates advance to 81 public components, 359 locale keys, 24 visual baselines, 42 Axe scenarios, 46 interactions per browser and 36 negative type assertions.
- Generated API coverage advances to 917 Props, 323 Events and 160 Slots.
- Root and component-subpath runtime, declarations, related carousel types, isolated CSS and generated API documentation share the 1.47.0 contract.
- Absolute package and distribution ceilings plus frozen 1.28 per-component allowances receive bounded Carousel headroom; file-count, consumer, chunk and non-additive improvement gates remain unchanged.

## [1.46.0] - 2026-08-15

### Added

- `UiQueryBuilder`, a controlled recursive condition editor with typed field/operator metadata, AND/OR/NOT groups, zero/one/two-value operators and text, number, date, select, multi-value and boolean editors.
- Immutable add, remove, duplicate, reorder and clear operations; keyboard editing; validation; hidden form serialization; public instance methods; and a built-in local `matches(record)` evaluator with custom field getters and operator tests.
- Query Builder examples in the component center, Schema Form, one-page static preview and standalone consumer, with unit, SSR, visual, Axe, type, packed-consumer and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Release gates advance to 80 public components, 349 locale keys, 23 visual baselines, 41 Axe scenarios, 45 interactions per browser and 35 negative type assertions.
- Generated API coverage advances to 894 Props, 315 Events and 155 Slots; package runtime, component subpath, isolated CSS, related query types and Schema Form resolution share the 1.46.0 contract.
- The frozen 1.28 comparison uses explicit per-additive-component allowances for package JavaScript, component-union CSS and the recursive typed editor dependency closure; absolute 18-metric ceilings remain independently enforced.

## [1.45.0] - 2026-08-15

### Added

- `UiInputTag`, a controlled multi-value editor with Unicode normalization, configurable separators and submit keys, multiline paste, case-aware deduplication and maximum count/length guards.
- Serialized synchronous or asynchronous validation and `beforeAdd` hooks, inline editing, collapse, clear, native form submission, FormItem linkage and built-in Schema Form support.
- InputTag examples in the component center, one-page static preview and standalone consumer, with unit, SSR, visual, Axe, type, packed-consumer and Chromium/Firefox/WebKit interaction coverage.

### Changed

- Release gates advance to 79 public components, 285 locale keys, 22 visual baselines, 40 Axe scenarios, 44 interactions per browser and 34 negative type assertions.
- Generated API coverage advances to 874 Props, 307 Events and 150 Slots; package runtime, root/subpath styles and types, interaction matrix and artifact verification share the 1.45.0 contract.
- InputTag keyboard behavior uses logical RTL arrows, an armed Backspace removal model, IME-safe tokenization and live localized mutation feedback.
- The frozen 1.28 comparison uses documented per-additive-component allowances for package JavaScript, component-union CSS and the standalone consumer while every unrelated historical metric retains zero allowance.

## [1.44.0] - 2026-08-14

### Added

- `UiMentions`, a caret-aware multiline mention editor with local or asynchronous suggestions, multiple trigger tokens, trigger-scoped options, custom filtering/validation/formatting and autosize/count support.
- Abortable debounced loading with stale-response protection and cache, plus localized loading, empty and error states and option/status Slots.
- Mentions examples in the component center, one-page static preview and standalone consumer, with unit, SSR, visual, Axe, type and Chromium/Firefox/WebKit interaction coverage.

### Changed

- The shared floating-position utility now observes real DOM Elements only, allowing virtual caret anchors without ResizeObserver exceptions.
- Mention accessibility uses a labelled combobox owner around the native multiline textbox, active-descendant/listbox ownership and contrast-compliant active suggestion metadata.
- Release gates advance to 78 public components, 265 locale keys, 21 visual baselines, 39 Axe scenarios, 43 interactions per browser and 33 negative type assertions.
- Generated API coverage advances to 846 Props, 297 Events and 148 Slots; package runtime, subpath styles/types and consumer verification share the 1.44.0 contract.
- The frozen 1.28 comparison keeps zero allowance for unchanged metrics and documents additive per-component allowances of 500 B package JS raw, 2.75 KB package JS gzip and 800 B standalone JS raw.

## [1.43.0] - 2026-08-14

### Added

- `UiOtpInput`, a segmented one-time-code control with numeric, alphanumeric and text modes, Unicode NFKC normalization, optional masking, separators and form submission support.
- Mobile `one-time-code` autofill, multi-character paste distribution, automatic focus movement, RTL-aware Arrow navigation, Home/End, Backspace/Delete and typed input/change/complete/invalid metadata.
- OTP examples in the component center, static preview and standalone consumer, with unit, SSR, visual, Axe, type and Chromium/Firefox/WebKit interaction regression coverage.

### Changed

- Release gates advance to 77 public components, 260 locale keys, 20 visual baselines, 38 Axe scenarios, 42 interactions per browser and 32 negative type assertions.
- Generated API coverage advances to 820 Props, 288 Events and 144 Slots; package runtime, subpath styles/types and consumer verification share the 1.43.0 contract.
- The frozen 1.28 comparison remains strict for historical metrics; aggregate package JavaScript gzip uses a transparent 2.25KB allowance per additive public component and an independent 188.5KB ceiling.

## [1.42.0] - 2026-08-14

### Added

- `UiList`, a semantic finite-data list with rich item fields and Slots, horizontal or vertical layouts, responsive container-aware grids, disabled records and none/single/multiple selection.
- Roving active-option behavior with Arrow/Home/End, typeahead, Enter/Space, Ctrl/Cmd+A, RTL movement, client/server pagination, localized loading/error/empty states and public focus/selection/scroll methods.
- List examples in the component center, static preview and standalone consumer, with unit, SSR, visual, Axe, type and Chromium/Firefox/WebKit regression coverage.

### Changed

- Release gates advance to 76 public components, 257 locale keys, 19 visual baselines, 37 Axe scenarios, 41 interactions per browser and 31 negative type assertions.
- Generated API coverage advances to 802 Props, 281 Events and 144 Slots; package runtime, subpath styles/types and consumer verification share the 1.42.0 contract.
- Locale drift checks now reject replacement characters and runs of question marks so corrupted translated labels fail before release.
- The frozen 1.28 comparison remains strict for historical metrics; aggregate package JavaScript gzip uses a 2KB allowance per additive public component and an independent 185KB ceiling.

## [1.41.0] - 2026-08-14

### Added

- `UiTypography`, a semantic title/text/paragraph primitive with typed tone, size, weight, alignment and inline emphasis treatments.
- Localized copy actions with Async Clipboard/fallback delivery, inline editing, controlled overflow expansion, ResizeObserver/font remeasurement, slot hooks and public instance methods.
- Typography examples in the component center, static preview and standalone consumer, with unit, SSR, visual, Axe, type and three-browser interaction regression coverage.

### Changed

- Release gates advance to 75 public components, 251 locale keys, 18 visual baselines, 36 Axe scenarios, 40 interactions per browser and 30 negative type assertions.
- Generated API coverage advances to 764 Props, 271 Events and 131 Slots; package runtime, subpath styles/types and consumer verification now share the 1.41.0 contract.
- The frozen 1.28 baseline remains strict for all historical metrics. Only aggregate package JavaScript gzip receives a deterministic 1.5KB allowance for each additive public component, alongside an absolute 180KB ceiling.

## [1.40.0] - 2026-08-14

### Added

- `UiSplitter`, a typed, data-driven multi-panel layout component with horizontal and vertical directions, pixel/percentage defaults and constraints, adjacent-pair pointer resizing, lazy preview mode and controlled responsive ratios.
- ARIA Separator semantics, Arrow/Home/End keyboard resizing, RTL mirroring, Enter/double-click collapse, forced-colors and print behavior, deterministic SSR and public reset/set/collapse/expand methods.
- Splitter examples across the component center, standalone consumer and one-page preview, with unit, SSR, visual, Axe, type and Chromium/Firefox/WebKit regression coverage.

### Changed

- Release gates advance to 74 public components, 242 locale keys, 17 visual baselines, 35 Axe scenarios, 39 interactions per browser and 29 negative type assertions.
- Generated API coverage advances to 741 Props, 262 Events and 125 Slots; application, static preview, declarations, component CSS and installed-tarball consumers share the 1.40.0 contract.
- The frozen 1.28 aggregate-JS guard now uses its recorded 69-component baseline and a deterministic 1KB gzip allowance per additive public component; all other historical metrics remain strict and the independent 175KB ceiling remains mandatory.

## [1.39.0] - 2026-08-13

### Added

- `UiAffix`, a typed top/bottom sticky-action component for the window or a custom scroll container, with explicit offsets, z-index, boundary constraints and reactive geometry updates.
- Public `update` and `updateRoot` methods, typed change/scroll/error diagnostics, invalid-target fallback, ResizeObserver integration and deterministic SSR output.
- Affix examples across the component center, standalone consumer and static preview, plus focused unit, SSR, visual, Axe, type and Chromium/Firefox/WebKit interaction regression.

### Changed

- Release gates advance to 73 public components, 242 locale keys, 16 visual baselines, 34 Axe scenarios, 38 interactions per browser and 28 negative type assertions.
- The application shell, login surface, component-menu badge, interaction matrix, API documentation, packed consumer and version metadata now expose the same 1.39.0 / 73-component release state.
- The isolated package consumer now verifies root and stable subpath Affix imports, component CSS, TypeScript declarations, SSR output and the browser bundle.
- The frozen 1.28 performance comparison retains strict improvement for 13 metrics and applies a 0.25% aggregate gzip tolerance only to additive package JavaScript; the absolute 172KB gzip ceiling remains mandatory.

## [1.38.0] - 2026-08-13

### Added

- `UiWatermark`, a typed text/image watermark component with device-pixel-aware Canvas rendering, multi-line text, configurable geometry, CORS handling, image fallback and an explicit accessible-label mode.
- Mutation recovery that restores a removed or modified visual layer without interfering with normal slot mutations or the protected content's pointer and keyboard interaction.
- Watermark examples in the component center, standalone package consumer and interactive static preview, plus unit, SSR, visual, Axe, type and Chromium/Firefox/WebKit regression coverage.

### Changed

- Release gates advance to 72 public components, 242 locale keys, 15 visual baselines, 33 Axe scenarios, 37 interactions per browser and 27 negative type assertions.
- The packed external consumer now installs, renders, types and bundles `UiWatermark` from its stable subpath with component-specific CSS.
- The application shell, login surface, component-menu badge and interaction matrix now expose the same 1.38.0 / 72-component release state instead of stale showcase metadata.

## [1.37.0] - 2026-08-13

### Added

- `UiTour`, a typed product-onboarding component with controlled step state, target resolution, 12 placements, viewport flip/shift, target highlighting, per-step masks, missing-target diagnostics and public navigation methods.
- Keyboard, focus-trap/restore, RTL, reduced-motion, SSR, forced-colors and non-modal scroll behavior, covered by focused unit, visual, Axe and Chromium/Firefox/WebKit interaction regression.
- Product-tour examples in the component center, static HTML preview and standalone package consumer, plus generated Props/Events/Slots documentation and component-specific CSS.

### Changed

- Overlay scroll locking is now per-entry, so non-modal tours preserve document scrolling while nested modal overlays still own the lock.
- Release gates advance to 71 public components, 242 locale keys, 14 visual baselines, 32 Axe scenarios, 36 interactions per browser and 26 negative type assertions. Performance ceilings add bounded headroom for the new runtime and styles while retaining the frozen 1.28 improvement comparison.

## [1.36.0] - 2026-08-13

### Added

- A supported Node runtime matrix for 20.19.0, 22.12.0 and the current 24 line, using the Node 20-compatible pnpm 10 line and repeating the full isolated packed-consumer contract on every runtime.
- A release contract that binds the package version, changelog, Git tag, exact tarball name, SHA-256 checksum, 70 component entries and distribution budgets before an artifact can be released.
- A tag/manual GitHub Release workflow that uploads the verified archive and checksum, creates an artifact attestation and creates a GitHub Release only for an exact version tag.

### Changed

- CI now runs three independent Linux compatibility jobs in addition to Windows verification and Firefox/WebKit interaction coverage.
- Packed-consumer regression now validates the same release artifact contract used by the release workflow.
- Isolated consumer setup now resolves an explicit lockfile and prefetches its content before the tested offline frozen install, avoiding package-manager metadata-cache coupling.

## [1.35.0] - 2026-08-13

### Added

- MIT licensing plus repository, issue tracker, homepage and public provenance metadata for a redistributable package boundary.
- A real packed-consumer regression that requires reproducible archives, rejects internal-file leakage, installs the release tarball offline outside the workspace, checks root and component subpaths, resolves public types, renders SSR and builds browser CSS/JavaScript.
- Explicit distribution ceilings for packed file count, compressed bytes and unpacked bytes, plus a reproducible `pack:artifact` command.

### Changed

- `tokens.css` is now an explicit Package Export and declared CSS side effect, so package consumers can load only the canonical Token layer through a supported subpath.
- Package gates now prove the artifact that consumers install rather than only inspecting the in-workspace `dist-lib` tree.

## [1.34.0] - 2026-08-13

### Added

- `UiAnchor`, a typed page-outline component with nested items, controlled and uncontrolled active state, window or element scroll containers, configurable offsets and bounds, sticky or inline layouts, vertical and horizontal variants, and item slots.
- Scroll-spy updates, programmatic navigation, pointer lifecycle events, roving keyboard focus, RTL arrow mirroring, reduced-motion behavior, deterministic SSR output, locale labels, per-component CSS and generated API coverage.

### Changed

- The component use-case center now consumes the public `UiAnchor` rather than maintaining a private table-of-contents implementation.
- Every showcase page is route-level lazy loaded, keeping the large component catalog and business examples out of the initial admin shell chunk.
- The standalone consumer registers its custom icon through the public icon subpath and keeps locally imported components on demand instead of redundantly installing the full global component plugin.
- Package JS ceilings add bounded headroom for the new public component while the frozen 1.28 release comparison remains enforced across all comparable metrics.
- Release gates advance to 70 public components with focused unit, type, visual, Axe and Chromium/Firefox/WebKit interaction coverage.

## [1.33.0] - 2026-08-13

### Added

- A generated Component API corpus for all 69 public components, with six stable categories, searchable Props/Events/Slots signatures, runtime constructor names, defaults, root imports and component-subpath imports.
- A lazy-loaded `/api` admin route with category filtering, contract search, copyable imports, direct component links, responsive tables and empty-result feedback.
- Deterministic Markdown, application JSON and public JSON outputs plus focused unit, visual, Axe and Chromium/Firefox/WebKit discovery regressions.

### Changed

- Upgraded `api-manifest.json` to schema 3 with detailed declarations and runtime default metadata while preserving the existing compact member lists.
- `api:generate`, `api:check`, `check` and `prepack` now reject generated API documentation drift. Admin hash routing ignores query parameters when resolving a page so component deep links remain routable.

## [1.32.0] - 2026-08-13

### Added

- A typed `motion` package subpath with `full / reduced / system` preference helpers, `useReducedMotion` and a persistence-aware `createMotionController` for application roots.
- Scoped motion metadata and variables on `UiConfigProvider`, including nested overrides and all 12 Teleport roots.
- Motion contracts, unit/SSR coverage, a visual baseline, a zero-violation Axe scenario, a three-browser interaction and dedicated raw/gzip subpath budgets.

### Changed

- All component transitions, spinners, skeletons and long-running decorative animations now consume cascading motion variables instead of independent duration literals.
- Reduced motion changes smooth scrolling to immediate scrolling, including managed-form error focus and the showcase floating action.
- The admin shell, component center, static preview and standalone consumer now demonstrate and persist motion preferences.
- Release gates advance to 11 visual baselines, 29 zero-violation Axe scenarios, 33 interactions per browser and 18 performance ceilings while preserving 69 public components.

## [1.31.0] - 2026-08-13

### Added

- A provider-owned Teleport theme scope that carries requested/resolved appearance, named Tokens, locale, size, density, direction, color scheme and overlay base to floating roots rendered under `body`.
- A build contract that discovers every Vue component containing Teleport and rejects missing bridge imports, setup calls, root attributes or styles; all 12 current Teleport components are covered.
- Focused unit, visual, Axe and Chromium/Firefox/WebKit interaction evidence for live scoped portal updates, including system-preference changes while an overlay remains open.

### Changed

- Modal, Drawer, Toast, Notification, Tooltip, Dropdown, Popover, Popconfirm, AutoComplete, ColorPicker, CommandPalette and Image preview now retain their nearest `UiConfigProvider` theme after Teleport.
- Global document themes remain the fallback when no local provider exists; the bridge adds no attributes or inline variables in that path.
- `UiCheckbox` now exposes `sm / md / lg` sizing and an explicit `ariaLabel`; `UiTable` reuses its compact `sm` variant for select-all and row selection instead of maintaining a visually oversized native-only checkbox.
- Release gates advance to 10 visual baselines, 28 zero-violation Axe scenarios and 32 interactions per browser while preserving 69 public components and all public APIs.

## [1.30.0] - 2026-08-13

### Added

- A public `theme` subpath with generated immutable light/dark presets, 102 validated Token names, theme definition/merge/style helpers and complete root/subpath TypeScript declarations.
- A host `createThemeController` for light, dark and system appearance, storage persistence, media-query updates, subscriptions, deterministic SSR, teardown and optional DOM restoration.
- Scoped theme examples and release gates across the component center, standalone consumer, unit tests, three browser engines, visual regression and Axe.

### Changed

- `UiConfigProvider` now exposes requested and resolved appearance attributes, follows live system preference changes and applies custom Tokens only to its own subtree without mutating the document root.
- `createLanUi` adds `setAppearance` and `setTheme`; the showcase shell now uses the public controller instead of directly coordinating document attributes and storage.
- Package/API parity advances to 20 public subpaths. CI now requires 9 visual baselines, 27 zero-violation Axe scenarios, 31 interactions per browser and a dependency-closure budget for the theme subpath.

## [1.29.0] - 2026-08-13

### Added

- A deterministic post-build ESM minifier and a `CSS_BOUNDARY` contract that verifies all 69 component styles, manifest byte parity, required selectors and the absence of 16 application/showcase selector families.
- A previous-release performance comparison gate: every one of the 14 measured metrics must improve on the recorded 1.28.0 release, not merely remain below a larger ceiling.
- Focused package-boundary tests for locale activation, protected built-ins, component runtime imports and cascade-layer containment.

### Changed

- Published `style.css` is now a minified union of public component selectors, Tokens and shared baseline rules. Admin shell, documentation, preview and example-only selectors remain in the showcase source stylesheet but no longer leak into the package.
- Per-component styles split comma-separated selectors at safe top-level boundaries, keep only selectors rooted at that component and are minified with pinned Lightning CSS.
- Component subpaths use a lean configuration runtime with the default Chinese locale. Importing the public `config` facade, `UiConfigProvider` or plugin installs the compatible English built-in and keeps both built-ins protected.
- Compared with 1.28.0, measured package JS falls from `467295 / 169161` B to about `363229 / 150087` B, package CSS from `434213 / 102085` B to about `337774 / 82667` B, root CSS from `182767 / 31846` B to about `127236 / 21761` B, and the UiButton consumer from `91716 / 8294` B to about `83067 / 7658` B.

## [1.28.0] - 2026-08-13

### Added

- Production `UiUpload` request orchestration with a controlled file queue, configurable worker concurrency, progress reporting, cancellation, retry, async preflight transformation and guarded removal.
- Typed upload files, request contexts, lifecycle payloads, public queue methods and trigger/tip/file slot scopes from both root and component subpath declarations.
- Component-center, customer import, standalone/static preview, deterministic SSR, visual, Axe and three-browser interaction examples for the complete upload lifecycle.

### Changed

- Existing selection-only usage remains compatible; when no `request` is supplied, accepted files retain the legacy immediate-success behavior.
- Locale coverage advances from 223 to 235 keys; visual coverage from 7 to 8 baselines, Axe coverage from 25 to 26 scenarios and interaction coverage from 29 to 30 cases per browser.
- Upload rendering now distinguishes ready, uploading, success, error and canceled states with localized status text, native progress semantics and task-specific accessible action names.
- Measured P32 ceilings are narrowly rebaselined for the larger upload orchestrator: aggregate package JS `470000 / 171000` B, package CSS Raw `436000` B and standalone raw JS/CSS `413000 / 185000` B; the other 9 budgets remain unchanged.

## [1.27.0] - 2026-08-13

### Added

- Native repeatable `type: 'list'` nodes in `UiSchemaForm`, including nested child fields, responsive item grids, item-aware resolvers, stable row identity and localized add/remove/reorder controls.
- List instance methods (`addListItem`, `removeListItem`, `moveListItem`, `replaceListItems`, `getListValue`) plus typed `list-change` and `list-limit` events.
- Component-center, standalone/static preview, deterministic SSR, visual, Axe and cross-browser interaction examples for schema-owned repeatable groups.

### Changed

- `UiFormList` change payloads now include immutable `previous` values; Schema Form forwards the complete structured list change while continuing to emit canonical `field-change` updates.
- Locale coverage advances from 216 to 223 keys; visual coverage from 6 to 7 baselines, Axe coverage from 24 to 25 scenarios and interaction coverage from 28 to 29 cases per browser.
- Measured P31 ceilings are narrowly rebaselined for the new orchestration and styles: package JS `456000 / 167000` B, package CSS `433000 / 103000` B, root CSS `183000 / 32500` B, largest component CSS `33000 / 5900` B and standalone raw JS/CSS `402000 / 184000` B.

## [1.26.0] - 2026-08-13

### Added

- Public `UiSchemaForm` for flat or grouped schema-driven forms, including nested model paths, responsive grid columns, field spans, conditional visibility and model-aware property resolvers.
- Built-in field mappings, custom component registries, targeted field/section slots, value normalization, immutable `field-change` payloads and contained/deduplicated `schema-error` reporting.
- Component-center, standalone/static preview, SSR, root/subpath type, visual, Axe and three-browser interaction coverage for conditional form orchestration.

### Changed

- Public component/style/API parity advances from 68 to 69; visual coverage advances from 5 to 6 baselines, Axe coverage from 23 to 24 scenarios and interaction coverage from 27 to 28 cases per browser.
- Measured P30 ceilings are narrowly rebaselined: package JS to `444000 / 164000` B, package CSS to `428000 / 102000` B, largest component CSS to `30000 / 5400` B, and standalone JS/CSS raw to `392000 / 181000` B; largest JS chunks, root CSS and minimal-consumer ceilings remain unchanged.

## [1.25.0] - 2026-08-13

### Added

- Public `UiFormList` for standalone or form-bound dynamic arrays, with stable row keys, nested field paths, guarded add/remove/move/replace operations and typed structured events.
- Cross-field `dependencies`, conditional rule `when(model, context)` and validator value getters for password confirmation, conditional sections and related-field validation.
- Component-center, standalone/static preview, SSR, unit, root/subpath type, visual, Axe and three-browser interaction coverage for dynamic form workflows.

### Changed

- `UiForm` field registration now uses a shallow reactive map so dynamic unregister/reindex operations preserve public field identity and do not retain stale rows.
- Public component/style/API parity advances from 67 to 68; visual coverage advances from 4 to 5 baselines, Axe coverage from 22 to 23 scenarios and interaction coverage from 26 to 27 cases per browser.
- The standalone example JavaScript ceiling is narrowly rebaselined from `383000` to `384000` raw bytes for its new FormList consumer; all package, CSS, chunk and minimal-consumer ceilings remain unchanged.

## [1.24.0] - 2026-08-13

### Added

- Managed `UiForm` field APIs for nested paths, partial reset, value/state inspection, programmatic submit, validation, focus and scroll control, plus server-error injection through `setFieldError` and `setFields`.
- Optional localized error summary with actionable field links, aggregate dirty/touched/validating slot state and typed form/item validation events.
- Built-in type, exact-length, enum and whitespace rules, value transforms and cancellable async validators with stale-result protection.
- Dedicated unit, SSR, root type, component-center, standalone/static preview, visual, Axe and three-browser interaction coverage for mature form workflows.
- Performance ceilings are narrowly rebaselined for the managed-form release: package JS `433000/160000` raw/gzip bytes and standalone example JS `383000` raw bytes; all CSS, chunk and minimal-consumer ceilings remain unchanged.

### Changed

- `UiForm` now scopes error focus to registered fields rather than querying the global document, handles native reset, keeps model identity and supports explicit `initialValues`.
- `UiFormItem` now reports idle/validating/success/error, touched and dirty state, responds to dynamic field names and exposes focus/scroll/error helpers.
- Locale parity advances from 211 to 216 keys; visual coverage advances from 3 to 4 baselines, Axe coverage from 21 to 22 scenarios and interaction coverage from 25 to 26 cases per browser.

## [1.23.0] - 2026-08-13

### Added

- Public `UiDataGrid` composition with controlled query, filters, stable sort, pagination, selection, expansion, density and column visibility.
- Client processing for nested search fields, custom search/filter/sort strategies and contained consumer callbacks; server orchestration emits reasoned `state-change` and `request` payloads with debounced search and optional initial request.
- Component-center, 25-section static preview, standalone consumer, SSR, root/subpath type, visual and three-browser interaction coverage.

### Changed

- `UiListToolbar` now supports independently hideable total, density, columns and refresh controls, named toolbar semantics, stable popup ownership and Escape focus restoration.
- `UiPagination` accepts an explicit accessible label so multiple pagination landmarks remain distinguishable; DataGrid generates a grid-specific pagination label.
- Table selection controls use 24px targets, mobile DataGrid rows avoid clipped interaction targets and secondary grid metadata meets dark-theme contrast.
- Public component/style/API parity advances from 66 to 67; Locale parity advances from 202 to 211 keys; Axe coverage advances from 19 to 21 scenarios and interaction coverage from 23 to 25 cases per browser.
- Performance ceilings are narrowly rebaselined for the composed DataGrid entry: package JS `420000/156000`, package CSS `400000/97000`, largest component CSS `24000/4700` and standalone JS `374000` raw/gzip bytes where applicable.

## [1.22.0] - 2026-08-13

### Added

- Public `UiVirtualList` with fixed, function-derived and live-measured item sizes, binary window lookup, overscan, scroll-anchor compensation and deterministic SSR output.
- Single/multiple selection, controlled active index, disabled records, typeahead, Arrow/Home/End/Page/Enter/Space/Ctrl+A keyboard behavior and public scroll/range/cache methods.
- Public `UiStatusPage` plus reusable 403, 404 and 500 routes with embedded/full-screen layouts, localized actions and typed illustration/action slots.
- Interactive component-center, standalone-consumer and 24-section static-preview demonstrations for virtualized data and application error boundaries.
- Unit, SSR, root/subpath type, visual, 19-scenario Axe and 23-case-per-browser interaction regression coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 64 to 66 entries; Locale parity advances from 187 to 202 keys.
- Static preview advances from 22 to 24 sections and now demonstrates a live 1,000-record rendering window plus switchable status states.
- Accessibility coverage advances from 17 to 19 scenarios and interaction coverage from 21 to 23 cases for Chromium, Firefox and WebKit.
- Components center release metadata now describes `UiVirtualList` 1.22.0 and the 403/404/500 application shell.
- Package and example ceilings are rebaselined with narrow release headroom: package JS `408000/152000`, package CSS `376000/92000`, root CSS `180000/32000`, UiButton subpath JS `92000`, standalone JS `364000` and standalone CSS `180000` raw/gzip bytes where applicable.

## [1.21.0] - 2026-08-12

### Added

- Public `UiImage` with native lazy/eager loading, decoding/cross-origin/referrer controls, responsive sizing, aspect ratio, object fit/position and one-shot fallback handling.
- Accessible full-screen preview with controlled/uncontrolled visibility and index, looping gallery navigation, adjacent preloading, zoom, rotation, reset, wheel/double-click operations and bounded pointer panning.
- Focus trapping/restoration, overlay-stack participation, body-scroll locking, Escape/mask close, LTR/RTL Arrow mapping, reduced-motion/forced-colors treatment and localized accessible controls.
- Typed placeholder/error/overlay/preview/caption/toolbar slots plus load, fallback, retry, gallery, preview-error and transform event metadata.
- Unit, SSR, typed root/subpath, package, component-center, static-preview, visual, Axe, three-browser keyboard and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 63 to 64 entries.
- Locale parity advances from 172 to 187 keys; Axe coverage advances from 15 to 17 scenarios and browser interaction coverage from 20 to 21 scenarios per engine.
- Static preview advances from 21 to 22 sections and includes an interactive image gallery.
- Package, root-style and standalone ceilings are rebaselined narrowly for the image runtime and preview styles: package JS `386000/145000`, package CSS `347000/85000`, root CSS `168000/29500`, standalone JS `348000` and standalone CSS `169000` raw/gzip bytes where applicable.
- Corrected the component-center interaction matrix so AutoComplete and Tree keep independent, scannable component labels.
- Static image preview now honors its initial `hidden` state and remains mounted after Escape, preventing an invisible layer from blocking the gallery and preserving repeatable focus restoration.
- Browser regression navigation now waits for fixture-ready markers after `DOMContentLoaded` with a 60-second navigation ceiling, avoiding false CI failures from an unnecessary `networkidle` wait.
- Numeric-string image dimensions and radii now normalize to pixels while explicit CSS lengths remain unchanged, fixing zero-size lazy images in Firefox.
- Calendar range previews now show chronological start/end caps on either side of a pending anchor and expose the unfinished anchor as a distinct state.
- Centered modals now fit the dynamic viewport, scroll oversized bodies internally, wrap narrow action rows and respect mobile safe-area insets.

## [1.20.0] - 2026-08-12

### Added

- Public `UiCalendar` with single, multiple and range selection, string/Date/timestamp output, controlled month navigation and a 12-year selection panel.
- Locale-aware weekday order and labels, optional week numbers, fixed/natural rows, adjacent-day visibility, minimum/maximum dates, capped multiple selection and contained custom disabled-date rules.
- Instance-scoped roving focus with Arrow, Home/End, Page, Shift+Page, Enter/Space and Delete/Backspace keyboard operations plus RTL horizontal mapping.
- Range hover previews, today/range/selection semantics, three sizes, responsive layout, reduced-motion/forced-colors treatment and typed header/cell/year/footer slots.
- Unit, SSR, typed root/subpath, package, component-center, static-preview, visual, Axe, three-browser keyboard and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 62 to 63 entries.
- Locale parity advances from 158 to 172 keys; Axe coverage advances from 14 to 15 scenarios and browser interaction coverage from 19 to 20 scenarios per engine.
- Static preview advances from 20 to 21 sections and includes an interactive range-calendar example.
- Reviewed package JS raw/gzip ceilings move to `365000 / 138000` B, package CSS to `325000 / 81000` B, root CSS to `160000 / 28500` B, subpath-consumer JS raw to `88000` B and standalone JS/CSS raw to `330000 / 162000` B. The remaining five ceilings are unchanged.

## [1.19.0] - 2026-08-12

### Added

- Public `UiStatistic` for localized numeric or string values, exact precision, arbitrary `Intl.NumberFormat` options, prefix/suffix/placeholder content and contained custom formatters.
- Directional trends with configurable positive direction, localized accessible text, neutral zero handling, status/size variants, stable loading skeletons and optional live-region announcements.
- Title, prefix, value, suffix, trend and extra slots plus explicit `ariaLabel` and `ariaValueText` escape hatches for customized visual content.
- Unit, SSR, typed root/subpath, package, component-center, static-preview, visual, Axe, three-browser live-update and standalone-consumer coverage.

### Changed

- Public component, declaration, style and API-manifest parity advances from 61 to 62 entries.
- Locale parity advances from 152 to 158 keys; browser interaction coverage advances from 18 to 19 scenarios per engine.
- Static preview advances from 19 to 20 sections and corrects Rate/ColorPicker section numbering.
- Error toasts now track the active overlay stack and stay above nested modal/drawer layers; overlay stack entries also preserve monotonic z-index ordering.
- Reviewed raw-byte ceilings move from 335000 to 345000 B for package JS, 150000 to 155000 B for root CSS, 310000 to 318000 B for standalone JS and 150000 to 155000 B for standalone CSS. All gzip ceilings and the other six raw ceilings remain unchanged.

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
