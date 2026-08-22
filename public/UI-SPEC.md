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
- 空状态解释原因并提供下一步动作；403 / 404 / 500 使用统一状态页组件并提供返回、首页或重试动作；退出前提供确认页。

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
- `UiSteps` 使用独立连接线元素，禁止依赖标题剩余宽度绘制连线；支持 Default / Navigation / Inline、水平/垂直方向和标签、三种尺寸、受控/非受控当前步骤、线性流程、禁用、Loading、Empty 与响应式收拢。可导航模式必须使用原生 Button、`aria-current="step"`、roving focus，并让 Arrow/Home/End 跳过不可用阶段且遵循 RTL。
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

## 38. Maturity P25: image loading and gallery preview

- `UiImage` forwards native image semantics and loading controls while standardizing width, height, aspect ratio, fit, position and radius through component styles.
- The primary source has explicit loading/loaded/error states. `fallback` is attempted once, terminal failure exposes localized retry behavior, and placeholder/error/overlay slots support branded states without changing the state machine.
- Preview visibility and gallery index support controlled and uncontrolled models. A single source, explicit `previewSrc` or ordered `previewList` all share the same preview contract.
- Gallery navigation can loop or stop at boundaries and preloads adjacent images. Arrow Left/Right mirrors in RTL while Home/End-style ordering remains source-order deterministic.
- Zoom is clamped to consumer bounds and supports buttons, `+`/`-`, wheel and double-click. Rotation supports controls and `R`/`Shift+R`; `0` resets. Pointer panning activates only above 100% and remains bounded by the canvas.
- Preview is an ARIA modal dialog in the shared overlay stack. It locks body scroll, closes only as the top overlay, traps focus and restores the exact opener after Escape, mask or close-button dismissal.
- Loading, terminal preview errors, live gallery counts, descriptive image alternatives and named toolbar controls remain exposed to assistive technology. Reduced-motion and forced-colors modes retain equivalent behavior.
- Preview, caption and toolbar slots expose typed transformation scope; load/fallback/retry/preview/navigation/error/transform events carry typed metadata for analytics and application state.
- Root/component exports, Props/Emits/Slots declarations, styles, manifests, component center, 22-section static preview, standalone consumer and SSR fixtures remain in parity for 64 components and 187 locale keys.
- CI, 17 Axe cases and 21 interaction cases per Chromium/Firefox/WebKit engine are required for the P25 delivery evidence.

## 39. Maturity P26: status pages and virtualized collections

- `UiStatusPage` owns reusable 403, 404 and 500 application boundaries. It supports full-screen and embedded layouts, localized titles/descriptions/actions, illustration/action/extra slots and typed home/back/retry events.
- The 500 state exposes an alert; 403/404 expose labelled regions. Responsive, RTL, forced-colors and reduced-motion behavior retain equivalent information and controls.
- `UiVirtualList` virtualizes vertical collections using a bounded render window, binary offset lookup and configurable overscan. Item size may be fixed, item-derived or live-measured with `ResizeObserver`.
- Live measurement compensates scroll anchors when rows above the viewport change height. `resetAfterIndex` invalidates cached sizes without replacing the dataset.
- Single and multiple selection support controlled models, controlled/uncontrolled active index, disabled keys, optional loop/deselect, prefix typeahead and Ctrl/Cmd+A. Arrow, Home/End, Page and Enter/Space keep the active record visible.
- List/listbox roles, active descendant, selected/disabled state, set size, position and live selected count remain synchronized even though most records are absent from the DOM.
- `scrollToIndex`, `scrollToKey`, `resetAfterIndex` and `getVisibleRange` are public methods. Scroll/range/reach/selection/click/retry events expose typed metadata for application analytics and infinite loading.
- Loading, empty and error states have localized defaults and typed slots; SSR renders a deterministic initial window without requiring browser measurement APIs.
- Root/subpath runtime exports, Props/Emits/Slots declarations, styles, manifests, component center, 24-section static preview, standalone consumer and SSR fixtures remain in parity for 66 components and 202 locale keys.
- CI requires 19 Axe scenarios and 23 interaction cases per Chromium/Firefox/WebKit engine for the P26 delivery evidence.

## 40. Maturity P27: managed enterprise data grids

- `UiDataGrid` is the default orchestration layer for enterprise record lists. It composes the public toolbar, table and pagination primitives without hiding their controlled models or scoped presentation slots.
- Client mode applies normalized nested-field search, exact/array/custom filtering, stable locale-aware/custom sorting and page slicing in that order. Throwing consumer callbacks are contained and preserve deterministic fallback behavior.
- Server mode renders supplied rows unchanged and uses external `total`. Initialization, search, filter, sort, page, page-size, refresh, retry and reset transitions use a single typed state envelope with an explicit reason.
- Search requests debounce only in server mode; controlled query updates and state-change announcements remain immediate. Page resets and out-of-range page clamps emit coherent controlled updates.
- Toolbar total, density, columns and refresh controls can be shown independently. Column settings use a labelled checkbox group, Escape closes the popup and focus returns to its trigger.
- Search, region, table caption, result live region and pagination landmarks have distinct accessible names. Selection targets are at least 24px, dark metadata meets contrast and mobile bounded tables do not clip row controls.
- Root/subpath runtime exports, Props/Emits/Slots declarations, component styles, manifests, component center, 25-section static preview, standalone consumer and SSR fixtures remain in parity for 67 components and 211 locale keys.
- CI requires 21 Axe scenarios and 25 interaction cases per Chromium/Firefox/WebKit engine for the P27 delivery evidence.

## 41. Maturity P28: managed forms and validation

- UiForm owns registered field orchestration while preserving the consumer model object. Dot/bracket paths address nested values consistently across rules, validation, partial reset and server errors.
- The initial snapshot is deterministic and may be overridden by initialValues. Native reset and public reset methods restore values in place, preserving Vue reactivity and application references.
- Form state exposes field/aggregate errors, idle/validating/success/error, touched and dirty metadata. setFields and setFieldError integrate API responses without a parallel error store.
- Required, whitespace, type, exact length, minimum, maximum, enum, pattern, transform and custom rules share trigger semantics. Async validators receive an AbortSignal and stale completion is ignored.
- Failed submission may render a localized error summary whose buttons focus registered controls. Focus/scroll behavior is instance-scoped, configurable and never targets another form.
- Help/error IDs, aria-invalid, aria-busy, field alerts and labelled summary regions remain synchronized. Success display is opt-in so dense forms do not add visual noise.
- Public methods include validate/validateField/submit, clear/reset, field value/state inspection, server-error injection, focus and scroll. Props, events, slots and UiFormInstance are fully typed.
- Component center, standalone/static preview, SSR, unit, four visual baselines, 22 Axe scenarios and 26 interactions per browser are release gates for 67 components and 216 locale keys.

## 42. Maturity P29: dynamic form arrays and dependency validation

- `UiFormList` provides standalone `v-model` and form-bound `name` modes for repeated values. It normalizes string/array paths and never replaces the parent form model identity.
- Slot fields expose stable `key`, current `name`, `index` and `value`. Object identity preserves row keys through reordering; `field.name` must be used to register nested `UiFormItem` controls after reindexing.
- `add`, `remove`, `move`, `replace` and `getValue` are exposed methods. Successful changes emit immutable typed payloads; guarded min/max operations emit a `limit` payload without mutating the model.
- List-level array rules participate in normal form validation, reset, error summaries and focus. Removed rows unregister synchronously and surviving rows re-register under canonical paths without retaining stale fields.
- `UiFormItem.dependencies` revalidates an already-touched or validated field when related values change. `validateOnDependencyChange` opts out for application-managed scheduling.
- A rule-level `when(model, context)` condition controls applicability. Custom validators receive `getFieldValue` and `getFieldsValue` in addition to `signal`, `trigger` and `name` for cross-field logic without closing over a second state store.
- Dynamic rows use labelled group semantics and their nested controls keep unique label/help/error relationships. Disabled structural operations remain native disabled controls.
- Component center, standalone/static preview, deterministic SSR, seven focused unit cases, five visual baselines, 23 Axe scenarios and 27 interactions per browser are release gates for 68 components and 216 locale keys.

## 43. Maturity P30: schema-driven form orchestration

- `UiSchemaForm` composes `UiForm` and `UiFormItem`; the consumer retains model ownership and may return to the primitives without a data migration.
- Flat field lists and grouped sections normalize into a consistent structure. Sections define semantic headings, descriptions, columns and gaps; fields define nested paths, grid spans and control mappings.
- `visible`, `required`, `disabled`, `readonly`, `props`, `options` and `placeholder` may be static or resolve from current model/context. Hidden controls unmount synchronously and no longer participate in validation.
- Built-in mappings cover 12 common form controls. A registry or direct component supports domain controls; field and section slots override only the required rendering boundary.
- Resolver, normalization and component lookup failures preserve a deterministic fallback and emit one deduplicated `schema-error` payload rather than breaking the complete form render.
- Schema Form forwards managed validation, reset, server-error, field value/state, focus and scroll APIs. `field-change` reports canonical paths plus immutable previous/next values.
- Required markers, labels, descriptions, error alerts, error summaries and focus-on-error remain provided by the lower-level managed form contract.
- Component center, standalone/static preview, deterministic SSR, eight focused unit cases, six visual baselines, 24 Axe scenarios and 28 interactions per browser are release gates for 69 components and 216 locale keys.

Axe 4.11.4 runs WCAG 2.0/2.1/2.2 A/AA and Best Practice audits in a real Chromium DOM. The 24-case matrix adds conditional Schema Form rendering to the existing light, dark RTL, mobile, overlays, data and form scenarios; detected `violations` must remain zero.

## 44. Maturity P31: repeatable Schema Form nodes

- A Schema Form list node uses `type: 'list'`, a canonical root `name`, `fields` with item-relative names, and optional `min`, `max`, `columns`, `gap` and default-item factory settings.
- Structural controls preserve `UiFormList` stable identity and min/max semantics. Successful changes carry immutable current and previous arrays; blocked operations emit a typed limit event without mutating the model.
- Child visibility, props, options, placeholder, required, disabled and readonly resolvers receive current root model plus item/index context. Dependencies are item-relative unless explicitly prefixed with `$root`.
- Default-item factory failures are contained and deduplicated as `schema-error` events. A valid empty object keeps the form operable after a consumer callback fault.
- Generated controls use deterministic labelled group/item semantics. Responsive item grids collapse to one column on narrow viewports; disabled actions remain native disabled buttons.
- Targeted list item, empty-state and child-field slots keep the schema orchestration boundary while allowing domain rendering. Instance methods expose add/remove/move/replace/read operations for programmatic workflows.
- Component center, standalone/static preview, deterministic SSR, eight focused unit cases, seven visual baselines, 25 zero-violation Axe scenarios and 29 interactions per browser are release gates for 69 components and 223 locale keys.

Axe 4.11.4 now runs 25 scenarios. The additional case audits the repeatable Schema Form group, item headings, controls and nested field labelling; detected `violations` must remain zero.

## 45. Maturity P32: production upload orchestration

- `UiUpload` retains controlled `modelValue` ownership and normalizes every accepted file into a stable queue item with id, raw file metadata, status, percent, response and isolated error state.
- A request worker receives the raw file, normalized item, AbortSignal and clamped progress reporter. `concurrency` limits active workers while queued files keep deterministic selection order.
- Auto mode schedules accepted files after async preflight. Manual mode exposes ready items until `upload()` is called. Public select/upload/abort/retry/remove/clear/open methods return compact operation results.
- Async `beforeUpload` may reject or transform a candidate; transformed files are revalidated. Async `beforeRemove` guards removal. Callback rejection is contained and reported without corrupting sibling queue items.
- Each upload run owns a monotonic token and AbortController. Cancel, remove and retry invalidate older completion, preventing stale success/error writes after a user action.
- Structured select/reject/exceed/start/progress/success/upload-error/abort/retry/remove events complement the compatible change/error boundary. Change metadata includes reason, previous list and related file/source.
- The default file list exposes ready/uploading/success/error/canceled text, native progressbar semantics, live updates and file-specific start/cancel/retry/remove names. Trigger/tip/file slots receive equivalent state and methods.
- Component center, business import, standalone/static preview, deterministic SSR, ten focused unit cases, eight visual baselines, 26 zero-violation Axe scenarios and 30 interactions per browser are release gates for 69 components and 235 locale keys.

Axe 4.11.4 now runs 26 scenarios. The additional case audits a mixed-state upload queue, progress semantics, status labelling and all file-level operations; detected `violations` must remain zero.

## 46. Maturity P33: package and style boundaries

- The published root stylesheet is derived from the union of classes declared by the 69 public Vue components and their component dependencies. Admin shell, page, documentation, preview, showcase and demo selectors are not package API.
- Top-level comma-separated selectors are parsed with quote, escape, attribute and functional-pseudo awareness. A component stylesheet retains only branches whose first selector class belongs to the component boundary.
- Tokens and the minimal shared baseline remain in `styles/core.css`; every component stylesheet imports that file and wraps its own rules in `@layer lan-ui`.
- Form List and Schema Form source rules participate in the same cascade layer. Package generation rejects missing root/component rules, manifest byte drift, empty styles or any of 16 known application-selector families.
- `style-manifest.json` schema 2 records the minified root component union, shared core and each component's exact bytes/rules. The built and public manifests must be byte-for-byte equivalent.
- Every generated ESM entry and shared chunk is minified after Vite output. Package tests reopen all root, component and utility subpaths and render a real SSR component before the artifact is accepted.
- Component subpaths use a lean locale/config runtime. The full public config facade installs English into the same registry as an immutable built-in, so plugin/provider usage remains compatible without forcing English messages into a component-only consumer.
- Performance release evidence compares all 14 raw/gzip metrics to 1.28.0 and requires every metric to improve. Absolute ceilings are independently enforced to preserve capacity for future components.

P33 keeps 69 public components, 235 locale keys, eight visual baselines, 26 zero-violation Axe scenarios and 30 interaction cases per Chromium/Firefox/WebKit engine.

## 47. Maturity P34: theme runtime and scoped appearance

- `design-tokens.json` is the canonical theme source. Generation emits an immutable module with the full 102-Token light preset and an explicit dark override set; check mode rejects source/generated drift.
- Public appearance values are `light`, `dark` and `system`. Normalization rejects unsupported values unless an explicit fallback is supplied; resolving `system` is deterministic in SSR and follows `prefers-color-scheme` after mount.
- Theme definitions have a stable name, resolved light/dark base and validated Token map. Token normalization accepts kebab, camel or CSS custom-property spelling, rejects unknown names and unsafe empty/control-character values, and never mutates consumer input.
- `defineTheme`, `mergeThemes` and `themeToStyle` return new immutable values. Built-in presets remain frozen and cannot acquire application-owned overrides across requests or nested providers.
- `UiConfigProvider` records requested and effective appearances using `data-ui-appearance` and `data-ui-resolved-appearance`, exposes `data-theme` for CSS selectors, sets `color-scheme`, and applies custom properties only to its rendered subtree.
- Nested providers inherit locale, sizing, density, direction and parent Tokens before applying their own overrides. A scoped provider never changes document attributes, storage or a sibling subtree.
- The host controller owns one target, appearance persistence, system media-query subscription and state listeners. Every transition has a reason; throwing adapters/listeners are contained through `onError` without leaving a partially applied target.
- `dispose` removes media-query listeners and subscriptions and restores the target attributes and inline `color-scheme` captured at mount. A deliberate `restore: false` keeps the last requested appearance on a long-lived host.
- The plugin exposes controlled `setAppearance` and `setTheme` updates. The showcase application uses the same public controller as consumers, avoiding a second private theme state machine.
- Root and `theme` subpath runtime/type exports, API manifest, package reopen tests, component center, standalone consumer and SSR fixtures must remain in parity.

P34 keeps 69 public components and 235 locale keys. Release gates require 9 visual baselines, 27 zero-violation Axe scenarios, 31 interactions per Chromium/Firefox/WebKit engine, 23 negative type assertions and 16 performance ceilings including the complete theme-subpath JS dependency closure.

## 48. Maturity P35: scoped Teleport theme inheritance

- `UiConfigProvider` provides a reactive internal portal scope containing requested/resolved appearance, theme identity, normalized Token styles, locale, size, density, direction, `color-scheme` and overlay base.
- The bridge is attached to the first rendered root inside each Teleport, so CSS variables and `[data-theme]` selectors work even though Vue moved that root outside the provider DOM subtree.
- Modal, Drawer, Toast, Notification, Tooltip, Dropdown, Popover, Popconfirm, AutoComplete, ColorPicker, CommandPalette and Image preview use one shared composable. Future Teleport components must pass the source-discovery contract before release.
- Portal metadata uses `data-ui-teleport-scope`, `data-ui-appearance`, `data-ui-resolved-appearance`, `data-ui-theme`, `data-ui-locale`, `data-ui-size`, `data-ui-density` and `data-ui-direction`; explicit component direction and positioning styles retain precedence.
- Provider changes update an already-rendered portal. System appearance changes update resolved appearance and `color-scheme` without closing or remounting the overlay.
- Repeated roots such as Toast placements each receive the same scope. Custom Teleport targets and disabled Teleports remain deterministic because the bridge is applied at the component root rather than to a global container.
- Components without a nearest `UiConfigProvider` receive an empty bridge object, preserving document-level theme inheritance and avoiding an implicit light override.
- Unit tests cover named Tokens, live updates, system media changes, repeated portal roots and the no-provider branch. Browser interaction repeats the live contract in Chromium, Firefox and WebKit.
- `UiCheckbox` exposes `sm / md / lg` visual sizes plus an explicit accessible label API. Icon-only controls do not reserve an empty text gap.
- Table select-all and row-selection cells must compose the public compact checkbox rather than restyling a native checkbox; the visible control is 14px and its interaction box remains at least 24px.

P35 keeps 69 public components and 235 locale keys. Release gates require 10 visual baselines, 28 zero-violation Axe scenarios, 32 interactions per Chromium/Firefox/WebKit engine, 23 negative type assertions and 16 performance ceilings.

## 49. Maturity P36: adaptive motion preference runtime

- Public motion preferences are `full`, `reduced` and `system`. Normalization is strict by default; resolution maps system preference to a deterministic full-motion SSR fallback and follows `prefers-reduced-motion` after mount.
- The host controller owns persistence, one media-query subscription, requested/resolved target attributes, state subscriptions, teardown and optional restoration. Storage, media and target adapters remain injectable for SSR and deterministic tests.
- `UiConfigProvider` exposes `motion`, inherits it through nested configuration and provides the resolved value to descendants. A nested explicit `full` scope can override an ancestor or operating-system reduction.
- Motion CSS uses cascading duration aliases, spinner/skeleton/orbit durations, iteration count and scroll behavior. Component declarations contain no private duration literals or infinite iteration keywords.
- `useReducedMotion` gives behavior-oriented components the resolved scope. Managed-form error navigation and showcase scrolling switch from smooth to immediate behavior when reduction is active.
- The Teleport bridge forwards `data-ui-motion-preference`, `data-ui-motion` and effective motion variables to all 12 floating component families, including live system changes.
- The package root and `motion` subpath expose matching runtime and TypeScript contracts. Package reopen tests, API manifest, standalone consumer, static preview and the admin shell exercise the same public path.
- Browser interaction verifies system reduction, explicit full override, Teleport inheritance and a live switch back to no-preference in Chromium, Firefox and WebKit.

P36 keeps 69 public components and 235 locale keys. Release gates require 11 visual baselines, 29 zero-violation Axe scenarios, 33 interactions per Chromium/Firefox/WebKit engine, 24 negative type assertions and 18 performance ceilings.

## 50. Maturity P37: generated API reference and drift governance

- `api-manifest.json` schema 3 is the canonical machine contract for documentation. Every component exposes sorted compact names plus detailed Props, Events and Slots entries containing public TypeScript signatures and required state.
- Prop details join declarations to the built Vue runtime. Constructor names and literal, implicit, undefined or factory defaults are documented without executing consumer callbacks or mutable default factories.
- Six stable categories cover every one of the 69 public components exactly once. Generation rejects missing, duplicate and unknown assignments before writing any output.
- `COMPONENT-API.md`, `src/generated/component-api.json` and `public/component-api.json` are deterministic projections of the manifest. Check mode compares normalized bytes and is part of `check` and `prepack` through `api:check`.
- The admin shell exposes a lazy-loaded `/api` route. Component, prop, event and slot search; category filters; empty results; import copying and `?component=` deep links are keyboard-accessible and responsive.
- Hash route resolution separates the route path from its query. Selecting a contract updates history without remounting the shell, while opening a direct link restores the selected component.
- The page uses semantic headings, labelled navigation, live result counts, native tables with captions and visible focus treatment. Narrow viewports collapse the index and contract columns without hiding API information.
- Unit tests prove schema/detail/category parity and browser discovery. Visual and Axe fixtures render the real page; the interaction matrix repeats search, selection and deep-link behavior in Chromium, Firefox and WebKit.

P37 keeps 69 public components and 235 locale keys. Release gates require 12 visual baselines, 30 zero-violation Axe scenarios, 34 interactions per Chromium/Firefox/WebKit engine, 24 negative type assertions, generated documentation drift checks and 18 performance ceilings.

## 51. Maturity P38: anchor navigation and lazy showcase routes

- `UiAnchor` accepts a recursive item model and flattens it into a stable document outline while retaining level metadata for indentation and item-slot rendering.
- Controlled and uncontrolled active state use one change boundary. Pointer, scroll-spy and public API updates identify their source, suppress duplicate writes and expose complete scroll start/end events.
- Window, selector, element and factory containers resolve only after mount. Target geometry accounts for container bounds, current scroll position, fixed header offset and activation tolerance.
- Vertical and horizontal layouts expose native links inside labelled navigation. Disabled links leave the focus order; Home, End and directional arrows rove across enabled links and horizontal arrows mirror under RTL.
- Sticky placement uses logical properties and Token z-index. Focus, hover, active, forced-colors and reduced-motion behaviors remain visible without application selectors in package CSS.
- The component use-case center composes the same public component rather than duplicating scroll and active-state logic. Generated schema 3 documentation includes all 10 Props, five Events and the scoped item Slot.
- Every admin page is loaded with a route-level async boundary. The shell entry stays below 331KB raw and no Vite chunk-size warning is emitted; the component center and API corpus remain separately cached chunks.
- The standalone consumer uses local component imports plus the public icon registry instead of also installing the full plugin, preserving an independent-project example without pulling unused global components into its entry bundle.
- Focused tests cover nested semantics, element scrolling, scroll-spy, controlled deduplication, disabled focus skipping, RTL arrows, reduced motion and SSR. Visual, Axe and three-engine interaction fixtures exercise the real component.

P38 advances to 70 public components and 236 locale keys. Release gates require 13 visual baselines, 31 zero-violation Axe scenarios, 35 interactions per Chromium/Firefox/WebKit engine, 25 negative type assertions, schema/documentation drift checks and 18 performance ceilings.


## 52. Maturity P39: publishable tarball and external consumer contract

- The distributable boundary is the `.tgz` produced from `package.json.files` and Package Exports, not the repository or its existing `node_modules` tree.
- Release metadata identifies the MIT license, source repository, issue tracker, homepage, public registry access and provenance intent. CI validates metadata and never performs publication.
- `tokens.css`, the complete stylesheet, core stylesheet and every component stylesheet are explicit exports and CSS side effects. Consumers never need an internal `dist-lib` path.
- Packed-file allow-list checks require root/component JavaScript, declarations, styles, Tokens, manifests, README, license, changelog and API documentation. Repository source, tests, scripts, examples, CI configuration, verification state and dependencies are forbidden.
- Two lifecycle-disabled pack passes must produce byte-identical SHA-256 archives. The regression installs the actual tarball into an isolated non-workspace application with offline dependency resolution and validates root and subpath ESM imports, public TypeScript declarations, Vue SSR output and a Vite browser build containing both Token and component CSS.
- Distribution budgets are independent of runtime bundle budgets: no more than 340 files, 320,000 compressed bytes or 1,800,000 unpacked bytes.
- `prepack` retains all runtime, locale, type, documentation, package, example and performance gates. The nested tarball check disables lifecycle scripts only for its internal fixture to avoid recursively invoking `prepack`.

P39 keeps 70 public components and 236 locale keys. Release gates add one installed-artifact consumer while retaining 13 visual baselines, 31 zero-violation Axe scenarios, 35 interactions per Chromium/Firefox/WebKit engine, 25 negative type assertions and 18 runtime performance ceilings.

## 53. Maturity P40: runtime matrix and auditable release contract

- The supported Node boundary is executable: pnpm 10.34.0 runs on 20.19.0, 22.12.0 and the current 24 line; each runtime installs the frozen lockfile, runs unit tests, builds the package and installs the real archive into an isolated consumer.
- Runtime validation keeps `package.json.engines`, the CI matrix, the actual process version and Vue 3.5 peer/runtime assumptions synchronized.
- The isolated consumer first resolves a standalone lockfile and prefetches its exact content, then performs the asserted installation with frozen-lockfile and offline flags. This avoids relying on package-manager-specific metadata left by the workspace install.
- The release reference is version-bound. A tag build proceeds only when the ref is exactly `v` plus the semantic `package.json.version`, and that version must already have a changelog entry.
- Release artifacts use the deterministic `lan-ui-design-system-<version>.tgz` name. Validation reopens the archive, checks identity and licensing, requires all 70 runtime/type/style triplets, applies distribution budgets and writes a SHA-256 sidecar.
- GitHub Release automation uploads the archive/checksum, produces an artifact attestation with OIDC and creates a Release only for tag-triggered runs. Manual dispatch exercises the same build and upload path without inventing a release tag.
- Registry publication is intentionally separate from GitHub artifact production. A release workflow cannot publish to npm by implication.

P40 keeps 70 public components, 236 locale keys, 13 visual baselines, 31 zero-violation Axe scenarios, 35 interactions per Chromium/Firefox/WebKit engine, 25 negative type assertions and 18 runtime performance ceilings. It adds three Node compatibility jobs and a version-bound, checksummed, attested GitHub Release gate.


## 54. Maturity P41: target-aware product onboarding

- `UiTour` accepts controlled `modelValue` and `current`, an ordered step array and selector, Element, Vue public-instance or factory targets. Target lookup occurs only on the client and missing targets emit a typed diagnostic before using a centered fallback.
- Twelve logical placements support start/end alignment. Positioning scores the preferred, opposite and perpendicular candidates, then shifts the chosen panel inside a 10px viewport boundary. Resize, nested scroll and ResizeObserver changes recompute geometry.
- The spotlight is formed by four mask regions around the padded target. `targetClickable=false` adds a blocker inside the hole; step-level `mask` and `maskColor` override the component defaults.
- Masked tours expose a modal dialog, lock document scrolling, trap focus and participate in the shared top-overlay Escape stack. Mask-free tours omit `aria-modal`, preserve document scrolling, leave Tab traversal untrapped and still retain z-order and keyboard ownership.
- Opening captures the invocation origin. Step changes replace, rather than accumulate, the target's `aria-describedby`; close and unmount restore prior descriptions, scroll state, observers, listeners and invocation focus.
- Escape closes. Home/End select boundaries, and directional keys navigate when the panel owns focus; horizontal keys mirror in RTL. Target scrolling consumes the nearest motion scope and becomes immediate under reduced motion.
- Title, indicator, description and actions Slots receive the current step and navigation functions. The exposed instance offers `next`, `previous`, `goTo`, `finish`, `close` and `update`.
- Runtime Props/Events/Slots, root and component-subpath declarations, locale strings, generated API records, component CSS and SSR output remain one release contract.
- The component center, static HTML preview and standalone consumer each render a working onboarding example. Unit, visual, Axe and three-browser interaction fixtures verify geometry, focus, semantics, RTL, reduced motion, SSR and consumer delivery.

P41 advances to 71 public components, 242 locale keys and 13 theme-scoped Teleport families. Release gates require 14 visual baselines, 32 zero-violation Axe scenarios, 36 interactions per Chromium/Firefox/WebKit engine, 26 negative type assertions, schema/documentation drift checks, an isolated tarball consumer and 18 performance ceilings.

## 55. Maturity P42: resilient document watermark

- `UiWatermark` protects a bounded content region with text or image marks while the default Slot remains the semantic and interactive content source.
- Text accepts one or multiple lines. `font`, `width`, `height`, `gap`, `offset`, `rotate` and `zIndex` form a typed layout contract; invalid numeric geometry is normalized before rendering.
- Canvas dimensions include the current device-pixel ratio, capped at 4, while CSS background dimensions remain in logical pixels. Text retains an SVG fallback when a 2D context is unavailable.
- `image` is loaded with a constrained native CORS mode and has priority over text. Load, CORS or Canvas-export failure emits `image-error` with a stage and falls back to `content`.
- The visual layer is non-interactive and decorative by default. Supplying `ariaLabel` exposes one named image without repeating the watermark text to assistive technology.
- With `observe=true`, MutationObserver distinguishes removed and modified layers, emits a diagnostic, reattaches the retained node and restores protected class, data, style and ARIA fields without desynchronizing Vue's virtual DOM.
- Ordinary mutations inside the content Slot do not trigger repair. Unmount cancels image callbacks and observers; SSR never resolves browser globals during render.
- Root/subpath runtime exports, declarations, component CSS, generated API records, component center, static preview, standalone consumer and packed installation remain in parity.

P42 advances to 72 public components and keeps 242 locale keys and 13 theme-scoped Teleport families. Release gates require 15 visual baselines, 33 zero-violation Axe scenarios, 37 interactions per Chromium/Firefox/WebKit engine, 27 negative type assertions, an isolated tarball consumer and 18 performance ceilings.

## 56. Maturity P43: viewport and container-aware affix

- `UiAffix` accepts top/bottom position, numeric offset and z-index, optional window/Element/selector/factory scroll targets, an optional boundary, a disabled state and observation control.
- The root placeholder retains the measured content height while fixed. The fixed layer preserves the source column's left edge and width, so enabling Affix does not reflow adjacent content.
- A custom scroll target becomes the implicit boundary. Top mode stops before the boundary bottom; bottom mode stops after the boundary top. An explicit boundary may decouple scrolling from containment.
- Invalid targets and boundaries emit typed diagnostics. An invalid scroll target degrades to the window; an invalid boundary is ignored. Resolution failures remain observable through typed diagnostics.
- Scroll events publish scroll position and geometry; change events occur only when fixed state changes. `ResizeObserver`, captured nested-scroll listeners and window resize keep geometry synchronized.
- `disabled` restores normal flow, print media removes fixed positioning, unmount removes every listener and observer, and SSR resolves no selectors or browser globals.
- The exposed `update` and `updateRoot` methods support layout systems that mutate content or replace scroll roots outside observable DOM geometry.
- Root and stable subpath exports, Props/Events/Slots declarations, component CSS, generated API documentation, component center, static preview, standalone consumer and installed tarball stay in parity.
- Performance keeps 13 historical comparison metrics strictly below the 1.28 baseline. Only aggregate package-JS gzip receives a 0.25% additive tolerance, and it must also remain within the absolute 172KB release budget.

P43 advances to 73 public components and keeps 242 locale keys and 13 theme-scoped Teleport families. Release gates require 16 visual baselines, 34 zero-violation Axe scenarios, 38 interactions per Chromium/Firefox/WebKit engine, 28 negative type assertions, an isolated tarball consumer and 18 performance ceilings.

## 57. Maturity P44: constrained multi-panel splitter

- `UiSplitter` accepts a keyed `panels` array and normalized percentage `modelValue`. It supports horizontal or vertical direction, eager or lazy resize, global disabling, keyboard step, separator size and an accessible group label.
- Panel `size`, `defaultSize`, `min`, `max` and `collapsedSize` accept numeric pixels, pixel strings or percentages. Initial pixel constraints are fitted to the available content dimension and emitted as a responsive ratio whose sum remains 100.
- Pointer gestures resize only the adjacent pair and clamp both sides. Eager mode publishes during movement; lazy mode publishes preview sizes and a guide, then commits the model on release. Unmount removes document listeners and observation.
- Separators use `role="separator"`, inverse orientation, two `aria-controls` IDs and cumulative `aria-valuemin`, `aria-valuenow` and `aria-valuemax`. Arrow keys resize, Home/End clamp to bounds, and Enter or double click toggles an eligible collapsible neighbor.
- Horizontal pointer and keyboard deltas mirror in RTL. A disabled or immutable pair is removed from the tab order, collapsed panels are hidden and inert, forced-colors keeps visible boundaries, print removes controls, and SSR uses deterministic model/default ratios.
- The public instance exposes `reset`, `setSizes`, `collapse`, `expand`, `toggleCollapse` and a reactive `sizes` reference. Resize start/move/end, collapse and invalid diagnostics use typed payloads.
- Component center, one-page preview, standalone project, API docs, root/subpath package exports, component CSS, declarations, SSR and installed-tarball smoke tests remain synchronized.
- The frozen 1.28 performance comparison retains strict improvement for 13 metrics. Aggregate package JS gzip receives a deterministic 1KB allowance for each public component above the 69-component baseline and must independently stay below 175KB.

P44 advances to 74 public components and keeps 242 locale keys and 13 theme-scoped Teleport families. Release gates require 17 visual baselines, 35 zero-violation Axe scenarios, 39 interactions per Chromium/Firefox/WebKit engine, 29 negative type assertions, an isolated tarball consumer and 18 performance ceilings.


## 58. Maturity P45: semantic typography primitive

- `UiTypography` provides `text`, `paragraph` and title-level semantic output without forcing product code to recreate action affordances or truncation logic.
- Tone, shared size/weight scale, alignment and marked/code/keyboard/deleted/underlined/strong/italic treatments compose from one stable class contract.
- Copy accepts an optional canonical source, uses Clipboard with a document fallback, exposes localized status and emits typed success or error payloads.
- Editable text supports icon, text or both triggers; Escape cancels, Enter confirms single-line fields, Ctrl/Cmd+Enter confirms paragraphs, max length is enforced and blur may be explicitly enabled.
- Ellipsis uses one or multi-line measurement, `ResizeObserver` and font-ready remeasurement. The expandable action appears only for overflow, preserves `aria-expanded` and supports controlled or uncontrolled state.
- Disabled actions remain visible but immutable. Prefix, suffix and action-icon slots retain semantics; component refs expose copy, edit, expand, measurement and focus methods.
- Root and component-subpath exports, component CSS, generated API documentation, static preview, standalone consumer, SSR, installed-tarball checks and cross-browser fixtures remain synchronized.

P45 keeps the frozen 1.28 comparison strict for every historic metric and uses a deterministic 1.5KB gzip allowance per public component only for aggregate package JavaScript.

P45 advances to 75 public components and 251 locale keys. Release gates require 18 visual baselines, 36 zero-violation Axe scenarios, 40 interactions per Chromium/Firefox/WebKit engine, 30 negative type assertions, an isolated tarball consumer and 18 performance ceilings.


## 59. Maturity P46: semantic finite-data list

- `UiList` represents finite operational records as a semantic list or selectable listbox. Item keys and built-in text, title, description, avatar and disabled fields accept property names or resolvers.
- Default rich markup is replaceable through item/default, avatar, title, description, actions and extra Slots; header, footer, loading, error, empty and pagination Slots keep surrounding product structure caller-owned.
- Selection is disabled, single or multiple. Controlled model and active index coexist with defaults, disabled keys and records, optional deselection, looped navigation and nested-interaction isolation.
- Arrow keys navigate one row or one responsive grid column; Home/End move to boundaries, Enter/Space commits selection, Ctrl/Cmd+A selects all enabled records and typeahead resolves the next matching title. Inline movement mirrors in RTL.
- Container width selects the declared columns for base, sm, md and lg ranges. Native container-query styles and a ResizeObserver-backed keyboard column step stay synchronized.
- Client pagination slices finite input; server pagination preserves caller-supplied records while using page, page size and total to publish global `aria-posinset` and `aria-setsize` values.
- Loading uses inert skeleton rows and localized status text. Error uses an alert and retry action. Empty output is localized and all states remain overridable.
- The instance exposes focus, active-index movement, selection, clearing and scroll-to-key. Runtime exports, root/subpath declarations, component CSS, generated API, SSR, component center, static preview, standalone and packed consumers remain synchronized.
- Locale release gates reject Unicode replacement characters and three-or-more question-mark runs before packaging.

P46 keeps the frozen 1.28 comparison strict for every historic metric and retains a deterministic 2KB aggregate JavaScript gzip allowance per public component beyond the 69-component baseline.

P46 advances to 76 public components and 257 locale keys. Release gates require 19 visual baselines, 37 zero-violation Axe scenarios, 41 interactions per Chromium/Firefox/WebKit engine, 31 negative type assertions, an isolated tarball consumer and 18 performance ceilings.


## 60. Maturity P47: segmented one-time-code input

- `UiOtpInput` models one canonical verification-code value through one input cell per segment. Length is normalized to 1–12; numeric, alphanumeric and free-text modes constrain accepted characters without changing the public string model.
- Incoming values use Unicode NFKC normalization before filtering. Optional uppercase and transform hooks run before the length limit; a failing hook falls back to normalized input without breaking entry.
- Multi-character input and paste distribute from the active cell. Single-character entry advances focus, Backspace clears or moves backward, Delete clears, Home/End jump to boundaries and Arrow movement mirrors under RTL.
- Only the first cell requests mobile `one-time-code` autocomplete. When `name` is supplied, one hidden successful control submits the canonical code while segmented cells remain unnamed.
- Masking changes display only. Placeholder, separator/every grouping, size, readonly, disabled, invalid, autofocus and focus-selection behavior have stable typed Props.
- The group inherits ID, described-by, invalid and disabled state from `UiFormItem`. Every cell has a localized position label and completion uses a polite live region; forced-colors retains visible boundaries.
- `input`, `change`, `complete`, `focus`, `blur` and `invalid` carry typed metadata. The instance exposes the root, input collection, focus, blur, clear and setValue APIs.
- Root/subpath exports, component CSS, generated API docs, component center, static preview, standalone consumer, SSR and isolated packed installation remain synchronized.

P47 retains the frozen 1.28 comparison and uses a deterministic 2.25KB aggregate JavaScript gzip allowance per public component beyond the 69-component baseline.

P47 advances to 77 public components and 260 locale keys. Release gates require 20 visual baselines, 38 zero-violation Axe scenarios, 42 interactions per Chromium/Firefox/WebKit engine, 32 negative type assertions, an isolated tarball consumer and 18 performance ceilings.

## 61. Maturity P48: contextual multiline mentions

- `UiMentions` owns one controlled multiline string and recognizes one or more trigger tokens. Trigger discovery requires a token boundary, uses the current caret rather than the end of the field and supports optional spaces, minimum query length and custom validation.
- Local options can be strings, numbers or rich records with labels, values, keywords, descriptions, disabled state and trigger scope. Filtering and inserted output can be customized independently.
- `fetchSuggestions` is debounced and receives the trigger plus AbortSignal. New queries abort prior requests, stale completions are ignored, successful results can be cached, and loading, empty and error states have localized defaults and Slots.
- The floating panel anchors to a virtual caret rectangle, flips on viewport collision and mirrors logical start/end in RTL. The shared floating-position utility observes only real Elements, so virtual anchors do not leak ResizeObserver exceptions.
- Arrow Up/Down skips disabled suggestions; Ctrl+Home/End selects boundaries; Enter/Tab commits; Escape dismisses. Composition input does not update or search until IME completion.
- A labelled combobox owner contains the native multiline textbox and owns the listbox. The textarea retains textbox semantics, autocomplete, controls and active-descendant linkage; FormItem labels, help, errors and invalid state remain associated with the focusable control.
- Autosize, maxlength/count, size, disabled, readonly, invalid, append target, cache and placement are typed. Events report search, selection, change, open, async error and focus metadata; refs expose focus, blur, close, insert and position update.
- Root/subpath exports, component CSS, generated API docs, component center, static preview, standalone consumer, SSR and isolated packed installation remain synchronized.

P48 retains the frozen 1.28 comparison and uses deterministic per-additive-component allowances of 500 B package JavaScript raw, 2.75 KB package JavaScript gzip and 800 B standalone JavaScript raw beyond the 69-component baseline. All remaining historical metrics retain zero allowance.

P48 advances to 78 public components, 265 locale keys and 14 theme-scoped Teleport families. Release gates require 21 visual baselines, 39 zero-violation Axe scenarios, 43 interactions per Chromium/Firefox/WebKit engine, 33 negative type assertions, an isolated tarball consumer and 18 performance ceilings.

## 62. Maturity P49: tokenized multi-value input

- `UiInputTag` owns one controlled string array and one transient text draft. Incoming candidates use Unicode NFKC normalization, optional trimming and a typed transform hook before validation.
- Enter, custom submit keys, configurable separators and multiline paste tokenize one or many candidates. Comparison defaults to case-insensitive deduplication and can opt into case-sensitive or duplicate values.
- `maxTags`, Unicode code-point `maxLength`, `validate` and `beforeAdd` form one ordered guard pipeline. Both hooks may be asynchronous; additions are serialized and publish `aria-busy` while pending.
- Backspace first arms the final tag and then removes it. Delete removes the active tag, Enter/F2 opens inline editing, Escape cancels and logical Arrow navigation mirrors under RTL. IME text is not tokenized while composition is active.
- Editable, collapsed, clearable, readonly, disabled, invalid and loading states share one visual contract. Tags have labelled remove actions, state changes use a polite live region and focus returns to the native text input after mutations.
- When `name` is present, each canonical value is rendered as a successful hidden form control. `UiFormItem` IDs, labels, descriptions and invalid state are inherited; Schema Form resolves `type:'input-tag'` without custom registration.
- Root and component-subpath runtime exports, Props/Emits/Slots declarations, component CSS, generated API docs, component center, static preview, standalone consumer, SSR and installed-tarball verification remain synchronized.

P49 advances to 79 public components, 285 locale keys and 14 theme-scoped Teleport families. Release gates require 22 visual baselines, 40 zero-violation Axe scenarios, 44 interactions per Chromium/Firefox/WebKit engine, 34 negative type assertions, an isolated tarball consumer and 18 performance ceilings. Against the frozen 1.28 baseline, per-additive-component allowances are 1.9 KB package JS raw, 2.9 KB package JS gzip, 400 B package CSS raw, 450 B largest component CSS raw and 2.2 KB standalone JS raw; other historical metrics keep zero allowance.

## 63. Maturity P50: recursive typed query composition

- `UiQueryBuilder` owns a controlled `UiQueryGroup` tree. Each node is either a rule with field/operator/value metadata or a nested AND/OR group with optional NOT negation.
- Field definitions declare label, type, options, supported operators, defaults, bounds, custom value lookup and validation. Operators declare zero, one or two values, compatible field types, multi-value behavior and an optional local evaluator.
- Text, number, date, select, multi-select, tag and boolean editors reuse existing public form primitives. Field or operator changes reset incompatible values instead of retaining stale domain data.
- Add, remove, duplicate, move and clear create a new public tree while preserving the previous object. Depth and per-group limits are enforced before mutation; generated IDs may be retained or stripped from emitted/persisted output.
- Ctrl/Cmd+D duplicates, Ctrl/Cmd+Enter appends, Alt+Arrow reorders and Alt+Backspace removes a focused node. Focus follows created or moved nodes, every icon action has a localized label, and mutations are announced through a polite live region.
- Validation covers missing field/operator/value, inverted ranges, minimum rule counts and custom field/global validators. Inline errors use described-by linkage; the instance exposes validation results, errors and recursive counts.
- `matches(record)` evaluates the same tree with built-in comparison, text, range, membership and emptiness operators. Field getters and operator tests support nested or product-specific records without coupling the component to a data layer.
- A named builder emits one hidden serialized form value. Schema Form resolves `type:'query-builder'`; root/component subpaths, Props/Emits/Slots, related types, component CSS, generated API and SSR output stay in parity.
- Component center, one-page preview and standalone consumer demonstrate direct and schema-driven usage. Unit, visual, zero-violation Axe, negative type, packed-consumer and three-browser interaction gates verify recursion, keyboard editing, evaluation, accessibility and distribution.

P50 advances to 80 public components, 349 locale keys and 14 theme-scoped Teleport families. Release gates require 23 visual baselines, 41 zero-violation Axe scenarios, 45 interactions per Chromium/Firefox/WebKit engine, 35 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings. The frozen 1.28 comparison uses explicit per-additive-component byte allowances for the typed-editor dependency closure and no percentage tolerance.

## 64. Maturity P51: accessible content carousel

- `UiCarousel` owns one numeric active index and accepts stable application items. Controlled `modelValue` and uncontrolled `defaultIndex` modes share navigation, lazy visitation and event payloads without mutating item identity.
- Horizontal/vertical and slide/fade presentation modes are independent of navigation state. Looping wraps while finite mode disables endpoint controls and emits typed `reach-start` / `reach-end` metadata.
- Previous/next controls, dot/line/number indicators, logical Arrow keys, Home/End and pointer swipe converge on `previous`, `next` and `to`. Change payloads include current/previous index, item identity, source and movement direction.
- Autoplay uses one restartable timeout. Hover, focus-within, page visibility, drag and endpoint pauses are tracked independently; leaving one pause reason must not erase another. Reduced Motion prevents automatic rotation even when requested.
- A named `region` with carousel role description owns named slide groups. Inactive slides are `aria-hidden` and inert, controls identify their track/slide, live updates are polite when manual and off while rotating, and an explicit playback button remains available whenever autoplay is requested.
- Lazy rendering visits the active slide deterministically during SSR and retains visited content after navigation. Empty, custom item, indicator and arrow Slots preserve the same accessible shell.
- CSS covers touch-action, focus-visible, RTL arrow direction, responsive demos, print, forced-colors and reduced-motion. Component-subpath CSS must contain Carousel selectors without unrelated component families.
- Component center, one-page HTML, standalone consumer, root/subpath types, generated API, SSR and package exports stay in parity. Unit, visual, Axe, negative type, packed-consumer and three-engine interaction gates cover the public contract.

P51 advances to 81 public components, 359 locale keys and generated coverage of 917 Props, 323 Events and 160 Slots. Release gates require 24 visual baselines, 42 zero-violation Axe scenarios, 46 interactions per Chromium/Firefox/WebKit engine, 36 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 65. Maturity P52: strict time-range input

- `UiTimeRangePicker` specializes the proven range adapter in `time` mode and exposes a dedicated scheduling-oriented public contract without duplicating parsing or time-zone logic.
- The controlled model contains start/end values in one representation: string, `Date` or timestamp. Local, UTC and IANA zones, DST disambiguation, reference date and minute/second/millisecond precision match the single time picker.
- Min/Max and optional opposite-end constraints are applied to both native controls. Inverted values remain observable when constraints are disabled and produce structured change validity plus a range-order invalid event.
- One labelled group owns both focusable endpoints, FormItem label/help/error associations, visible focus and invalid rings, endpoint-specific focus/blur payloads, an accessible clear action and a live order-error announcement.
- Schema Form resolves `time-range`; `datetime` and `datetime-range` apply deterministic mode presets before consumer field props. Existing date/time types are unchanged.
- Root and component subpaths, Props/Emits/Slots, isolated CSS, generated API, component center, static preview, standalone consumer, SSR and packed installation stay in parity.

P52 advances to 82 public components, 365 locale keys and generated coverage of 934 Props, 329 Events and 160 Slots. Release gates require 25 visual baselines, 43 zero-violation Axe scenarios, 47 interactions per Chromium/Firefox/WebKit engine, 37 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 66. Maturity P53: discoverable date-time adapters

- `UiDateTimePicker` and `UiDateTimeRangePicker` specialize the strict single/range date controls in `datetime` mode. They provide explicit application vocabulary without duplicating parsing, serialization or accessibility logic.
- Both expose string, `Date` and timestamp representations, local/UTC/IANA zones, DST disambiguation, reference date, precision, step, Min/Max, clear, invalid, focus and blur contracts.
- The range uses one labelled semantic group and two named native `datetime-local` inputs. Opposite-end constraints are enabled by default; unconstrained inverted input remains observable with structured order validation.
- Existing datetime modes and Schema Form types stay compatible. Root/subpath runtime, declarations, isolated CSS, generated API, component center, static preview, standalone consumer, deterministic SSR and installed-tarball checks remain in parity.

P53 advances to 84 public components, 365 locale keys and generated coverage of 965 Props, 341 Events and 160 Slots. Release gates require 26 visual baselines, 44 zero-violation Axe scenarios, 48 interactions per Chromium/Firefox/WebKit engine, 39 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 67. Maturity P54: encoded QR lifecycle

- `UiQRCode` owns a real byte-mode QR matrix backed by a pinned zero-dependency encoder. Content changes or L/M/Q/H error-correction changes produce a new deterministic matrix during both browser and server rendering.
- Integer SVG modules use crisp-edge rendering. Size is clamped from 64–1024 px, quiet-zone margin from 0–16 modules, and foreground/background colors remain explicit export values.
- Optional center imagery receives a background plate and a 30% size cap. Product guidance requires Q/H correction and scan-device verification when imagery obscures modules.
- Active, loading, expired, scanned and encoder-invalid states keep the encoded image named for assistive technology while a polite status overlay communicates lifecycle. Invalid encoding upgrades to an alert.
- Expired refresh is consumer controlled: the component emits the current value, and the product issues a new value. Download serializes the same matrix into a standalone SVG and emits filename/content metadata.
- Overlay, caption and actions Slots preserve encoder state. The exposed instance supplies `refresh`, `download` and `toSvg`; runtime and Props/Emits/Slots types match root and component subpaths.
- Component center, one-page HTML, standalone consumer, isolated CSS, generated API, deterministic SSR and offline installed-tarball tests remain in parity. Unit, visual, zero-violation Axe and three-engine interaction gates cover lifecycle, matrix changes and actions.

P54 advances to 85 public components, 372 locale keys and generated coverage of 979 Props, 344 Events and 163 Slots. Release gates require 27 visual baselines, 45 zero-violation Axe scenarios, 49 interactions per Chromium/Firefox/WebKit engine, 41 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.


## 68. Maturity P55: scanner-ready barcode lifecycle

- `UiBarcode` produces a real deterministic one-dimensional module stream through the pinned JsBarcode encoder. CODE128/39, EAN, UPC, ITF, MSI, Pharmacode and Codabar cover common asset, retail, logistics and medication workflows.
- Module width, bar height, quiet-zone margin, foreground/background, human-readable text, font size and text gap use bounded values. SVG paths use crisp edges and serialize without a browser DOM.
- Active, loading, expired, scanned and encoder-invalid states retain the named barcode graphic. Polite lifecycle overlays become alerts for invalid input; expired actions emit refresh while applications replace the value.
- Download emits the exact standalone SVG and metadata. Overlay, caption and actions Slots plus `refresh`, `download`, `toSvg` and `getEncoding` instance methods expose the full contract.
- Root/subpath runtime exports, Props/Emits/Slots, isolated CSS, generated API, component center, static preview, standalone consumer, deterministic SSR and offline installed-tarball verification remain synchronized.

P55 advances to 86 public components, 379 locale keys and 28 visual baselines. Release gates require 46 zero-violation Axe scenarios, 50 interactions per Chromium/Firefox/WebKit engine, 43 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 69. Maturity P56: validated Unix Cron scheduling

- `UiCronEditor` owns a controlled five-field Unix Cron string for automation, report-delivery and maintenance forms. Common presets never replace the serializable expression with an opaque schedule object.
- Minute, hour, day-of-month, month and day-of-week fields accept wildcard, number, list, ordered range and positive step syntax with bounded numeric values. Sunday `7` normalizes to `0`; restricted day-of-month and weekday fields follow Unix OR semantics.
- Validation produces stable error codes, source field and token values. Invalid input stays editable, receives an alert and FormItem error linkage, and suppresses misleading future-run output.
- Preview calculation starts at the next complete minute, never mutates the supplied reference date, supports deterministic UTC or browser-local execution and caps requested output and search horizon.
- Default presets, custom presets, five-field breakdown, responsive container styling, readonly/disabled behavior and reduced-motion/forced-color treatment cover dense enterprise layouts.
- Header, presets, preview and actions Slots expose controlled composition. `validate`, `nextRuns`, `setExpression`, `applyPreset`, `focus` and `blur` instance methods match declared runtime behavior.
- Root/subpath exports, Props/Emits/Slots, isolated CSS, generated API, component center, static HTML, standalone consumer, SSR and offline installed-tarball verification remain synchronized.

P56 advances to 87 public components, 406 locale keys and 29 visual baselines. Release gates require 47 zero-violation Axe scenarios, 51 interactions per Chromium/Firefox/WebKit engine, 45 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 70. Maturity P57: structured key-value configuration

- `UiKeyValueEditor` owns a controlled array of application records. Default `key`, `value`, `enabled` and `id` fields can be remapped, and unrelated consumer fields survive normalization and every immutable update.
- Stable internal row identity follows `itemKey` when present and falls back to positional continuity. Add, remove, move, toggle, replace and text import preserve focus and publish previous/current values with mutation source and validation metadata.
- Empty keys, case-sensitive or insensitive duplicates, key patterns, required values and minimum/maximum rows produce stable error codes. Invalid content stays editable, rows receive field-specific ARIA invalid state, and the group exposes one live validation summary.
- Dotenv-style import ignores blank/comment lines, splits only on the first configurable separator and supports replace or append mode. Malformed input and quantity limits leave the current model unchanged.
- `name` produces indexed successful controls for key, value and enabled state. FormItem label, help and error IDs flow into the named group and text controls without duplicating visible labels.
- Container queries collapse the column layout for narrow panels; logical properties and RTL switch motion keep layout direction-safe. Disabled, readonly, forced-colors and reduced-motion states remain visible and operable according to their semantics.
- Header, row, empty and actions Slots expose validation and mutation methods. The instance API exposes add/remove/move/toggle/replace/import/validate/getValue/focus with root and component-subpath type parity.
- Component center, one-page HTML, standalone consumer, isolated CSS, generated API, deterministic SSR and offline installed-tarball verification remain synchronized.

P57 advances to 88 public components, 431 locale keys and 30 visual baselines. Release gates require 48 zero-violation Axe scenarios, 52 interactions per Chromium/Firefox/WebKit engine, 47 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 71. Maturity P58: semantic page heading composition

- `UiPageHeader` is the single page-level contract for breadcrumb, logical back navigation, title, description, metadata, actions, footer and loading presentation. Business pages must compose these regions through Props and Slots instead of recreating page-local heading wrappers.
- The root is a named `header`; the configured `titleTag` supplies its document-outline label, and title-less or loading states retain an explicit accessible name. Nested breadcrumb landmarks receive page-specific labels so multiple examples remain distinguishable.
- Button and link back modes share disabled semantics and emit pointer/keyboard source metadata plus optional href. Exposed `focusBack` and `scrollIntoView` methods return operation status; default smooth scrolling adapts to scoped or system Reduced Motion.
- `sm`, `md` and `lg` title scales, optional divider and sticky offset cover dense workspaces. Logical properties, responsive single-column actions, RTL back direction, forced-colors focus and bounded skeleton motion preserve the same contract across environments.
- Breadcrumb, back-icon, title, description, meta, actions, footer and loading Slots retain application composition without weakening the landmark or heading relationship.
- Dashboard, Workbench, Data, AI, Gantt and Components pages, the one-page HTML preview, standalone consumer, root/subpath declarations, isolated CSS, generated API, deterministic SSR and offline installed-tarball verification remain synchronized.

P58 advances to 89 public components, 433 locale keys and generated coverage of 1,050 Props, 368 Events and 182 Slots. Release gates require 31 visual baselines, 49 zero-violation Axe scenarios, 53 interactions per Chromium/Firefox/WebKit engine, 49 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 72. Maturity P59: production card containers

- `UiCard` is the shared content-container contract for title, subtitle, cover, body, actions and footer. Existing `.card`, `.card-header`, `.card-title` and `.card-body` selectors remain stable for legacy consumers.
- `default`, `outlined`, `elevated` and `filled` variants, `sm`/`md`/`lg` density, independent border and shadow controls, hover, selected, disabled and loading states cover dashboard, list and navigation-card patterns without local wrappers.
- An `href` selects native anchor semantics and secures `_blank` by default. Other interactive roots expose button semantics, visible focus, Enter/Space activation and pointer/keyboard source metadata; nested actionable descendants never activate the container.
- Title and subtitle IDs form the default accessible name and description. Custom headers can use explicit ARIA naming. Loading publishes busy state and localized status while disabled/loading states suppress events and focus.
- Cover, header, title, subtitle, action/actions, loading and footer Slots preserve composition. The instance API exposes root, focus, blur and reduced-motion-aware `scrollIntoView` behavior.
- Component center, static preview, standalone consumer, root/subpath declarations, isolated CSS, generated API, deterministic SSR and offline installed-tarball verification remain synchronized.

P59 retains 89 public components and 433 locale keys while generated coverage advances to 1,068 Props, 370 Events and 188 Slots. Release gates require 32 visual baselines, 50 zero-violation Axe scenarios, 54 interactions per Chromium/Firefox/WebKit engine, 51 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 73. Maturity P60: interactive tag vocabulary

- `UiTag` is the compact vocabulary for status, category, filter selection, removable tokens and lightweight navigation. Legacy `color`, `dot`, default Slot and `.tag` selectors remain stable.
- Semantic blue, green, orange, red, gray and purple colors coexist with arbitrary CSS colors. Soft, Solid and Outlined variants, `sm`/`md`/`lg` sizes and optional pill rounding cover status and filter density without page-specific classes.
- `checkable` and `interactive` select a native Button; `href` selects a native Anchor. Checkable state is controlled with `checked` / `update:checked`, exposes `aria-pressed`, and publishes pointer/keyboard activation metadata.
- `closable` creates an independent native close control with a localized accessible name. Close does not activate the label and leaves collection mutation to the consumer.
- `_blank` links receive secure relation defaults. Disabled links lose navigation and tab order; disabled buttons use native semantics. Visible focus, forced-colors, RTL logical spacing and Reduced Motion preserve the same contract.
- Prefix, suffix, default and close-icon Slots expose checked/disabled state. The instance exposes root, action and close refs plus `focus` and `focusClose` methods.
- Component center, one-page HTML, standalone consumer, root/subpath declarations, isolated CSS, generated API, deterministic SSR and offline installed-tarball verification remain synchronized.

P60 retains 89 public components while advancing to 434 locale keys and generated coverage of 1,083 Props, 375 Events and 191 Slots. Release gates require 33 visual baselines, 51 zero-violation Axe scenarios, 55 interactions per Chromium/Firefox/WebKit engine, 53 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 74. Maturity P61: semantic interactive timelines

- `UiTimeline` accepts consumer-owned items and maps stable identity, title, description, time, machine-readable datetime, status, custom color, icon, link and disabled values through string or function field adapters. Source arrays and records are never mutated; `reverse` only changes presentation order.
- Vertical/horizontal orientation, start/end/alternate placement, content/opposite time, three sizes, outlined/solid dots and solid/dashed/dotted/hidden connectors are orthogonal visual controls. Horizontal tracks remain scrollable, while narrow vertical alternate/opposite layouts collapse to a readable single side.
- Status values resolve to default, primary, success, warning, error, info or pending tokens; consumer colors use a scoped custom property. Disabled text preserves WCAG contrast, forced-colors exposes rails and selection, and Reduced Motion removes pending/skeleton animation.
- Passive timelines render semantic `ol` content. Interactive/selectable items render native buttons, links render native anchors with secure `_blank` defaults, disabled links lose navigation, and machine-readable `<time datetime>` stays paired with visible copy.
- Selectable mode supports controlled `modelValue` and uncontrolled `defaultValue`; updates publish value plus previous/current selection and pointer/keyboard/API source metadata. `item-click`, `activate` and focus events remain distinct so consumer side effects can be chosen precisely.
- One roving tab stop follows selection and focus. Vertical ArrowUp/ArrowDown and horizontal logical ArrowLeft/ArrowRight navigate enabled records; Home/End jump to enabled boundaries; optional looping wraps without stopping on disabled stages.
- Pending, loading skeleton and empty copy remain localized and accessible through `aria-live`, `aria-busy` and named ordered-list semantics. Item, dot, title, description, time, opposite, pending and empty Slots share typed record scopes.
- Root/subpath runtime, declarations, isolated CSS, generated API, SSR, component center, static HTML and standalone consumer stay in parity. P61 gates require 34 visual baselines, 52 zero-violation Axe scenarios, 56 interactions in each of Chromium/Firefox/WebKit, 55 negative type assertions, 438 locale keys and an offline installed-tarball consumer.

## 75. Maturity P62: semantic navigable steps

- `UiSteps` accepts consumer-owned items and maps stable identity, title, description, subtitle, status, icon and disabled values through string or function field adapters. Existing `items`, `current` and `direction` usage remains compatible, while `modelValue` takes precedence and `defaultCurrent` supplies uncontrolled state.
- Dedicated `.ui-step-connector` rails are independent of title width, so horizontal lines remain visible across short, long and localized labels. Horizontal, vertical, horizontal-label and vertical-label layouts, three sizes, Default/Navigation/Inline appearances and responsive fallback remain orthogonal presentation controls.
- Finish, process, wait and error states derive from the current index unless an item supplies an explicit status. Custom icons, subtitles, descriptions, disabled indexes, global disabled state, loading skeletons and localized empty content preserve stable ordered-list semantics.
- `interactive` and Navigation mode render native buttons. Controlled changes publish model/current compatibility updates plus index, previous index, stable key, source item, status and pointer/keyboard/API source metadata; linear flow rejects later jumps and disabled stages are never activated.
- One roving tab stop follows the active stage. Logical ArrowLeft/ArrowRight, ArrowUp/ArrowDown, Home and End navigate enabled stages, optional looping wraps, and RTL reverses horizontal intent without reversing consumer data.
- Item, icon, title, subtitle, description, loading and empty Slots share typed record scopes. The instance exposes root, current/first/last/item focus plus go-to, next and previous methods with matching root and component-subpath declarations.
- Visible focus, forced-colors rails, Reduced Motion, `aria-current`, `aria-busy`, localized naming and deterministic SSR cover accessibility and server rendering. Component center, one-page HTML, standalone consumer, isolated CSS, generated API and offline installed-tarball verification remain synchronized.

P62 retains 89 public components while advancing to 440 locale keys and generated coverage of 1,138 Props, 385 Events and 206 Slots. Release gates require 35 visual baselines, 53 zero-violation Axe scenarios, 57 interactions per Chromium/Firefox/WebKit engine, 57 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 76. Maturity P63: semantic collapsible breadcrumbs

- `UiBreadcrumb` accepts consumer-owned paths and maps stable identity, label, native href, icon, disabled and current values through string or function field adapters. Primitive labels and string `to` fallbacks remain supported, source arrays stay immutable, and stable DOM identity does not depend on display text.
- The final record is current by default; `currentKey` or an explicit current field can select another record. Exactly one rendered path item receives `aria-current="page"`; disabled records retain context with `aria-disabled` while leaving the activation path.
- Native anchors keep normal browser behavior and secure `_blank` defaults. Callback or opt-in interactive records use native buttons. The existing `navigate(item)` first argument remains stable while metadata adds key, index, label, href, current, disabled and pointer/keyboard/API source; click and focus events remain independently observable.
- `maxItems` values of three or more collapse intermediate levels into a localized native disclosure button. Leading/trailing context counts are configurable, `expanded` supports controlled state, `defaultExpanded` supports local state, and keyboard disclosure restores focus to the first newly revealed action.
- Icon/text/custom separators, `sm`/`md`/`lg`, wrap/nowrap overflow, bounded truncation, item icons, Loading and Empty form orthogonal presentation controls. RTL directional icons, logical properties, visible focus, forced-colors and Reduced Motion preserve the same contract.
- Item, icon, separator, overflow, loading and empty Slots expose typed scopes. The instance exposes root, item/first/last focus, programmatic navigation, expand, collapse and toggle methods with root/component-subpath declaration parity.
- The semantic structure remains one named `nav` containing an ordered list. Loading assistive copy remains a list item with a nested live status, SSR is deterministic, and PageHeader, component center, static HTML, standalone consumer, isolated CSS, generated API and offline installed-tarball verification remain synchronized.

P63 retains 89 public components while advancing to 443 locale keys and generated coverage of 1,159 Props, 389 Events and 212 Slots. Release gates require 36 visual baselines, 54 zero-violation Axe scenarios, 58 interactions per Chromium/Firefox/WebKit engine, 59 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 77. Maturity P64: production contextual tooltips

- `UiTooltip` keeps the existing content, placement, disabled, offset and Hover + Focus defaults while adding Hover/Focus/Click/Manual trigger composition. Active reasons are independent: a focused trigger remains described after pointer leave, and timer re-entry cancels stale closes.
- Controlled `open` and uncontrolled `defaultOpen` share one visibility contract. Update, open-change, show and hide events publish previous state, source, resolved placement and the source event; the instance exposes root/panel refs plus show, hide, toggle, trigger focus and position update methods.
- `showDelay` / `hideDelay`, second-click toggling, outside pointer dismissal and Escape dismissal cover dense admin interactions. Disabled and empty content suppress creation; prop changes close stale uncontrolled state and clean global listeners/timers.
- Logical top/bottom/left/right start/end placement coexists with legacy top-left/top-right values. Floating collision flip/shift reacts to viewport, scroll, resize, panel/trigger resize, offset and z-index changes. Arrow alignment, bounded wrapping and viewport-safe maximum width avoid page-local overlay CSS.
- The tooltip is non-interactive by design; actionable content belongs in Popover. Teleport targeting, inline rendering and scoped theme/direction attributes support embedded apps, nested providers and SSR.
- While visible, the component merges its ID into the first actionable trigger's `aria-describedby`; on close/unmount it removes only its own ID and restores existing descriptions. The default Slot exposes open/describedby/actions, while content and arrow Slots expose resolved placement.
- Component center, one-page HTML, standalone consumer, root/subpath declarations, isolated CSS, generated API, deterministic SSR and offline installed-tarball verification remain synchronized.

P64 retains 89 public components and 443 locale keys while generated coverage advances to 1,173 Props, 393 Events and 214 Slots. Release gates require 37 visual baselines, 55 zero-violation Axe scenarios, 59 interactions per Chromium/Firefox/WebKit engine, 61 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 78. Maturity P65: production interactive popovers

- `UiPopover` keeps the existing controlled `modelValue`, placement, width, title, offset, default Click trigger and outside-dismiss behavior while adding uncontrolled `defaultOpen` and Click/Hover/Focus/Manual trigger composition. Hover and Focus reasons persist across the trigger-to-panel boundary, and cancellable show/hide timers prevent re-entry flicker.
- Update, open-change, open and close events publish previous/requested state, source, resolved logical placement and source event. Exposed root/trigger/panel refs plus show, hide, toggle, trigger/panel focus and position update methods support orchestration without private DOM access.
- Outside pointer, Escape and optional content-click dismissal are independent policies. Disabled state suppresses opening; loading remains dismissible while exposing `aria-busy`. Width, minimum/maximum width, Arrow, custom Portal target, inline rendering and z-index are orthogonal presentation controls.
- Non-modal focus remains unchanged by default. `autoFocus` moves into actionable panel content, `trapFocus` loops Tab only when requested, and `returnFocus` restores the trigger for Escape or explicit completion without stealing focus after an outside pointer action.
- The first actionable trigger receives merged `aria-expanded`, `aria-controls`, `aria-haspopup` and disabled state while mounted; consumer-owned values are restored on trigger replacement or unmount. The panel uses a configurable interactive popup role with title/label relationships and deterministic SSR output.
- Title, body, footer and Arrow Slots expose open/close/placement/loading actions. Collision flip/shift, logical start/end placement, scoped portal appearance/direction, RTL, Reduced Motion and forced-colors preserve the contract across embedded apps.
- Component center, one-page HTML, standalone consumer, root/subpath declarations, isolated CSS, generated API, deterministic SSR and offline installed-tarball verification remain synchronized.

P65 retains 89 public components and 443 locale keys while generated coverage advances to 1,193 Props, 394 Events and 217 Slots. Release gates require 38 visual baselines, 56 zero-violation Axe scenarios, 60 interactions per Chromium/Firefox/WebKit engine, 63 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 79. Maturity P66: production dropdown menus

- `UiDropdown` keeps existing `modelValue`, items, placement, disabled, default Click trigger, outside dismissal and selection behavior while adding uncontrolled `defaultOpen`, controlled/uncontrolled active index and Click/Hover/Focus/Contextmenu/Manual trigger composition.
- Headings and dividers remain outside the activation path; disabled items are skipped. Menu items support descriptions, shortcuts, danger state, links, checkbox/radio roles and checked semantics without consumer-side wrappers.
- Arrow Up/Down, Home/End, PageUp/PageDown and incremental Typeahead share roving focus. Enter/Space activate, Escape closes and returns focus, while Tab closes then continues to the logically adjacent page control even when the menu is teleported.
- Outside, Escape and selection dismissal remain independent. Update, open-change, active-change, open, close and select events expose source, event, item, value, placement and prior-state metadata; instance methods cover open, focus, selection and position orchestration.
- Trigger ARIA relationships merge and restore through mount, replacement and unmount. Loading/empty states, minimum/maximum widths, custom Portal target, collision flip/shift, logical RTL placement, scoped appearance/direction, Reduced Motion, forced colors and SSR stay synchronized.
- Component center, one-page HTML, standalone consumer, root/subpath declarations, isolated CSS, generated API and installed-tarball verification all exercise the same public contract.

P66 retains 89 public components and 443 locale keys while generated coverage advances to 1,215 Props, 398 Events and 219 Slots. Release gates require 39 visual baselines, 57 zero-violation Axe scenarios, 61 interactions per Chromium/Firefox/WebKit engine, 65 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 80. Maturity P67: production collapse and accordion

- `UiCollapse` keeps existing items, controlled `modelValue`, accordion and bordered usage while adding `defaultValue`, normalized scalar/array state, field adapters and per-item overrides for identity, labels, content, extra content, disabled state, icon visibility, heading level and render lifetime.
- Multiple panels may be independently open. Accordion mode enforces one panel, and `collapsible=false` prevents the last enabled item from closing. Update, change, toggle, before-change, blocked, error, focus and transition events expose stable item/key/index/source metadata.
- Arrow Up/Down, Home and End move roving focus among enabled native heading buttons, with optional looping. Each trigger owns `aria-expanded`, `aria-controls` and pending state; every rendered panel is a labelled Region.
- `beforeToggle` supports synchronous or asynchronous policy checks. Pending keys suppress duplicate requests and expose `aria-busy`; false results and thrown errors remain independently observable without corrupting controlled state.
- Immediate render, lazy render, destroy-on-hide and per-item force-render policies compose with animated grid transitions, configurable duration and Reduced Motion. Sizes, bordered/Ghost surfaces, icon position, Loading, Empty, RTL and forced-colors remain orthogonal.
- Header, content, extra, icon, Loading, Empty and keyed item Slots expose typed scopes. Root/subpath declarations and exposed open/close/toggle/bulk/focus methods stay aligned with component center, one-page HTML, standalone consumer, deterministic SSR, isolated CSS, generated API and installed-tarball verification.

P67 retains 89 public components while advancing to 445 locale keys and generated coverage of 1,237 Props, 405 Events and 225 Slots. Release gates require 40 visual baselines, 58 zero-violation Axe scenarios, 62 interactions per Chromium/Firefox/WebKit engine, 67 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.

## 81. Maturity P68: production button actions

- `UiButton` keeps existing variant, size, icon, loading, disabled and native type usage while adding logical icon placement, explicit icon sizing, Loading text, Block, Round, Circle, Pressed, prefix/suffix Slots and accessible icon-only presentation.
- Without `href` the root is a native Button and preserves form, name, value and autofocus attributes. With `href` it is a native Anchor; disabled/loading links leave the tab and activation paths, while `_blank` links gain secure relationship defaults.
- Click emits the native event first and stable activation metadata second. Optional synchronous or asynchronous `action` publishes start, success and error events; internal pending state locks duplicate activation and composes with externally controlled Loading.
- Default prevention and propagation stopping are explicit policies. Exposed root/pending refs plus focus, blur and click methods support orchestration without private DOM access.
- `aria-busy`, `aria-disabled`, `aria-pressed`, native disabled state, fallback icon-only labels, logical RTL order, Reduced Motion and forced-colors remain aligned across Button, Anchor and form contexts.
- Component center, one-page HTML, standalone consumer, root/subpath declarations, isolated CSS, generated API, deterministic SSR and installed-tarball verification exercise the same contract.

P68 retains 89 public components and 445 locale keys while generated coverage advances to 1,255 Props, 409 Events and 229 Slots. Release gates require 41 visual baselines, 59 zero-violation Axe scenarios, 63 interactions per Chromium/Firefox/WebKit engine, 69 negative type assertions, an isolated tarball consumer and 18 absolute performance ceilings.
