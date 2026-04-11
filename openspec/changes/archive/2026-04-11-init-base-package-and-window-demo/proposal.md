## Why

当前项目仅具备 React + Vite + TypeScript 的初始化骨架，尚未形成可对外发布的基础包，也没有用于展示组件能力的 Demo 站点。现在需要把仓库推进到可同时支撑 `@system-ui-js/base` 包发布与 Demo 演示的状态，以便后续围绕基础能力持续迭代并对外验证效果。

## What Changes

- 将当前工程从仅用于初始化验证的前端脚手架，扩展为可产出 `@system-ui-js/base` 的包工程。
- 引入面向展示的 Demo 站点能力，并以 `@system-ui-js/chameleon` 作为底层组件库进行集成。
- 提供首个 Demo 场景，优先展示 Window 相关界面与交互效果，替换当前最小示例页面。
- 明确包构建产物与 Demo 展示产物可分别构建和发布，支撑双形态交付。

## Capabilities

### New Capabilities
- `base-package-distribution`: 定义 `@system-ui-js/base` 的包元数据、构建产物与发布形态要求。
- `window-demo-showcase`: 定义 Demo 展示站接入 `@system-ui-js/chameleon` 并提供 Window 首屏展示的能力要求。

### Modified Capabilities
- 无

## Impact

- 影响根目录工程配置，如 `package.json`、构建脚本与产物组织方式。
- 影响前端入口与展示页面，如 `src/main.tsx`、`src/App.tsx` 及相关样式文件。
- 新增对 `@system-ui-js/chameleon` 的依赖与集成约束。
- 将新增对应的 OpenSpec 能力规格、设计说明与实现任务拆解。
