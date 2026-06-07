## Tasks

### Plan: chameleon-file-list

- [ ] 1. 扩展 FileManager 公共 API 类型与 `FileSystemLike.promises.rename` / 可选 `exists`，更新 `src/lib/index.ts` 类型导出。
- [ ] 2. 保留 FileManager 默认渲染并接入 `renderItem(displayMode, sizeRatio, entry, position)` 参数，`sizeRatio` 钳制 `[0, 1]`。
- [ ] 3. 将 `CList` 的 `type` 与 `displayMode` 联动并新增 icon 模式样式钩子，不引入 `grid`。
- [ ] 4. 实现拖入文件夹移动主流程：CList `onItemDragInto` → 守卫 → `fileSystem.promises.rename` → 内部刷新 tick + 回调。
- [ ] 5. 完善 list/icon 模式样式与可拖拽视觉反馈，保持默认外观回退。
- [ ] 6. Demo `file-browser-window` opt-in 拖拽并接入 `onMoveError` 通知层，确保外层导航控件位置不变。
- [ ] 7. 为 FileManager 增加 Vitest 组件/集成测试：`renderItem`、`sizeRatio` 钳制、拖入守卫、`rename` 成功/失败/取消、并发锁。
- [ ] 8. 为 Demo 增加 Vitest 测试，验证导航控件位置不变并验证 `onMoveError` 触达通知层。
- [ ] 9. 引入 `@playwright/test` devDep、根目录 `playwright.config.ts`、`pw:install` 与 `test:e2e` scripts、`e2e/` 目录骨架，Chromium-only。
- [ ] 10. 编写 `e2e/file-manager-drag.e2e.ts` 真实浏览器拖拽用例，并在 CI 工作流新增 E2E step，不缓存浏览器二进制。
- [ ] 11. 创建本 OpenSpec change（本任务）：proposal / tasks / 四个 capability deltas，`openspec validate --strict` 通过。
- [ ] 12. 最终本地验证：`yarn lint`、`yarn test:run`、`yarn build`、`yarn pw:install`、`yarn test:e2e`、`yarn pack` 全部退出 0，并 `openspec validate add-file-manager-drag-move --strict` 退出 0。
