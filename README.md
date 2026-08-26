# Lan UI

<div align="center">

**面向企业后台的 Vue 3 设计系统与组件框架**

92 个可复用组件 · TypeScript 类型 · 主题与国际化 · 可访问性与跨浏览器回归 · MIT License

[快速开始](#快速开始) · [安装说明](#安装说明) · [界面预览](#界面预览) · [文档导航](#文档导航)

</div>

## 这是什么框架

Lan UI 是一个基于 **Vue 3 + Vite** 的开源企业级设计系统。它同时提供组件库、设计 Token、主题与国际化运行时、组件 API 文档，以及可直接运行的后台示例，适合 ERP、CRM、运营平台、数据后台和 AI 工作台等中后台产品。

当前版本为 **v1.80.0**，公共 API 覆盖 **92 个组件、1,815 个 Props、608 个 Events 和 406 个 Slots**。

## 为什么选择 Lan UI

- **完整的后台能力**：表单、选择器、表格、数据网格、反馈浮层、导航、图表式看板、状态页和高级业务组件均有统一实现。
- **既能整库使用，也能按需引入**：支持根入口、组件子路径与独立组件样式，便于在开发效率和产物体积之间取舍。
- **设计与代码使用同一套 Token**：颜色、字体、间距、圆角、动效和密度均由语义变量管理，支持亮色、暗色、系统主题和局部主题作用域。
- **面向国际化与复杂布局**：内置中英文能力，支持 Locale 扩展、RTL、响应式布局和 Teleport 浮层主题继承。
- **类型与 API 可追踪**：提供 TypeScript 声明、生成式 API 清单和组件子路径类型，便于自动补全与升级审查。
- **质量门禁可复现**：仓库包含单元、类型、视觉、无障碍、交互、性能、SSR、打包消费和跨浏览器检查。
- **真实业务示例**：不仅展示孤立组件，还提供看板、客户数据、AI 问答、甘特计划、登录与错误页等完整界面。

## 本轮组件完善

**P78 成熟表格组件**：`UiTable` 已补齐受控/默认选择、展开、当前行、排序、筛选和列宽状态，支持行级策略与异步守卫、嵌套字段、指针/键盘列宽调整、虚拟行、完整键盘/RTL、结构化事件、13 个 Slots 和实例 API；`UiDataGrid` 同步复用同一套表格能力。

**P79 成熟日期选择器**：`UiDatePicker` 以 `UiCalendar` + `UiPopover` 组合为日期模式提供受控/默认值、面板与视图状态、最小/最大/自定义禁用、预设、同步/异步守卫、键盘/RTL/Portal/SSR、10 个 Slots 和实例 API；时间与日期时间模式继续保留原生输入回退。

**P80 选择界面视觉完整性**：`UiTransfer` 为普通与带描述选项提供稳定的逐项虚拟高度与累计偏移，选中/活动/焦点状态统一使用已定义 Token；`UiTable` 紧凑选择列保持至少 24×28 命中区并让表头、数据行勾选框垂直居中。

**P81 成熟日期范围选择器**：`UiDateRangePicker` 在日期模式使用真实 `UiPopover` + `UiCalendar` 范围面板，支持受控/默认值、打开与视图状态、两步预览/完成、预设、约束、同步/异步守卫、组合 Slots、实例 API、RTL、Portal、SSR 与无障碍语义；`UiTimeRangePicker` 与 `UiDateTimeRangePicker` 保持原生双输入适配器。

**P82 悬浮操作组件族**：`UiFloatButton` 支持原生按钮/链接、提示、徽标溢出、加载与禁用、受控可见性、Back-to-top、目标滚动与实例 API；默认保持调用方 DOM，显式 `teleportTo` 才建立 Portal。新增 `UiFloatButtonGroup` 提供点击/悬停 Speed Dial、异步打开守卫、动作注册、方向键/Home/End、Escape 焦点恢复、RTL、Portal 主题与 SSR 安全语义；组内子按钮由 Group 拥有 Portal，不会重复 teleport。

**P83 响应式布局原语**：`UiLayout`、`UiGrid`、`UiCol`、`UiSpace` 与 `UiDivider` 保留既有标量默认值，并增加 SSR 安全的 xs/sm/md/lg/xl/xxl 响应式值、fixed/auto-fit/auto-fill 栅格、实际列偏移与溢出钳制、Fragment 安全分隔符、语义/装饰分隔线、逻辑 RTL、密度、实例状态与 `getRect()`。组件中心、Workbench、静态预览、独立示例、类型、视觉、Axe、三浏览器交互和打包消费均使用真实布局原语。

```vue
<UiTable v-model:selected-rows="selected" v-model:expanded-rows="expanded" :columns="columns" :rows="rows" selectable expandable resizable />
```

## 界面预览

### 综合看板

![Lan UI 综合看板](https://raw.githubusercontent.com/dengpan20/LanUI/main/docs/images/dashboard.jpg)

<table>
  <tr>
    <td width="50%" align="center"><strong>组件用例中心</strong></td>
    <td width="50%" align="center"><strong>客户数据列表</strong></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/dengpan20/LanUI/main/docs/images/components.jpg" alt="Lan UI 组件用例中心" /></td>
    <td><img src="https://raw.githubusercontent.com/dengpan20/LanUI/main/docs/images/data-table.jpg" alt="Lan UI 客户数据列表" /></td>
  </tr>
</table>

## 快速开始

在本地运行完整后台示例：

```bash
git clone https://github.com/dengpan20/LanUI.git
cd LanUI
corepack enable
pnpm install
pnpm dev
```

打开 <http://127.0.0.1:4173/>。首次进入时按页面提示登录，即可浏览看板、业务页面、组件用例中心与 API 参考。

常用开发命令：

```bash
pnpm dev          # 启动开发环境
pnpm build        # 构建后台示例
pnpm build:lib    # 构建组件库
pnpm test         # 单元测试与核心契约检查
pnpm check        # 执行完整质量门禁
```

## 安装说明

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- Vue `^3.5.0`

### 安装组件库

任选一种包管理器：

```bash
pnpm add lan-ui-design-system
# 或：npm install lan-ui-design-system
# 或：yarn add lan-ui-design-system
```

### 全局安装

```js
import { createApp } from 'vue'
import LanUi from 'lan-ui-design-system'
import 'lan-ui-design-system/style.css'
import App from './App.vue'

createApp(App).use(LanUi).mount('#app')
```

随后可在模板中直接使用组件：

```vue
<template>
  <UiButton variant="primary" @click="submit">提交</UiButton>
</template>
```

### 按需引入

```vue
<script setup>
import UiButton from 'lan-ui-design-system/components/UiButton'
import 'lan-ui-design-system/styles/UiButton.css'

function submit() {
  console.log('submitted')
}
</script>

<template>
  <UiButton variant="primary" @click="submit">提交</UiButton>
</template>
```

组件样式会通过 `@import` 自动带入共享的 `core.css`；完整样式、按组件样式和 Token 的选型说明见[详细使用教程](https://github.com/dengpan20/LanUI/blob/main/docs/USAGE-GUIDE.md)。

## 文档导航

README 只保留项目介绍、界面预览、快速开始和安装入口。版本记录、完整教程与 API 细节分别维护在以下文件中：

| 我想了解 | 文档 | 内容 |
|---|---|---|
| 从安装到主题、语言与反馈服务 | [详细使用教程](https://github.com/dengpan20/LanUI/blob/main/docs/USAGE-GUIDE.md) | 全局/按需接入、配置、主题、Locale、反馈服务、工程命令 |
| 每个组件有哪些 Props / Events / Slots | [组件 API](./COMPONENT-API.md) | 92 个组件的生成式 API 参考与导入方式 |
| 设计语言与交互规则 | [设计规范](./UI-SPEC.md) | Token、排版、布局、组件状态、动效与无障碍规范 |
| 每个版本改了什么 | [版本说明](./CHANGELOG.md) | 按 SemVer 维护的新增、变更与修复记录 |
| 升级时需要调整什么 | [迁移指南](./MIGRATION.md) | 破坏性变更、兼容策略与版本迁移步骤 |
| 查看独立消费项目 | [Standalone Vue 示例](https://github.com/dengpan20/LanUI/tree/main/examples/standalone-vue/) | 从已安装包导入组件的完整 Vue 应用 |
| 查看机器可读清单 | [API Manifest](./api-manifest.json) / [Style Manifest](./style-manifest.json) | API、样式入口、规则数量与体积信息 |

## 项目结构

```text
LanUI/
├─ src/
│  ├─ components/          # Vue 组件
│  ├─ pages/               # 后台示例页面
│  ├─ locales/             # 内置语言包
│  └─ index.js             # 组件库根入口
├─ examples/standalone-vue # 独立消费示例
├─ docs/                   # 使用教程与 README 图片
├─ tests/                  # 单元、类型、交互与视觉用例
├─ scripts/                # 构建、文档、质量与发布脚本
├─ COMPONENT-API.md        # 自动生成的组件 API
├─ UI-SPEC.md              # 设计与交互规范
├─ CHANGELOG.md            # 版本说明
└─ MIGRATION.md            # 迁移指南
```

## 参与贡献

1. Fork 仓库并创建功能分支。
2. 完成功能与对应测试。
3. 运行 `pnpm check`。
4. 提交 Pull Request，并说明变更动机、验证方式与界面影响。

提交问题或建议：<https://github.com/dengpan20/LanUI/issues>

## License

[MIT](./LICENSE) © 2026 dengpan20
