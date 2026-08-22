# Lan UI 详细使用教程

本教程面向在 Vue 3 项目中消费 `lan-ui-design-system` 的开发者。项目概览与本地运行见[项目 README](../README.md)，逐组件 API 见[组件 API](../COMPONENT-API.md)，设计与交互约束见[设计规范](../UI-SPEC.md)。

## 导航

- [1. 环境与安装](#1-环境与安装)
- [2. 整库接入](#2-整库接入)
- [3. 按需接入](#3-按需接入)
- [4. 全局配置](#4-全局配置)
- [5. 局部配置](#5-局部配置)
- [6. 主题与 Token](#6-主题与-token)
- [7. 国际化](#7-国际化)
- [8. 表单示例](#8-表单示例)
- [9. 服务式反馈](#9-服务式反馈)
- [10. TypeScript 与 API 查询](#10-typescript-与-api-查询)
- [11. 工程验证](#11-工程验证)
- [12. 升级与排错](#12-升级与排错)

## 1. 环境与安装

运行环境：

- Node.js `^20.19.0` 或 `>=22.12.0`
- Vue `^3.5.0`
- 支持 ESM 的构建工具，推荐 Vite

安装：

```bash
pnpm add lan-ui-design-system
# npm install lan-ui-design-system
# yarn add lan-ui-design-system
```

如果项目尚未安装 Vue：

```bash
pnpm add vue@^3.5.0
```

## 2. 整库接入

整库接入适合后台新项目、原型和需要使用大量组件的应用。

```js
// src/main.js
import { createApp } from 'vue'
import LanUi from 'lan-ui-design-system'
import 'lan-ui-design-system/style.css'
import App from './App.vue'

createApp(App).use(LanUi).mount('#app')
```

注册后，所有公共组件都可直接在模板中使用：

```vue
<script setup>
import { ref } from 'vue'

const keyword = ref('')
</script>

<template>
  <UiSpace>
    <UiInput v-model="keyword" clearable placeholder="搜索客户" />
    <UiButton variant="primary">查询</UiButton>
  </UiSpace>
</template>
```

## 3. 按需接入

只使用少数组件时，从组件子路径导入 JavaScript，并导入对应样式：

```vue
<script setup>
import UiButton from 'lan-ui-design-system/components/UiButton'
import UiInput from 'lan-ui-design-system/components/UiInput'
import 'lan-ui-design-system/styles/UiButton.css'
import 'lan-ui-design-system/styles/UiInput.css'
</script>

<template>
  <UiInput placeholder="项目名称" />
  <UiButton variant="primary">保存</UiButton>
</template>
```

每份组件 CSS 会导入共享的 `core.css`。如果组件使用范围较大，直接导入完整样式更简单：

```js
import 'lan-ui-design-system/style.css'
```

可用样式入口及体积见 [`style-manifest.json`](../style-manifest.json)。

## 4. 全局配置

使用 `createLanUi` 为应用创建独立配置实例：

```js
import { createApp } from 'vue'
import { createLanUi } from 'lan-ui-design-system'
import 'lan-ui-design-system/style.css'
import App from './App.vue'

const lanUi = createLanUi({
  locale: 'zh-CN',
  appearance: 'system',
  motion: 'system',
  size: 'md',
  density: 'default',
  direction: 'ltr',
  zIndex: 2000,
})

createApp(App).use(lanUi).mount('#app')
```

运行时可更新常用配置：

```js
lanUi.setLocale('en-US')
lanUi.setAppearance('dark')
lanUi.setMotion('reduced')
```

多应用、微前端或 SSR 场景推荐为每个应用/请求创建独立实例；需要连同反馈状态隔离时传入 `{ isolated: true }`。

## 5. 局部配置

`UiConfigProvider` 可在页面或模块内覆盖语言、主题、密度、尺寸、方向和动效设置：

```vue
<script setup>
import { UiButton, UiConfigProvider, UiInput } from 'lan-ui-design-system'
</script>

<template>
  <UiConfigProvider
    locale="en-US"
    appearance="dark"
    density="compact"
    size="sm"
    direction="ltr"
    motion="reduced"
  >
    <UiInput placeholder="Release name" />
    <UiButton variant="primary">Publish</UiButton>
  </UiConfigProvider>
</template>
```

嵌套 Provider 会继承上层配置，仅覆盖显式传入的字段。由 Teleport 创建的浮层也会继承当前作用域。

## 6. 主题与 Token

### 6.1 使用内置外观

```vue
<UiConfigProvider appearance="light">...</UiConfigProvider>
<UiConfigProvider appearance="dark">...</UiConfigProvider>
<UiConfigProvider appearance="system">...</UiConfigProvider>
```

### 6.2 创建自定义主题

```js
import { defineTheme } from 'lan-ui-design-system/theme'

export const tenantTheme = defineTheme({
  name: 'tenant-blue',
  appearance: 'light',
  tokens: {
    'brand-600': '#155EEF',
    'brand-700': '#004EEB',
    'bg-page': '#F5F8FF',
  },
})
```

```vue
<UiConfigProvider :theme="tenantTheme">
  <RouterView />
</UiConfigProvider>
```

完整 Token 可从以下入口读取：

```js
import tokens from 'lan-ui-design-system/tokens'
```

也可以使用 CSS 变量：

```css
@import 'lan-ui-design-system/tokens.css';

.product-card {
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}
```

Token 命名与视觉原则见[设计规范](../UI-SPEC.md)。

## 7. 国际化

内置语言为 `zh-CN` 和 `en-US`：

```js
const lanUi = createLanUi({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
})

lanUi.setLocale('en-US')
```

注册同步语言包：

```js
lanUi.registerLocale({
  name: 'fr-FR',
  messages: frenchMessages,
}, ['fr'])
```

按需加载语言包：

```js
await lanUi.loadLocale(
  'ja-JP',
  () => import('./locales/ja-JP.js'),
  { aliases: ['ja'], activate: true },
)
```

组件外可使用本地化工具：

```js
import { useLocale } from 'lan-ui-design-system'

const { t, tc, formatNumber, formatDate, formatRelativeTime, formatList } = useLocale()
```

RTL 页面可在全局配置或局部 Provider 中设置 `direction: 'rtl'`。

## 8. 表单示例

```vue
<script setup>
import { reactive, ref } from 'vue'
import {
  UiButton,
  UiForm,
  UiFormItem,
  UiInput,
  UiSelect,
} from 'lan-ui-design-system'

const formRef = ref()
const model = reactive({ name: '', type: '' })
const rules = {
  name: [{ required: true, message: '请输入客户名称' }],
  type: [{ required: true, message: '请选择客户类型' }],
}
const typeOptions = [
  { label: '企业客户', value: 'business' },
  { label: '渠道客户', value: 'channel' },
]

async function submit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  console.log({ ...model })
}
</script>

<template>
  <UiForm ref="formRef" :model="model" :rules="rules">
    <UiFormItem label="客户名称" name="name" required>
      <UiInput v-model="model.name" clearable />
    </UiFormItem>
    <UiFormItem label="客户类型" name="type" required>
      <UiSelect v-model="model.type" :options="typeOptions" />
    </UiFormItem>
    <UiButton variant="primary" @click="submit">保存</UiButton>
  </UiForm>
</template>
```

组件 Props、事件元数据、Slots 和实例方法以[组件 API](../COMPONENT-API.md)为准。

### 8.1 穿梭框与权限分配

`UiTransfer` 同时支持目标值、双侧勾选和双侧搜索的受控状态。筛选后全选只影响当前可见且可用的记录，并保留被筛选隐藏的勾选项：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UiTransfer } from 'lan-ui-design-system'

const permissions = ref(['token'])
const selectedKeys = ref([])
const searches = ref<[string, string]>(['', ''])
const permissionOptions = [
  { label: 'API access', value: 'api', description: 'Service integration' },
  { label: 'Design tokens', value: 'token', description: 'Theme variables' },
  { label: 'Billing admin', value: 'billing', disabled: true },
]
</script>

<template>
  <UiTransfer
    v-model="permissions"
    v-model:selected-keys="selectedKeys"
    v-model:search-values="searches"
    :options="permissionOptions"
    searchable
    :min-count="1"
    :max-count="8"
    target-order="original"
    name="permissions"
    required
  />
</template>
```

大数据集可设置 `listHeight`、`itemHeight`、`overscan` 和 `measure`；两侧面板使用虚拟列表。Enter 或 Alt+逻辑方向键移动已勾选项，Space 切换当前项，移动限制会通过 `limit` 和 `invalid` 事件返回结构化原因。

## 9. 服务式反馈

在应用根部挂载 Host：

```vue
<template>
  <RouterView />
  <UiToastHost />
  <UiNotification />
</template>
```

在业务代码中调用服务：

```js
import { notification, toast } from 'lan-ui-design-system'

toast.success('保存成功')

notification.open({
  type: 'info',
  title: '版本已生成',
  message: '可以进入发布流程。',
  actionText: '查看详情',
  onAction: () => console.log('open release'),
})
```

组合式 API：

```js
import { useNotification, useToast } from 'lan-ui-design-system'

const toast = useToast()
const notification = useNotification()
```

## 10. TypeScript 与 API 查询

根入口提供组件类型；子路径也提供独立声明：

```ts
import type {
  UiButtonEmits,
  UiButtonProps,
  UiButtonSlots,
} from 'lan-ui-design-system/components/UiButton'
```

查找 API 的推荐顺序：

1. 在[组件 API](../COMPONENT-API.md)中搜索组件名。
2. 需要机器处理时读取 [`api-manifest.json`](../api-manifest.json)。
3. 需要核对声明时查看 [`src/index.d.ts`](../src/index.d.ts)。

`COMPONENT-API.md` 由清单生成，不应直接编辑。修改组件契约后运行：

```bash
pnpm api:generate
pnpm api:check
```

## 11. 工程验证

```bash
pnpm lint                       # 静态规则
pnpm test                       # 单元与核心契约
pnpm test:types                 # 类型消费回归
pnpm test:visual                # 视觉回归
pnpm test:a11y                  # 浏览器无障碍检查
pnpm test:interaction           # Chromium 交互回归
pnpm test:interaction:cross-browser
pnpm test:performance           # 性能预算
pnpm test:package               # 包入口与安装消费
pnpm check                      # 完整门禁
```

独立消费示例位于 [`examples/standalone-vue`](../examples/standalone-vue/)：

```bash
pnpm build:lib
pnpm build:example
```

## 12. 升级与排错

- 查看版本变化：[CHANGELOG.md](../CHANGELOG.md)
- 查看升级步骤：[MIGRATION.md](../MIGRATION.md)
- 查看组件契约：[COMPONENT-API.md](../COMPONENT-API.md)
- 查看设计边界：[UI-SPEC.md](../UI-SPEC.md)

常见问题：

### 组件有结构但没有样式

整库使用时导入：

```js
import 'lan-ui-design-system/style.css'
```

按需使用时导入对应组件样式，例如：

```js
import 'lan-ui-design-system/styles/UiButton.css'
```

### Vue 出现重复实例或版本警告

确认消费项目使用满足 Peer Dependency 的 Vue 版本，并避免在打包配置中复制 Vue Runtime。

### 浮层主题与页面不一致

将触发组件放在对应 `UiConfigProvider` 作用域内；Lan UI 会把主题、方向、密度和 Locale 上下文同步到 Teleport 根节点。

### 升级后类型或行为发生变化

先核对[版本说明](../CHANGELOG.md)和[迁移指南](../MIGRATION.md)，然后运行消费项目的类型检查、单元测试与关键交互回归。
