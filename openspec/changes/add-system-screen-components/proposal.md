## Why

当前 `@system-ui-js/base` 只对外提供 Window 相关能力，Demo 首页也只能用单一窗口验证基础展示，缺少对“系统 → 屏幕 → 小部件”这一更贴近桌面场景的组合抽象。现在补齐 `System` 与 `Screen` 组件，可以把生命周期钩子、屏幕容器和后续开始栏等系统级能力纳入公开 API，并让 Demo 结构更贴近真实使用方式。

## What Changes

- 新增公开的 `System` 组件，用于承载系统级容器，并向外暴露 `onBoot`（初始化）与 `onLoad`（Mounted）钩子。
- 新增公开的 `Screen` 组件，用于表示系统中的单个屏幕；一个 `System` 可以拥有多个 `Screen`。
- 约束 `Screen` 成为可承载 chameleon `CWidget` 的相对定位容器，便于窗口、开始栏等组件在屏幕内布局。
- 调整 Demo 默认结构，从“直接渲染单个窗口”改为“System → Screen → 具体演示组件”的组合方式。
- 保持现有 Window 公开能力可继续在新的 System/Screen 结构内使用，不引入额外包管理或交付流程变更。

## Capabilities

### New Capabilities
- `system-screen-components`: 定义 `@system-ui-js/base` 对外提供 `System` 与 `Screen` 组件的行为约束，包括生命周期钩子、屏幕层级关系和 `Screen` 的容器语义。

### Modified Capabilities
- `window-demo-showcase`: 默认 Demo 首屏从单一窗口展示演进为基于 `System` 与 `Screen` 组织的展示结构，同时继续使用公开导出的基础组件承载默认演示内容。

## Impact

- 影响 `src/lib` 的公开导出与组件封装，需要新增 System/Screen 相关实现与类型导出。
- 影响 `src/App.tsx` 及相关样式，默认 Demo 入口将改为基于系统与屏幕层级的结构。
- 依赖现有 `@system-ui-js/chameleon` 中的 `CWidget`/屏幕相关能力完成组合，但不新增包依赖。
