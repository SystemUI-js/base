## 1. 根包与包装层迁移

- [x] 1.1 将根包依赖升级到 `@system-ui-js/chameleon@0.3.0`，保留根包为唯一可发布包，并补充 `react-native` peer 约束
- [x] 1.2 移除库导出的 Demo CSS 入口，改用 Native-safe `style` 合并替代 `sb-base-window-action` 类名路径
- [x] 1.3 对齐 `src/lib/window.tsx`、`src/lib/window-theme.ts` 与公开导出面到 Chameleon `0.3.0` 运行时契约

## 2. Web Demo 下线与 Native 示例接管

- [x] 2.1 删除 `src/main.tsx`、`src/App.tsx`、`vite.config.ts`、`tsconfig.app.json`、`index.html` 与 `src/styles/` 等 Web Demo 链路文件
- [x] 2.2 新增私有 `example/` Expo Managed 应用，并通过 `file:..` 依赖消费 `@system-ui-js/base`
- [x] 2.3 保持 `example/` 仅作为 Native 验证载体，不引入第二个可发布包、不恢复 Web 入口

## 3. 工具链与自动化调整

- [x] 3.1 将根脚本、TypeScript 配置、ESLint 范围与构建流程重组为“库构建 + Native 示例验证”形态
- [x] 3.2 更新 `.github/workflows/ci-pr.yml` 以执行 `yarn install --frozen-lockfile`、`yarn lint`、`yarn test --runInBand`、`yarn build` 与 `yarn pack`
- [x] 3.3 更新 `.github/workflows/publish.yml`，使发布流程只发布根包，同时把 Expo 示例构建作为 smoke validation 的一部分

## 4. 回归测试与验证证据

- [x] 4.1 新增 Jest 配置与包装层回归测试，覆盖主题解析、resize option 合并、title action 映射与 Native-safe action button 样式路径
- [x] 4.2 完成计划级最终验证：F1 Plan Compliance、F2 Code Quality、F3 Real QA、F4 Scope Fidelity 全部通过
- [x] 4.3 将 `.sisyphus` 中的计划、复盘和证据转换为 OpenSpec archive，并同步主规格到迁移后的仓库事实
