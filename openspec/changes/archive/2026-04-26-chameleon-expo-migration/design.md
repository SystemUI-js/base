## Context

`.sisyphus/plans/chameleon-expo-migration.md` 描述了一次已执行完成的仓库重构：根包 `@system-ui-js/base` 升级到 `@system-ui-js/chameleon@0.3.0`，移除 Vite Web Demo 入口与相关配置，把发布目标保留在根包上，同时新增一个只用于本地与 CI Native 验证的私有 `example/` Expo Managed 应用。配套地，仓库还补齐了包装层的 Jest 回归测试，以及围绕 Yarn 安装、Lint、测试、构建、打包和 Expo 导出的 CI / 发布流程。

当前 `openspec/specs/` 中仍保留着迁移前的能力假设：`react-vite-typescript-app` 与 `window-demo-showcase` 仍将仓库描述为一个可运行 Web 入口和可独立部署 Demo 站点的项目，这与当前实现不一致。相对地，迁移后新增的 Native 示例验证与包装层测试能力尚未被主规格覆盖。

## Goals / Non-Goals

**Goals:**
- 将 `.sisyphus` 中的迁移计划转换为 OpenSpec 的 `proposal.md`、`design.md`、`tasks.md` 与 delta specs。
- 让 `openspec/specs/` 精确反映迁移后的仓库能力，而不是保留过时的 Web Demo 描述。
- 保留 `.sisyphus` 里的已完成状态与验证结论，使归档 change 能解释这次迁移为何已完成且可追溯。

**Non-Goals:**
- 不重新执行或重构迁移本身的产品代码。
- 不修改 `.sisyphus` 原始计划或证据文件。
- 不借这次规格迁移处理 `.sisyphus/notepads/chameleon-expo-migration/issues.md` 中记录的中低优先级实现遗留项。

## Decisions

### 1. 直接归档为历史变更，而不是先创建活动 change 再二次移动
- 决策：将转换结果直接落在 `openspec/changes/archive/2026-04-26-chameleon-expo-migration/`。
- 原因：`.sisyphus` 中的 7 个实施任务与 F1-F4 最终验证均已完成，本次工作是历史规格沉淀，不是待实现中的活动变更。
- 备选方案：先创建 `openspec/changes/chameleon-expo-migration/`，再手动归档。该方案会引入一次没有增量价值的中间状态，因此不采用。

### 2. 保留标准 OpenSpec 工件，同时把 `.sisyphus` 作为来源而不是直接复制目录
- 决策：输出标准 `proposal.md`、`design.md`、`tasks.md` 与 `specs/*/spec.md`，在文档中引用 `.sisyphus` 来源，而不把整个 `.sisyphus` 树原样搬进 archive。
- 原因：OpenSpec 归档的核心价值在于可读的规格结构，而不是重复保存执行日志的目录布局；源证据仍可通过 `.sisyphus` 追溯。
- 备选方案：把 `.sisyphus` 目录整体复制到 archive。该方案会制造重复数据，且偏离仓库里现有 archived change 的组织方式，因此不采用。

### 3. 同步主规格到迁移后的事实，而不是仅保存 delta specs
- 决策：除归档 delta specs 外，同步更新 `openspec/specs/`，新增 Native 示例与包装层测试能力，并删除不再适用的 Web 能力 spec。
- 原因：如果只保留 archive 而不更新主规格，后续维护者打开 `openspec/specs/` 仍会看到错误的仓库基线。
- 备选方案：只生成 archive，不改主规格。该方案无法达成“转换成 OpenSpec 格式”的真正落地效果，因此不采用。

### 4. 用新增 capability 代替复用旧的 Web 命名
- 决策：新增 `expo-native-example-validation` 与 `wrapper-contract-regression-testing`，而不是继续沿用 `window-demo-showcase` 或 `react-vite-typescript-app` 的目录名。
- 原因：迁移后的职责已经发生结构性变化，继续复用旧能力名会让 capability 语义与实现事实脱节。
- 备选方案：在旧 capability 下重写 Requirement。该方案虽然能减少文件数量，但会让 capability 名称误导读者，因此不采用。

## Risks / Trade-offs

- `.sisyphus` 中仍保存更细的执行证据与审计结果，而 OpenSpec 工件更偏向稳定的规格摘要；两套资料需要共同阅读才能还原完整执行过程。
- 本次主规格同步会删除两个旧 capability 目录；若外部文档仍引用这些名称，需要后续一起更新。
- `.sisyphus/notepads/chameleon-expo-migration/issues.md` 中记录的中低优先级实现问题会继续存在，但它们不会阻止这次规格归档。

## Migration Notes

1. `proposal.md` 负责总结迁移原因、变更范围和 capability 变化。
2. `design.md` 解释为什么要把 `.sisyphus` 历史迁移为已归档的 OpenSpec change，并同步主规格。
3. `tasks.md` 用 OpenSpec 样式记录原计划 1-7 与 F1-F4 已完成状态。
4. delta specs 用于声明新增、修改、删除的 capability 变更。
5. `openspec/specs/` 直接更新为迁移后的基线，以便后续 OpenSpec 工作继续在正确基线上演进。
