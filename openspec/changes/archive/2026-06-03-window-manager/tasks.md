## Tasks

### Plan: window-manager

- [x] 1. Add Vitest + React Testing Library test foundation
  - 添加开发依赖：`vitest`、`jsdom`、`@testing-library/react`、`@testing-library/dom`、`@testing-library/jest-dom`
  - 添加 `vitest.config.ts` 配置
  - 添加 `src/test-setup.ts` 初始化文件
  - 添加 `package.json` 测试脚本

- [x] 2. Define WindowManager public types and lifecycle contract
  - 定义 `WindowSlotContent`、`WindowLifecycleStatus`、`WindowCreateOptions` 类型
  - 定义 `WindowContent` 和 `WindowInstance` 接口
  - 定义 `WindowManager` 类骨架和 `createWindow` 方法签名
  - 添加管理器检查辅助方法：`getWindow(id)`、`getWindows()`、`destroyAll()`

- [x] 3. Implement browser render host and native slot adapter
  - 实现内部宿主创建（`class="sb-window-manager-host"`）
  - 使用 `createRoot` 从 `react-dom/client` 进行管理器拥有的 React 渲染
  - 实现插槽渲染器：React 内容正常渲染，`HTMLElement` 内容附加到 ref 容器
  - 使用 `WeakSet<HTMLElement>` 跟踪活跃原生元素，重复使用时抛出错误

- [x] 4. Implement WindowManager and WindowInstance lifecycle behavior
  - 实现 `createWindow`：分配稳定 ID、注册实例、立即渲染
  - 实现 `show`、`hide`、`update`、`destroy`
  - 实现 `getWindow`、`getWindows`、`destroyAll`
  - 确保 `destroy()` 幂等，销毁后 `show`/`hide`/`update` 抛出错误
  - 多窗口共存，使用确定性默认几何位置

- [x] 5. Compose managed window UI and package styles
  - 使用 `BaseWindow`、`BaseWindowTitle`、`BaseWindowBody` 渲染每个管理窗口
  - 标题插槽放入 `BaseWindowTitle`，主体插槽放入 `BaseWindowBody`
  - 状态栏渲染在 `sb-window-manager-status-bar` 类元素中
  - 使用 `BaseWindowTitle` 的 `closable` 和 `onClose` 调用实例 `destroy()`
  - 添加 CSS 样式到 `src/lib/styles/base.css`

- [x] 6. Export WindowManager API and protect build/CI hygiene
  - 从 `src/lib/index.ts` 导出 `WindowManager`、`windowManager` 和所有公共类型
  - 更新 TypeScript 构建配置排除测试文件
  - 更新 CI 工作流在 lint 后运行 `yarn test:run`
  - 验证打包输出不包含测试文件

- [x] 7. Add minimal demo usage for on-screen creation
  - 更新 `src/App.tsx` 演示 `windowManager.createWindow(...)`
  - 演示使用位置参数和 React 内容
  - 确保演示创建的窗口通过管理器宿主显示，无需 provider

### Final Verification

- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high
- [x] F4. Scope Fidelity Check — deep
