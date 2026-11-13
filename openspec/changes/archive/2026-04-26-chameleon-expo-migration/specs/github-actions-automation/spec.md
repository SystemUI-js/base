## MODIFIED Requirements

### Requirement: Pull request validation workflow

仓库 SHALL 在面向 `main` 或 `dev` 的 Pull Request 场景下提供统一的 GitHub Actions 校验流程，并使用迁移后的 Yarn 脚本完成依赖安装、静态检查、包装层回归测试、库构建、私有 Expo 示例验证以及发布前打包校验。

#### Scenario: Validate a pull request with library and native-example checks

- **WHEN** 维护者创建或更新目标分支为 `main` 或 `dev` 的 Pull Request
- **THEN** 系统 MUST 通过 GitHub Actions 执行 `yarn install --frozen-lockfile`、`yarn lint`、`yarn test --runInBand`、`yarn build` 与 `yarn pack`

### Requirement: Version branch publish workflow is available

仓库 SHALL 提供独立于 Pull Request 校验的 GitHub Actions 发布工作流，用于响应 `version/*` 分支推送、在发布前构建根包并完成 Native 示例 smoke validation，同时仅对根包执行 npm 发布。

#### Scenario: Publish only the root package after build validation

- **WHEN** 维护者向 `version/*` 分支推送代码且当前版本尚未发布
- **THEN** 系统 MUST 先运行迁移后的构建与示例验证流程，再只发布根包 `@system-ui-js/base`，而不发布 `example/`
