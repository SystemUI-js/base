# @system-ui-js/base

## GitHub Actions

- `PR CI` 会在目标分支为 `main` 或 `dev` 的 Pull Request 上执行 `yarn install --frozen-lockfile`、`yarn lint`、`yarn build` 与 `yarn pack` 校验。
- `Publish to npm` 会在推送到 `version/*` 分支时执行，并根据 `package.json` 中的版本号自动选择 `latest`、`beta` 或 `dev` 标签。
- 发布工作流依赖仓库 Secret `NPM_TOKEN`；该令牌需要具备 npm 包发布与 `dist-tag` 更新权限。
