# System UI Workspace

仓库现已切换为 Yarn workspace 结构：

- `packages/base`：`@system-ui-js/base` 基础包，独立构建、类型产物与打包校验都在这里完成。
- `apps/expo-demo`：Expo Managed Workflow 示例应用，作为默认开发入口与窗口演示载体。

## 常用命令

- `yarn install`：安装整个工作区依赖。
- `yarn dev`：先构建基础包，再进入 Expo 示例应用开发流程。
- `yarn build:base`：仅构建 `@system-ui-js/base`。
- `yarn pack:base`：校验基础包可独立 `yarn pack`。
- `yarn check:expo`：执行 Expo 示例应用的无交互有效性校验。
- `yarn validate`：串行执行 lint、类型检查、基础包构建/打包与 Expo 校验。

## 目录说明

- Web Demo 与 Vite 入口已移除，仓库不再维护浏览器首页、`index.html` 或 Vite 构建链路。
- Expo 成为默认开发入口；窗口示例通过 `@system-ui-js/base` 的公开导出渲染，而不是直接引用包内部实现。

## GitHub Actions

- `PR CI` 会在目标分支为 `main` 或 `dev` 的 Pull Request 上执行 `yarn install --frozen-lockfile`、`yarn lint`、`yarn typecheck`、基础包构建与打包校验，以及 Expo 无交互校验。
- `Publish to npm` 会在推送到 `version/*` 分支时执行，并仅发布 `packages/base` 中的 `@system-ui-js/base`。
- 发布工作流依赖仓库 Secret `NPM_TOKEN`；该令牌需要具备 npm 包发布与 `dist-tag` 更新权限。
