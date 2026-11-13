## MODIFIED Requirements

### Requirement: Publishable base package metadata

仓库 SHALL 将 `@system-ui-js/base` 维持为唯一可发布包，并把其发布契约更新为面向 `@system-ui-js/chameleon@0.3.0` 的 Native-oriented 形态，包括仅导出根包入口、保留 `dist/` 作为发布文件范围、为运行时声明 `react-native` peer 依赖，以及不再导出 Demo CSS 资产。

#### Scenario: Inspect package manifest after the Expo migration

- **WHEN** 维护者检查迁移后的根包 `package.json`
- **THEN** 系统 MUST 声明 `@system-ui-js/base` 为唯一发布目标、将 `@system-ui-js/chameleon` 固定到 `0.3.0`、包含 `react-native` peer 依赖，并且不再暴露 `./styles.css` 之类的 Demo CSS 导出

### Requirement: Independent base package build output

仓库 SHALL 保留独立的基础包构建能力，使维护者能够通过库构建入口生成仅面向发布的 `dist/` 产物，而 Native 示例应用仅承担验证角色。

#### Scenario: Build the publishable library artifact

- **WHEN** 维护者执行库构建流程
- **THEN** 系统 MUST 生成 `@system-ui-js/base` 的发布产物，并允许 Expo 示例应用在后续步骤消费这些产物进行验证，而不是让示例应用成为第二个发布包

### Requirement: Dual delivery workflows remain separable

仓库 SHALL 允许可发布基础包与私有 Expo Native 验证应用分别承担交付与验证职责，以支持“发布根包、验证 Native 集成”的双形态工作流。

#### Scenario: Publish the package while keeping the example private

- **WHEN** 维护者执行包发布或 Native 验证流程
- **THEN** 系统 MUST 只发布根包 `@system-ui-js/base`，并把 `example/` 保持为私有验证应用而不是第二个交付产物
