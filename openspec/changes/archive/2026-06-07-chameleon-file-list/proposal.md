# Proposal: Chameleon File List & Window Fixes

## Why
- User requested: "利用 chameleon 的 CList 的拖动功能，封装文件列表组件（如果有就优化）。实现拖动文件或文件夹到文件夹上，抬起鼠标则移动到这个文件夹内。"
- User requested: "现在按了全屏按钮，窗口并没有全屏。期望点击全屏后窗口宽高都变为 100%；因为是全屏，应表现为不允许 resize；当前窗口有 resizable props，如果是全屏状态应强制 false，movable 也应强制 false。"
- User requested: "在不侵入 chameleon 这个 npm 包的代码的情况下，窗口增加 点击后切换 zindex 的能力...顺便管理窗口 active 状态...增加窗口最大化和最小化能力。"
- User requested: "增加窗口管理能力，增加 WindowManager，管理窗口的初始化、销毁等等状态，要有一个 createWindow 方法..."

## What Changes
1. **Chameleon File List**: Optimize `FileManager` to support drag-into-folder moves using `CList.onItemDragInto` and `fileSystem.promises.rename`.
2. **Render Extensions**: Add `renderItem(displayMode, sizeRatio, entry, position)` extension point.
3. **Fullscreen Fix**: Fix demo window fullscreen behavior to fill parent container and disable resize/move.
4. **Window Manager Layering**: Extend `WindowManager` with click-to-front z-index, active state, minimize, and maximize/restore.

## Capabilities
- `FileManager` supports list/icon modes and custom rendering.
- `FileManager` supports drag-into-folder move validation and rename flow.
- Playwright E2E verifies real browser drag behavior.
- `WindowManager` manages window focus, stacking, minimize, maximize, and restore.
- Fullscreen windows disable resize and move controls.

## Impact
- Updates to `src/lib/fileManager/` and `src/demo/file-browser-window.tsx`.
- Updates to `src/lib/window-manager.tsx` and `src/lib/screen/`.
- New E2E tests in `e2e/`.
