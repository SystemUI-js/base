## Purpose

定义 `@system-ui-js/base` 在 Expo Native 迁移后的分发与交付能力，确保根包继续作为唯一发布目标交付，而私有 Expo 示例应用仅承担 Native 验证职责。

## Requirements

### Requirement: Publishable base package metadata

仓库 SHALL 为 `@system-ui-js/base` 定义面向 `@system-ui-js/chameleon@0.3.0` 的可发布包元数据，包括包名、对外入口映射、类型声明入口、发布文件范围、`react-native` peer 依赖，以及不再向外暴露 Demo CSS 资产。

#### Scenario: Inspect package manifest for distribution

- **WHEN** 维护者检查用于发布 `@system-ui-js/base` 的包配置
- **THEN** 配置 MUST 明确声明 `@system-ui-js/base` 的包名、入口导出、类型信息、`react-native` peer 依赖，并且不再包含 `./styles.css` 之类的 Demo 资源导出

### Requirement: Independent base package build output

仓库 SHALL 保留独立的基础包构建能力，并生成适合发布到包管理器的 `dist/` 产物，使 Native 示例应用能够在后续步骤消费同一发布形态进行验证。

#### Scenario: Build the base package only

- **WHEN** 维护者执行基础包构建流程
- **THEN** 系统 MUST 生成 `@system-ui-js/base` 的发布产物，并允许后续 Native 示例验证复用这些产物，而不是创建第二个发布包

### Requirement: Dual delivery workflows remain separable

仓库 SHALL 允许基础包产物与私有 Expo Native 验证应用分别承担发布与验证职责，以支持“发布根包、验证 Native 集成”的双形态交付流程。

#### Scenario: Run package and native validation separately

- **WHEN** 维护者分别执行基础包交付流程与 Native 示例验证流程
- **THEN** 两套流程 MUST 可独立完成，并且只把根包视为真正对外发布的交付结果

### Requirement: Version branch publish is idempotent

仓库 SHALL 允许 `@system-ui-js/base` 通过 `version/*` 分支触发的 GitHub Actions 发布流程执行标准 npm 发布，并基于 `package.json` 中的包名与版本判断是否需要真正发版。

#### Scenario: Publish an unpublished package version

- **WHEN** `version/*` 分支触发发布且 `package.json` 中声明的 `@system-ui-js/base` 版本尚未存在于 npm Registry
- **THEN** 系统 MUST 构建该基础包并将当前版本发布到 npm

#### Scenario: Skip an already published package version

- **WHEN** `version/*` 分支触发发布且 `package.json` 中声明的版本已经存在于 npm Registry
- **THEN** 系统 MUST 跳过重复发布，并将该次执行作为已处理的幂等发布流程结束

### Requirement: Distribution tag follows package version semantics

仓库 SHALL 根据 `@system-ui-js/base` 的版本语义为自动发布设置 npm `dist-tag`，以区分稳定版与预发布版的消费通道。

#### Scenario: Publish a stable version with latest tag

- **WHEN** `package.json` 中的版本号不包含 `-dev` 或 `-beta` 后缀
- **THEN** 系统 MUST 以 `latest` 作为发布标签发布该版本

#### Scenario: Publish a pre-release version with matching tag

- **WHEN** `package.json` 中的版本号包含 `-dev` 或 `-beta` 后缀
- **THEN** 系统 MUST 分别以 `dev` 或 `beta` 作为发布标签发布，并确保对应的 `dist-tag` 指向当前发布版本
