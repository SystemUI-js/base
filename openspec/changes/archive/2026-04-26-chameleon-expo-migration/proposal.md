## Why

当前仓库的 `.sisyphus/plans/chameleon-expo-migration.md` 已完整记录一次从 Web Demo 形态迁移到 Expo Native 验证形态的重大变更，但这些信息仍停留在 Sisyphus 的执行计划与证据目录中，没有沉淀到仓库统一使用的 `openspec/` 规格体系里。为了让后续维护者能够直接从 OpenSpec 视角理解这次迁移的目标、边界、交付物与已完成状态，需要把现有 `.sisyphus` 计划、验证证据与复盘结论转换为 OpenSpec 变更并完成归档。

## What Changes

- 将 `chameleon-expo-migration` 的实施目标、设计决策、任务拆解与完成状态转换为一份已归档的 OpenSpec change。
- 将仓库主规格同步到迁移后的真实状态：根包升级到 `@system-ui-js/chameleon@0.3.0`、Web Demo 链路移除、私有 Expo 示例应用接管原有展示验证职责。
- 为迁移后新增的能力补充主规格，包括 Expo Native 示例验证能力与包装层回归测试能力。
- 移除已经不再符合仓库现状的主规格能力：`react-vite-typescript-app` 与 `window-demo-showcase`。

## Capabilities

### New Capabilities
- `expo-native-example-validation`: 定义私有 Expo Managed 示例应用如何以包入口消费 `@system-ui-js/base` 并承担 iOS/Android 验证职责。
- `wrapper-contract-regression-testing`: 定义包装层的 Jest 回归测试能力与对 `@system-ui-js/chameleon` 的模块边界 mock 约束。

### Modified Capabilities
- `base-package-distribution`: 从“基础包 + Web Demo”双轨交付调整为“可发布基础包 + 私有 Expo 验证应用”协同形态。
- `github-actions-automation`: 将 PR / 发布流程更新为 Yarn 安装、Lint、Jest、库构建、打包校验与 Expo Native smoke export 的自动化规范。

### Removed Capabilities
- `react-vite-typescript-app`: 旧的 React + Vite + TypeScript Web 应用骨架能力已不再适用。
- `window-demo-showcase`: 旧的浏览器窗口 Demo 展示能力已由私有 Expo Native 示例应用取代。

## Impact

- 受影响目录：`openspec/changes/archive/2026-04-26-chameleon-expo-migration/`、`openspec/specs/`。
- 信息来源：`.sisyphus/plans/chameleon-expo-migration.md`、`.sisyphus/notepads/chameleon-expo-migration/`、`.sisyphus/evidence/`。
- 状态说明：该变更对应的实现、验证与复盘均已完成，本次工作仅做规格归档与主规格同步，不新增产品代码行为。
