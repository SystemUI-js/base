## ADDED Requirements

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
