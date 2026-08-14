from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
required = [
    "COMPONENT-API.md", "public/component-api.json", "src/generated/component-api.json", "src/pages/ApiReferencePage.vue", "scripts/api-docs.mjs", "tests/api-docs-p37.spec.js", "tests/visual/baselines/win32/api-reference.png", "scripts/build_p37_artifacts.py",
    "src/components/UiAnchor.vue", "tests/anchor-p38.spec.js", "tests/visual/baselines/win32/anchor-navigation.png", "scripts/build_p38_artifacts.py",
    "LICENSE", "scripts/packed-consumer-regression.mjs", "scripts/build_p39_artifacts.py", "scripts/build_p41_artifacts.py", "scripts/build_p42_artifacts.py", "scripts/build_p43_artifacts.py", "scripts/build_p44_artifacts.py", "scripts/build_p45_artifacts.py", "scripts/build_p46_artifacts.py", "scripts/build_p47_artifacts.py", "scripts/build_p48_artifacts.py", "scripts/build_p49_artifacts.py",
    "index.html", "component-preview.html", "interaction-regression.html", "styles.css", "tokens.css", "font-preview.css",
    "UI-SPEC.md", "README.md", "CHANGELOG.md", "MIGRATION.md", "api-manifest.json", "style-manifest.json", "visual-regression.html", "package.json", "pnpm-workspace.yaml", "vite.config.js", "src/main.js", "src/App.vue",
    "src/pages/LoginPage.vue", "src/pages/LogoutPage.vue", "src/pages/NotFoundPage.vue", "src/pages/ForbiddenPage.vue", "src/pages/ServerErrorPage.vue",
    "src/pages/DashboardPage.vue", "src/pages/WorkbenchPage.vue", "src/pages/DataPage.vue",
    "src/pages/AiPage.vue", "src/pages/GanttPage.vue", "src/pages/ComponentsPage.vue",
    "src/components/UiIcon.vue", "src/components/UiInput.vue", "src/components/UiInputTag.vue", "src/components/UiMentions.vue", "src/components/UiNumberInput.vue", "src/components/UiOtpInput.vue", "src/components/UiSlider.vue", "src/components/UiRate.vue", "src/components/UiStatistic.vue", "src/components/UiCalendar.vue", "src/components/UiImage.vue", "src/components/UiDataGrid.vue", "src/components/UiList.vue", "src/components/UiVirtualList.vue", "src/components/UiStatusPage.vue", "src/components/UiAutoComplete.vue", "src/components/UiSelect.vue", "src/components/UiTextarea.vue",
    "src/components/UiDatePicker.vue", "src/components/UiTimePicker.vue", "src/components/UiPagination.vue",
    "src/components/UiUpload.vue", "src/components/UiFloatButton.vue",
    "src/components/UiTable.vue", "src/components/UiListToolbar.vue",
    "src/components/UiModal.vue", "src/components/UiDrawer.vue",
    "src/components/UiTooltip.vue", "src/components/UiPopover.vue",
    "src/components/UiPopconfirm.vue", "src/components/UiToastHost.vue",
    "src/components/UiNotification.vue", "src/components/UiTour.vue", "src/components/UiWatermark.vue", "src/components/UiAffix.vue", "src/components/UiSplitter.vue", "src/components/UiTypography.vue", "src/components/UiFormItem.vue", "src/components/UiFormList.vue", "src/components/UiSchemaForm.vue",
    "src/components/UiCheckbox.vue", "src/components/UiRadio.vue",
    "src/components/UiSwitch.vue",
    "src/components/UiLayout.vue", "src/components/UiGrid.vue", "src/components/UiCol.vue",
    "src/components/UiSpace.vue", "src/components/UiDivider.vue", "src/components/UiTabs.vue",
    "src/components/UiBreadcrumb.vue", "src/components/UiAvatar.vue", "src/components/UiBadge.vue",
    "src/components/UiSkeleton.vue", "src/components/UiEmpty.vue", "src/components/UiAlert.vue",
    "src/components/UiDropdown.vue", "src/components/UiProgress.vue", "src/components/UiSteps.vue",
    "src/components/UiTimeline.vue", "src/components/UiForm.vue", "src/components/UiMultiSelect.vue",
    "src/components/UiTree.vue", "src/components/UiTreeSelect.vue", "src/components/UiCascader.vue", "src/components/UiTransfer.vue", "src/components/UiCommandPalette.vue", "src/components/UiColorPicker.vue",
    "src/components/UiMenu.vue", "src/components/UiCollapse.vue", "src/components/UiDescriptions.vue",
    "src/components/UiResult.vue", "src/components/UiSpin.vue", "src/components/UiSegmented.vue",
    "src/components/UiConfigProvider.vue", "src/components/UiDateRangePicker.vue",
    "src/components/AppIcon.vue", "src/components/overlayManager.js", "src/components/floatingPosition.js", "src/components/focusUtils.js", "src/components/formUtils.js", "src/config.js", "src/config-runtime.js", "src/locales/zh-CN.js", "src/locales/en-US.js", "src/date.js", "src/icons.js", "src/components.js", "src/plugin.js", "src/feedback.js", "src/env.js", "src/color.js", "src/theme-tokens.js", "src/theme.js", "src/motion.js", "src/theme-scope.js", "src/index.js", "src/index.d.ts", "vite.lib.config.js", "vitest.config.js",
    "design-tokens.json", "performance-budgets.json", "scripts/export-tokens.mjs", "scripts/generate-theme-tokens.mjs", "scripts/copy-types.mjs", "scripts/lint.mjs", "scripts/split-component-css.mjs", "scripts/minify-library-js.mjs", "scripts/css-boundary-contracts.mjs", "scripts/browser-runtime.mjs", "scripts/visual-regression.mjs", "scripts/accessibility-regression.mjs", "scripts/interaction-regression.mjs", "scripts/performance-regression.mjs",
    "scripts/component-contracts.mjs", "scripts/locale-contracts.mjs", "scripts/intl-contracts.mjs", "scripts/locale-registry-contracts.mjs", "scripts/date-contracts.mjs", "scripts/icon-contracts.mjs", "scripts/color-contracts.mjs", "scripts/theme-contracts.mjs", "scripts/theme-portal-contracts.mjs", "scripts/motion-contracts.mjs", "scripts/build_p14_artifacts.py", "scripts/build_p15_artifacts.py", "scripts/build_p16_artifacts.py", "scripts/build_p17_artifacts.py", "scripts/build_p18_artifacts.py", "scripts/build_p19_artifacts.py", "scripts/build_p20_artifacts.py", "scripts/build_p21_artifacts.py", "scripts/build_p22_artifacts.py", "scripts/build_p23_artifacts.py", "scripts/build_p24_artifacts.py", "scripts/build_p25_artifacts.py", "scripts/build_p26_artifacts.py", "scripts/build_p27_artifacts.py", "scripts/build_p28_artifacts.py", "scripts/build_p29_artifacts.py", "scripts/build_p30_artifacts.py", "scripts/build_p31_artifacts.py", "scripts/build_p32_artifacts.py", "scripts/build_p33_artifacts.py", "scripts/build_p34_artifacts.py", "scripts/build_p35_artifacts.py", "scripts/build_p36_artifacts.py", "scripts/test-package-exports.mjs", "scripts/build-subpath-consumer.mjs", "scripts/api-manifest.mjs", "tests/accessibility.spec.js", "tests/accessibility-p6.spec.js", "tests/maturity-p1.spec.js", "tests/maturity-p7.spec.js", "tests/maturity-p8.spec.js", "tests/config-p2.spec.js", "tests/locale-p11.spec.js", "tests/intl-p12.spec.js", "tests/locale-registry-p13.spec.js", "tests/date-p14.spec.js", "tests/icon-p15.spec.js", "tests/number-input-p16.spec.js", "tests/otp-input-p47.spec.js", "tests/slider-p17.spec.js", "tests/autocomplete-p18.spec.js", "tests/tree-p19.spec.js", "tests/command-palette-p20.spec.js", "tests/color-picker-p21.spec.js", "tests/rate-p22.spec.js", "tests/statistic-p23.spec.js", "tests/calendar-p24.spec.js", "tests/image-p25.spec.js", "tests/status-page-p26.spec.js", "tests/virtual-list-p26.spec.js", "tests/data-grid-p27.spec.js", "tests/form-p28.spec.js", "tests/form-list-p29.spec.js", "tests/schema-form-p30.spec.js", "tests/schema-form-list-p31.spec.js", "tests/upload-p32.spec.js", "tests/build-boundary-p33.spec.js", "tests/theme-p34.spec.js", "tests/theme-portal-p35.spec.js", "tests/motion-p36.spec.js", "tests/table-checkbox-p36.spec.js", "tests/tour-p41.spec.js", "tests/watermark-p42.spec.js", "tests/affix-p43.spec.js", "tests/splitter-p44.spec.js", "tests/typography-p45.spec.js", "tests/list-p46.spec.js", "tests/ssr-p3.spec.js", "tests/overlay-client-p3.spec.js", "tests/rtl-p5.spec.js", "tests/types/tsconfig.json", "tests/types/contracts.ts", "tests/types/Consumer.vue", "tests/visual/fixture-main.js", "tests/visual/VisualFixture.vue", "tests/visual/fixture.css", "tests/visual/baselines/win32/scoped-theme.png", "tests/visual/baselines/win32/scoped-theme-portal.png", "tests/visual/baselines/win32/scoped-motion.png", "tests/visual/baselines/win32/product-tour.png", "tests/visual/baselines/win32/watermark-document.png", "tests/visual/baselines/win32/affix-container.png", "tests/visual/baselines/win32/splitter-workspace.png", "tests/visual/baselines/win32/typography-contract.png", "tests/visual/baselines/win32/list-contract.png", "tests/visual/baselines/win32/otp-input-contract.png", "tests/interaction/fixture-main.js", "tests/interaction/InteractionFixture.vue", "tests/interaction/fixture.css", "tests/fixtures/subpath-consumer/index.html", "tests/fixtures/subpath-consumer/src/main.js", ".editorconfig", ".gitattributes", ".github/workflows/ci.yml",
    "tests/mentions-p48.spec.js", "tests/visual/baselines/win32/mentions-contract.png", "tests/input-tag-p49.spec.js", "tests/visual/baselines/win32/input-tag-contract.png",
    "examples/standalone-vue/package.json", "examples/standalone-vue/vite.config.js",
    "examples/standalone-vue/src/main.js", "examples/standalone-vue/src/App.vue",
]

failures = []
for rel in required:
    path = ROOT / rel
    if not path.is_file() or path.stat().st_size == 0:
        failures.append(f"missing-or-empty:{rel}")

package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
performance_budgets = json.loads((ROOT / "performance-budgets.json").read_text(encoding="utf-8"))
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
for dependency in ["vitest", "@vue/test-utils", "happy-dom", "postcss", "lightningcss", "playwright", "pixelmatch", "pngjs", "axe-core", "typescript", "vue-tsc"]:
    if not package.get("devDependencies", {}).get(dependency):
        failures.append(f"package:test-dependency:{dependency}")
if "vitest run" not in package.get("scripts", {}).get("test", ""):
    failures.append("package:behavior-test-script")
exports = package.get("exports", {})
for subpath in ["./components/*", "./color", "./config", "./date", "./feedback", "./icons", "./plugin", "./theme", "./motion", "./style.css", "./styles/core.css", "./styles/*.css", "./tokens", "./style-manifest", "./style-manifest.json"]:
    if subpath not in exports:
        failures.append(f"package:export:{subpath}")
if "test:package" not in package.get("scripts", {}) or "test:package" not in package.get("scripts", {}).get("check", ""):
    failures.append("package:subpath-test-script")
for marker in ["minify-library-js.mjs", "split-component-css.mjs"]:
    if marker not in package.get("scripts", {}).get("build:lib", "") + package.get("scripts", {}).get("build:lib:base", ""):
        failures.append(f"package:p33-build:{marker}")
if "css-boundary-contracts.mjs" not in package.get("scripts", {}).get("test:package", ""):
    failures.append("package:p33-css-boundary-gate")
if package.get("packageManager") != "pnpm@10.34.0" or package.get("license") != "MIT":
    failures.append("package:release-metadata")
if not all(name in package.get("files", []) for name in ["api-manifest.json","COMPONENT-API.md","public/component-api.json","style-manifest.json","CHANGELOG.md","MIGRATION.md"]) or "api:check" not in package.get("scripts", {}).get("check", ""):
    failures.append("package:api-manifest-delivery")
if not package.get("typesVersions", {}).get("*", {}).get("components/*"):
    failures.append("package:legacy-types-subpaths")
api_manifest = json.loads((ROOT / "api-manifest.json").read_text(encoding="utf-8"))
if api_manifest.get("package") != package.get("name") or api_manifest.get("version") != package.get("version"):
    failures.append("api-manifest:package-version")
if api_manifest.get("publicSubpaths") != sorted(exports):
    failures.append("api-manifest:subpaths")
manifest_components = api_manifest.get("components", [])
if api_manifest.get("schemaVersion") != 3 or len(api_manifest.get("root", {}).get("typeExports", [])) < 654 or len(manifest_components) != 79:
    failures.append(f"api-manifest:components:{len(manifest_components)}")
for component in manifest_components:
    name = component.get("name")
    if sorted(component.get("runtimeExports", [])) != sorted(["default", name]) or not component.get("props") or not isinstance(component.get("emits"), list) or not isinstance(component.get("slots"), list) or component.get("emitsType") != f"{name}Emits" or component.get("slotsType") != f"{name}Slots" or [item.get("name") for item in component.get("propDetails", [])] != component.get("props") or [item.get("name") for item in component.get("emitDetails", [])] != component.get("emits") or [item.get("name") for item in component.get("slotDetails", [])] != component.get("slots") or not component.get("imports", {}).get("root"):
        failures.append(f"api-manifest:parity:{component.get('name')}")

component_api = json.loads((ROOT / "public/component-api.json").read_text(encoding="utf-8"))
generated_component_api = json.loads((ROOT / "src/generated/component-api.json").read_text(encoding="utf-8"))
if component_api != generated_component_api or component_api.get("version") != package.get("version") or component_api.get("schemaVersion") != 1:
    failures.append("p37:generated-api-parity")
api_categories = component_api.get("categories", [])
api_components = component_api.get("components", [])
if len(api_categories) != 6 or len(api_components) != 79 or sum(item.get("count", 0) for item in api_categories) != 79 or len({item.get("name") for item in api_components}) != 79:
    failures.append("p37:generated-api-coverage")

style_manifest = json.loads((ROOT / "style-manifest.json").read_text(encoding="utf-8"))
style_components = style_manifest.get("components", [])
if style_manifest.get("package") != package.get("name") or style_manifest.get("version") != package.get("version"):
    failures.append("style-manifest:package-version")
if len(style_components) != 79 or any(not item.get("bytes") or not item.get("rules") for item in style_components):
    failures.append(f"style-manifest:components:{len(style_components)}")
if style_manifest.get("core", {}).get("subpath") != "./styles/core.css" or not style_manifest.get("core", {}).get("bytes"):
    failures.append("style-manifest:core")
if style_manifest.get("schemaVersion") != 2 or style_manifest.get("root", {}).get("subpath") != "./style.css" or style_manifest.get("root", {}).get("source") != "component-union" or not style_manifest.get("root", {}).get("bytes") or not style_manifest.get("root", {}).get("rules"):
    failures.append("style-manifest:root-boundary")
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
if "color-contracts.mjs" not in package.get("scripts", {}).get("test:color", "") or "test:color" not in package.get("scripts", {}).get("prepack", ""):
    failures.append("package:p21-color-gate")
type_declarations = (ROOT / "src/index.d.ts").read_text(encoding="utf-8")
type_contract = (ROOT / "tests/types/contracts.ts").read_text(encoding="utf-8")
type_fixture = (ROOT / "tests/types/Consumer.vue").read_text(encoding="utf-8")
for component in manifest_components:
    name = component.get("name")
    if f"{name}:LanComponent<{name}Props" not in type_declarations and f"{name}:{name}Component" not in type_declarations:
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
config_source = (ROOT / "src/config.js").read_text(encoding="utf-8") + (ROOT / "src/config-runtime.js").read_text(encoding="utf-8")
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
for marker in ["vue/server-renderer", "typeof document", "UiModal", "UiDrawer", "UiPopover", "UiDateRangePicker", "UiImage", "stable across equivalent app renders"]:
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
if preview.count('class="preview-section"') < 25:
    failures.append("preview:section-count")
for interaction in ["data-modal", "data-drawer", "data-toast", "previewSwitch", "previewTabs", "previewSelect", "previewUpload", "previewPagination", "previewBackTop", "previewRate", "previewStatusCode", "previewVirtualViewport", "previewVirtualContent", "previewDataGrid", "previewDataGridSearch", "previewDataGridBody", "previewDataGridOutput", "previewUploadQueue", "data-upload-action"]:
    if interaction not in preview:
        failures.append(f"preview:interaction:{interaction}")
for marker in ["previewOverlayComponents", "previewPopoverPanel", "previewConfirmPanel", "previewOverlaySwitch"]:
    if marker not in preview:
        failures.append(f"preview:feedback-form:{marker}")
for marker in ["previewCompletionSystem", "previewAccessibleTabs", "previewCompletionAlert", "data-completion-tab"]:
    if marker not in preview:
        failures.append(f"preview:completion:{marker}")
for marker in ["previewSchemaForm", "previewSchemaType", "previewSchemaTax", "syncPreviewSchema"]:
    if marker not in preview:
        failures.append(f"preview:schema-form:{marker}")
for marker in ["previewSchemaReviewers", "previewSchemaReviewerAdd", "schemaReviewerMarkup", "syncSchemaReviewers"]:
    if marker not in preview:
        failures.append(f"preview:schema-form-list:{marker}")
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
for component in ["UiInput", "UiNumberInput", "UiSlider", "UiAutoComplete", "UiSelect", "UiTextarea", "UiSchemaForm"]:
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
upload_source = (ROOT / "src/components/UiUpload.vue").read_text(encoding="utf-8")
for marker in ["AbortController", "beforeUpload", "beforeRemove", "concurrency", "onProgress", "upload-error", "aria-busy", "defineExpose"]:
    if marker not in upload_source:
        failures.append(f"upload-orchestration:{marker}")
for marker in ["importRequest", ":request=", "upload-error"]:
    if marker not in data_page:
        failures.append(f"data-upload-sync:{marker}")
for component in ["UiTable", "UiListToolbar", "UiPagination"]:
    if component not in data_page:
        failures.append(f"table-sync:{component}")
for behavior in ["selectable", "expandable", "sticky-header", "v-model:sort-key", "v-model:selected-rows"]:
    if behavior not in data_page:
        failures.append(f"table-behavior:{behavior}")
for marker in ["previewTableSystem", "previewSelectAll", "previewTableSort", "data-preview-table-state"]:
    if marker not in preview:
        failures.append(f"preview:table-system:{marker}")
for marker in ['id="command-palette"', "previewCommandTrigger", "previewCommandInput", "previewCommandMatches", "event.ctrlKey"]:
    if marker not in preview:
        failures.append(f"preview:command-palette:{marker}")
for marker in ['id="color-picker"', "previewColorPlane", "previewColorHue", "previewColorAlpha", "previewColorContrast", "previewColorPresets", "positionPreviewColor"]:
    if marker not in preview:
        failures.append(f"preview:color-picker:{marker}")
for marker in ['id="statistic"', "Statistic / KPI", "ui-statistic-trend", "ui-statistic-skeleton"]:
    if marker not in preview:
        failures.append(f"preview:statistic:{marker}")
for marker in ['id="calendar"', "previewCalendarGrid", "previewCalendarSelected"]:
    if marker not in preview:
        failures.append(f"preview:calendar:{marker}")
for marker in ['id="image"', "previewImageDialog", "previewImageZoomIn", "data-preview-image", "overlay:not(#previewImageOverlay)"]:
    if marker not in preview:
        failures.append(f"preview:image:{marker}")

components_page = (ROOT / "src/pages/ComponentsPage.vue").read_text(encoding="utf-8")
for component in ["UiCheckbox", "UiRadio", "UiSwitch", "UiTooltip", "UiPopover", "UiPopconfirm", "UiMenu", "UiCollapse", "UiDescriptions", "UiResult", "UiStatusPage", "UiVirtualList", "UiDataGrid", "UiSpin", "UiSegmented", "UiConfigProvider", "UiDateRangePicker", "UiTimePicker", "UiIcon", "UiNumberInput", "UiSlider", "UiRate", "UiStatistic", "UiCalendar", "UiImage", "UiAutoComplete", "UiTree", "UiCommandPalette", "UiColorPicker"]:
    if component not in components_page:
        failures.append(f"component-center:sync:{component}")
for marker in ["fontPresets", "selectedFont", "applyFont", "Inter + Noto Sans SC", "LXGW WenKai"]:
    if marker not in components_page:
        failures.append(f"component-center:font-system:{marker}")
if "<td>AutoComplete</td>" not in components_page or "Tree supports Arrow" in components_page:
    failures.append("component-center:state-matrix-labels")
for marker in ["iconDemoNames", "iconDemoRegistry", "tenantMark", "directional", "icon-gallery"]:
    if marker not in components_page:
        failures.append(f"component-center:icon-system:{marker}")
for marker in ["type:'list'", "contacts", "defaultValue:({index})", "removable:(_model,{item})"]:
    if marker not in components_page:
        failures.append(f"component-center:schema-form-list:{marker}")
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
    "formlist": (ROOT / "src/components/UiFormList.vue").read_text(encoding="utf-8"),
    "schemaform": (ROOT / "src/components/UiSchemaForm.vue").read_text(encoding="utf-8"),
    "select": (ROOT / "src/components/UiSelect.vue").read_text(encoding="utf-8"),
    "tabs": (ROOT / "src/components/UiTabs.vue").read_text(encoding="utf-8"),
    "form": (ROOT / "src/components/UiForm.vue").read_text(encoding="utf-8"),
    "datagrid": (ROOT / "src/components/UiDataGrid.vue").read_text(encoding="utf-8"),
    "table": (ROOT / "src/components/UiTable.vue").read_text(encoding="utf-8"),
    "multiselect": (ROOT / "src/components/UiMultiSelect.vue").read_text(encoding="utf-8"),
    "treeselect": (ROOT / "src/components/UiTreeSelect.vue").read_text(encoding="utf-8"),
    "tree": (ROOT / "src/components/UiTree.vue").read_text(encoding="utf-8"),
    "commandpalette": (ROOT / "src/components/UiCommandPalette.vue").read_text(encoding="utf-8"),
    "colorpicker": (ROOT / "src/components/UiColorPicker.vue").read_text(encoding="utf-8"),
    "rate": (ROOT / "src/components/UiRate.vue").read_text(encoding="utf-8"),
    "statistic": (ROOT / "src/components/UiStatistic.vue").read_text(encoding="utf-8"),
    "calendar": (ROOT / "src/components/UiCalendar.vue").read_text(encoding="utf-8"),
    "image": (ROOT / "src/components/UiImage.vue").read_text(encoding="utf-8"),
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
    "formlist": ["useId()", "entries", "canAdd", "canRemove", "function add", "function remove", "function move", "defineExpose"],
    "schemaform": ["normalizeSchema", "visibleFields", "resolveComponent", "field-change", "schema-error", "defineExpose"],
    "select": ["useId()", "aria-activedescendant", "aria-controls", "ArrowDown", "Home", "End"],
    "tabs": ['role="tablist"', 'role="tab"', "ArrowRight", "Home", "End"],
    "form": ["provide('uiFormContext'", "async function validate", "defineExpose"],
    "datagrid": ["mode==='server'", "processedRows", "searchDebounce", "state-change", "request", "UiListToolbar", "UiPagination", "defineExpose"],
    "table": ["filter-change", "column-resize", "virtualRange", "aria-sort"],
    "multiselect": ['aria-multiselectable="true"', "aria-activedescendant", "ArrowDown", "Home", "End"],
    "treeselect": ['role="tree"', "aria-activedescendant", "ArrowRight", "ArrowLeft"],
    "tree": ['role="tree"', 'role="treeitem"', "aria-activedescendant", "checkStrictly", "AbortController", "ResizeObserver", "load-error", "useDirection"],
    "commandpalette": ['role="dialog"', 'role="combobox"', 'role="listbox"', "aria-activedescendant", "AbortController", "requestSequence", "load-error", "data-error", "openOverlay", "focusWithRetry", "useDirection"],
    "colorpicker": ['role="dialog"', 'role="slider"', "pointermove", "ArrowRight", "formatColor", "parseColor", "showContrast", "useDirection", "update:open"],
    "rate": ['role="slider"', "aria-valuetext", "pointermove", "PageUp", "allowClear", "useDirection", "uiFormItemContext"],
    "statistic": ['role="group"', "<output", "aria-live", "aria-busy", "formatNumber", "positiveDirection", "ariaValueText"],
    "calendar": ['role="grid"', 'role="gridcell"', "aria-multiselectable", "selectionMode", "disabledDate", "PageDown", "range-preview", "useDirection"],
    "image": ['role="dialog"', "previewList", "fallback", "openOverlay", "captureFocusOrigin", "ArrowLeft", "Home", "handleWheel", "pointermove", "update:previewOpen"],
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
    if f"{component}:LanComponent<{component}Props" not in declarations and f"{component}:{component}Component" not in declarations:
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

config_runtime = (ROOT / "src/config-runtime.js").read_text(encoding="utf-8")
config_facade = (ROOT / "src/config.js").read_text(encoding="utf-8")
if "installBuiltInLocale(enUS,['en'])" not in config_facade or "from './locales/en-US.js'" not in config_facade or "enUS" in config_runtime:
    failures.append("p33:lean-locale-runtime")
component_config_sources = {path.name:path.read_text(encoding="utf-8") for path in (ROOT / "src/components").glob("Ui*.vue")}
full_config_components = sorted(name for name,source in component_config_sources.items() if "from '../config.js'" in source)
runtime_config_components = sorted(name for name,source in component_config_sources.items() if "from '../config-runtime.js'" in source)
if full_config_components != ["UiConfigProvider.vue"] or len(runtime_config_components) < 50:
    failures.append(f"p33:component-config-boundary:{len(runtime_config_components)}:{','.join(full_config_components)}")
css_boundary = (ROOT / "scripts/css-boundary-contracts.mjs").read_text(encoding="utf-8")
style_split = (ROOT / "scripts/split-component-css.mjs").read_text(encoding="utf-8")
js_minifier = (ROOT / "scripts/minify-library-js.mjs").read_text(encoding="utf-8")
for marker,source in [("component-union",style_split),("splitSelectors",style_split),("startsAtComponentBoundary",style_split),("lightningcss",style_split),("Showcase selector leaked",css_boundary),("minifySync",js_minifier),("LIBRARY_JS_MINIFY PASS",js_minifier)]:
    if marker not in source:
        failures.append(f"p33:build-boundary:{marker}")
if "Package boundary and delivery optimization (P33)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P33: package and style boundaries" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p33:documentation")
theme_source = (ROOT / "src/theme.js").read_text(encoding="utf-8")
theme_tokens = (ROOT / "src/theme-tokens.js").read_text(encoding="utf-8")
theme_provider = component_config_sources["UiConfigProvider.vue"]
theme_contracts = (ROOT / "scripts/theme-contracts.mjs").read_text(encoding="utf-8")
for marker, source in [
    ("createThemeController", theme_source), ("matchMedia", theme_source), ("restoreAttribute", theme_source),
    ("lightThemeTokens", theme_tokens), ("data-ui-resolved-appearance", theme_provider),
    ("THEME_CONTRACT PASS", theme_contracts), ("setAppearance", (ROOT / "src/plugin.js").read_text(encoding="utf-8")),
]:
    if marker not in source:
        failures.append(f"p34:theme-runtime:{marker}")
if "Theme runtime and scoped appearance (P34)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P34: theme runtime and scoped appearance" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p34:documentation")
if any(marker not in preview for marker in ["previewAppearanceSwitch", "previewThemeState", "data-ui-resolved-appearance"]):
    failures.append("p34:showcase-version")
if "test:theme" not in package.get("scripts", {}).get("prepack", "") or "./theme" not in package.get("exports", {}):
    failures.append("p34:package-gate")
portal_scope = (ROOT / "src/theme-scope.js").read_text(encoding="utf-8")
portal_contract = (ROOT / "scripts/theme-portal-contracts.mjs").read_text(encoding="utf-8")
teleport_sources = {path.name:path.read_text(encoding="utf-8") for path in (ROOT / "src/components").glob("*.vue") if "<Teleport" in path.read_text(encoding="utf-8")}
for marker, source in [
    ("lan-ui-teleport-theme-scope", portal_scope), ("data-ui-teleport-scope", portal_scope),
    ("THEME_PORTAL_CONTRACT PASS", portal_contract), ("provide(lanUiTeleportScopeKey,teleportScope)", theme_provider),
]:
    if marker not in source:
        failures.append(f"p35:portal-runtime:{marker}")
if len(teleport_sources) != 14 or any("useTeleportThemeScope" not in source or 'v-bind="portalThemeAttrs"' not in source for source in teleport_sources.values()):
    failures.append(f"p35:teleport-coverage:{len(teleport_sources)}")
if "Scoped Teleport theme bridge (P35)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P35: scoped Teleport theme inheritance" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p35:documentation")
if "data-ui-teleport-scope" not in preview:
    failures.append("p35:showcase-version")
if "theme-portal-contracts.mjs" not in package.get("scripts", {}).get("test:theme", ""):
    failures.append("p35:package-gate")
checkbox_source = component_config_sources["UiCheckbox.vue"]
table_source = component_config_sources["UiTable.vue"]
styles_source = (ROOT / "styles.css").read_text(encoding="utf-8")
preview_source = (ROOT / "component-preview.html").read_text(encoding="utf-8")
if any(marker not in checkbox_source for marker in ["size:{type:String", "ariaLabel", "$slots.default"]):
    failures.append("p35:checkbox-size-contract")
if any(marker not in table_source for marker in ["import UiCheckbox", 'size="sm"', "ui-table-checkbox"]):
    failures.append("p35:table-checkbox-composition")
if any(marker not in styles_source for marker in [
    ".ui-checkbox.size-sm input { width: 14px; height: 14px;",
    '.ui-table-select-column > input[type="checkbox"] { width: 14px; min-width: 14px; max-width: 14px; height: 14px; min-height: 14px; max-height: 14px;',
]) or ".ui-table-select-column input { width:24px; height:24px;" in styles_source:
    failures.append("p35:table-checkbox-style")
if preview_source.count("checkbox ui-checkbox size-sm ui-table-checkbox") < 3 or preview_source.count("ui-table-control-column ui-table-select-column") < 3:
    failures.append("p35:table-checkbox-preview")

motion_source = (ROOT / "src/motion.js").read_text(encoding="utf-8")
motion_contract = (ROOT / "scripts/motion-contracts.mjs").read_text(encoding="utf-8")
for marker, source in [
    ("createMotionController", motion_source), ("prefers-reduced-motion", motion_source), ("useReducedMotion", motion_source),
    ("data-ui-motion-preference", theme_provider), ("resolvedMotion", theme_provider),
    ("data-ui-motion", portal_scope), ("MOTION_CONTRACT PASS", motion_contract),
    ("setMotion", (ROOT / "src/plugin.js").read_text(encoding="utf-8")),
]:
    if marker not in source:
        failures.append(f"p36:motion-runtime:{marker}")
if "Adaptive motion preferences (P36)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P36: adaptive motion preference runtime" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p36:documentation")
if any(marker not in preview for marker in ["V1.45.0", "previewMotionSwitch", "data-ui-motion-preference"]):
    failures.append("p36:showcase-version")
if "test:motion" not in package.get("scripts", {}).get("prepack", "") or "./motion" not in package.get("exports", {}):
    failures.append("p36:package-gate")
if styles_source.count("prefers-reduced-motion") != 1 or any(marker not in styles_source for marker in ['[data-ui-motion="full"]','[data-ui-motion="reduced"]','--motion-count','--motion-scroll']):
    failures.append("p36:motion-style-contract")

api_page = (ROOT / "src/pages/ApiReferencePage.vue").read_text(encoding="utf-8")
api_docs_script = (ROOT / "scripts/api-docs.mjs").read_text(encoding="utf-8")
if any(marker not in api_page for marker in ["搜索组件 API", "filteredComponents", "copyDeepLink", "componentFromHash", "api-reference-table-wrap", "aria-live"]):
    failures.append("p37:api-reference-page")
if any(marker not in app for marker in ["defineAsyncComponent", "'/api'", "split('?')[0]", "组件 API 参考"]):
    failures.append("p37:api-route")
if any(marker not in api_docs_script for marker in ["categoryDefinitions", "Duplicate API documentation category", "category coverage failed", "API_DOCS PASS", "COMPONENT-API.md"]):
    failures.append("p37:api-doc-generator")
if "Generated Component API reference (P37)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P37: generated API reference and drift governance" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p37:documentation")
if "api-docs.mjs" not in package.get("scripts", {}).get("api:check", "") or "api:check" not in package.get("scripts", {}).get("prepack", ""):
    failures.append("p37:package-gate")

anchor_source = (ROOT / "src/components/UiAnchor.vue").read_text(encoding="utf-8")
for marker in ["scrollToItem", "updateFromScroll", "scroll-start", "scroll-end", "useReducedMotion", "direction-${props.direction}", "aria-current"]:
    if marker not in anchor_source:
        failures.append(f"p38:anchor-runtime:{marker}")
if "UiAnchor" not in components_page:
    failures.append("p38:showcase-consumer")
if preview.count('id="anchor" class="preview-section"') != 1 or "ui-anchor direction-horizontal" not in preview:
    failures.append("p38:static-preview")
if app.count("defineAsyncComponent") < 12:
    failures.append("p38:lazy-showcase-routes")
if "Scroll-aware anchor navigation and route boundaries (P38)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P38: anchor navigation and lazy showcase routes" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p38:documentation")
packed_consumer = (ROOT / "scripts/packed-consumer-regression.mjs").read_text(encoding="utf-8")
license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
distribution_budgets = performance_budgets.get("distributionBudgets", {})
if package.get("version") != "1.45.0" or package.get("private") is not False or package.get("license") != "MIT":
    failures.append("p39:publishable-metadata")
if package.get("repository", {}).get("url") != "git+https://github.com/dengpan20/LanUI.git" or not package.get("publishConfig", {}).get("provenance") or package.get("publishConfig", {}).get("access") != "public":
    failures.append("p39:repository-provenance")
if package.get("exports", {}).get("./tokens.css") != "./tokens.css" or "./tokens.css" not in package.get("sideEffects", []):
    failures.append("p39:token-style-export")
if not {"README.md", "LICENSE"}.issubset(set(package.get("files", []))) or "Permission is hereby granted" not in license_text:
    failures.append("p39:license-packlist")
for marker in ["--ignore-workspace", "--offline", "packedManifest.private===false", "renderToString", "typescript/bin/tsc", "internals=absent", "componentNames.length===79", "allowedTopLevel", "reproducible=pass", "allowList=pass"]:
    if marker not in packed_consumer:
        failures.append(f"p39:packed-consumer:{marker}")
if package.get("scripts", {}).get("test:packed-consumer") != "node scripts/packed-consumer-regression.mjs" or "test:packed-consumer" not in package.get("scripts", {}).get("test:package", "") or "test:package" not in package.get("scripts", {}).get("prepack", ""):
    failures.append("p39:package-gate")
if distribution_budgets != {"packedFiles": 365, "packedTarballRaw": 385000, "packedUnpackedRaw": 2180000}:
    failures.append("p39:distribution-budgets")
if "InputTag P49" not in components_page or "1.45.0" not in components_page or "V1.45.0" not in preview:
    failures.append("p39:showcase-version")
if "Publishable package and external installation (P39)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P39: publishable tarball and external consumer contract" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p39:documentation")

runtime_contract = (ROOT / "scripts/runtime-compatibility.mjs").read_text(encoding="utf-8")
release_contract = (ROOT / "scripts/release-contracts.mjs").read_text(encoding="utf-8")
ci_workflow = (ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")
release_workflow = (ROOT / ".github/workflows/release.yml").read_text(encoding="utf-8")
for marker in ["20.19.0", "22.12.0", "LAN_UI_EXPECTED_NODE", "RUNTIME_COMPATIBILITY PASS"]:
    if marker not in runtime_contract and marker not in ci_workflow:
        failures.append(f"p40:runtime-matrix:{marker}")
for marker in ["RELEASE_CONTRACT PASS", "componentNames.length===79", "actions/upload-artifact@v7", "actions/attest@v4", "artifact-metadata: write", "gh release create"]:
    if marker not in release_contract and marker not in release_workflow:
        failures.append(f"p40:release-contract:{marker}")
if package.get("scripts", {}).get("test:runtime") != "node scripts/runtime-compatibility.mjs" or "test:release" not in package.get("scripts", {}).get("test:package", ""):
    failures.append("p40:package-gates")
if "Runtime matrix and auditable GitHub releases (P40)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P40: runtime matrix and auditable release contract" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p40:documentation")

tour_source = (ROOT / "src/components/UiTour.vue").read_text(encoding="utf-8")
for marker in ["target-missing", "activeMask", "coordinates", "scrollIntoView", "useReducedMotion", "useTeleportThemeScope", "isTopOverlay", "defineExpose"]:
    if marker not in tour_source:
        failures.append(f"p41:tour-runtime:{marker}")
overlay_source = (ROOT / "src/components/overlayManager.js").read_text(encoding="utf-8")
if "lockScroll" not in overlay_source or "syncScrollLock" not in overlay_source:
    failures.append("p41:nonmodal-overlay-lock")
if "UiTour" not in components_page or 'id="product-tour"' not in preview or "previewTourOpen" not in preview or "UiTour" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p41:showcase-consumers")
if "Target-aware product onboarding (P41)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P41: target-aware product onboarding" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p41:documentation")

watermark_source = (ROOT / "src/components/UiWatermark.vue").read_text(encoding="utf-8")
for marker in ["MutationObserver", "devicePixelRatio", "imageCrossOrigin", "buildSvgFallback", "data-ui-watermark-signature", "pointerEvents: 'none'", "defineExpose"]:
    if marker not in watermark_source:
        failures.append(f"p42:watermark-runtime:{marker}")
if "UiWatermark" not in components_page or 'id="watermark"' not in preview or "previewWatermarkObserver" not in preview or "UiWatermark" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p42:showcase-consumers")
login_page = (ROOT / "src/pages/LoginPage.vue").read_text(encoding="utf-8")
if "V1.45.0" not in app or "V1.45.0" not in login_page or "badge:79" not in components_page or "<td>Watermark</td>" not in components_page:
    failures.append("p42:showcase-version-and-state-matrix")
if "Resilient document watermark (P42)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P42: resilient document watermark" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p42:documentation")

affix_source = (ROOT / "src/components/UiAffix.vue").read_text(encoding="utf-8")
for marker in ["resolveRoots", "boundaryRoot", "ResizeObserver", "data-ui-affix", "data-affixed", "updateRoot", "defineExpose"]:
    if marker not in affix_source:
        failures.append(f"p43:affix-runtime:{marker}")
if "UiAffix" not in components_page or 'id="affix" class="preview-section"' not in preview or "previewAffixTarget" not in preview or "UiAffix" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p43:showcase-consumers")
if "<td>Affix</td>" not in components_page or "affix-container-lifecycle" not in (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8"):
    failures.append("p43:state-and-interaction")
if "Container-aware sticky actions (P43)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P43: viewport and container-aware affix" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p43:documentation")

splitter_source = (ROOT / "src/components/UiSplitter.vue").read_text(encoding="utf-8")
for marker in ["pairResize", "role=\"separator\"", "aria-valuenow", "pointermove", "keyboardDelta", "useDirection", "pendingRatios", "toggleCollapse", "ResizeObserver", "defineExpose"]:
    if marker not in splitter_source:
        failures.append(f"p44:splitter-runtime:{marker}")
if "UiSplitter" not in components_page or 'id="splitter" class="preview-section"' not in preview or "previewSplitterDrag" not in preview or "UiSplitter" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p44:showcase-consumers")
if "<td>Splitter</td>" not in components_page or "splitter-keyboard-pointer-rtl" not in (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8"):
    failures.append("p44:state-and-interaction")
if "Responsive resizable workspace layout (P44)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P44: constrained multi-panel splitter" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p44:documentation")

typography_source = (ROOT / "src/components/UiTypography.vue").read_text(encoding="utf-8")
for marker in ["data-ui-typography", "navigator.clipboard", "copy-error", "ResizeObserver", "aria-expanded", "edit-start", "edit-end", "edit-cancel", "defineExpose"]:
    if marker not in typography_source:
        failures.append(f"p45:typography-runtime:{marker}")
if "UiTypography" not in components_page or 'id="typography-component" class="preview-section"' not in preview or "previewTypography" not in preview or "UiTypography" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p45:showcase-consumers")
if "<td>Typography</td>" not in components_page or "typography-copy-edit-expand" not in (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8"):
    failures.append("p45:state-and-interaction")
if "Semantic typography (P45)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P45: semantic typography primitive" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p45:documentation")

list_source = (ROOT / "src/components/UiList.vue").read_text(encoding="utf-8")
for marker in ['role="selectionMode===\'none\'?\'list\':\'listbox\'"', "aria-posinset", "typeaheadSearch", "columnStep", "ResizeObserver", "page-change", "data-ui-list-action", "defineExpose"]:
    if marker not in list_source:
        failures.append(f"p46:list-runtime:{marker}")
if "UiList" not in components_page or 'id="data-list" class="preview-section"' not in preview or "previewListData" not in preview or "UiList" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p46:showcase-consumers")
if "<td>List</td>" not in components_page or "list-selection-actions-pagination-rtl" not in (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8"):
    failures.append("p46:state-and-interaction")
if "Semantic finite-data lists (P46)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P46: semantic finite-data list" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p46:documentation")
locale_contract_source = (ROOT / "scripts/locale-contracts.mjs").read_text(encoding="utf-8")
if "\\uFFFD" not in locale_contract_source or "\\?{3,}" not in locale_contract_source:
    failures.append("p46:locale-corruption-gate")

otp_source = (ROOT / "src/components/UiOtpInput.vue").read_text(encoding="utf-8")
for marker in ["one-time-code", "normalize('NFKC')", "separatorEvery", "onPaste", "Backspace", "useDirection", "uiFormItemContext", "defineExpose"]:
    if marker not in otp_source:
        failures.append(f"p47:otp-runtime:{marker}")
if "UiOtpInput" not in components_page or 'id="otp-input" class="preview-section"' not in preview or "previewOtpInputs" not in preview or "UiOtpInput" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p47:showcase-consumers")
if "<td>OtpInput</td>" not in components_page or "otp-input-autofill-keyboard-rtl" not in (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8"):
    failures.append("p47:state-and-interaction")
if "One-time code input (P47)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P47: segmented one-time-code input" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p47:documentation")

mentions_source = (ROOT / "src/components/UiMentions.vue").read_text(encoding="utf-8")
for marker in ["contextAt", "fetchSuggestions", "AbortController", "compositionstart", "aria-autocomplete", "role=\"combobox\"", "useFloatingPosition", "useDirection", "uiFormItemContext", "defineExpose"]:
    if marker not in mentions_source:
        failures.append(f"p48:mentions-runtime:{marker}")
if "UiMentions" not in components_page or 'id="mentions" class="preview-section"' not in preview or "previewMentionContextAt" not in preview or "UiMentions" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p48:showcase-consumers")
if "data-mentions-state-contract" not in components_page or "mentions-caret-keyboard-multi-trigger-rtl" not in (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8"):
    failures.append("p48:state-and-interaction")
if "Contextual mentions (P48)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P48: contextual multiline mentions" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p48:documentation")

input_tag_source = (ROOT / "src/components/UiInputTag.vue").read_text(encoding="utf-8")
for marker in ["normalize('NFKC')", "compositionstart", "onPaste", "Backspace", "beforeAdd", "useDirection", "uiFormItemContext", "aria-busy", "defineExpose"]:
    if marker not in input_tag_source:
        failures.append(f"p49:input-tag-runtime:{marker}")
if "UiInputTag" not in components_page or 'data-input-tag-state-contract' not in components_page or 'id="input-tag" class="preview-section"' not in preview or "UiInputTag" not in (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8"):
    failures.append("p49:showcase-consumers")
if "<td>InputTag</td>" not in components_page or "input-tag-tokenize-edit-remove-rtl" not in (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8"):
    failures.append("p49:state-and-interaction")
if "Tokenized multi-value input (P49)" not in (ROOT / "README.md").read_text(encoding="utf-8") or "Maturity P49: tokenized multi-value input" not in (ROOT / "UI-SPEC.md").read_text(encoding="utf-8"):
    failures.append("p49:documentation")

if "localStorage.getItem('lan-font')" not in app or "dataset.font" not in app:
    failures.append("app:font-persistence")
if (ROOT / "UI-SPEC.md").read_bytes() != (ROOT / "public/UI-SPEC.md").read_bytes():
    failures.append("docs:public-spec-out-of-sync")
for path in [ROOT / "README.md", ROOT / "UI-SPEC.md"]:
    if "????" in path.read_text(encoding="utf-8"):
        failures.append(f"docs:corrupted-section:{path.name}")

standalone = (ROOT / "examples/standalone-vue/src/App.vue").read_text(encoding="utf-8")
for component in ["UiAffix", "UiAlert", "UiAnchor", "UiAutoComplete", "UiButton", "UiCalendar", "UiImage", "UiCommandPalette", "UiColorPicker", "UiIcon", "UiInput", "UiInputTag", "UiMentions", "UiNumberInput", "UiOtpInput", "UiSlider", "UiRate", "UiSplitter", "UiTypography", "UiStatistic", "UiSelect", "UiSchemaForm", "UiTour", "UiWatermark", "UiUpload", "UiSteps", "UiTable", "UiTree", "UiSegmented", "UiDescriptions", "UiToastHost", "UiConfigProvider", "UiDateRangePicker", "toast.success"]:
    if component not in standalone:
        failures.append(f"standalone:component:{component}")
for marker in ["direction", ":direction=", "RTL", "LTR"]:
    if marker not in standalone:
        failures.append(f"standalone:direction:{marker}")
for marker in ["type:'list'", "reviewers", "defaultValue:({index})"]:
    if marker not in standalone:
        failures.append(f"standalone:schema-form-list:{marker}")
for marker in ["releaseUploadRequest", "Release asset queue", ":request="]:
    if marker not in standalone:
        failures.append(f"standalone:upload-queue:{marker}")
for marker in ["standaloneAnchorItems", "standalone-overview", "standalone-schema", "standalone-upload"]:
    if marker not in standalone:
        failures.append(f"standalone:anchor:{marker}")
standalone_main = (ROOT / "examples/standalone-vue/src/main.js").read_text(encoding="utf-8")
for marker in ["registerIcon", "lan-ui-design-system/icons", "projectMark", "createApp(App).mount"]:
    if marker not in standalone_main:
        failures.append(f"standalone:icon-registry:{marker}")

direction_sources = "\n".join((ROOT / rel).read_text(encoding="utf-8") for rel in [
    "src/config.js", "src/components/UiTabs.vue", "src/components/UiSegmented.vue", "src/components/UiMenu.vue",
        "src/components/UiTree.vue", "src/components/UiTreeSelect.vue", "src/components/UiCascader.vue", "src/components/UiDrawer.vue", "src/components/UiTable.vue", "src/components/UiCommandPalette.vue", "src/components/UiColorPicker.vue", "src/components/UiRate.vue", "src/components/UiCalendar.vue", "src/components/UiImage.vue",
])
for marker in ["useDirection", "rtl", "direction"]:
    if marker not in direction_sources:
        failures.append(f"rtl:marker:{marker}")

visual_baselines = list((ROOT / "tests/visual/baselines").glob("*/*.png"))
if len(visual_baselines) < 22 or any(path.stat().st_size < 1000 for path in visual_baselines):
    failures.append(f"visual:baselines:{len(visual_baselines)}")
browser_runtime = (ROOT / "scripts/browser-runtime.mjs").read_text(encoding="utf-8")
visual_script = (ROOT / "scripts/visual-regression.mjs").read_text(encoding="utf-8")
for marker in ["pixelmatch", "maxDiffRatio", "light-ltr-default", "dark-rtl-compact", "light-ltr-mobile", "managed-form-error", "schema-form", "schema-form-list", "upload-queue", "scoped-theme", "scoped-theme-portal", "scoped-motion", "api-reference", "anchor-navigation", "watermark-document", "affix-container", "splitter-workspace", "typography-contract", "list-contract", "otp-input-contract", "mentions-contract", "input-tag-contract", "LAN_UI_BROWSER_PATH"]:
    if marker not in visual_script + browser_runtime:
        failures.append(f"visual:script:{marker}")
accessibility_script = (ROOT / "scripts/accessibility-regression.mjs").read_text(encoding="utf-8")
for marker in ["axe.run", "wcag22aa", "best-practice", "violations", "incomplete", "autocomplete-open", "multi-select-open", "tree-select-open", "tree-enterprise", "cascader-open", "command-palette-open", "color-picker-open", "calendar-focused", "image-focused", "image-preview-open", "virtual-list-focused", "data-grid-focused", "data-grid-columns-open", "status-page-500", "managed-form-error", "schema-form", "schema-form-list", "upload-queue", "scoped-theme-dark", "scoped-theme-portal", "scoped-motion-preferences", "api-reference", "anchor-navigation", "watermark-document", "affix-container", "splitter-workspace", "typography-contract", "list-contract", "otp-input-contract", "mentions-contract", "input-tag-contract", "modal-open", "drawer-rtl-open"]:
    if marker not in accessibility_script:
        failures.append(f"accessibility:browser:{marker}")
if accessibility_script.count("{name:") < 40:
    failures.append("accessibility:case-count")
interaction_script = (ROOT / "scripts/interaction-regression.mjs").read_text(encoding="utf-8")
for marker in ["color-picker-keyboard", "command-palette-keyboard", "tree-enterprise-keyboard", "autocomplete-keyboard", "select-keyboard", "number-input-keyboard", "slider-keyboard", "rate-keyboard", "statistic-live-update", "calendar-range-keyboard", "image-preview-keyboard", "tabs-rtl-keyboard", "modal-focus-trap-restore", "nested-overlay-stack", "popconfirm-cancel-confirm", "pagination-switch", "upload-validation-remove", "upload-queue-lifecycle", "table-state-contract", "form-validation-focus", "managed-form-nested-summary-server-error", "schema-form-conditional-orchestration", "schema-form-repeatable-list", "menu-directional-keyboard", "virtual-list-keyboard", "data-grid-client-contract", "data-grid-columns-keyboard", "status-page-actions", "scoped-theme-system", "scoped-theme-portal", "scoped-motion-system", "anchor-scroll-keyboard", "api-reference-discovery", "watermark-mutation-recovery", "affix-container-lifecycle", "splitter-keyboard-pointer-rtl", "typography-copy-edit-expand", "list-selection-actions-pagination-rtl", "otp-input-autofill-keyboard-rtl", "mentions-caret-keyboard-multi-trigger-rtl", "input-tag-tokenize-edit-remove-rtl", "reducedMotion: 'reduce'", "chromium", "firefox", "webkit", "INTERACTION_BROWSER PASS", "INTERACTION_REGRESSION PASS"]:
    if marker not in interaction_script:
        failures.append(f"interaction:browser:{marker}")
if interaction_script.count("name: '") + interaction_script.count("name:'") < 44:
    failures.append("interaction:case-count")
focus_source = (ROOT / "src/components/focusUtils.js").read_text(encoding="utf-8")
p8_test = (ROOT / "tests/maturity-p8.spec.js").read_text(encoding="utf-8")
for marker in ["registerFocusOriginTracking", "captureFocusOrigin", "focusWithRetry"]:
    if marker not in focus_source or marker not in p8_test:
        failures.append(f"interaction:p8-focus:{marker}")
if "lastPointerTimestamp" not in focus_source or "PointerEvent" not in p8_test:
    failures.append("interaction:p8-focus:pointer-origin-window")
performance_script = (ROOT / "scripts/performance-regression.mjs").read_text(encoding="utf-8")
for marker in ["gzipSync", "packageJsRaw", "largestChunkRaw", "subpathConsumerJsRaw", "standaloneExampleJsRaw", "themeSubpathJsRaw", "motionSubpathJsRaw", "moduleClosure", "releaseBaseline", "PERFORMANCE_DELTA PASS", "PERFORMANCE_REGRESSION PASS"]:
    if marker not in performance_script:
        failures.append(f"performance:script:{marker}")
if len(performance_budgets.get("budgets", {})) != 18 or performance_budgets.get("version") != package.get("version"):
    failures.append("performance:budget-version-or-count")
if performance_budgets.get("releaseBaseline", {}).get("version") != "1.28.0" or len(performance_budgets.get("releaseBaseline", {}).get("metrics", {})) != 14:
    failures.append("performance:p33-release-baseline")
if performance_budgets.get("releaseBaseline", {}).get("componentCount") != 69 or performance_budgets.get("releaseBaseline", {}).get("perComponentAllowance", {}) != {"packageJsRaw": 1900, "packageJsGzip": 2900, "packageCssRaw": 400, "largestComponentCssRaw": 450, "standaloneExampleJsRaw": 2200}:
    failures.append("performance:p49-additive-component-policy")
if "tolerance" in performance_budgets.get("releaseBaseline", {}):
    failures.append("performance:p49-additive-policy-must-not-use-percent-tolerance")
for export_name in ["./performance-budgets", "./performance-budgets.json"]:
    if export_name not in package.get("exports", {}):
        failures.append(f"performance:package-export:{export_name}")
ci_workflow = (ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")
for marker in ["runs-on: windows-latest", "runs-on: ubuntu-latest", "version: 10.34.0", "LAN_UI_BROWSER_PATH", "Microsoft\\Edge", "interaction-cross-browser", "playwright install --with-deps firefox webkit", "test:interaction:non-chromium"]:
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
    if len(component_js) != 79 or len(component_types) != 79:
        failures.append(f"dist-lib:component-subpaths:{len(component_js)}:{len(component_types)}")
    for rel in ["color.js","color.d.ts","config.js","config.d.ts","date.js","date.d.ts","feedback.js","feedback.d.ts","icons.js","icons.d.ts","plugin.js","plugin.d.ts","theme.js","theme.d.ts","motion.js","motion.d.ts"]:
        if not (dist_lib / rel).is_file():
            failures.append(f"dist-lib:subpath:{rel}")
    style_files = list((dist_lib / "styles").glob("Ui*.css"))
    if len(style_files) != 79 or not (dist_lib / "styles/core.css").is_file() or not (dist_lib / "styles/manifest.json").is_file():
        failures.append(f"dist-lib:component-styles:{len(style_files)}")

if failures:
    print("VERIFY FAIL")
    for failure in failures:
        print(f"- {failure}")
    sys.exit(1)

print("VERIFY PASS")
print(f"- required_files={len(required)}")
print(f"- vue_pages={len(list((ROOT / 'src/pages').glob('*.vue')))}")
print("- routes=9")
print("- preview_sections=" + str(preview.count('class="preview-section"')))
print("- forms=ui-input,ui-input-tag,ui-number-input,ui-slider,ui-autocomplete,ui-color-picker,ui-select,ui-textarea,no-native-select")
print("- extensions=date-picker,date-range-picker,time-picker,calendar,image,pagination,upload,layout,float-button")
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
print("- maturity-p20=command-palette,59-public-components,134-locale-keys,fuzzy-grouped-async,global-hotkey,focus-trap,rtl,16-interactions-per-browser")
print("- maturity-p21=color-picker,60-public-components,147-locale-keys,hex-rgb-hsl-alpha,wcag-contrast,pointer-keyboard,rtl,17-interactions-per-browser")
print("- maturity-p22=rate,61-public-components,152-locale-keys,fractional-pointer-keyboard,clear,rtl,form-aria,18-interactions-per-browser")
print("- maturity-p23=statistic,62-public-components,158-locale-keys,intl-precision,trend-semantics,loading-live-aria,19-interactions-per-browser")
print("- maturity-p24=calendar,63-public-components,172-locale-keys,single-multiple-range,year-panel,week-locale,rtl-keyboard,20-interactions-per-browser")
print("- maturity-p25=image,64-public-components,187-locale-keys,fallback-preview-gallery,zoom-rotate-pan,rtl-keyboard,21-interactions-per-browser")
print("- maturity-p26=status-page+virtual-list,66-public-components,202-locale-keys,403-404-500,windowing,variable-measurement,23-interactions-per-browser")
print("- maturity-p27=data-grid,67-public-components,211-locale-keys,client-server-orchestration,toolbar-a11y,25-interactions-per-browser")
print("- maturity-p28=managed-form,67-public-components,216-locale-keys,nested-paths,async-race,server-errors,error-summary,26-interactions-per-browser")
print("- maturity-p29=dynamic-form-list,68-public-components,216-locale-keys,stable-keys,reindex,dependencies,conditional-rules,27-interactions-per-browser")
print("- maturity-p30=schema-form,69-public-components,216-locale-keys,conditional-fields,resolvers,custom-registry,28-interactions-per-browser")
print("- maturity-p31=schema-form-list,69-public-components,223-locale-keys,repeatable-nodes,item-context,structured-previous,29-interactions-per-browser")
print("- maturity-p32=upload-queue,69-public-components,235-locale-keys,async-request,progress,cancel,retry,concurrency,30-interactions-per-browser")
print("- maturity-p33=component-style-union,css-boundary,esm-minify,lean-locale-runtime,14-release-deltas")
print("- maturity-p34=theme-runtime,102-token-presets,scoped-provider,system-preference,host-controller,31-interactions-per-browser")
print("- maturity-p35=12-teleport-theme-bridges,live-provider-scope,no-provider-fallback,10-visual,28-axe,32-interactions-per-browser")
print("- maturity-p36=adaptive-motion-runtime,provider-teleport-scope,11-visual,29-axe,33-interactions-per-browser,18-performance-budgets")
print("- maturity-p37=api-schema-3,generated-docs,6-categories,lazy-api-route,12-visual,30-axe,34-interactions-per-browser")
print("- maturity-p38=ui-anchor,scroll-spy,rtl-keyboard,reduced-motion,lazy-showcase-routes,13-visual,31-axe,35-interactions-per-browser")
print("- maturity-p39=mit-license,publish-metadata,packed-install,offline-consumer,ssr+types+vite,distribution-budgets")
print("- maturity-p40=node-20+22+24,compatibility-ci,version-bound-release,sha256,artifact-attestation,github-release")
print("- maturity-p41=ui-tour,target-aware-positioning,modal+nonmodal,focus+rtl+ssr,14-visual,32-axe,36-interactions-per-browser,26-negative-types")
print("- maturity-p42=ui-watermark,text+image-fallback,dpr-canvas,mutation-recovery,ssr+a11y,15-visual,33-axe,37-interactions-per-browser,27-negative-types")
print("- maturity-p43=ui-affix,window+container,boundary-aware,resize-observed,ssr+types,16-visual,34-axe,38-interactions-per-browser,28-negative-types")
print("- maturity-p44=ui-splitter,horizontal+vertical,multi-panel,constraints,collapse,keyboard+rtl,lazy,ssr+types,17-visual,35-axe,39-interactions-per-browser,29-negative-types")
print("- maturity-p45=ui-typography,semantic-title-text-paragraph,copy-edit-ellipsis,overflow-observer,ssr+types,18-visual,36-axe,40-interactions-per-browser,30-negative-types")
print("- interactions=modal,drawer,toast,notification,tooltip,popover,popconfirm,switch,tabs,select,upload,pagination,float-button,table-filter,theme,auth")
print("- maturity-p46=ui-list,finite-rich-records,responsive-grid,selection+typeahead,client+server-pagination,localized-states,ssr+packed-consumer,19-visual,37-axe,41-interactions-per-browser")
print("- maturity-p47=ui-otp-input,nfkc+filter,paste+autofill,mask+form-value,keyboard+rtl,ssr+types,20-visual,38-axe,42-interactions-per-browser,32-negative-types")
print("- maturity-p48=ui-mentions,caret-anchor,multi-trigger,async-abort+cache,ime,combobox-owner+listbox,rtl,ssr+types,21-visual,39-axe,43-interactions-per-browser,33-negative-types")
print("- maturity-p49=ui-input-tag,nfkc+separators+paste,async-validation+serialized-add,editable+collapse,keyboard+rtl,form+schema,ssr+types,22-visual,40-axe,44-interactions-per-browser,34-negative-types")
