# Lan UI Design System V1

## 1. 设计定位

基于参考截图反向提炼的 **Clean Enterprise / Light Blue Admin** 设计语言：浅灰页面背景、白色内容卡片、品牌蓝强调、轻边框、小圆角、弱阴影与紧凑型排版。目标场景为 ERP、CRM、数据后台、运营后台与 AI 工作台。

> 说明：截图在当前任务中没有可再次读取的原始像素，因此 `Observed` 表示会话中可确认的结构特征；具体数值为基于这些特征形成的 `Inferred V1` Token，可在获得原图后做像素级校准。

## 2. Foundations

### 2.1 色彩

| Token | 值 | 用途 |
|---|---:|---|
| `brand.600` | `#2563EB` | 主按钮、选中导航、链接、焦点 |
| `brand.50` | `#EFF6FF` | 轻选中背景、提示背景 |
| `bg.page` | `#F4F7FB` | 后台页面底色 |
| `bg.surface` | `#FFFFFF` | 卡片、弹窗、导航表面 |
| `text.primary` | `#172033` | 标题、主信息 |
| `text.secondary` | `#526078` | 正文、说明 |
| `border.default` | `#DFE5EE` | 输入框、表格、分割线 |
| `success.500` | `#10B981` | 成功、在线、完成 |
| `warning.500` | `#F59E0B` | 风险、等待、提醒 |
| `danger.500` | `#EF4444` | 错误、删除、失败 |

颜色不可只表达状态：状态同时使用文字或图标；正文与背景对比度目标至少 4.5:1。

### 2.2 Typography

- 字体栈：`Inter, PingFang SC, Microsoft YaHei, system-ui`。
- 页面标题：22/28，600；卡片标题：16/24，600；正文：14/22，400；辅助文字：12/18，400。
- 数值/KPI 可使用 28/36，650；表格保持 13–14px 高密度。
- 标题使用主文字色，说明使用次级色，弱信息使用三级色。

### 2.3 Spacing / Radius / Elevation

- 4px 基准间距：`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`。
- 控件内部间距优先 8/12；卡片间距 16；页面间距 20/24。
- 控件圆角 6px；卡片 8–12px；大弹层 12–16px；胶囊标签 999px。
- 卡片默认不使用重阴影，以 1px 轻边框为主；浮层使用中等阴影。

### 2.4 Layout

- 桌面侧栏 224px，可收起至 72px；头部 56px；多页签 38px。
- 内容区采用流式 12 栅格，页面最大宽度不锁死；最小内容安全宽度 960px。
- `< 1024px` 自动收起侧栏；`< 720px` 侧栏成为抽屉，卡片/表单改为单列。
- 页面层级：`App Shell → Page Header → Toolbar/Filter → Content Cards → Feedback Overlay`。

## 3. 组件规范

### Button

- 变体：Primary / Secondary / Outline / Text / Danger。
- 尺寸：sm 28px / md 34px / lg 40px。
- 状态：Default → Hover → Pressed → Focus-visible → Loading → Disabled。
- 同一区域只保留一个 Primary；Danger 必须匹配破坏性动作。

### Input / Select

- 状态：Empty / Hover / Focus / Filled / Error / Disabled / Read-only。
- Focus 使用品牌色边框与 3px focus ring；Error 同时出现红色边框和帮助文案。
- Label 与控件间 6–8px；帮助/错误文案距控件 6px。

### Form / Selection

- `UiFormItem` 统一 Label、Required、Help、Error 与 `aria-describedby`，错误信息使用 `role="alert"`。
- Checkbox 支持 Boolean、Array 和 Indeterminate；Checkbox Group 中至少保留一个清晰的组标签。
- Radio 使用相同 `name` 形成互斥组，键盘方向键遵循浏览器原生行为。
- Switch 表达即时生效的二元状态，支持 Disabled、Loading、Small，并始终提供可读标签。

### Navigation

- 菜单：Default / Hover / Pressed / Selected / Disabled；二级菜单支持 Closed / Expanding / Opened。
- 选中项使用品牌浅色背景 + 品牌色文字 + 左侧/内嵌强调，不只依赖图标颜色。
- 顶部页签：Inactive / Hover / Active / Close-hover / Closing；关闭活动页签后激活左侧最近页签。

### Table

- 表头使用弱背景和 600 字重；行高约 48px；Hover 使用 `brand.50` 的低透明版本。
- 支持排序、筛选、多选、批量操作、分页、Loading、Empty、Error 与横向溢出。
- 行操作以 1–2 个高频文字操作 + 更多菜单呈现。
- 列表由 `UiListToolbar + UiTable + UiPagination` 组合：Toolbar 管理批量动作、密度和显示列；Table 管理列结构、行状态和排序；Pagination 管理页码与 PageSize。
- `UiTable` 使用列配置描述 `key / label / width / align / sortable / fixed / configurable`，业务内容通过 `cell-{key}` Slot 注入。
- 表格密度分为 Compact（39px）、Default（48px）和 Comfortable（58px）；密度变化只影响垂直空间，不改变信息层级。
- 全选仅作用于当前数据集并保留数据集之外的已选项；部分选择必须展示 Indeterminate 状态。
- 展开行用于补充低频信息，不代替详情页；固定操作列在横向滚动时保持可见。
- 桌面端支持 Sticky Header 和横向滚动；小于 720px 时切换为带字段标签的卡片列表。
- 服务端模式由页面监听 `sort-change`、Pagination change 和筛选条件，组件本身不持有远端请求状态。

### Feedback

- Toast：成功/警告/错误/信息，默认 3 秒；Hover 暂停；可关闭。
- Modal：需阻断任务；点击遮罩关闭只用于可安全放弃的操作；焦点保持在弹层内。
- Drawer：用于查看/编辑上下文信息，关闭后焦点回到触发器。
- Modal 与 Drawer 使用 Teleport 挂载到 Body，打开时锁定页面滚动并保持焦点循环；Esc、遮罩点击均由 Props 控制。
- Tooltip 同时响应 Hover 与 Focus；Popover 用于轻量内容；Popconfirm 只用于需要二次确认的高风险操作。
- Notification 用于需要阅读和处理的消息；Toast 负责短时反馈，Hover 暂停倒计时，离开后继续。
- Loading：按钮局部加载优先；超过 300ms 才展示；骨架屏用于结构稳定的内容区。

## 4. Motion

| 场景 | 时长 | 曲线 |
|---|---:|---|
| Hover / Press | 120ms | standard |
| Dropdown / Tooltip | 180ms | standard |
| Modal / Drawer / Menu | 260ms | emphasized |
| 页面内容切换 | 180ms | standard |

遵循 `prefers-reduced-motion`，关闭非必要位移和缩放。

## 5. 交互与可访问性

- 所有可交互元素可用键盘到达，使用 `:focus-visible` 清晰显示焦点。
- `Esc` 关闭 Modal/Drawer/Dropdown；Modal 打开后自动聚焦关闭按钮。
- 触控目标建议不低于 40×40px；紧凑表格操作最小 32px。
- 表单错误在提交后聚焦首个错误项；异步动作展示 Loading 并避免重复提交。
- 空状态解释原因并提供下一步动作；404 提供返回首页；退出前提供确认页。

## 6. 模式与页面

- **Dashboard**：KPI → 趋势/分布 → 待办/动态，先总览后诊断。
- **Workbench**：欢迎区 + 我的数据 + 快捷入口 + 工单/公告。
- **Data Table**：筛选 → 工具栏 → 结果表 → 批量操作 → 分页。
- **AI Chat**：对话历史 + 消息流 + 推荐问题 + Composer + 重试/复制。
- **Gantt**：任务树 + 时间轴 + Today Line + 进度条 + Tooltip + 缩放。

## 7. 扩展组件规范

### DatePicker
- 支持 `date / time / datetime` 三种模式，以及 `sm / md / lg` 尺寸。
- 状态覆盖 Default、Hover、Focus、Invalid、Disabled、HasValue；允许键盘输入、系统日历选择与一键清除。
- 日期范围由两个 DatePicker 组合，开始时间晚于结束时间时立即显示字段级错误。

### Pagination
- 默认展示总条数、当前范围、页码、上一页/下一页及 PageSize。
- 页码超过 7 页时使用省略号；改变 PageSize 后回到第 1 页；首尾方向按钮保持 Disabled 状态。
- 小屏允许控件换行，不压缩到低于 28px 的点击区域。

### Upload
- 支持点击选择与拖拽；选择前校验文件格式、单文件大小和数量上限。
- 文件列表展示名称、大小、结果状态和移除操作；失败信息说明具体文件与原因。
- 上传区必须可通过键盘触发，拖拽仅作为增强交互。

### Layout
- 桌面采用 12 栏栅格，推荐 `16px` Gutter 和 `24px` 内容边距，内容最大宽度建议 `1440px`。
- `≥1200px` 展开侧栏；`720–1199px` 收起侧栏；`<720px` 使用单栏和 `14px` 页面边距。
- 页面结构保持 Sidebar → Header → Tabs → Content 的稳定层级。

### FloatButton
- 固定于右下安全边距，主按钮使用品牌色，辅助按钮使用 Surface；Tooltip 在 Hover/Focus 时出现。
- 可展开按钮组沿纵向展开，点击主按钮或按 `Esc` 收起；返回顶部使用平滑滚动。
- 避免覆盖分页、表格行操作、移动端底部导航和系统级反馈。

## 8. 治理

- Token、Primitive、Pattern、Page 四层依赖；上层可依赖下层，禁止反向依赖。
- 新组件先证明无法由现有组件组合；新增 Variant 必须覆盖真实重复场景。
- 版本遵循 SemVer；Deprecated 至少保留一个 minor 版本并提供迁移说明。

## 9. 完整组件能力

### 布局与导航
- `UiLayout / UiGrid / UiCol / UiSpace / UiDivider` 是页面布局的唯一基础入口；业务页面不直接声明新的栅格体系。
- `UiBreadcrumb` 当前项使用 `aria-current="page"`；中间节点可以是链接或受控导航动作。
- `UiTabs` 使用 `tablist / tab / tabpanel` 语义，支持方向键、Home、End、Disabled 和可关闭标签。
- `UiDropdown` 支持外部点击、Esc、上下方向键、Home/End，并在关闭后保持触发上下文。

### 数据展示
- `UiAvatar / UiBadge / UiSkeleton / UiEmpty / UiAlert` 统一头像回退、状态计数、加载、空数据和持久提示。
- `UiProgress / UiSteps / UiTimeline` 分别表达连续进度、阶段流程和时间事件，不互相替代。
- Skeleton 只表示结构加载；超过 10 秒必须切换为明确的错误或重试状态。

### 高级表单
- `UiForm` 统一管理 model、rules、提交、重置、清除错误和滚动到首个错误项。
- Rules 支持 Required、Min/Max、Pattern 与同步/异步 Validator；字段错误必须与帮助信息互斥。
- `UiMultiSelect / UiTreeSelect / UiCascader / UiTransfer` 分别用于多值标签、层级单选、路径选择和双栏分配。
- 复杂选择组件必须支持 Esc 关闭、Disabled 项和明确的选择状态；搜索是增强能力，不替代分组与层级。

### Table 增强
- Column 可声明 Sortable、Filterable、Fixed 和 Resizable；筛选状态由页面通过 `v-model:filters` 管理。
- 大数据量场景使用 Virtual、RowHeight、ViewportHeight 与 Overscan；服务端场景监听 Sort/Filter/Page 事件请求数据。
- 列宽最小为 `72px`；固定列必须给出 Left/Right 偏移，避免覆盖滚动内容。

### Overlay Manager
- Modal 和 Drawer 通过统一 Stack 管理 Body Scroll Lock、Z-index 和 Esc 关闭顺序。
- 只有栈顶浮层响应 Esc 与遮罩关闭；最后一个浮层关闭后恢复打开前的页面滚动状态。
- Popconfirm 支持 `beforeConfirm` 异步钩子、Loading 和错误事件，避免重复提交。

## 10. 工程交付

- `src/index.js` 是组件统一导出入口，`src/index.d.ts` 提供 TypeScript 契约。
- `pnpm run build:lib` 输出 ES Module 与样式文件；Vue 保持 Peer Runtime 外置。
- `design-tokens.json` 由 `tokens.css` 生成，可用于 Tokens Studio、Figma Variables 转换与多主题构建。
- `pnpm run ci` 依次执行 Token 导出、源码检查、组件契约测试、后台构建和组件库构建。
- 依赖使用明确版本并提交 Lockfile；CI 使用 Frozen Lockfile，保证本地与流水线行为一致。

## 11. 独立项目接入

- Vue 组件通过 `lan-ui-design-system` 包消费，Vue 保持 Peer Dependency，避免宿主项目出现重复运行时。
- 组件包固定输出 `lan-ui.js / lan-ui.css / lan-ui.d.ts`，并提供 `style.css` 和 `tokens` 子路径导出。
- 全量样式放入 `lan-ui` CSS Layer；宿主项目可以使用未分层样式覆盖品牌细节，接入存量项目时仍需执行视觉回归。
- `examples/standalone-vue` 是独立消费基线，CI 必须验证其生产构建，以防导出路径、样式或类型交付退化。
- 仅复用视觉语言的非 Vue 项目使用 `tokens.css / design-tokens.json / UI-SPEC.md`，组件交互需要在目标框架重新实现。
- 示例登录、权限、数据和 AI 均为前端演示；生产项目必须接入服务端身份、权限、审计、错误监控和持久化能力。

## 12. 字体策略

- 默认方案为 `Inter + Noto Sans SC`：Inter 负责数字和拉丁字符，Noto Sans SC 负责简体中文；二者均采用 SIL Open Font License 1.1。
- `Noto Sans SC` 适合作为跨平台统一方案；`Source Han Sans CN` 适合具备本地字体部署能力的中文企业系统。
- `LXGW WenKai` 只用于欢迎页、帮助中心、品牌内容等低密度区域，不作为表格、表单和导航默认字体。
- 系统字体栈提供零下载模式，但 Windows、macOS 和 Linux 的中文字形存在差异，不用于强品牌一致性场景。
- 字体选择通过根节点 `data-font` 管理，允许值为 `inter-noto / noto / source-han / system / wenkai`，并持久化到 `lan-font`。
- 正文保持 `14px / 1.55`，辅助文字建议不低于 `12px / 1.5`；关键表单提示、错误和操作信息不使用 9–10px。
- 展示环境可使用在线字体服务；生产环境优先自托管按需子集化的 WOFF2，并使用 `font-display: swap` 与系统字体回退。

## 13. 成熟度 P0 基线

- 普通辅助文字按照 WCAG 2.2 AA 的 `4.5:1` 对比度要求处理，`text.tertiary` 为 `#64748B`。
- 正文与辅助信息字号下限为 `12px`；紧凑图标按钮视觉尺寸不小于 `24×24px`。
- `UiFormItem` 生成稳定 ID，并将 Label、Help、Error 与真实控件关联；复杂分组使用 `group` 语义。
- 复杂选择组件支持 `aria-controls`、`aria-activedescendant`、方向键、Home、End、Enter 和 Esc。

## 14. 成熟度 P1 通用能力

### 浮层碰撞定位

- Tooltip、Popover、Popconfirm、Dropdown 通过 Teleport 渲染到 Body，并使用统一定位器。
- 首选方向主轴空间不足时先翻转到相反方向，再沿交叉轴平移，保持 `8px` 视口安全边距。
- Resize、滚动容器滚动和内容尺寸变化触发重新定位；关闭时移除监听。

### 通用组件与反馈

- Menu、Collapse、Descriptions、Result、Spin、Segmented 补齐导航、披露、详情、结果、加载与紧凑选择能力。
- 根节点只挂载一个 `UiToastHost` 和一个 `UiNotification`，业务层使用 `toast` 与 `notification` 服务。
- Error Toast 使用 `role=alert`，其他轻量消息使用 `role=status`。

## 15. 成熟度 P2 全局配置与本地化

### 安装模型

- 支持按需导入、默认 Plugin `LanUi` 和 `createLanUi(options)` 三种接入方式。
- Plugin 统一注册组件并提供 Locale、Size、Density、Z-index 和 Theme Token 配置。
- `UiConfigProvider` 允许模块级覆盖；嵌套 Provider 继承上层未声明字段。

### 国际化

- 内置 `zh-CN` 与 `en-US`，自定义 Locale 以消息键合并，不因覆盖单条消息丢失其他默认文案。
- Select、DatePicker、DateRangePicker、Pagination、Upload、Empty、Table、Spin、Switch、Popconfirm 和 Notification 使用统一 Locale 上下文。
- 业务 Props 显式文案优先级高于 Locale 默认文案。

### DateRangePicker

- 支持 `date / time / datetime`，值为 `[start, end]`，允许清空单侧或整体清除。
- 默认通过原生 Min/Max 限制结束值早于开始值；关闭 Constrain 时仍通过 `aria-invalid`、Alert 和 `invalid` 事件报告顺序错误。
- 两个输入具备独立可访问名称，整体使用 Group 语义并继承 `UiFormItem` 的 Label、Help 与 Error 关联。
- 小屏保持双输入结构；业务文案较长时应使用简短 Placeholder，并在字段帮助信息中解释范围含义。

### 测试发现边界

- Vitest 只收集根目录 `tests/**/*.spec.js`，明确排除 `.verify`、`.baseline`、`dist` 和 `node_modules`。
- 独立消费项目必须同时验证默认 Plugin 安装、按需组件导入和生产构建。

## 16. 成熟度 P3 SSR 与子路径交付

### SSR 与 Hydration

- 公开组件在模块求值阶段不得读取 `window / document / localStorage`；DOM 监听、焦点管理和滚动锁只在客户端生命周期执行。
- Modal、Drawer 等浮层使用 Vue `useId()` 生成确定性 ID，服务端 HTML 与客户端首次渲染必须一致。
- Overlay Manager 在服务端返回稳定默认层级且不写入共享栈；客户端继续管理 Body Scroll Lock 和浮层顺序。
- CI 使用 `vue/server-renderer` 同时渲染打开状态的 Modal、Drawer、Popover 和 DateRangePicker，并比较两次等价应用的输出。

### 独立入口与 Tree-shaking

- 主入口 `lan-ui-design-system` 保留 Plugin 和完整命名导出。
- 每个公开组件提供 `lan-ui-design-system/components/UiXxx` 子路径、默认导出和 `UiXxxProps` 类型。
- `config / feedback / plugin / style.css / tokens` 使用稳定子路径；Package Exports 是公开边界，不依赖 `dist-lib` 内部路径。
- 构建必须生成 58 份组件 JS 和 58 份对应声明文件；最小消费者只导入 UiButton 时，Bundle 中不得出现 Table、Modal、Transfer 或 DateRangePicker 实现。

## 17. 成熟度 P4 公开 API 与发布治理

### 运行时与类型一致性

- 每个 `components/UiXxx` 子路径同时提供 Default 与同名运行时导出，两者必须引用同一组件。
- 子路径声明只描述真实存在的运行时导出，并公开对应 `UiXxxProps`；CI 对 58 个入口逐一动态导入验证。
- `api-manifest.json` 固化根运行时/类型导出、Package Exports、Props 字段和 Utility 子路径，构建结果与 Manifest 不一致时阻止交付。

### SemVer 与迁移

- 修复且不改变公开契约使用 Patch；新增可选能力使用 Minor；移除/重命名或改变默认行为使用 Major。
- Deprecated API 至少保留一个 Minor 版本，并在 `MIGRATION.md` 说明替代入口、行为差异和删除版本。
- 每次公开 API 更新同时提交 Manifest、`CHANGELOG.md` 和迁移记录，Code Review 以三者 Diff 判断兼容性。
- 公共 Registry 发布前必须确定许可证、去除 Private 标记、启用来源证明，并从最终 Tarball 在独立目录完成安装与生产构建。

## 18. 成熟度 P5：方向、按组件样式与视觉回归

### RTL 方向

- Plugin 与 `UiConfigProvider` 接受 `direction: ltr / rtl`，默认 LTR，嵌套 Provider 继承上级值。
- 样式优先使用 `inline-start / inline-end` 逻辑属性；Drawer 对外提供 `start / end`，并保留 Left/Right 兼容值。
- Tabs、Segmented、Menu、TreeSelect 与 Cascader 按阅读方向处理方向键，并保持 Home、End、Enter 与 Esc 行为。
- Tooltip、Popover、Popconfirm、Dropdown、Modal、Drawer、Toast 与 Notification 的 Teleport 根节点继承 `dir`。

### 按组件 CSS

- `styles/core.css` 包含 Token、Reset 与最小公共基础。
- 每个组件提供 `styles/UiXxx.css`，自动导入 Core，并只选择该组件及其依赖所需规则。
- `style-manifest.json` 固化 58 个组件样式入口、规则数和字节数；生成结果必须与清单一致。
- 最小消费项目同时验证 JavaScript 与 CSS Tree-shaking；UiButton 构建不得包含 Table、Modal 或 Transfer 样式。

### 视觉回归

- 固定 Fixture 覆盖 Light/LTR/Default、Dark/RTL/Compact 与 390px Mobile。
- 截图使用固定视口、设备像素比、语言、颜色方案和 Reduced Motion，并等待字体加载完成。
- 默认像素差上限为 `0.2%`，超过阈值阻止 CI。
- 基线仅通过 `visual:update` 更新，提交前必须目视检查。

## 19. 成熟度 P6：浏览器级无障碍质量门禁

### 自动审计矩阵

- 使用 Axe 4.11.4 在真实 Chromium DOM 中执行 WCAG 2.0、2.1、2.2 A/AA 与 Best Practice 规则。
- 覆盖 Light/LTR、Dark/RTL/Compact、390px Mobile、Select、MultiSelect、TreeSelect、Cascader、Modal 与 Drawer 共 9 个场景。
- 自动判定的 `violations` 必须为 0；`incomplete` 作为人工复核项写入 `.verify/accessibility/<platform>`，不得静默丢弃。
- CI 使用与 Windows 视觉基线一致的 Edge 环境，同时执行 `test:visual` 与 `test:a11y`。

### 组件语义

- `UiProgress` 自身承担 `progressbar` 角色，必须具备可访问名称、当前值和百分比文本。
- `UiTabs` 仅在实际渲染 Panel 时声明 `aria-controls`；只作为导航使用时不引用不存在的 ID。
- Select、MultiSelect、TreeSelect 与 Cascader 仅在 Popup 存在时声明 `aria-controls`。
- Drawer 使用允许 `role=dialog` 的 Section 元素，并保留 `aria-modal`、标题关联与焦点循环。
- `UiCard.titleTag` 允许页面按真实信息层级选择 H2–H6，避免硬编码标题级别。

### 对比度 Token

- 品牌文字使用 `brand-text`，与品牌实色背景分离；亮色与暗色主题分别提供满足正文对比度的值。
- 危险实色按钮使用 `danger-solid / danger-solid-hover`，白色正文与背景达到 WCAG AA。
- Dark Theme 为 Success、Warning、Danger 与 Info 提供独立语义表面和前景色，禁止直接复用亮色 `*-50` 背景。

## 20. 成熟度 P7：真实交互与性能预算

### 浏览器交互契约

- 固定 Fixture 覆盖 Select 方向键选择与 Disabled 跳过、Tabs LTR/RTL 逻辑方向、Modal 焦点循环/恢复和 Modal + Drawer 嵌套浮层顺序。
- Popconfirm 打开后聚焦首个操作，Esc 取消并恢复触发器；该行为在 `prefers-reduced-motion: reduce` 下同样成立。
- Pagination 页码和 PageSize、Switch 键盘切换、Upload 类型校验/移除、Table 排序/选择/展开、Menu 展开/选择均使用真实浏览器事件验证。
- Form 提交失败后聚焦首个错误控件；字段修正后首次点击必须完成提交，不得因 Blur 清除错误引发布局移动而吞掉 Click。
- `UiFormItem.reserveMessageSpace` 用于需要稳定字段高度的密集表单；默认关闭以保持既有紧凑布局，提交指针期间临时保留消息高度。

### 性能预算

- `performance-budgets.json` 是版本化交付物，记录 P6 基线和 P7 的 14 项最大值。
- 同时约束 `dist-lib` 全量 JS/CSS Raw 与 Gzip、最大共享 Chunk、根样式、最大组件样式、最小按需消费和独立示例产物。
- `test:performance` 仅在组件包、按需消费项目和独立示例均完成生产构建后执行；缺失产物视为失败，不以零字节或跳过处理。
- 提高预算必须说明依赖或能力增长原因；常规样式和交互修复应保持在现有预算内。
- CI 顺序固定包含 Unit/Contract、Visual、Axe、Interaction、Package/API/Style、Consumer Build 和 Performance Budget。

## 21. 成熟度 P8：跨浏览器交互与焦点恢复

### 浏览器矩阵

- 同一组 11 条真实交互契约必须在 Chromium、Firefox 与 WebKit 上通过，发布矩阵共 33 条浏览器用例。
- 默认 `test:interaction` 保持 Chromium 快速门禁；`test:interaction:cross-browser` 执行三引擎矩阵，`test:interaction:non-chromium` 供已单独覆盖 Chromium 的 CI 使用。
- 每个引擎输出独立 JSON 到 `.verify/interaction/<platform>/<browser>.json`，聚合 `report.json` 记录所测引擎、总用例数、耗时和失败详情。
- Windows 门禁继续使用 Edge 验证视觉、Axe 与 Chromium 交互；Linux 门禁安装 Firefox/WebKit，避免单一浏览器实现掩盖兼容问题。

### 焦点来源与恢复

- Modal、Drawer 与 Popconfirm 使用统一的可重试焦点转移；Teleport 挂载或卸载延迟不得导致首个操作或原触发器失焦。
- WebKit 指针点击按钮时可能保留旧的 `activeElement`。组件只在紧邻打开动作的短时间窗内优先采用最近指针触发器，避免嵌套浮层关闭后恢复到上一个控件。
- 键盘触发没有新的 Pointer 记录时仍以当前焦点为来源，不因历史点击改变恢复目标。
- 嵌套 Modal + Drawer 关闭内层后恢复 Drawer 触发器，随后关闭外层恢复 Modal 触发器；Esc 只处理浮层栈顶部实例。

## 22. 成熟度 P9：TypeScript Props、Emits 与 Slots 契约

### 公开声明边界

- 58 个组件均公开 `UiXxxProps`、`UiXxxEmits`、`UiXxxSlots`，根入口与 `components/UiXxx` 子路径保持同一类型来源。
- `LanComponent<Props, Emits, Slots>` 将 Emits 转换为监听器 Props 与 `$emit` 重载，并将 Slots 转换为 `$slots` 作用域签名。
- v-model 的 `update:*`、业务 Change/Select、焦点事件、表格排序/筛选/列宽及错误事件必须使用真实运行时负载类型。
- 静态插槽与动态 `cell-* / panel-* / item-*` 插槽声明作用域字段；组件模板新增插槽时必须同步公开 Slots 类型。

### 自动一致性门禁

- API Manifest Schema 2 同时记录 Props、Emits、Slots；生成器逐组件比较运行时 Props、运行时 Emits、源码 Slot 与公开声明。
- 58 个子路径声明必须导出对应 Props、Emits、Slots，禁止只在根入口声明或产生子路径类型漂移。
- 严格 vue-tsc Fixture 覆盖根入口、子路径、v-model、事件回调、静态/动态作用域插槽，并以 `@ts-expect-error` 固化错误输入。
- `test:types` 是 CI 与 `prepack` 的发布门禁；任何公开契约变更都必须同步 Manifest、Changelog 与 Migration，并按 SemVer 审查。

## 23. 成熟度 P10：多应用与 SSR 反馈隔离

### 服务实例边界

- 默认 `LanUi`、根入口 `toast / notification` 与无参数 `createLanUi()` 保持既有单应用共享行为。
- 多应用、微前端与 SSR 使用 `createLanUi({ isolated:true })`，每个 Plugin 独立持有 Toast 队列、Notification 当前项、ID 与计时器。
- `useFeedback / useToast / useNotification` 在组件 Setup 中解析当前应用注入；Setup 外回退到默认实例，避免破坏既有直接调用方式。
- `UiToastHost / UiNotification` 默认订阅注入实例，也允许通过 `feedback` Prop 明确绑定宿主管理的实例。

### 生命周期

- 隔离 Plugin 在应用 Unmount 时销毁自有反馈实例，清除展示计时器、退出计时器、Toast 队列和 Notification 状态。
- SSR 请求完成后显式执行 `plugin.dispose()`；销毁后的实例拒绝新的消息写入，避免迟到异步任务污染后续请求。
- `createLanUi({ feedback })` 只注入外部实例，不接管其生命周期；宿主必须在共享边界结束时调用 `feedback.dispose()`。

### 自动验证

- 同一 DOM 中挂载两个应用，任一应用触发的 Toast 与 Notification 只能进入自身 Host 与 State。
- 应用卸载后必须清空自有状态、取消所有挂起计时器，且不触发已经取消的业务回调。
- 两个并发 SSR Render 的 Teleport 输出必须只包含各自请求消息；测试结束后两个实例均为 Disposed。

## 24. 成熟度 P11：完整本地化契约

### 覆盖边界

- `zh-CN / en-US` 必须拥有完全一致的消息键集合和插值占位符；任一语言缺键、空值或参数漂移均阻断发布。
- 选择、树、级联、穿梭、列表工具栏、反馈、导航、详情、步骤、标签页及表单默认错误统一从 Locale Context 解析。
- 58 个公开 `Ui*` 组件源码不得包含硬编码中文；业务示例页面不受该约束。
- 显式 Placeholder、Title、Titles、ARIA Label、Rule Message 等业务 Props 的优先级始终高于语言包默认值。

### 响应式切换

- `plugin.setLocale()` 和嵌套 `UiConfigProvider` 切换后，可见默认文案与无障碍名称必须在同一更新周期内变化。
- Toast 与 Notification 虽 Teleport 到 Body，仍继承创建 Host 的 Locale；默认标题和关闭按钮不得回退到固定语言。
- `UiFormItem` 内置校验保存 Message Key 与参数，而不是保存翻译后的静态字符串；已显示错误在语言切换后同步更新。
- 自定义 Validator 返回的字符串、Rule Message 以及组件显式文案保持业务原值，不由 Locale 二次翻译。

### 自动门禁

- `test:locale` 静态检查两套语言包 101 个键、插值参数、组件消息引用、动态消息键和公开组件硬编码文案。
- Runtime Fixture 同时验证普通 DOM、ARIA、Teleport、生成式表单错误和显式覆盖在 `zh-CN → en-US` 切换后的行为。
- Locale Contract 必须进入 `pnpm test` 与 `prepack`，保证源码回归和发布归档使用相同门禁。

## 25. 成熟度 P12：Intl 运行时、复数与回退链

### Locale 解析与回退

- 未内置的 Locale 名称必须原样保留，用于 `Intl` 的区域规则；不得再将未知语言伪装成 `zh-CN`。
- `fallbackLocale` 按消息键回退，可通过 Plugin、`UiConfigProvider` 或 `plugin.setFallbackLocale()` 设置；值为 `false / null` 时缺失消息返回键名。
- 已知语言的局部消息对象继续覆盖同名内置语言；未知语言只拥有显式消息，避免静默混入不相关语言。
- `UiConfigProvider` 输出当前 Locale 与 Fallback 数据属性，嵌套模块可观测自身边界。

### 复数与格式化

- `tc(key,count)` 使用 `Intl.PluralRules`，支持 `zero / one / two / few / many / other`、`=N` 精确分支和两段/三段 Pipe 文案。
- `formatNumber / formatDate / formatRelativeTime / formatList` 与当前 Locale 同步，并按 Locale + Options 缓存原生 Formatter。
- `createLocaleTools()` 为 Vue Setup 外的领域模型、导出任务和服务端代码提供同一静态契约；`useLocale()` 提供响应式版本。
- Badge、ListToolbar、Pagination、Progress、Transfer 与 Upload 的计数、页码、百分比和尺寸显示必须使用当前编号系统，原始数值 Props 与事件载荷保持不变。

### 自动门禁

- `test:locale` 同时执行消息源码契约与 Intl 运行时契约，覆盖逐键回退、关闭回退、复数分支、未知 Locale、数字、日期、相对时间和列表。
- DOM Fixture 使用阿拉伯语编号系统验证组件级计数，确保本地化不仅替换文案，还真实作用于数据显示。
- 类型回归固定 `createLocaleTools`、复数消息对象、Intl Options 与动态 Fallback API；API Manifest 和 Tarball 消费者必须同步验证新增导出。

## 26. 成熟度 P13：语言注册表、按需加载与多级回退

### 注册表边界

- 每次 `createLanUi()` 默认创建独立 `LocaleRegistry`，内置 `zh-CN / en-US`；不同应用、微前端和 SSR 请求之间不得共享动态注册状态。
- 注册表支持 `register / unregister / get / has / list / load`，别名解析必须返回同一个语言对象，列表返回新的数组快照。
- `zh-CN / en-US` 及其 `zh / en` 别名保持可用；注销内置项返回 `false`，新别名与现有名称或别名冲突时必须抛出明确错误。
- 根入口与 `config` 子路径提供默认注册表便捷 API；只有显式传入同一注册表时，多个 Plugin 才共享语言包。
- Locale 名称先从当前注册表解析，再查找内置语言；未注册名称仍保留原名称与空消息集合，继续用于 Intl 区域规则。

### 按需语言包

- `loadLocale(name, loader)` 接受语言对象、`default` 导出的 ES Module 或 `locale` 导出的模块，并返回规范化 `Promise<LanUiLocale>`。
- 同一注册表内对同一缺失语言的并发请求复用一个 Promise；加载成功后写入注册表，失败后必须清理 Pending 记录以允许重试。
- 已注册语言默认不再次执行 Loader；`force=true` 显式刷新，`activate=true` 只在成功注册后切换 Plugin 当前语言。
- Loader 可声明一个或多个别名；请求名称与别名均指向实际语言名称，注销实际名称或任一别名时同步清理关联别名。

### 多级回退链

- `fallbackLocale` 兼容单值、`false / null`，并新增有序数组；`fallbackLocales` 暴露去重后的规范化语言对象列表。
- 消息解析顺序固定为当前语言、回退链第 1 项至最后一项、最后返回消息键；同名回退项只保留第一次出现的位置。
- Intl 数字、日期、相对时间、列表与复数规则始终使用当前语言名称；回退链只为无效 Locale 名称提供构造器候选，不改变正常区域格式。
- `UiConfigProvider` 输出首个回退语言和完整链的数据属性，嵌套 Provider 继承父级注册表及未覆盖链。

### 自动门禁

- `test:locale` 必须覆盖注册、别名、注销、并发去重、强制刷新、失败重试、多级回退、Plugin 激活、Provider 状态和应用隔离。
- 类型回归固定 `LocaleRegistry / LocaleLoader / LocaleLoadOptions`、数组回退与 Plugin 管理 API；根入口和 `config` 子路径运行时与类型导出保持一致。
- `prepack`、API Manifest、独立 Tarball 消费者和回滚副本必须验证 P13 契约，确保源码测试通过但发布包遗漏新 API 的情况被阻断。

## 27. 成熟度 P14：日期时间值模型与时区语义

### 统一值模型

- `UiDatePicker / UiDateRangePicker / UiTimePicker` 共用 `date` 适配层，支持 `string / Date / timestamp`；默认 `auto` 在空值时回到字符串，保持既有表单兼容。
- 严格解析必须拒绝不存在的日期、24:00、非 ISO 本地格式与无效字段，不依赖浏览器对 `new Date(string)` 的宽松解析。
- `precision` 固定为分钟、秒或毫秒，原生 `step` 与格式精度保持一致；范围边界与顺序比较使用解析后的结构值。
- 纯时间转换为 Instant 必须允许传入稳定 `referenceDate`；默认参考日固定为 `1970-01-01`，不得隐式读取执行当天。

### 时区与夏令时

- `timeZone` 接受 `local / UTC / IANA`，同一 `Date` 在不同时区展示不同墙上时间但保持同一 Instant。
- 夏令时空档和重叠通过 `compatible / earlier / later / reject` 显式消歧；`reject` 在更新 model 前发出 `invalid-date-value`。
- 组件根节点输出 `data-time-zone / data-value-type`，便于测试、日志和业务诊断，不用显示文本推断内部语义。
- `UiTimePicker` 是公开独立组件，使用时钟图标并复用 DatePicker 的尺寸、清除、焦点、错误和表单关联语义。

### 发布门禁

- `test:date` 覆盖闰年、非法日期、IANA 转换、DST 空档/重叠、三类值模型、毫秒精度和稳定参考日，并进入 `test / prepack`。
- 根入口与 `date` 子路径必须导出同一适配函数；54 个组件的 JS、类型、样式和 API Manifest 保持逐项一致。
- 组件中心、类型 Fixture、独立 Tarball 消费项目、补丁重放、归档重开与回滚副本共同证明 P14 发布行为。
## 28. 成熟度 P15：公共图标、安全定义与应用隔离

### 公共图标契约

- `UiIcon` 是稳定公共组件，内置 46 个可枚举名称，并与 Button、Input、Menu、Empty、Feedback 等组件共用注册表。
- `size / strokeWidth / color / fill / rotate / flip / directional / spin / fallback` 必须是可声明、可类型检查与可观测的变体；未知名称使用显式 Fallback。
- 装饰图标输出 `aria-hidden`；独立表意图标通过 `ariaLabel` 输出 `role=img` 与可读名称，图标不参与 Tab 顺序。
- `directional` 按当前 Direction 在 RTL 下镜像；`spin` 复用统一 Motion 契约并继承 `prefers-reduced-motion` 全局规则。

### 注册表与安全边界

- 每次 `createLanUi()` 默认创建独立 `IconRegistry`；微前端、多应用与 SSR 请求之间不得共享动态图标。`UiConfigProvider` 可为局部子树覆盖注册表。
- `createIconRegistry / register / unregister / get / has / list / resolve` 返回稳定结果；内置名称默认不可删除，覆盖与强制删除必须显式声明。
- 自定义 SVG 只允许自闭合几何元素和白名单属性，拒绝 Script、Event Attribute、Style、Link、URL 值、非法 ViewBox、过大定义与非自闭合节点。
- `UiIcon` 渲染规范化几何节点，禁止使用 `v-html`；源码字符串不得直接进入 DOM。

### 发布门禁

- `test:icons` 覆盖 46 个内置定义、自定义注册、安全拒绝、应用/Provider 隔离、SSR、ARIA、RTL 与 Motion，并进入 `test / prepack`。
- 根入口与 `icons` 子路径必须导出同一注册 API；54 个组件的 JS、类型、样式和 API Manifest 保持逐项一致。
- 组件中心、静态一页预览、类型 Fixture、独立 Tarball 消费者、补丁重放、归档重开与回滚副本共同证明 P15 发布行为。

## 29. Maturity P16: numeric input

### Public contract

- `UiNumberInput` owns numeric editing; its model is `number | null`, never a numeric string.
- `min / max / step / precision` define deterministic arithmetic. Control and keyboard stepping clamp to finite bounds and round after each operation.
- `formatter` and `parser` are paired display hooks. Invalid committed text restores the model and emits an `invalid` payload rather than writing `NaN`.
- Prefix and suffix slots are presentation-only and do not change the numeric model.

### Interaction and accessibility

- The editable control uses `role=spinbutton`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, FormItem labels/descriptions and localized increment/decrement names.
- Arrow keys step once; Page keys step ten times; Home/End use finite bounds; Enter commits; Escape restores. Wheel stepping is opt-in and only active while focused.
- Side controls are the accessible default with full-height pointer targets. Compact right controls are available for dense data-entry forms.
- Disabled, readonly, invalid, focus, small/medium/large and RTL logical-border states follow the shared form-control language.
- Explicit `aria-labelledby` or `aria-label` takes precedence over an inherited FormItem label; independently named controls must not share a single FormItem control ID.

### Release gates

- Unit tests cover precision, bounds, draft commit, invalid restoration, formatting/parsing, consumer-hook containment, stable IDs, FormItem semantics and keyboard behavior.
- Root/subpath runtime exports, Props/Emits/Slots declarations, component styles, API Manifest, component center, static preview and standalone consumer remain in parity for 55 components.
- CI, cross-browser interaction, archive reopen, patch replay, tarball consumer and rollback evidence are required for the P16 artifact set.

## 30. Maturity P17: slider and range

- `UiSlider` owns a numeric `number` model in single mode and an ordered `number[]` model in range mode.
- Values align to `min + n × step`; finite min/max bounds are enforced and `minDistance` is capped to the available span.
- Horizontal, vertical, reverse and inherited RTL modes must keep pointer position, visible track and Arrow-key direction consistent.
- Each thumb exposes `role="slider"`, orientation, min/max/now/text, disabled/readonly/invalid state, a stable ID and FormItem label/help linkage.
- Range thumbs require distinct accessible names. A string label gains localized start/end suffixes; an array labels each thumb explicitly.
- Pointer gestures emit continuous `input` updates and one committed `change`; keyboard and mark actions commit immediately with `{ source, thumb }` metadata.
- Tooltip visibility supports `auto`, `always` and `never`; formatter failures fall back to the raw numeric value.
- Marks remain native buttons with localized action names, visible keyboard focus and disabled/readonly synchronization.
- Root/subpath runtime exports, Props/Emits/Slots declarations, component styles, API Manifest, component center, static preview and standalone consumer remain in parity for 57 components.
- CI, three-engine interaction, visual/a11y regression, archive reopen, patch replay, tarball consumer and rollback evidence are required for the P17 artifact set.

## 31. Maturity P18: autocomplete

- `UiAutoComplete` owns an editable `role="combobox"` with `aria-autocomplete="list"`, stable listbox/option IDs, active-descendant navigation and FormItem label/help/error linkage.
- Local suggestions match label, value and keywords using `contains` or `startsWith`; matched label text is rendered as safe text segments rather than injected HTML.
- Remote suggestions use configurable debounce, per-query cache, `AbortSignal` cancellation and monotonic request sequencing so late results never replace the newest query.
- IME composition suppresses intermediate search/model updates until `compositionend`; disabled and readonly controls remain immutable.
- Arrow keys move through enabled suggestions, Ctrl+Home/End jump to bounds, Enter selects or commits, Escape closes, and Tab commits custom text before focus advances.
- `allowCustom=false` restores the last committed option when free text is submitted. Selection writes the option value and displays its label.
- Suggestion panels flip and shift within the viewport, preserve logical start/end in RTL, and expose loading, error, empty and option slots without breaking the listbox contract.
- Root/subpath runtime exports, declarations, styles, manifests, component center, static preview, standalone consumer, SSR and three-browser fixtures remain in parity for 57 components and 114 locale keys.
- CI, 10 Axe cases and 14 interaction cases per Chromium/Firefox/WebKit engine are required for the P18 delivery evidence.

## 32. Maturity P19: enterprise tree

- `UiTree` owns a visible hierarchical collection with stable node keys, single or ordered multi-selection, controlled/uncontrolled selection, expansion and checked models, and custom key/label/children fields.
- Non-strict checks cascade through enabled descendants and derive checked or mixed ancestors; strict mode keeps nodes independent. Disabled selection and disabled checkboxes remain distinct constraints.
- Filtering keeps matching nodes and their complete ancestor paths visible without mutating expansion state. Custom filtering failures are contained as non-matches.
- Lazy branches are declared with `isLeaf:false`; they receive `{ signal }`, load once, never reload existing `children`, ignore stale/aborted responses, inherit an already-checked parent, expose root busy state and provide localized inline retry after contained errors.
- Up/Down, Home/End, logical expand/collapse, `*`, Enter, Space and typeahead follow the WAI tree keyboard model. Expand/collapse keys mirror in inherited RTL direction.
- The root owns focus and a stable active descendant. Each rendered item exposes level, sibling position/count, expanded, selected and disabled state; checks expose true, false or mixed semantics.
- Virtual mode requires a reliable `itemHeight`; numeric/pixel heights are deterministic and responsive CSS heights are measured with `ResizeObserver`. Overscan must never alter logical order or active-node scrolling.
- Duplicate or missing keys are not rendered ambiguously and emit `data-error`. Node, icon, suffix and empty slots may customize content without replacing the structural ARIA roles.
- Root/subpath runtime exports, declarations, styles, manifests, component center, static preview, standalone consumer, SSR and three-browser fixtures remain in parity for 58 components and 122 locale keys.
- CI, 11 Axe cases and 15 interaction cases per Chromium/Firefox/WebKit engine are required for the P19 delivery evidence.

## 33. Maturity P20: global command palette

- `UiCommandPalette` separates the original command payload from its normalized searchable view and requires stable, unique command keys.
- Matching ranks exact labels, label prefixes, keywords, descriptions and sequential fuzzy matches deterministically; disabled commands remain discoverable but never active, while hidden commands never render.
- Local and remote commands may be combined. Remote providers are debounced, receive `AbortSignal`, ignore stale completions, support per-query caching and expose loading, empty, error and retry states without collapsing the dialog.
- The default `Ctrl/Cmd + K` shortcut is configurable. Arrow/Page/Home/End navigation skips disabled commands; Enter selects; Escape closes only the top overlay; Tab remains trapped inside the modal surface.
- Opening captures the current focus origin, locks document scrolling, joins the shared overlay stack and focuses the combobox. Closing releases the stack/lock and restores focus after DOM removal.
- The component exposes dialog, combobox, listbox, group and option semantics with stable IDs, active-descendant linkage, busy/error announcements and inherited locale/direction.
- Trigger, header, group, command, loading, empty, error and footer slots customize content while the component retains structural ARIA and focus ownership.
- Root/subpath runtime exports, declarations, styles, manifests, component center, 17-section static preview, standalone consumer, SSR and three-browser fixtures remain in parity for 59 components and 134 locale keys.
- CI, 12 Axe cases and 16 interaction cases per Chromium/Firefox/WebKit engine are required for the P20 delivery evidence.

## 34. Maturity P21: color picker and color runtime

- `UiColorPicker` owns an optional string model and normalizes supported HEX, RGB or HSL input into the configured output format. Empty values remain empty; malformed committed text restores the last valid value and emits `{ reason:'parse', input }`.
- The pure `color` runtime parses short/long HEX with alpha, comma/space RGB, HSL angle units, percentages, transparent/basic named colors and normalized RGBA objects without a DOM dependency.
- `rgbToHsv / hsvToRgb / rgbToHsl / hslToRgb` preserve alpha and round-trip byte colors deterministically. `formatColor` controls explicit alpha output; invalid inputs return an empty string rather than leaking malformed CSS.
- `getContrastRatio` composites transparency over the supplied background and applies WCAG relative luminance. `getReadableTextColor` compares configurable light/dark candidates.
- The visual plane maps inline saturation and vertical brightness, mirrors saturation in RTL and supports Arrow keys with Shift acceleration plus Home/End and Page brightness steps. Hue and alpha remain native range controls.
- The trigger integrates FormItem label/help/error semantics. The popup is a named non-modal dialog with direction-aware viewport flip/shift, outside/Escape close and trigger focus restoration.
- Presets accept strings or labelled/disabled records. Text input, clear, preset, hue, alpha, plane and keyboard updates emit source metadata; controlled `open` consumers update through `update:open`.
- Root/component/color-subpath exports, Props/Emits/Slots declarations, styles, manifests, component center, 18-section static preview, standalone consumer and SSR fixtures remain in parity for 60 components and 147 locale keys.
- CI, 13 Axe cases and 17 interaction cases per Chromium/Firefox/WebKit engine are required for the P21 delivery evidence.

## 35. Maturity P22: rate

- `UiRate` owns a numeric `0..max` model; `step` supports integer and fractional ratings without floating-point drift.
- Pointer movement previews a value without mutating the model. Pointer selection commits once; selecting the active value clears when `allowClear` is enabled.
- One `role="slider"` focus target exposes the current value and localized value text. Arrow keys step, Page keys move five steps, Home/End select the bounds and Delete/Backspace clears.
- Horizontal Arrow and pointer behavior mirror in RTL. `readonly` remains focusable, `disabled` leaves the tab order, and FormItem label/help/error links are inherited.
- Item and text slots may customize presentation while the component retains slider focus, value and input ownership.
- Root/component exports, Props/Emits/Slots declarations, styles, manifests, component center, 19-section static preview, standalone consumer and SSR fixtures remain in parity for 61 components and 152 locale keys.
- CI, 14 Axe cases and 18 interaction cases per Chromium/Firefox/WebKit engine are required for the P22 delivery evidence.

## 36. Maturity P23: statistic and KPI display

- `UiStatistic` displays a localized number or an already-formatted string without introducing an editable model. Non-finite, null and empty input resolve to an explicit placeholder or localized em dash.
- `precision` fixes minimum and maximum fractional digits; `formatOptions` exposes currency, percent, compact notation and other `Intl.NumberFormat` options from the inherited locale.
- Custom value and trend formatters receive typed context and are contained: empty, throwing or invalid runtime formatting falls back to stable display text.
- Signed `trend` determines up/down/flat direction. `positiveDirection` maps business meaning so lower latency, cost or defect rates can use positive styling; zero and `none` remain neutral.
- Prefix and suffix are visually decorative but included in the output accessible name. Custom value slots use `ariaValueText` when their spoken meaning differs from the fallback.
- `loading` preserves the value footprint, hides trend output, exposes `aria-busy` and announces localized loading text. `live` is opt-in with off, polite or assertive values.
- Small, medium and large sizes, default/success/warning/danger statuses, responsive stacking, reduced motion and forced-colors behavior use shared tokens.
- Title, prefix, value, suffix, trend and extra slots customize presentation without replacing the component-owned group/output semantics.
- Root/component exports, Props/Emits/Slots declarations, styles, manifests, component center, 20-section static preview, standalone consumer and SSR fixtures remain in parity for 62 components and 158 locale keys.
- CI, 14 Axe cases and 19 interaction cases per Chromium/Firefox/WebKit engine are required for the P23 delivery evidence.

## 37. Maturity P24: calendar and range planning

- `UiCalendar` supports `single`, `multiple` and `range` selection. Single mode emits one value; multiple/range modes emit arrays, and completed ranges normalize start/end wall dates in ascending order.
- String, Date and timestamp output share the strict date adapter, configured time zone and DST disambiguation contract. `valueType="auto"` infers from the first non-empty model value.
- Display month is initialized from `viewDate`, `defaultViewDate`, selection or today. Navigation emits controlled `update:viewDate` plus source-aware `view-change`; the 12-year panel preserves the active month and clamped day.
- Locale-derived weekday order supports platform `weekInfo` and `getWeekInfo`, with deterministic locale fallback and explicit `0–6` override. Month, weekday, date and action labels inherit Locale context.
- Fixed/natural week rows, outside-day visibility, optional week numbers, three sizes and responsive layout cover embedded cards and full-width mobile use.
- `min`, `max`, maximum multiple selections and contained `disabledDate` rules affect pointer selection, keyboard movement and accessible unavailable names without preventing users from navigating away from a disabled active cell.
- The ARIA grid uses one instance-scoped roving tab stop. Arrow, Home/End, Page, Shift+Page, Enter/Space and Delete/Backspace behavior is covered in LTR and RTL; focus never leaks to another calendar instance.
- Range start/end/in-range/hover-preview styling preserves chronological model order, forced-colors visibility and reduced-motion behavior. Today and selection remain independently perceivable.
- Header, cell, year and footer slots expose typed presentation scope while the component retains gridcell buttons and accessible labels.
- Root/component exports, Props/Emits/Slots declarations, styles, manifests, component center, 21-section static preview, standalone consumer and SSR fixtures remain in parity for 63 components and 172 locale keys.
- CI, 15 Axe cases and 20 interaction cases per Chromium/Firefox/WebKit engine are required for the P24 delivery evidence.
