## 1. 工作流准备

- [x] 1.1 对照 `../chameleon/.github/workflows/ci-pr.yml` 与 `../chameleon/.github/workflows/publish.yml` 提取可复用结构
- [x] 1.2 确认当前仓库 `package.json`、`package-lock.json` 中的包名、版本与 npm 脚本可供工作流使用

## 2. PR 校验工作流

- [x] 2.1 新增 `.github/workflows/ci-pr.yml`，限制 `pull_request` 目标分支为 `main` 与 `dev`
- [x] 2.2 配置 Node 20、npm 缓存与 `npm ci` 依赖安装步骤
- [x] 2.3 按顺序加入 `npm run lint`、`npm run build` 与 `npm pack --dry-run` 校验步骤
- [x] 2.4 添加 PR 并发互斥配置，取消同一 PR 或分支的旧运行

## 3. npm 发布工作流

- [x] 3.1 新增 `.github/workflows/publish.yml`，监听 `push` 到 `version/*` 分支
- [x] 3.2 配置 Node 20、npm 缓存、npm Registry 地址与 `secrets.NPM_TOKEN` 鉴权
- [x] 3.3 读取 `package.json` 中的包名与版本，并通过 `npm view` 判断当前版本是否已发布
- [x] 3.4 根据版本号后缀计算 `latest`、`beta` 或 `dev` 发布标签
- [x] 3.5 在版本未发布时执行 `npm run build` 与 `npm publish --tag`，已发布时跳过重复发布
- [x] 3.6 对 `beta` 与 `dev` 预发布版本补充 `npm dist-tag add` 兜底步骤

## 4. 验证与说明

- [x] 4.1 检查新增 workflow YAML 的语法、触发条件、权限与环境变量配置
- [x] 4.2 运行仓库现有校验命令，确认 `npm run lint` 与 `npm run build` 可通过
- [x] 4.3 补充必要说明，明确发布工作流依赖仓库配置 `NPM_TOKEN` Secret
- [x] 4.4 运行 `openspec validate add-github-actions --strict` 确认变更规格有效
