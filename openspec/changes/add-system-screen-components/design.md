## 背景

`@system-ui-js/base` 当前是围绕 `BaseWindow` 系列组件构建的薄封装层：`src/lib/index.ts` 只导出窗口与主题相关 API，Demo 入口 `src/App.tsx` 也直接在页面中渲染单个窗口，通过 `src/styles/app.css` 中针对首个子节点的样式规则完成居中与尺寸控制。这种结构足以验证窗口本身，但无法表达“系统 → 屏幕 → 小部件”的桌面层级，也无法为后续开始栏、桌面图标等系统级组件提供稳定宿主。

底层依赖 `@system-ui-js/chameleon` 已经提供 `SystemHost` 与 `CScreen` 能力，因此本次变更不需要新建系统模型，而是需要在 `@system-ui-js/base` 中补齐面向业务方的公开抽象，并让现有 `BaseWindow` 能自然运行在新的系统/屏幕容器中。

## Goals / Non-Goals

**Goals:**
- 对外新增 `System` 与 `Screen` 组件，补齐系统级容器与屏幕容器抽象。
- 为 `System` 提供 `onBoot` 与 `onLoad` 生命周期钩子，满足初始化与挂载完成两类扩展点。
- 让 `Screen` 成为适合承载 `CWidget`/窗口类组件的相对定位容器，为开始栏等后续组件保留布局基础。
- 将 Demo 默认结构调整为 `System -> Screen -> BaseWindow`，去掉当前依赖页面首个子节点的布局技巧。
- 保持现有 `BaseWindow` 公开能力与构建流程不变，不新增依赖，不破坏已有窗口 API。

**Non-Goals:**
- 不在本次变更中实现开始栏、任务栏、多桌面切换等新交互。
- 不改造 `BaseWindow` 的内部渲染模型或调整 `@system-ui-js/chameleon` 的底层实现。
- 不为 `System` 提供复杂的全局状态管理、窗口编排或屏幕注册中心。
- 不处理自定义主题系统的全面抽象，仅覆盖当前仓库已经稳定支持的系统/主题组合。

## Decisions

### 1. 基于 `SystemHost` 与 `BaseThemeProvider` 组合实现 `System`

`System` 将作为新的公开组件，内部组合 `@system-ui-js/chameleon` 的 `SystemHost` 与现有 `BaseThemeProvider`。`SystemHost` 负责建立系统类型与主题上下文，`BaseThemeProvider` 继续承担窗口系组件依赖的主题 className 注入能力。`System` 对外暴露 `children`、`systemType`、`theme`、`className`、`onBoot`、`onLoad` 等 props，并提供默认值 `systemType="windows"`、`theme="win98"`，与当前 Demo 主题保持一致。

这样可以最大化复用底层桌面语义，同时保证现有 `BaseWindow` 仍能通过原有主题解析逻辑工作。相比“仅用普通 `div` 搭建系统容器”的方案，这种组合方式更适合后续接入开始栏、桌面图标等依赖系统上下文的组件；相比“只用 `SystemHost` 不包裹 `BaseThemeProvider`”的方案，这能避免窗口组件与新容器之间出现主题上下文脱节。

### 2. 使用 `CScreen` 薄封装 `Screen`，并通过基础样式约束容器语义

`Screen` 将基于 `CScreen` 做薄封装，对外暴露最小必要 props（如 `children`、`className`、`screenClassName`、`theme`、`systemType`），同时附加基础 className，确保其默认具备 `position: relative`、`width: 100%`、`height: 100%`、`overflow: hidden` 等屏幕容器语义。这样 `BaseWindow`、开始栏和其他 `CWidget` 后续都能以屏幕为定位参考系，而不再依赖页面级样式 hack。

相比“直接暴露 `CScreen` 原始组件”的方案，`Screen` 可以为 `@system-ui-js/base` 提供稳定的样式前缀与约束；相比“用普通容器模拟屏幕”的方案，继续复用底层 `CScreen` 更利于保持与 `chameleon` 系统语义一致。

### 3. 生命周期采用 `onBoot -> useLayoutEffect`、`onLoad -> useEffect` 的双阶段模型

`System` 的 `onBoot` 用于系统初始化，采用初次挂载时的 `useLayoutEffect` 触发；`onLoad` 用于系统已挂载完成后的通知，采用初次挂载时的 `useEffect` 触发。二者都通过 ref 做单次调用保护，避免同一次挂载内重复执行。

选择双 effect 的原因是：`onBoot` 应更靠近容器建立完成但尚未进入普通副作用阶段的时机，适合初始化屏幕资源或同步注册；`onLoad` 更适合日志上报、异步启动等挂载后动作。相比把两个钩子都放进同一个 `useEffect`，这种方案语义更清晰；相比在 render 阶段直接调用回调，则更符合 React 副作用约束。

### 4. 公开 API 采用新文件承载，并保持现有窗口 API 不变

新增实现将集中在 `src/lib/system.tsx`（或等价命名文件）与对应基础样式中，`src/lib/index.ts` 只增加新的导出与类型导出，不改动已有 `BaseWindow` 系列命名和行为。对外新增组件名采用 `System`、`Screen`，而不是再引入 `BaseSystem`、`BaseScreen`，以突出它们在桌面结构中的核心语义，并与变更提案中的能力命名保持一致。

替代方案是沿用 `Base` 前缀统一命名，但那会让组合树变成 `BaseThemeProvider -> BaseSystem -> BaseScreen -> BaseWindow`，可读性较差，也不利于将 `System`/`Screen` 表达成更上层的结构概念。本次先接受命名上的过渡差异，保留后续是否补充别名导出的空间。

### 5. Demo 布局从“页面居中单窗”切换为“屏幕内演示”，但不把通用布局逻辑塞进 `Screen`

Demo 首页将改为：页面根节点只负责背景与最外层空间，`System` 负责系统容器，`Screen` 负责屏幕边界与定位上下文，窗口的居中展示规则迁移到 Demo 专用样式类中，而不是继续依赖 `.workspace-stage > :first-child` 这样的结构性选择器。`Screen` 本身只保证通用的相对定位与尺寸语义，不自动为子组件做居中、缩放或首子节点处理。

这样可以保持 `Screen` 的通用性，并避免未来当屏幕里出现多个小部件时，通用组件层混入 Demo 特殊逻辑。相比把所有布局规则内置进 `Screen`，Demo 专用样式更容易后续替换为开始栏或多窗口展示。

## Risks / Trade-offs

- [React StrictMode 下开发环境可能出现双挂载] → 通过 ref 限制单次挂载内重复调用，并在文档中明确回调应保持幂等。
- [`SystemHost` 的 `theme` 类型只接受内建主题 ID] → `System` 主题输入先收敛到仓库已支持的 `win98` / `winxp` / `default`，自定义主题 className 继续由窗口级能力承担。
- [新导出命名与既有 `BaseWindow` 风格不完全一致] → 保持现有窗口 API 不动，先用清晰的系统名词建立层级；若后续命名一致性成为问题，再补充别名导出。
- [Demo 从单窗口切换为系统层级后，样式会比当前多一层容器] → 将新增样式限定在 Demo 作用域与基础屏幕 className 下，避免影响窗口组件本身。
- [底层 `chameleon` 的 `SystemHost`/`CScreen` 行为文档较少] → 先采用最小封装策略，只透传必要 props，减少对未知内部行为的耦合。

## Migration Plan

1. 新增 `System` 与 `Screen` 组件实现、类型定义及基础样式，挂入 `src/lib` 公开导出。
2. 在 Demo 中将原有 `BaseThemeProvider -> BaseWindow` 结构调整为 `System -> Screen -> BaseWindow`。
3. 将窗口居中与视口尺寸规则迁移到 Demo 专用屏幕样式，移除依赖 DOM 结构的首子节点定位规则。
4. 通过构建或针对性校验确认导出、类型与 Demo 渲染都正常。
5. 如果需要回滚，只需移除新增导出、恢复 Demo 入口结构与样式，不涉及数据迁移或外部依赖回退。

## Open Questions

- 是否需要在 `System`/`Screen` 之外同步提供 `BaseSystem`/`BaseScreen` 别名，以保持公开 API 命名风格一致？
- `onBoot` 与 `onLoad` 是否需要在文档中明确声明为仅在客户端环境生效，并要求消费者自行保证幂等？
- Demo 在引入 `Screen` 后，是否要立即预留开始栏区域样式，还是先保持单窗口全屏幕展示，等后续能力再扩展？
