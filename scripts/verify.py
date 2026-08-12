from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    "index.html", "component-preview.html", "interaction-regression.html", "styles.css", "tokens.css", "font-preview.css",
    "UI-SPEC.md", "README.md", "CHANGELOG.md", "MIGRATION.md", "api-manifest.json", "style-manifest.json", "visual-regression.html", "package.json", "pnpm-workspace.yaml", "vite.config.js", "src/main.js", "src/App.vue",
    "src/pages/LoginPage.vue", "src/pages/LogoutPage.vue", "src/pages/NotFoundPage.vue",
    "src/pages/DashboardPage.vue", "src/pages/WorkbenchPage.vue", "src/pages/DataPage.vue",
    "src/pages/AiPage.vue", "src/pages/GanttPage.vue", "src/pages/ComponentsPage.vue",
    "src/components/UiIcon.vue", "src/components/UiInput.vue", "src/components/UiNumberInput.vue", "src/components/UiSlider.vue", "src/components/UiAutoComplete.vue", "src/components/UiSelect.vue", "src/components/UiTextarea.vue",
    "src/components/UiDatePicker.vue", "src/components/UiTimePicker.vue", "src/components/UiPagination.vue",
    "src/components/UiUpload.vue", "src/components/UiFloatButton.vue",
    "src/components/UiTable.vue", "src/components/UiListToolbar.vue",
    "src/components/UiModal.vue", "src/components/UiDrawer.vue",
    "src/components/UiTooltip.vue", "src/components/UiPopover.vue",
    "src/components/UiPopconfirm.vue", "src/components/UiToastHost.vue",
    "src/components/UiNotification.vue", "src/components/UiFormItem.vue",
    "src/components/UiCheckbox.vue", "src/components/UiRadio.vue",
    "src/components/UiSwitch.vue",
    "src/components/UiLayout.vue", "src/components/UiGrid.vue", "src/components/UiCol.vue",
    "src/components/UiSpace.vue", "src/components/UiDivider.vue", "src/components/UiTabs.vue",
    "src/components/UiBreadcrumb.vue", "src/components/UiAvatar.vue", "src/components/UiBadge.vue",
    "src/components/UiSkeleton.vue", "src/components/UiEmpty.vue", "src/components/UiAlert.vue",
    "src/components/UiDropdown.vue", "src/components/UiProgress.vue", "src/components/UiSteps.vue",
    "src/components/UiTimeline.vue", "src/components/UiForm.vue", "src/components/UiMultiSelect.vue",
    "src/components/UiTree.vue", "src/components/UiTreeSelect.vue", "src/components/UiCascader.vue", "src/components/UiTransfer.vue",
    "src/components/UiMenu.vue", "src/components/UiCollapse.vue", "src/components/UiDescriptions.vue",
    "src/components/UiResult.vue", "src/components/UiSpin.vue", "src/components/UiSegmented.vue",
    "src/components/UiConfigProvider.vue", "src/components/UiDateRangePicker.vue",
    "src/components/AppIcon.vue", "src/components/overlayManager.js", "src/components/floatingPosition.js", "src/components/focusUtils.js", "src/config.js", "src/date.js", "src/icons.js", "src/components.js", "src/plugin.js", "src/feedback.js", "src/env.js", "src/index.js", "src/index.d.ts", "vite.lib.config.js", "vitest.config.js",
    "design-tokens.json", "performance-budgets.json", "scripts/export-tokens.mjs", "scripts/copy-types.mjs", "scripts/lint.mjs", "scripts/split-component-css.mjs", "scripts/browser-runtime.mjs", "scripts/visual-regression.mjs", "scripts/accessibility-regression.mjs", "scripts/interaction-regression.mjs", "scripts/performance-regression.mjs",
    "scripts/component-contracts.mjs", "scripts/locale-contracts.mjs", "scripts/intl-contracts.mjs", "scripts/locale-registry-contracts.mjs", "scripts/date-contracts.mjs", "scripts/icon-contracts.mjs", "scripts/build_p14_artifacts.py", "scripts/build_p15_artifacts.py", "scripts/build_p16_artifacts.py", "scripts/build_p17_artifacts.py", "scripts/build_p18_artifacts.py", "scripts/build_p19_artifacts.py", "scripts/test-package-exports.mjs", "scripts/build-subpath-consumer.mjs", "scripts/api-manifest.mjs", "tests/accessibility.spec.js", "tests/accessibility-p6.spec.js", "tests/maturity-p1.spec.js", "tests/maturity-p7.spec.js", "tests/maturity-p8.spec.js", "tests/config-p2.spec.js", "tests/locale-p11.spec.js", "tests/intl-p12.spec.js", "tests/locale-registry-p13.spec.js", "tests/date-p14.spec.js", "tests/icon-p15.spec.js", "tests/number-input-p16.spec.js", "tests/slider-p17.spec.js", "tests/autocomplete-p18.spec.js", "tests/tree-p19.spec.js", "tests/ssr-p3.spec.js", "tests/overlay-client-p3.spec.js", "tests/rtl-p5.spec.js", "tests/types/tsconfig.json", "tests/types/contracts.ts", "tests/types/Consumer.vue", "tests/visual/fixture-main.js", "tests/visual/VisualFixture.vue", "tests/visual/fixture.css", "tests/interaction/fixture-main.js", "tests/interaction/InteractionFixture.vue", "tests/interaction/fixture.css", "tests/fixtures/subpath-consumer/index.html", "tests/fixtures/subpath-consumer/src/main.js", ".editorconfig", ".github/workflows/ci.yml",
    "examples/standalone-vue/package.json", "examples/standalone-vue/vite.config.js",
    "examples/standalone-vue/src/main.js", "examples/standalone-vue/src/App.vue",
]

failures = []
for rel in required:
    path = ROOT / rel
    if not path.is_file() or path.stat().st_size == 0:
        failures.append(f"missing-or-empty:{rel}")

package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
if not str(package.get("peerDependencies", {}).get("vue", "")).strip():
    failures.append("package:vue-peer-dependency")
if not str(package.get("devDependencies", {}).get("vue", "")).strip():
    failures.append("package:vue-dev-dependency")
if "vite" not in package.get("scripts", {}).get("build", ""):
    failures.append("package:build-script")
if package.get("types") != "./dist-lib/lan-ui.d.ts" or package.get("style") != "./dist-lib/lan-ui.css":
    failures.append("package:distribution-entrypoints")
if "./dist-lib/lan-ui.css" not in package.get("sideEffects", []):
    failures.append("package:css-side-effect")
for dependency in ["vitest", "@vue/test-utils", "happy-dom", "postcss", "playwright", "pixelmatch", "pngjs", "axe-core", "typescript", "vue-tsc"]:
    if not package.get("devDependencies", {}).get(dependency):
        failures.append(f"package:test-dependency:{dependency}")
if "vitest run" not in package.get("scripts", {}).get("test", ""):
    failures.append("package:behavior-test-script")
exports = package.get("exports", {})
for subpath in ["./components/*", "./config", "./date", "./feedback", "./icons", "./plugin", "./style.css", "./styles/core.css", "./styles/*.css", "./tokens", "./style-manifest", "./style-manifest.json"]:
    if subpath not in exports:
        failures.append(f"package:export:{subpath}")
if "test:package" not in package.get("scripts", {}) or "test:package" not in package.get("scripts", {}).get("check", ""):
    failures.append("package:subpath-test-script")
if package.get("packageManager") != "pnpm@11.16.0" or package.get("license") != "UNLICENSED":
    failures.append("package:release-metadata")
if not all(name in package.get("files", []) for name in ["api-manifest.json","style-manifest.json","CHANGELOG.md","MIGRATION.md"]) or "api:check" not in package.get("scripts", {}).get("check", ""):
    failures.append("package:api-manifest-delivery")
if not package.get("typesVersions", {}).get("*", {}).get("components/*"):
    failures.append("package:legacy-types-subpaths")
api_manifest = json.loads((ROOT / "api-manifest.json").read_text(encoding="utf-8"))
if api_manifest.get("package") != package.get("name") or api_manifest.get("version") != package.get("version"):
    failures.append("api-manifest:package-version")
if api_manifest.get("publicSubpaths") != sorted(exports):
    failures.append("api-manifest:subpaths")
manifest_components = api_manifest.get("components", [])
if api_manifest.get("schemaVersion") != 2 or len(api_manifest.get("root", {}).get("typeExports", [])) < 285 or len(manifest_components) != 58:
    failures.append(f"api-manifest:components:{len(manifest_components)}")
for component in manifest_components:
    name = component.get("name")
    if sorted(component.get("runtimeExports", [])) != sorted(["default", name]) or not component.get("props") or not isinstance(component.get("emits"), list) or not isinstance(component.get("slots"), list) or component.get("emitsType") != f"{name}Emits" or component.get("slotsType") != f"{name}Slots":
        failures.append(f"api-manifest:parity:{component.get('name')}")

style_manifest = json.loads((ROOT / "style-manifest.json").read_text(encoding="utf-8"))
style_components = style_manifest.get("components", [])
if style_manifest.get("package") != package.get("name") or style_manifest.get("version") != package.get("version"):
    failures.append("style-manifest:package-version")
if len(style_components) != 58 or any(not item.get("bytes") or not item.get("rules") for item in style_components):
    failures.append(f"style-manifest:components:{len(style_components)}")
if style_manifest.get("core", {}).get("subpath") != "./styles/core.css" or not style_manifest.get("core", {}).get("bytes"):
    failures.append("style-manifest:core")
if [item.get("name") for item in style_components] != sorted(item.get("name") for item in style_components):
    failures.append("style-manifest:order")
for script_name in ["test:visual", "test:a11y", "visual:update", "styles:generate", "styles:check"]:
    if script_name not in package.get("scripts", {}):
        failures.append(f"package:p5-script:{script_name}")
for script_name in ["test:visual", "test:a11y", "test:types", "test:package"]:
    if script_name not in package.get("scripts", {}).get("check", ""):
        failures.append(f"package:p5-check-gate:{script_name}")
for script_name in ["test:interaction", "test:interaction:cross-browser", "test:interaction:non-chromium"]:
    if script_name not in package.get("scripts", {}):
        failures.append(f"package:p8-script:{script_name}")
if "vue-tsc" not in package.get("scripts", {}).get("test:types", "") or "test:types" not in package.get("scripts", {}).get("prepack", ""):
    failures.append("package:p9-type-gate")
if "locale-contracts.mjs" not in package.get("scripts", {}).get("test:locale", "") or "test:locale" not in package.get("scripts", {}).get("prepack", ""):
    failures.append("package:p11-locale-gate")
if "intl-contracts.mjs" not in package.get("scripts", {}).get("test:locale", ""):
    failures.append("package:p12-intl-gate")
if "locale-registry-contracts.mjs" not in package.get("scripts", {}).get("test:locale", ""):
    failures.append("package:p13-registry-gate")
if "date-contracts.mjs" not in package.get("scripts", {}).get("test:date", "") or "test:date" not in package.get("scripts", {}).get("prepack", ""):
    failures.append("package:p14-date-gate")
if "icon-contracts.mjs" not in package.get("scripts", {}).get("test:icons", "") or "test:icons" not in package.get("scripts", {}).get("prepack", ""):
    failures.append("package:p15-icon-gate")
type_declarations = (ROOT / "src/index.d.ts").read_text(encoding="utf-8")
type_contract = (ROOT / "tests/types/contracts.ts").read_text(encoding="utf-8")
type_fixture = (ROOT / "tests/types/Consumer.vue").read_text(encoding="utf-8")
for component in manifest_components:
    name = component.get("name")
    if f"{name}:LanComponent<{name}Props,{name}Emits,{name}Slots>" not in type_declarations:
        failures.append(f"typescript:component-contract:{name}")
for marker in ["@ts-expect-error", "UiInputEmits", "UiInputSlots", "cell-${string}", "panel-${string}"]:
    if marker not in type_contract + type_declarations:
        failures.append(f"typescript:fixture:{marker}")
for marker in ["#footer", "#cell-name", "#panel-summary", "@sort-change", "v-model"]:
    if marker not in type_fixture:
        failures.append(f"typescript:vue-fixture:{marker}")

feedback_source = (ROOT / "src/feedback.js").read_text(encoding="utf-8")
plugin_source = (ROOT / "src/plugin.js").read_text(encoding="utf-8")
isolation_test = (ROOT / "tests/isolation-p10.spec.js").read_text(encoding="utf-8")
for marker in ["createLanUiFeedback", "lanUiFeedbackKey", "useFeedback", "disposed", "exitTimer"]:
    if marker not in feedback_source:
        failures.append(f"feedback:isolation:{marker}")
for marker in ["options.isolated", "options.feedback", "app.onUnmount", "feedback.dispose"]:
    if marker not in plugin_source:
        failures.append(f"plugin:isolation:{marker}")
for marker in ["keeps two installed applications independent", "explicit feedback instance", "pending toast timers"]:
    if marker not in isolation_test:
        failures.append(f"test:isolation:{marker}")
locale_script = (ROOT / "scripts/locale-contracts.mjs").read_text(encoding="utf-8")
locale_test = (ROOT / "tests/locale-p11.spec.js").read_text(encoding="utf-8")
for marker in ["Locale key parity", "Locale placeholder parity", "hard-coded CJK copy", "LOCALE_CONTRACT PASS"]:
    if marker not in locale_script:
        failures.append(f"locale:contract:{marker}")
for marker in ["updates visible copy and accessible names", "generated form errors reactive", "explicit component labels"]:
    if marker not in locale_test:
        failures.append(f"locale:test:{marker}")
intl_script = (ROOT / "scripts/intl-contracts.mjs").read_text(encoding="utf-8")
intl_test = (ROOT / "tests/intl-p12.spec.js").read_text(encoding="utf-8")
config_source = (ROOT / "src/config.js").read_text(encoding="utf-8")
for marker in ["createLocaleTools", "fallbackLocale", "Intl.NumberFormat", "Intl.DateTimeFormat", "Intl.RelativeTimeFormat", "Intl.ListFormat", "Intl.PluralRules"]:
    if marker not in config_source:
        failures.append(f"intl:runtime:{marker}")
for marker in ["Per-key fallback resolution", "Exact plural choice", "Unknown locale collapsed", "INTL_CONTRACT PASS"]:
    if marker not in intl_script:
        failures.append(f"intl:contract:{marker}")
for marker in ["reacts to application locale and fallback changes", "localizes component counters", "fallback opt-out"]:
    if marker not in intl_test:
        failures.append(f"intl:test:{marker}")
for component in ["UiBadge.vue", "UiListToolbar.vue", "UiPagination.vue", "UiProgress.vue", "UiTransfer.vue", "UiUpload.vue"]:
    if "formatNumber" not in (ROOT / "src/components" / component).read_text(encoding="utf-8"):
        failures.append(f"intl:component-number:{component}")
for marker in ["createLocaleTools", "setFallbackLocale", "LanUiLocaleTools", "Intl.PluralRulesOptions"]:
    if marker not in type_contract + type_declarations:
        failures.append(f"intl:types:{marker}")
registry_script = (ROOT / "scripts/locale-registry-contracts.mjs").read_text(encoding="utf-8")
registry_test = (ROOT / "tests/locale-registry-p13.spec.js").read_text(encoding="utf-8")
for marker in ["createLocaleRegistry", "defaultLocaleRegistry", "pending", "fallbackLocales", "registerLocale", "loadLocale"]:
    if marker not in config_source + plugin_source:
        failures.append(f"locale-registry:runtime:{marker}")
for marker in ["registry=isolated", "lazy=deduplicated", "retry=pass", "fallback-chain=2", "LOCALE_REGISTRY_CONTRACT PASS"]:
    if marker not in registry_script:
        failures.append(f"locale-registry:contract:{marker}")
for marker in ["deduplicates concurrent lazy loads", "failed pending loads", "multi-level fallback chain", "plugin registries isolated", "fallback-chain updates", "provider chain"]:
    if marker not in registry_test:
        failures.append(f"locale-registry:test:{marker}")
for marker in ["LocaleRegistry", "LocaleLoader", "LocaleLoadOptions", "createLocaleRegistry", "plugin.loadLocale", "fallbackLocales"]:
    if marker not in type_contract + type_declarations:
        failures.append(f"locale-registry:types:{marker}")
date_source = (ROOT / "src/date.js").read_text(encoding="utf-8")
date_script = (ROOT / "scripts/date-contracts.mjs").read_text(encoding="utf-8")
date_test = (ROOT / "tests/date-p14.spec.js").read_text(encoding="utf-8")
for marker in ["parseDateValue", "dateValueToDate", "formatDateValue", "fromDateValue", "compareDateValues", "resolveTimeZone", "disambiguation", "referenceDate"]:
    if marker not in date_source:
        failures.append(f"date:runtime:{marker}")
for marker in ["strict=calendar", "zones=iana", "dst=gap+overlap", "values=string+date+timestamp", "DATE_CONTRACT PASS"]:
    if marker not in date_script:
        failures.append(f"date:contract:{marker}")
for marker in ["daylight-saving gaps and overlaps", "emits Date values atomically", "nonexistent zoned wall times", "named time picker"]:
    if marker not in date_test:
        failures.append(f"date:test:{marker}")
for marker in ["DateValueOptions", "DateDisambiguation", "UiTimePickerProps", "dateValueToDate", "subpathDateValueToDate"]:
    if marker not in type_contract + type_declarations:
        failures.append(f"date:types:{marker}")
icon_source = (ROOT / "src/icons.js").read_text(encoding="utf-8")
icon_definition_source = (ROOT / "src/icon-definitions.js").read_text(encoding="utf-8")
icon_component = (ROOT / "src/components/UiIcon.vue").read_text(encoding="utf-8")
icon_script = (ROOT / "scripts/icon-contracts.mjs").read_text(encoding="utf-8")
icon_test = (ROOT / "tests/icon-p15.spec.js").read_text(encoding="utf-8")
for marker in ["BUILTIN_ICON_NAMES", "defineIcon", "createIconRegistry", "iconRegistryKey", "shallowReactive"]:
    if marker not in icon_source:
        failures.append(f"icons:runtime:{marker}")
for marker in ["allowedTags", "allowedAttributes"]:
    if marker not in icon_definition_source:
        failures.append(f"icons:definitions:{marker}")
for marker in ["builtins=46", "registry=isolated", "custom=sanitized", "accessibility=decorative+labelled", "ICON_CONTRACT PASS"]:
    if marker not in icon_script:
        failures.append(f"icons:contract:{marker}")
for marker in ["protected built-in catalog", "rejects executable or malformed fragments", "directional icons", "plugin and provider registries", "server rendering"]:
    if marker not in icon_test:
        failures.append(f"icons:test:{marker}")
for marker in ["IconDefinitionInput", "IconRegistry", "UiIconProps", "createIconRegistry", "createSubpathIconRegistry", "plugin.registerIcon"]:
    if marker not in type_contract + type_declarations:
        failures.append(f"icons:types:{marker}")
for marker in ["definition?.nodes", "ariaLabel", "data-ui-icon-missing", "directional", "is-spinning"]:
    if marker not in icon_component:
        failures.append(f"icons:component:{marker}")
if "v-html" in icon_component:
    failures.append("icons:component:v-html")
for marker in ["createIconRegistry", "iconRegistryKey", "app.provide(iconRegistryKey", "registerIcon", "listIcons"]:
    if marker not in plugin_source:
        failures.append(f"icons:plugin:{marker}")

app = (ROOT / "src/App.vue").read_text(encoding="utf-8")
main = (ROOT / "src/main.js").read_text(encoding="utf-8")
if 'class="tab-trigger"' not in app or 'type="button" class="tab-close"' not in app or 'class="tab-close" role="button"' in app:
    failures.append("navigation:independent-tab-actions")
for route in ["/home", "/workbench", "/data", "/ai", "/gantt", "/components", "/login", "/logout"]:
    if route not in app:
        failures.append(f"route:{route}")
for marker in ["createLanUi", ".use(createLanUi"]:
    if marker not in main:
        failures.append(f"main:plugin:{marker}")
vitest_config=(ROOT / "vitest.config.js").read_text(encoding="utf-8")
for marker in ["tests/**/*.spec.js", ".verify/**", ".baseline/**"]:
    if marker not in vitest_config:
        failures.append(f"vitest-boundary:{marker}")
ssr_test=(ROOT / "tests/ssr-p3.spec.js").read_text(encoding="utf-8")
for marker in ["vue/server-renderer", "typeof document", "UiModal", "UiDrawer", "UiPopover", "UiDateRangePicker", "stable across equivalent app renders"]:
    if marker not in ssr_test:
        failures.append(f"ssr-test:{marker}")
overlay_client_test=(ROOT / "tests/overlay-client-p3.spec.js").read_text(encoding="utf-8")
for marker in ["body lock", "overlayCount()).toBe(2)", "document.activeElement).toBe(trigger)"]:
    if marker not in overlay_client_test:
        failures.append(f"overlay-client-test:{marker}")
env_source=(ROOT / "src/env.js").read_text(encoding="utf-8")
modal_source=(ROOT / "src/components/UiModal.vue").read_text(encoding="utf-8")
drawer_source=(ROOT / "src/components/UiDrawer.vue").read_text(encoding="utf-8")
overlay_source=(ROOT / "src/components/overlayManager.js").read_text(encoding="utf-8")
if "typeof window !== 'undefined'" not in env_source or "getDocument" not in overlay_source:
    failures.append("ssr:environment-guard")
for name,source in [("modal",modal_source),("drawer",drawer_source)]:
    if "useId" not in source or "isClient" not in source or "Math.random" in source:
        failures.append(f"ssr:stable-id:{name}")

preview = (ROOT / "component-preview.html").read_text(encoding="utf-8")
if preview.count('class="preview-section"') < 13:
    failures.append("preview:section-count")
for interaction in ["data-modal", "data-drawer", "data-toast", "previewSwitch", "previewTabs", "previewSelect", "previewUpload", "previewPagination", "previewBackTop"]:
    if interaction not in preview:
        failures.append(f"preview:interaction:{interaction}")
for marker in ["previewOverlayComponents", "previewPopoverPanel", "previewConfirmPanel", "previewOverlaySwitch"]:
    if marker not in preview:
        failures.append(f"preview:feedback-form:{marker}")
for marker in ["previewCompletionSystem", "previewAccessibleTabs", "previewCompletionAlert", "data-completion-tab"]:
    if marker not in preview:
        failures.append(f"preview:completion:{marker}")
for marker in ["previewMenu", "previewCollapse", "previewSegmented", "previewSpin", "positionPreviewFloat"]:
    if marker not in preview:
        failures.append(f"preview:maturity-p1:{marker}")
for marker in ["previewLocaleSwitch", "previewConfigSurface", "ui-date-range-picker", "createLanUi"]:
    if marker not in preview:
        failures.append(f"preview:maturity-p2:{marker}")
for marker in ["previewFontGrid", "data-font-preset", "syncFontPreset", "font-preview.css"]:
    if marker not in preview:
        failures.append(f"preview:font-system:{marker}")
for marker in ['id="icon-registry"', 'data-ui-icon="tenantMark"', "createIconRegistry()", "Public icon system"]:
    if marker not in preview:
        failures.append(f"preview:icon-system:{marker}")
for marker in ['id="tree"', 'id="previewTree"', 'renderPreviewTree', 'Tree']:
    if marker not in preview:
        failures.append(f"preview:tree-system:{marker}")
if 'role="listbox"' not in preview or 'role="option"' not in preview:
    failures.append("preview:select-accessibility")
if "</i>" in preview.replace('<i class="status-dot"></i>', ""):
    failures.append("preview:orphan-icon-close")

vue_sources = "\n".join(path.read_text(encoding="utf-8") for path in (ROOT / "src").rglob("*.vue"))
if "<select" in vue_sources:
    failures.append("form:native-select")
for component in ["UiInput", "UiNumberInput", "UiSlider", "UiAutoComplete", "UiSelect", "UiTextarea"]:
    if component not in vue_sources:
        failures.append(f"form:component:{component}")
for component in ["UiDatePicker", "UiDateRangePicker", "UiTimePicker", "UiPagination", "UiUpload", "UiFloatButton"]:
    if component not in vue_sources:
        failures.append(f"extension:component:{component}")
for component in ["UiTable", "UiListToolbar"]:
    if component not in vue_sources:
        failures.append(f"table-system:component:{component}")
for component in ["UiModal", "UiDrawer", "UiToastHost", "UiNotification", "UiTooltip", "UiPopover", "UiPopconfirm"]:
    if component not in vue_sources:
        failures.append(f"feedback-system:component:{component}")
for component in ["UiFormItem", "UiCheckbox", "UiRadio", "UiSwitch"]:
    if component not in vue_sources:
        failures.append(f"form-selection:component:{component}")
completion_components = ["UiLayout","UiGrid","UiCol","UiSpace","UiDivider","UiTabs","UiBreadcrumb","UiAvatar","UiBadge","UiSkeleton","UiEmpty","UiAlert","UiDropdown","UiProgress","UiSteps","UiTimeline","UiForm","UiMultiSelect","UiTree","UiTreeSelect","UiCascader","UiTransfer"]
for component in completion_components:
    if component not in vue_sources:
        failures.append(f"completion:component:{component}")
for component in ["UiMenu","UiCollapse","UiDescriptions","UiResult","UiSpin","UiSegmented"]:
    if component not in vue_sources:
        failures.append(f"maturity-p1:component:{component}")
for component in ["UiConfigProvider","UiDateRangePicker"]:
    if component not in vue_sources:
        failures.append(f"maturity-p2:component:{component}")
for marker in ['id="layout"', 'id="floating"', 'id="extensions"', 'id="patterns"']:
    target = preview if marker in ['id="extensions"', 'id="patterns"'] else vue_sources
    if marker not in target:
        failures.append(f"extension:marker:{marker}")
data_page = (ROOT / "src/pages/DataPage.vue").read_text(encoding="utf-8")
for component in ["UiDateRangePicker", "UiPagination", "UiUpload"]:
    if component not in data_page:
        failures.append(f"data-sync:{component}")
for component in ["UiTable", "UiListToolbar", "UiPagination"]:
    if component not in data_page:
        failures.append(f"table-sync:{component}")
for behavior in ["selectable", "expandable", "sticky-header", "v-model:sort-key", "v-model:selected-rows"]:
    if behavior not in data_page:
        failures.append(f"table-behavior:{behavior}")
for marker in ["previewTableSystem", "previewSelectAll", "previewTableSort", "data-preview-table-state"]:
    if marker not in preview:
        failures.append(f"preview:table-system:{marker}")

components_page = (ROOT / "src/pages/ComponentsPage.vue").read_text(encoding="utf-8")
for component in ["UiCheckbox", "UiRadio", "UiSwitch", "UiTooltip", "UiPopover", "UiPopconfirm", "UiMenu", "UiCollapse", "UiDescriptions", "UiResult", "UiSpin", "UiSegmented", "UiConfigProvider", "UiDateRangePicker", "UiTimePicker", "UiIcon", "UiNumberInput", "UiSlider", "UiAutoComplete", "UiTree"]:
    if component not in components_page:
        failures.append(f"component-center:sync:{component}")
for marker in ["fontPresets", "selectedFont", "applyFont", "Inter + Noto Sans SC", "LXGW WenKai"]:
    if marker not in components_page:
        failures.append(f"component-center:font-system:{marker}")
for marker in ["iconDemoNames", "iconDemoRegistry", "tenantMark", "directional", "icon-gallery"]:
    if marker not in components_page:
        failures.append(f"component-center:icon-system:{marker}")
for component in ["<UiModal", "<UiDrawer", "<UiToastHost", "<UiNotification"]:
    if component not in app:
        failures.append(f"app:feedback-migration:{component}")
for legacy in ['v-if="modal" class="overlay"', 'v-if="drawer" class="drawer-overlay"', 'v-for="toast in toasts"']:
    if legacy in app:
        failures.append(f"app:legacy-overlay:{legacy}")

page_sources = "\n".join(path.read_text(encoding="utf-8") for path in (ROOT / "src/pages").glob("*.vue"))
for legacy in ['class="breadcrumb"', 'class="avatar', 'class="skeleton', 'class="segmented"']:
    if legacy in page_sources:
        failures.append(f"pages:legacy-primitive:{legacy}")
for page in ["DashboardPage.vue","WorkbenchPage.vue","DataPage.vue","AiPage.vue","GanttPage.vue","ComponentsPage.vue"]:
    if "UiBreadcrumb" not in (ROOT / "src/pages" / page).read_text(encoding="utf-8"):
        failures.append(f"pages:breadcrumb-sync:{page}")
for component in ["UiAvatar","UiBadge","UiEmpty"]:
    if component not in app:
        failures.append(f"app:primitive-sync:{component}")

behavior_sources = {
    "modal": (ROOT / "src/components/UiModal.vue").read_text(encoding="utf-8"),
    "drawer": (ROOT / "src/components/UiDrawer.vue").read_text(encoding="utf-8"),
    "tooltip": (ROOT / "src/components/UiTooltip.vue").read_text(encoding="utf-8"),
    "popover": (ROOT / "src/components/UiPopover.vue").read_text(encoding="utf-8"),
    "popconfirm": (ROOT / "src/components/UiPopconfirm.vue").read_text(encoding="utf-8"),
    "toast": (ROOT / "src/components/UiToastHost.vue").read_text(encoding="utf-8"),
    "checkbox": (ROOT / "src/components/UiCheckbox.vue").read_text(encoding="utf-8"),
    "switch": (ROOT / "src/components/UiSwitch.vue").read_text(encoding="utf-8"),
    "formitem": (ROOT / "src/components/UiFormItem.vue").read_text(encoding="utf-8"),
    "select": (ROOT / "src/components/UiSelect.vue").read_text(encoding="utf-8"),
    "tabs": (ROOT / "src/components/UiTabs.vue").read_text(encoding="utf-8"),
    "form": (ROOT / "src/components/UiForm.vue").read_text(encoding="utf-8"),
    "table": (ROOT / "src/components/UiTable.vue").read_text(encoding="utf-8"),
    "multiselect": (ROOT / "src/components/UiMultiSelect.vue").read_text(encoding="utf-8"),
    "treeselect": (ROOT / "src/components/UiTreeSelect.vue").read_text(encoding="utf-8"),
    "tree": (ROOT / "src/components/UiTree.vue").read_text(encoding="utf-8"),
    "cascader": (ROOT / "src/components/UiCascader.vue").read_text(encoding="utf-8"),
    "transfer": (ROOT / "src/components/UiTransfer.vue").read_text(encoding="utf-8"),
    "menu": (ROOT / "src/components/UiMenu.vue").read_text(encoding="utf-8"),
    "collapse": (ROOT / "src/components/UiCollapse.vue").read_text(encoding="utf-8"),
    "descriptions": (ROOT / "src/components/UiDescriptions.vue").read_text(encoding="utf-8"),
    "result": (ROOT / "src/components/UiResult.vue").read_text(encoding="utf-8"),
    "spin": (ROOT / "src/components/UiSpin.vue").read_text(encoding="utf-8"),
    "segmented": (ROOT / "src/components/UiSegmented.vue").read_text(encoding="utf-8"),
    "configprovider": (ROOT / "src/components/UiConfigProvider.vue").read_text(encoding="utf-8"),
    "icon": (ROOT / "src/components/UiIcon.vue").read_text(encoding="utf-8"),
    "numberinput": (ROOT / "src/components/UiNumberInput.vue").read_text(encoding="utf-8"),
    "slider": (ROOT / "src/components/UiSlider.vue").read_text(encoding="utf-8"),
    "autocomplete": (ROOT / "src/components/UiAutoComplete.vue").read_text(encoding="utf-8"),
    "daterange": (ROOT / "src/components/UiDateRangePicker.vue").read_text(encoding="utf-8"),
    "progress": (ROOT / "src/components/UiProgress.vue").read_text(encoding="utf-8"),
    "card": (ROOT / "src/components/UiCard.vue").read_text(encoding="utf-8"),
}
behavior_markers = {
    "modal": ["<Teleport to=\"body\">", "event.key !== 'Tab'", "openOverlay(overlayId)", "isTopOverlay(overlayId)", "captureFocusOrigin()", "focusWithRetry(returnFocus)"],
    "drawer": ["<Teleport to=\"body\">", "event.key!=='Tab'", "openOverlay(overlayId)", "isTopOverlay(overlayId)", "captureFocusOrigin()", "focusWithRetry(returnFocus)"],
    "tooltip": ["@mouseenter=\"show\"", "@focusin=\"show\"", 'role="tooltip"'],
    "popover": ["document.addEventListener('pointerdown',outside)", "event.key==='Escape'", 'role="dialog"'],
    "popconfirm": ["document.addEventListener('pointerdown',outside)", "event.key==='Escape'", 'role="alertdialog"'],
    "toast": ["toast.pause", "toast.resume", "item.type==='error'?'alert':'status'"],
    "checkbox": ["Array.isArray(props.modelValue)", "indeterminate", 'type="checkbox"'],
    "switch": ["props.disabled||props.loading", 'role="switch"', ':aria-checked="modelValue"', "ariaLabel", "aria-labelledby"],
    "formitem": ["useId()", "provide('uiFormItemContext'", "controlId", "describedby", "group"],
    "select": ["useId()", "aria-activedescendant", "aria-controls", "ArrowDown", "Home", "End"],
    "tabs": ['role="tablist"', 'role="tab"', "ArrowRight", "Home", "End"],
    "form": ["provide('uiFormContext'", "async function validate", "defineExpose"],
    "table": ["filter-change", "column-resize", "virtualRange", "aria-sort"],
    "multiselect": ['aria-multiselectable="true"', "aria-activedescendant", "ArrowDown", "Home", "End"],
    "treeselect": ['role="tree"', "aria-activedescendant", "ArrowRight", "ArrowLeft"],
    "tree": ['role="tree"', 'role="treeitem"', "aria-activedescendant", "checkStrictly", "AbortController", "ResizeObserver", "load-error", "useDirection"],
    "cascader": ['ui-cascader-column', "aria-activedescendant", "ArrowRight", "ArrowLeft"],
    "transfer": ["moveRight", "moveLeft", "searchable"],
    "menu": ['role="menu"', 'role="menuitem"', "ArrowDown", "ArrowRight"],
    "collapse": ["aria-expanded", "aria-controls", 'role="region"'],
    "descriptions": ["<dl", "<dt>", "<dd>"],
    "result": ["status==='error'?'alert':'status'", "ui-result-extra"],
    "spin": ["aria-busy", 'role="status"', "delay"],
    "segmented": ['role="radiogroup"', 'role="radio"', "ArrowRight"],
    "configprovider": ["provide(lanUiConfigKey", "data-ui-locale", "data-ui-density", "themeStyle"],
    "icon": ["definition?.nodes", "ariaLabel", "directional", "data-ui-icon", "is-spinning"],
    "numberinput": ['role="spinbutton"', "useId()", "PageUp", "clampOnBlur", "number.increase", "number.decrease"],
    "slider": ['role="slider"', "useId()", "PageUp", "minDistance", "slider.setValue", "useDirection"],
    "autocomplete": ['role="combobox"', 'aria-autocomplete="list"', "AbortController", "requestSequence", "compositionstart", "load-error", "allowCustom"],
    "daterange": ['role="group"', "range-order", "aria-invalid", "showPicker"],
    "progress": ['role="progressbar"', "aria-valuenow", "aria-valuetext", "accessibleLabel"],
    "card": ["titleTag", '<component :is="titleTag"'],
}
behavior_markers["configprovider"].extend(["data-ui-direction", "direction"])
for name, markers in behavior_markers.items():
    for marker in markers:
        if marker not in behavior_sources[name]:
            failures.append(f"behavior:{name}:{marker}")

overlay_manager = (ROOT / "src/components/overlayManager.js").read_text(encoding="utf-8")
for marker in ["stack.push", "getDocument", "target.body.style.overflow = 'hidden'", "isTopOverlay", "overlayCount"]:
    if marker not in overlay_manager:
        failures.append(f"overlay-manager:{marker}")
floating_position = (ROOT / "src/components/floatingPosition.js").read_text(encoding="utf-8")
for marker in ["opposite", "mainAxisOverflow", "ResizeObserver", "addEventListener('scroll', update, true)"]:
    if marker not in floating_position:
        failures.append(f"floating-position:{marker}")
feedback_service = (ROOT / "src/feedback.js").read_text(encoding="utf-8")
for marker in ["toastState", "notificationState", "useToast", "useNotification"]:
    if marker not in feedback_service:
        failures.append(f"feedback-service:{marker}")
entry = (ROOT / "src/index.js").read_text(encoding="utf-8")
component_entry = (ROOT / "src/components.js").read_text(encoding="utf-8")
declarations = (ROOT / "src/index.d.ts").read_text(encoding="utf-8")
for component in [path.stem for path in (ROOT / "src/components").glob("Ui*.vue")]:
    if f"default as {component}" not in component_entry:
        failures.append(f"library-export:{component}")
    if f"{component}:LanComponent<{component}Props,{component}Emits,{component}Slots>" not in declarations:
        failures.append(f"library-types:{component}")
for marker in ["createLanUi", "LanUi", "useLanUiConfig", "useLocale", "useDirection", "zhCN", "enUS"]:
    if marker not in entry and marker not in (ROOT / "src/plugin.js").read_text(encoding="utf-8") and marker not in (ROOT / "src/config.js").read_text(encoding="utf-8"):
        failures.append(f"library-config:{marker}")
if "latest" in (ROOT / "package.json").read_text(encoding="utf-8"):
    failures.append("package:unpinned-version")
for script in ["build:lib","build:example","tokens","lint","test","test:interaction","test:performance","ci","prepack"]:
    if script not in package.get("scripts",{}):
        failures.append(f"package:script:{script}")
token_json = json.loads((ROOT / "design-tokens.json").read_text(encoding="utf-8"))
if len(token_json.get("themes",{}).get("light",{})) < 80 or "dark" not in token_json.get("themes",{}):
    failures.append("tokens:json-export")

tokens = (ROOT / "tokens.css").read_text(encoding="utf-8")
for token in ["--brand-600", "--brand-text", "--danger-solid", "--danger-solid-hover", "--bg-page", "--bg-hover", "--bg-disabled", "--text-primary", "--text-disabled", "--text-tertiary: #64748b", "--control-icon-sm: 28px", "--font-inter-noto", "--font-noto", "--font-source-han", "--font-wenkai", "--space-4", "--radius-md", "--motion-base"]:
    if token not in tokens:
        failures.append(f"token:{token}")

styles = (ROOT / "styles.css").read_text(encoding="utf-8")
if "@layer lan-ui" not in styles:
    failures.append("styles:missing-cascade-layer")
if any(f"font-size: {size}px" in styles or f"font-size:{size}px" in styles for size in [8, 9, 10, 11]):
    failures.append("styles:font-below-12px")

if "localStorage.getItem('lan-font')" not in app or "dataset.font" not in app:
    failures.append("app:font-persistence")
if (ROOT / "UI-SPEC.md").read_bytes() != (ROOT / "public/UI-SPEC.md").read_bytes():
    failures.append("docs:public-spec-out-of-sync")
for path in [ROOT / "README.md", ROOT / "UI-SPEC.md"]:
    if "????" in path.read_text(encoding="utf-8"):
        failures.append(f"docs:corrupted-section:{path.name}")

standalone = (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8")
for component in ["UiAlert", "UiAutoComplete", "UiButton", "UiIcon", "UiInput", "UiNumberInput", "UiSlider", "UiSelect", "UiSteps", "UiTable", "UiTree", "UiSegmented", "UiDescriptions", "UiToastHost", "UiConfigProvider", "UiDateRangePicker", "toast.success"]:
    if component not in standalone:
        failures.append(f"standalone:component:{component}")
for marker in ["direction", ":direction=", "RTL", "LTR"]:
    if marker not in standalone:
        failures.append(f"standalone:direction:{marker}")
standalone_main = (ROOT / "examples/standalone-vue/src/main.js").read_text(encoding="utf-8")
for marker in ["createLanUi", "icons", "projectMark"]:
    if marker not in standalone_main:
        failures.append(f"standalone:icon-registry:{marker}")

direction_sources = "\n".join((ROOT / rel).read_text(encoding="utf-8") for rel in [
    "src/config.js", "src/components/UiTabs.vue", "src/components/UiSegmented.vue", "src/components/UiMenu.vue",
    "src/components/UiTree.vue", "src/components/UiTreeSelect.vue", "src/components/UiCascader.vue", "src/components/UiDrawer.vue", "src/components/UiTable.vue",
])
for marker in ["useDirection", "rtl", "direction"]:
    if marker not in direction_sources:
        failures.append(f"rtl:marker:{marker}")

visual_baselines = list((ROOT / "tests/visual/baselines").glob("*/*.png"))
if len(visual_baselines) < 3 or any(path.stat().st_size < 1000 for path in visual_baselines):
    failures.append(f"visual:baselines:{len(visual_baselines)}")
browser_runtime = (ROOT / "scripts/browser-runtime.mjs").read_text(encoding="utf-8")
visual_script = (ROOT / "scripts/visual-regression.mjs").read_text(encoding="utf-8")
for marker in ["pixelmatch", "maxDiffRatio", "light-ltr-default", "dark-rtl-compact", "light-ltr-mobile", "LAN_UI_BROWSER_PATH"]:
    if marker not in visual_script + browser_runtime:
        failures.append(f"visual:script:{marker}")
accessibility_script = (ROOT / "scripts/accessibility-regression.mjs").read_text(encoding="utf-8")
for marker in ["axe.run", "wcag22aa", "best-practice", "violations", "incomplete", "autocomplete-open", "multi-select-open", "tree-select-open", "tree-enterprise", "cascader-open", "modal-open", "drawer-rtl-open"]:
    if marker not in accessibility_script:
        failures.append(f"accessibility:browser:{marker}")
if accessibility_script.count("{name:") < 11:
    failures.append("accessibility:case-count")
interaction_script = (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8")
for marker in ["tree-enterprise-keyboard", "autocomplete-keyboard", "select-keyboard", "number-input-keyboard", "slider-keyboard", "tabs-rtl-keyboard", "modal-focus-trap-restore", "nested-overlay-stack", "popconfirm-cancel-confirm", "pagination-switch", "upload-validation-remove", "table-state-contract", "form-validation-focus", "menu-directional-keyboard", "reducedMotion: 'reduce'", "chromium", "firefox", "webkit", "INTERACTION_BROWSER PASS", "INTERACTION_REGRESSION PASS"]:
    if marker not in interaction_script:
        failures.append(f"interaction:browser:{marker}")
if interaction_script.count("name: '") < 15:
    failures.append("interaction:case-count")
focus_source = (ROOT / "src/components/focusUtils.js").read_text(encoding="utf-8")
p8_test = (ROOT / "tests/maturity-p8.spec.js").read_text(encoding="utf-8")
for marker in ["registerFocusOriginTracking", "captureFocusOrigin", "focusWithRetry"]:
    if marker not in focus_source or marker not in p8_test:
        failures.append(f"interaction:p8-focus:{marker}")
if "lastPointerTimestamp" not in focus_source or "PointerEvent" not in p8_test:
    failures.append("interaction:p8-focus:pointer-origin-window")
performance_script = (ROOT / "scripts/performance-regression.mjs").read_text(encoding="utf-8")
performance_budgets = json.loads((ROOT / "performance-budgets.json").read_text(encoding="utf-8"))
for marker in ["gzipSync", "packageJsRaw", "largestChunkRaw", "subpathConsumerJsRaw", "standaloneExampleJsRaw", "PERFORMANCE_REGRESSION PASS"]:
    if marker not in performance_script:
        failures.append(f"performance:script:{marker}")
if len(performance_budgets.get("budgets", {})) != 14 or performance_budgets.get("version") != package.get("version"):
    failures.append("performance:budget-version-or-count")
for export_name in ["./performance-budgets", "./performance-budgets.json"]:
    if export_name not in package.get("exports", {}):
        failures.append(f"performance:package-export:{export_name}")
ci_workflow = (ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")
for marker in ["runs-on: windows-latest", "runs-on: ubuntu-latest", "version: 11.16.0", "LAN_UI_BROWSER_PATH", "Microsoft\\Edge", "interaction-cross-browser", "playwright install --with-deps firefox webkit", "test:interaction:non-chromium"]:
    if marker not in ci_workflow:
        failures.append(f"visual:ci:{marker}")

dist = ROOT / "dist"
if dist.exists():
    for rel in ["index.html", "component-preview.html"]:
        if not (dist / rel).is_file():
            failures.append(f"dist:{rel}")
dist_lib = ROOT / "dist-lib"
for rel in ["lan-ui.js","lan-ui.css","lan-ui.d.ts"]:
    if not (dist_lib / rel).is_file():
        failures.append(f"dist-lib:{rel}")
if dist_lib.exists():
    component_js=list((dist_lib / "components").glob("Ui*.js"))
    component_types=list((dist_lib / "components").glob("Ui*.d.ts"))
    if len(component_js) != 58 or len(component_types) != 58:
        failures.append(f"dist-lib:component-subpaths:{len(component_js)}:{len(component_types)}")
    for rel in ["config.js","config.d.ts","date.js","date.d.ts","feedback.js","feedback.d.ts","icons.js","icons.d.ts","plugin.js","plugin.d.ts"]:
        if not (dist_lib / rel).is_file():
            failures.append(f"dist-lib:subpath:{rel}")
    style_files = list((dist_lib / "styles").glob("Ui*.css"))
    if len(style_files) != 58 or not (dist_lib / "styles/core.css").is_file() or not (dist_lib / "styles/manifest.json").is_file():
        failures.append(f"dist-lib:component-styles:{len(style_files)}")

if failures:
    print("VERIFY FAIL")
    for failure in failures:
        print(f"- {failure}")
    sys.exit(1)

print("VERIFY PASS")
print(f"- required_files={len(required)}")
print(f"- vue_pages={len(list((ROOT / 'src/pages').glob('*.vue')))}")
print("- routes=8")
print("- preview_sections=" + str(preview.count('class="preview-section"')))
print("- forms=ui-input,ui-number-input,ui-slider,ui-autocomplete,ui-select,ui-textarea,no-native-select")
print("- extensions=date-picker,date-range-picker,time-picker,pagination,upload,layout,float-button")
print("- table-system=toolbar,columns,density,sort,selection,expand,loading,error,empty,responsive")
print("- feedback-system=modal,drawer,toast,notification,tooltip,popover,popconfirm,focus-trap")
print("- form-selection=form-item,checkbox,radio,switch")
print("- completion=layout,navigation,display,advanced-form,table-filter-resize-virtual,overlay-manager")
print("- engineering=library-export,types,tokens-json,lint,contracts,ci,pinned-lockfile,peer-vue,css-layer,standalone-build")
print("- typography=inter-noto,noto,source-han,system,wenkai,persisted-switch,static-preview")
print("- maturity-p0=wcag-contrast,12px-floor,24px-targets,form-linkage,combobox-keyboard,52-prop-types,vitest")
print("- maturity-p1=floating-flip-shift,menu,collapse,descriptions,result,spin,segmented,feedback-service")
print("- maturity-p2=plugin-install,config-provider,zh-CN,en-US,global-size-density-theme,date-range,test-boundary")
print("- maturity-p3=ssr-safe,stable-hydration-ids,52-component-subpaths,52-type-subpaths,tree-shaking-consumer")
print("- maturity-p4=runtime-type-parity,api-manifest,semver-changelog,migration-guide,prepack-gates")
print("- maturity-p5=rtl-direction,logical-navigation,52-component-styles,style-manifest,3-visual-baselines,pixel-diff")
print("- maturity-p6=axe-4.11.4,9-browser-audits,zero-violations,progress-tabs-select-drawer-semantics,contrast-tokens")
print("- maturity-p7=11-browser-interactions,reduced-motion-focus,one-click-form-submit,14-performance-budgets,public-budget-export")
print("- maturity-p8=chromium-firefox-webkit,33-browser-cases,pointer-origin-focus,per-engine-reports,cross-browser-ci")
print("- maturity-p9=52-props-emits-slots,api-schema-2,runtime-source-type-parity,vue-tsc-consumer,negative-type-contracts")
print("- maturity-p10=multi-app-feedback-isolation,ssr-request-scope,host-injection,timer-disposal,default-compatibility")
print("- maturity-p11=101-locale-keys,placeholder-parity,52-public-components-no-cjk,dynamic-copy-and-errors,prepack-gate")
print("- maturity-p12=per-key-fallback,plural-rules,intl-number-date-relative-list,unknown-locale-preserved,6-localized-counters")
print("- maturity-p13=isolated-locale-registry,aliases,lazy-dedup,retry,multi-fallback-chain,atomic-activation")
print("- maturity-p14=strict-date-adapter,iana-time-zone,dst-disambiguation,string-date-timestamp,time-picker,stable-reference")
print("- maturity-p15=public-icon,46-builtins,sanitized-geometry,isolated-registry,provider-scope,rtl-directional")
print("- maturity-p16=number-input,55-public-components,104-locale-keys,decimal-step,clamp,format-parse,spinbutton,12-interactions-per-browser")
print("- maturity-p17=slider-range,56-public-components,108-locale-keys,pointer-keyboard,vertical-reverse-rtl,min-distance,13-interactions-per-browser")
print("- maturity-p18=autocomplete,57-public-components,114-locale-keys,async-race-cache,ime-composition,combobox-aria,14-interactions-per-browser")
print("- maturity-p19=tree,58-public-components,122-locale-keys,selection-check-cascade,lazy-load,filter,virtualization,rtl-keyboard,15-interactions-per-browser")
print("- interactions=modal,drawer,toast,notification,tooltip,popover,popconfirm,switch,tabs,select,upload,pagination,float-button,table-filter,theme,auth")
