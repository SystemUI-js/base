## Purpose

定义仓库级 GitHub Actions 自动化能力，确保 Pull Request 校验与版本分支发布流程具备一致、可重复执行的自动化规范。

## Requirements

### Requirement: Pull request validation workflow

仓库 SHALL 在面向 `main` 或 `dev` 的 Pull Request 场景下提供统一的 GitHub Actions 校验流程，并使用当前仓库已稳定存在的 npm 脚本完成依赖安装、静态检查、构建与发布前打包校验。

#### Scenario: Validate a pull request with repository checks

- **WHEN** 维护者创建或更新目标分支为 `main` 或 `dev` 的 Pull Request
- **THEN** 系统 MUST 通过 GitHub Actions 执行代码拉取、Node 20 环境准备、`npm ci`、`npm run lint`、`npm run build` 与 `npm pack --dry-run`

### Requirement: Pull request validation keeps only the latest run

仓库 SHALL 为 Pull Request 校验工作流提供并发互斥能力，以避免同一 Pull Request 的过期结果继续占用 CI 资源或干扰审查。

#### Scenario: Cancel outdated pull request validations

- **WHEN** 同一 Pull Request 在先前校验仍进行中时再次推送新的提交
- **THEN** 系统 MUST 取消旧的进行中校验任务，并保留最新提交对应的工作流结果

### Requirement: Version branch publish workflow is available

仓库 SHALL 提供独立于 Pull Request 校验的 GitHub Actions 发布工作流，用于响应 `version/*` 分支推送并显式依赖 npm Registry 鉴权配置。

#### Scenario: Trigger publish workflow from a version branch

- **WHEN** 维护者向 `version/*` 分支推送代码
- **THEN** 系统 MUST 启动独立的发布工作流，并使用仓库配置的 `NPM_TOKEN` 作为 npm Registry 鉴权凭据
