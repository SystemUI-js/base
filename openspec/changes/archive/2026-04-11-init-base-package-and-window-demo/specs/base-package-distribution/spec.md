## ADDED Requirements

### Requirement: Publishable base package metadata
仓库 SHALL 为 `@system-ui-js/base` 定义可发布的包元数据，包括包名、对外入口映射、类型声明入口与发布文件范围，使消费者能够以标准包方式安装和引用该基础包。

#### Scenario: Inspect package manifest for distribution
- **WHEN** 维护者检查用于发布 `@system-ui-js/base` 的包配置
- **THEN** 配置 MUST 明确声明 `@system-ui-js/base` 的包名、入口导出与类型信息

### Requirement: Independent base package build output
仓库 SHALL 提供独立于 Demo 站点的基础包构建能力，并生成适合发布到包管理器的构建产物。

#### Scenario: Build the base package only
- **WHEN** 维护者执行基础包构建流程
- **THEN** 系统 MUST 生成 `@system-ui-js/base` 的发布产物，且不要求 Demo 站点构建流程作为前置条件

### Requirement: Dual delivery workflows remain separable
仓库 SHALL 允许基础包产物与 Demo 展示产物分别构建和交付，以支持包发布与展示部署的双形态交付流程。

#### Scenario: Run package and demo delivery separately
- **WHEN** 维护者分别执行基础包交付流程与 Demo 交付流程
- **THEN** 两套流程 MUST 可独立完成，并各自产出对应的交付结果
