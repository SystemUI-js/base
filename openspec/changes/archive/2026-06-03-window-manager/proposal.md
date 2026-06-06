# WindowManager Capability - Proposal

## Why

### Original Request
User requested: "增加窗口管理能力，增加 WindowManager，管理窗口的初始化、销毁等等状态，要有一个 createWindow 方法，参数：title: React 或原生组件，body: React 或原生组件，statusBar: React 或原生组件，options: 暂时留空，返回 Window 实例，并显示在屏幕".

### Background
当前项目 `@system-ui-js/base` 提供了基础的 `BaseWindow`、`BaseWindowTitle`、`BaseWindowBody` 组件，但缺乏一个统一的管理层来创建、销毁和管理多个窗口实例。需要一个库级别的 `WindowManager` 来提供有状态的窗口管理能力。

## What Changes

### Core Objective
实现一个库级别的 `WindowManager`，能够创建并立即显示多个管理窗口，为每个创建的窗口返回生命周期感知的实例，并能干净地销毁窗口 DOM/资源。

### Deliverables
- `src/lib/window-manager.tsx` - WindowManager 核心实现
- `src/lib/window-manager.test.tsx` - 测试文件
- `vitest.config.ts` - Vitest 配置
- `src/test-setup.ts` - 测试初始化
- `package.json` 测试脚本/依赖更新和 `yarn.lock`
- `.github/workflows/ci-pr.yml` 测试步骤
- `src/lib/index.ts` 公共导出
- `src/lib/styles/base.css` WindowManager 宿主/状态样式
- `src/App.tsx` 最小化演示集成

### Must Have Capabilities
- `WindowManager#createWindow(title, body, statusBar, options?)` 其中 title、body、statusBar 接受 `React.ReactNode | HTMLElement`
- `options` 为可选的空保留对象：`Readonly<Record<string, never>>`
- 导出类 `WindowManager` 和导出单例 `windowManager`
- `WindowInstance` 包含：只读 `id`、`status`、`show()`、`hide()`、`update(next)`、`destroy()`
- 生命周期语义：`initializing → visible → hidden → destroyed`
- 浏览器宿主行为：自动创建在 `document.body` 下，SSR/非浏览器环境报错
- 使用现有 `BaseWindow`、`BaseWindowTitle`、`BaseWindowBody` 包装器

## Impact

### Affected Components
- `src/lib/window-manager.tsx` (新增)
- `src/lib/index.ts` (新增导出)
- `src/lib/styles/base.css` (新增样式)
- `src/App.tsx` (演示集成)

### Build & CI Impact
- 新增 `yarn test:run` 步骤到 CI 工作流
- 新增 Vitest 和相关测试依赖
- 需排除测试文件于构建输出外

### Verification
- `yarn test:run` 通过，覆盖 React 插槽渲染、原生 HTMLElement 插槽渲染、多窗口、显示/隐藏、更新、幂等销毁、SSR 守卫行为
- `yarn lint` 通过
- `yarn build` 通过，测试声明不发射到 `dist`
- `yarn pack` 通过
