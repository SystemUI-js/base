# FileManager Drag-Into-Folder Move - Proposal

## Why

### Original Request

用户要求：“利用 chameleon 的 CList 的拖动功能，封装文件列表组件（如果有就优化）。实现拖动文件或文件夹到文件夹上，抬起鼠标则移动到这个文件夹内。” 并补充要求文件列表支持 `props.renderItem(displayMode, sizeRatio, entry, position)`，`Demo` 中返回/前进等按钮不包括在文件列表组件内，`file-system-browser` 实例作为 props 注入，非法或失败拖拽默认静默 no-op，并新增 Playwright 真实浏览器拖拽验证。

### Background

当前 `src/lib/fileManager/index.tsx` 仅渲染只读目录项，没有拖拽移动能力，也没有提供自定义渲染入口。`FileSystemLike` 当前只暴露 `readdir`，缺少 `rename`，因此使用方无法在不直接持有 `file-system-browser` 实例的情况下完成文件夹内移动。Demo 的返回/前进/删除/新建/上传等控件已经在 FileManager 外层实现，但与 FileManager 内部能力的边界没有在 spec 中固化。同时，仓库目前只有 Vitest，没有覆盖真实浏览器 HTML5 拖拽行为的 E2E 工具链。

## What Changes

### Core Objective

把 `FileManager` 扩展为可复用文件列表组件：

- 支持 `displayMode = 'list' | 'icon'` 上下文（不引入 `'grid'`）。
- 支持调用方传入 `renderItem(displayMode, sizeRatio, entry, position)` 自定义条目渲染；当未传入时保持现有默认渲染。
- `sizeRatio` 由调用方定义语义，组件仅做 `[0, 1]` 钳制并透传，不做 CSS 尺寸映射。
- 基于 Chameleon `CList.onItemDragInto(payload.position === 'inside')` 触发文件/文件夹拖入目标文件夹的移动，移动通过 `fileSystem.promises.rename(oldPath, newPath)` 完成，不引入服务层封装。
- 暴露 `onBeforeMove` / `onMoveSuccess` / `onMoveError` 扩展点；非法或失败拖拽默认静默 no-op，错误以语义化 reason 报出（`invalid-target` / `self-target` / `descendant-target` / `conflict` / `cancelled` / `rename-failed`）。
- Demo 维持现有外层导航控件（返回/前进/删除/新建/上传等）位于 FileManager 之外，并通过 `onMoveError` 接入 Demo 自身的通知层。
- 新增 `@playwright/test` 作为真实浏览器拖拽的 E2E 工具层，作为 Vitest 的**追加**而不是替换；Chromium-only、不在 CI 缓存浏览器二进制；Vitest 仍然是单元与组件测试的主跑器。

### Deliverables

- `src/lib/fileManager/types.ts`、`src/lib/fileManager/index.tsx` 扩展 props、移动上下文、拖拽守卫与刷新流程。
- `src/lib/index.ts` 重新导出新增类型：`FileManagerDisplayMode`、`FileManagerRenderPosition`、`FileManagerEntryInfo`、`FileManagerMoveContext`、`FileManagerMoveError`、`FileManagerMoveErrorReason`。
- `FileSystemLike.promises` 扩展必填 `rename(oldPath, newPath)` 与可选 `exists(path)`。
- `src/demo/file-browser-window.tsx` opt-in 拖拽，将 `onMoveError` 接入 Demo 通知层，并保持现有外层控件不变。
- `@playwright/test` 作为 devDep，根目录 `playwright.config.ts`，`e2e/` 目录测试用例，`pw:install` 与 `test:e2e` scripts。
- 本次 OpenSpec change：四个 capability 的 delta。

### Must Have

- `displayMode` 仅支持 `'list' | 'icon'`。
- `sizeRatio` 钳制到 `[0, 1]`，仅透传，无 CSS 映射。
- 拖入目标必须是文件夹；自身、子孙目录、同父目录视为无效，默认静默 no-op。
- 移动通过 `fileSystem.promises.rename` 直接调用，无中间服务层。
- Demo 导航控件保持在 FileManager 外层。
- Playwright 在 Vitest 之外**追加**运行，不替代 Vitest。

### Must NOT Have

- 不引入 `displayMode = 'grid'`。
- 不实现 CList `before` / `after` 重排、多选拖拽、跨 FileManager 拖出。
- 不把 Demo 导航控件搬进 FileManager。
- 不做乐观本地列表变更；移动成功后通过内部刷新 tick 重新 `readdir`。
- 不在 CI 缓存 Playwright 浏览器二进制。
- 不修改主 specs（`openspec/specs/` 下文件），主 specs 仅在归档阶段同步。

## Impact

### Affected Capabilities

- `window-demo-showcase`：固化 FileManager 拖入文件夹移动、`displayMode` list/icon、`sizeRatio` 钳制透传、Demo 导航控件位于 FileManager 之外的边界。
- `base-package-distribution`：公共类型 barrel 新增 6 个 FileManager 类型导出，`FileSystemLike.promises` 扩展必填 `rename` 与可选 `exists`。
- `code-quality-tooling`：在保留 Vitest 主跑器的同时追加 Playwright Chromium-only E2E 层、`pw:install` 与 `test:e2e` scripts、CI 不缓存浏览器二进制。
- `react-vite-typescript-app`：Demo 文件浏览窗口 opt-in 拖拽并将 `onMoveError` 接入 Demo 自身通知层，外层导航控件维持在 FileManager 之外。

### Verification

- Vitest 覆盖 FileManager 渲染、自定义 `renderItem`、`sizeRatio` 钳制、拖入移动守卫与回调；以及 Demo 外层控件边界。
- Playwright 在 Chromium 中覆盖真实 HTML5 拖拽 → `rename` 流程。
- `openspec validate add-file-manager-drag-move --strict` 退出 0。
- 实现完成后再由后续 task 触发 `/opsx-sync` 与 `/opsx-archive`；本次 change 不修改主 specs，不归档。
