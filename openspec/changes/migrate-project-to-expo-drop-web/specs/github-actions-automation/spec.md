## MODIFIED Requirements

### Requirement: Pull request validation workflow

仓库 SHALL 在面向 `main` 或 `dev` 的 Pull Request 场景下提供统一的 GitHub Actions 校验流程，并使用仓库中稳定存在的 Yarn 脚本完成依赖安装、基础包静态检查与打包校验，以及 Expo 示例应用的原生工程有效性校验；该流程 MUST 围绕 Expo 原生应用与可发布基础包的双交付目标执行，而不是围绕 Vite Web 构建执行。

#### Scenario: Validate a pull request with repository checks

- **WHEN** 维护者创建或更新目标分支为 `main` 或 `dev` 的 Pull Request
- **THEN** 系统 MUST 通过 GitHub Actions 执行代码拉取、Node 20 环境准备、`yarn install --frozen-lockfile`，并分别完成基础包所需的检查与打包校验以及 Expo 示例应用所需的无交互原生校验

### Requirement: Version branch publish workflow is available

仓库 SHALL 提供独立于 Pull Request 校验的 GitHub Actions 发布工作流，用于响应 `version/*` 分支推送并显式依赖 npm Registry 鉴权配置；在本变更后，该流程 MUST 仅以 `@system-ui-js/base` 的发布为目标，且 MUST NOT 将 Expo 示例应用作为 npm 发布对象。

#### Scenario: Trigger publish workflow from a version branch

- **WHEN** 维护者向 `version/*` 分支推送代码
- **THEN** 系统 MUST 启动独立的发布工作流，并使用仓库配置的 `NPM_TOKEN` 作为 npm Registry 鉴权凭据来处理 `@system-ui-js/base` 的发布流程
