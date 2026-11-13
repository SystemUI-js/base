# WindowManager Capability - Design

## Context

### Codebase Patterns
- `BaseWindow`, `BaseWindowTitle`, `BaseWindowBody` 是 Chameleon `CWindow`, `CWindowTitle`, `CWindowBody` 的包装器
- `BaseWindowTitle` 支持 `closable?: boolean` 和 `onClose?: () => void`
- 所有包样式使用 `sb-` 前缀，位于 `src/lib/styles/base.css`
- 使用 `yarn@1.22.22`，不使用 npm
- TypeScript 模式：props 接口使用显式 `readonly` 字段

## Goals / Non-Goals

### Goals
- 实现有状态的 `WindowManager` 层，支持从位置化 `createWindow(title, body, statusBar, options?)` 调用创建、渲染、隐藏、显示、更新和销毁多个窗口
- 添加 Vitest + React Testing Library 测试基础设施，使生命周期和 DOM 行为可验证
- 自动创建浏览器 DOM 宿主，无需消费者提供 provider 即可显示创建的窗口

### Non-Goals
- 不实现用户可配置选项；`options` 被接受但故意没有行为
- 不添加焦点管理、z-index 排序、模态堆叠、拖拽策略、持久化、序列化、最小化、任务栏、事件总线、订阅或动画
- 不要求消费者手动挂载 provider/根组件
- 不绕过 `BaseWindow`、`BaseWindowTitle` 或 `BaseWindowBody`

## Decisions

### 1. Window Lifecycle States
- **决策内容**: 窗口生命周期状态定义为 `initializing | visible | hidden | destroyed`
- **选择原因**: 覆盖从创建到销毁的完整生命周期，状态转换清晰明确
- **备选方案**: 仅使用 `visible | hidden`，不区分初始化和销毁状态
- **不采用原因**: 缺乏初始化状态会导致首次渲染时机不明确，缺乏销毁状态无法区分已销毁窗口和未创建窗口

### 2. Empty Options Parameter
- **决策内容**: `options` 参数类型为 `Readonly<Record<string, never>>`，接受空对象但拒绝任意选项键
- **选择原因**: 保留未来扩展的可能性，同时通过 TypeScript 多余属性检查防止误用
- **备选方案**: 完全省略 options 参数
- **不采用原因**: 用户需求明确提到 "options: 暂时留空"，需要保留该参数位置

### 3. Native Element Ownership with WeakSet
- **决策内容**: 使用 `WeakSet<HTMLElement>` 跟踪活跃的原生元素，防止跨活跃窗口重用
- **选择原因**: WeakSet 自动清理，无需手动管理内存；提供运行时安全保障
- **备选方案**: 使用 Map 或 Set 跟踪
- **不采用原因**: Map/Set 需要手动清理，容易造成内存泄漏

### 4. Auto-created Browser Host
- **决策内容**: 在 `document.body` 下自动创建管理器宿主，类名为 `sb-window-manager-host`
- **选择原因**: 简化 API，消费者无需手动挂载 provider
- **备选方案**: 要求消费者挂载 Provider 组件
- **不采用原因**: 增加使用复杂度，与用户需求"无需 provider"相悖

### 5. No Focus/Z-index Management
- **决策内容**: 不实现焦点管理、z-index 排序、模态堆叠等高级窗口管理功能
- **选择原因**: 保持实现简洁，专注于核心生命周期管理
- **备选方案**: 实现完整的桌面窗口系统
- **不采用原因**: 超出当前需求范围，防止范围蔓延

## Risks / Trade-offs

### 1. TypeScript Strict Typing Issue
- **风险**: `instance: undefined as unknown as WindowInstance` 使用双重断言满足初始化，削弱了严格类型检查
- **缓解措施**: 后续通过分离 `instances` map 解决，移除双重断言

### 2. DOM Ownership and Cleanup
- **风险**: DOM 所有权和清理容易泄漏，特别是原生元素的管理
- **缓解措施**: 
  - 使用 `createRoot` 和 `unmount()` 确保 React 树正确清理
  - 原生元素从管理器 DOM 中分离，不恢复到原始父节点
  - 测试覆盖宿主创建和清理

### 3. SSR/Non-browser Environment
- **风险**: 在服务器端渲染环境中访问 `document` 会导致错误
- **缓解措施**: 仅在 `createWindow`/宿主解析路径中访问 `document`，模块导入时保持 SSR 安全

### 4. Test Infrastructure Complexity
- **风险**: Vitest + jsdom + React Testing Library 的配置可能引入兼容性问题
- **缓解措施**: 
  - 使用 `globals: true` 配置
  - 注册 `afterEach(cleanup)` 确保测试清理
  - 显式销毁管理器宿主避免测试间污染

## Migration Plan

### 阶段 1: 测试基础设施 (Wave 1)
- 添加 Vitest + React Testing Library 依赖
- 配置 `vitest.config.ts` 和 `src/test-setup.ts`
- 添加测试脚本到 `package.json`

### 阶段 2: API 契约定义 (Wave 1)
- 定义 `WindowManager` 类和 `WindowInstance` 接口
- 定义类型：`WindowSlotContent`、`WindowLifecycleStatus`、`WindowCreateOptions`
- 实现空方法骨架（抛出 `Not implemented`）

### 阶段 3: 渲染宿主和原生插槽适配器 (Wave 2)
- 实现浏览器宿主创建和管理
- 实现 React 和 HTMLElement 插槽渲染
- 实现原生元素重复检测

### 阶段 4: 生命周期行为实现 (Wave 2)
- 实现 `createWindow`、`show`、`hide`、`update`、`destroy`
- 实现 `getWindow`、`getWindows`、`destroyAll`
- 添加生命周期状态转换测试

### 阶段 5: UI 组合和样式 (Wave 2)
- 使用 `BaseWindow`、`BaseWindowTitle`、`BaseWindowBody` 组合
- 添加关闭按钮和状态栏支持
- 添加 CSS 样式

### 阶段 6: 导出和构建/CI 卫生 (Wave 3)
- 导出公共 API
- 排除测试文件于构建输出
- 更新 CI 工作流

### 阶段 7: 演示集成 (Wave 3)
- 在 `src/App.tsx` 中添加演示按钮
- 验证构建和运行
