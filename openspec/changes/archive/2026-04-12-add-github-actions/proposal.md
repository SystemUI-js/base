## Why

当前仓库已经具备本地 `lint`、构建与发包基础能力，但缺少基于 GitHub Actions 的统一自动化校验与发布入口，导致合并请求质量把关和版本分支发布仍依赖人工执行。参考 `../chameleon` 中已验证的工作流模式，为本仓库补齐适配自身脚本与包管理方式的 GitHub Actions，可以更早暴露问题并降低发版操作成本。

## What Changes

- 新增面向 GitHub 的仓库自动化能力，为拉取请求提供统一的静态检查、构建与打包校验流程。
- 新增适配 `@system-ui-js/base` 的发布工作流，在约定分支触发时自动完成安装、构建与 npm 发布。
- 将 `../chameleon` 中可复用的工作流设计迁移到当前仓库，并按本仓库的脚本、依赖安装方式与产物特点进行调整。
- 明确工作流依赖的仓库机密与触发约束，确保自动化流程可在 CI 环境中稳定执行。

## Capabilities

### New Capabilities
- `github-actions-automation`: 定义仓库在 Pull Request 校验与版本分支发布场景下的 GitHub Actions 自动化能力。

### Modified Capabilities
- `base-package-distribution`: 将基础包交付能力扩展为支持通过 GitHub Actions 触发并执行标准化 npm 发布流程。

## Impact

- 受影响目录：`.github/workflows/`、仓库根目录配置文件、可能补充的文档说明。
- 受影响系统：GitHub Actions、npm Registry、仓库 Secrets 配置。
- 受影响能力：现有基础包分发流程将新增自动化发布入口，但不改变包对外 API。
- 参考来源：`../chameleon/.github/workflows/ci-pr.yml`、`../chameleon/.github/workflows/publish.yml`。
