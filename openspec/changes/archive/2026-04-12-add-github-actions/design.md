## Context

当前仓库 `@system-ui-js/base` 已具备本地开发、Lint 与构建能力，但缺少统一的 GitHub Actions 自动化入口。现有 `package.json` 使用 npm 作为包管理器，并通过 `package-lock.json` 锁定依赖；核心校验脚本为 `npm run lint`，构建脚本为 `npm run build`，其中库产物输出到 `dist/`，Demo 产物输出到 `dist-demo/`。仓库目前不存在 `.github/workflows/`，说明 Pull Request 质量校验与 npm 发布仍依赖人工执行。

提案要求参考 `../chameleon` 中已验证的工作流模式，为当前仓库补齐两类自动化能力：一类用于 Pull Request 场景下的静态检查、构建与打包校验，另一类用于 `version/*` 分支触发的 npm 发布。与参考仓库不同的是，当前仓库没有测试脚本、采用 npm 而不是 Yarn，且发布对象是基础库包，Demo 仅作为展示构建的一部分，不参与 npm 包内容发布。

## Goals / Non-Goals

**Goals:**
- 为 `main`、`dev` 相关 Pull Request 提供稳定、可重复执行的 CI 校验流程。
- 为 `version/*` 分支提供可控的 npm 自动发布流程，并基于版本语义设置 `latest`、`beta`、`dev` dist-tag。
- 复用 `chameleon` 的成功模式，同时按当前仓库的 npm 安装方式、构建脚本与产物结构完成适配。
- 在不改变包对外 API 的前提下，降低人工发版步骤和遗漏风险。

**Non-Goals:**
- 不在本次设计中引入新的测试框架或补齐自动化测试体系。
- 不改造现有库构建产物结构或发布包内容定义。
- 不涉及 GitHub Release、变更日志自动生成或多 Registry 发布。
- 不调整版本管理策略本身，仅为既有 `version/*` 分支约定提供自动化实现。

## Decisions

### 1. 采用两个独立工作流，而不是单一复合工作流
- 决策：新增 `ci-pr.yml` 与 `publish.yml` 两个工作流，分别处理 Pull Request 校验与版本分支发布。
- 原因：两类流程的触发条件、权限需求、失败处理和可观测性不同。拆分后更容易限制发布权限，也便于在 PR 失败时快速定位问题，而不会混入发版逻辑。
- 备选方案：使用单一 workflow 通过 `if` 分支区分 PR 与发布场景。该方案会增加 YAML 复杂度，且更容易让发布相关配置误作用于普通校验流程，因此不采用。

### 2. PR 校验流程只执行当前仓库已稳定具备的检查项
- 决策：`ci-pr.yml` 按顺序执行 `checkout`、`setup-node`、`npm ci`、`npm run lint`、`npm run build`、`npm pack --dry-run`。
- 原因：当前仓库没有 `test`、`test:ui` 等脚本，直接迁移参考仓库的测试步骤会导致工作流长期红灯。保留 Lint、完整构建与打包校验，可以覆盖语法、类型产物、打包边界与发布前产物检查，是当前阶段成本与收益最平衡的方案。
- 备选方案：保留空的测试步骤或条件判断测试脚本是否存在。前者会制造噪声，后者会让流程逻辑复杂化且收益有限，因此暂不采用。

### 3. 安装与缓存策略统一采用 npm 生态
- 决策：工作流使用 `actions/setup-node@v4` 配置 Node 20，并启用 `cache: npm`；依赖安装统一使用 `npm ci`。
- 原因：仓库已经存在 `package-lock.json`，适合在 CI 中使用 `npm ci` 获得可重复安装结果；Node 20 与参考仓库保持一致，也兼容当前 Vite/TypeScript 工具链。
- 备选方案：使用 `npm install` 或切回 Yarn。`npm install` 在 CI 中确定性更弱；切换包管理器会引入额外迁移成本，与当前仓库事实不符，因此不采用。

### 4. 发布流程沿用 `version/*` 触发约定，并在发布前做版本幂等检查
- 决策：`publish.yml` 监听 `push` 到 `version/*` 分支，先读取 `package.json` 中的 `name` 与 `version`，通过 `npm view` 判断版本是否已存在；仅在未发布时执行构建与 `npm publish`。
- 原因：这样可以延续参考仓库的使用习惯，避免重复发布导致 workflow 失败，同时让版本分支成为显式、可审计的发布入口。
- 备选方案：每次推送强制发布或改为手动触发。强制发布缺乏幂等保护；纯手动触发虽然更保守，但与提案中“约定分支触发”的目标不一致，因此不采用。

### 5. dist-tag 由包版本语义决定，而不是仅由分支名决定
- 决策：发布流程根据 `package.json` 中版本号后缀决定 `PUBLISH_TAG`：包含 `-dev` 则发布到 `dev`，包含 `-beta` 则发布到 `beta`，否则发布到 `latest`；对于预发布标签，发布后补充执行 `npm dist-tag add` 做兜底。
- 原因：版本号才是 npm 消费侧真正感知的发布语义来源，使用版本语义判断可避免分支名与真实预发布类型不一致的问题。
- 备选方案：仅根据分支名称决定 tag。该方案要求额外维护命名约束，且一旦分支命名与版本内容不一致会造成错误发布，因此不采用。

### 6. 发布工作流显式配置 npm 鉴权，不将凭据写入仓库文件
- 决策：通过 `actions/setup-node@v4` 的 `registry-url` 配置 npm Registry，并使用 `secrets.NPM_TOKEN` 作为 `NODE_AUTH_TOKEN` 注入发布步骤；不新增仓库级 `.npmrc`。
- 原因：这样可以把凭据完全留在 GitHub Secrets 中，减少泄露面，同时保持本地开发环境与 CI 鉴权解耦。
- 备选方案：提交 `.npmrc` 模板到仓库。虽然可读性更高，但若处理不当容易导致本地/CI 配置耦合，因此不采用。

### 7. 保留显式构建步骤，不把全部责任下沉到生命周期脚本
- 决策：发布工作流在 `npm publish` 之前显式执行 `npm run build`，但本次设计不强制新增 `prepublishOnly`。
- 原因：显式构建可以更早暴露失败原因，并且与 PR 校验逻辑保持一致。是否增加 `prepublishOnly` 属于包发布保障增强项，可能影响本地发版体验，适合在实现阶段结合团队习惯再决定。
- 备选方案：仅依赖 `prepublishOnly`。该方案隐藏了构建行为，问题定位不如显式步骤直接，因此不作为当前主路径。

### 8. 为 PR 校验增加并发互斥，优先保留最新提交结果
- 决策：`ci-pr.yml` 采用基于 PR head SHA 或分支的 `concurrency` 配置，并开启 `cancel-in-progress: true`。
- 原因：前端构建与打包校验可能较耗时，快速连续推送时取消旧任务可以减少 GitHub Actions 资源浪费，并让审查者聚焦最新结果。
- 备选方案：不配置并发控制。该方案实现更简单，但会堆积冗余任务，不采用。

## Risks / Trade-offs

- [仓库当前没有自动化测试] → PR 校验只能覆盖 Lint、构建和打包，无法拦截运行时行为缺陷；后续若新增测试脚本，应把测试纳入 `ci-pr.yml`。
- [发布流程依赖 `version/*` 分支约定] → 若团队未严格遵守分支命名规范，可能导致发布入口不可用；通过在文档中明确触发规则并在实现中打印分支/版本信息缓解。
- [`npm run build` 同时构建库与 Demo] → 发布前构建时间比纯库构建更长，但可确保展示站构建不被意外破坏；若 CI 时间过长，后续可再评估是否拆分发布专用构建脚本。
- [未引入 `prepublishOnly`] → 自动发布依赖 workflow 本身保证构建顺序，而不是 npm 生命周期双保险；通过显式构建和 `npm pack --dry-run` 降低风险。
- [Secrets 配置错误会导致发布失败] → 需要在仓库设置中预先配置 `NPM_TOKEN`，并在实现说明中明确列出必需 Secrets。

## Migration Plan

1. 在仓库新增 `.github/workflows/ci-pr.yml` 与 `.github/workflows/publish.yml`。
2. 将参考仓库中的 Yarn 安装与缓存逻辑替换为 npm 版本，并移除不适用于当前仓库的测试步骤。
3. 在发布工作流中补齐版本检查、dist-tag 计算、Registry 鉴权与幂等发布逻辑。
4. 在仓库配置中添加 `NPM_TOKEN` Secret，并用测试分支或草稿 PR 验证 PR 工作流可正常执行。
5. 使用受控的 `version/*` 分支验证发布工作流；若需要回滚，可直接回退 workflow 文件或临时在 GitHub 中禁用对应 workflow。

## Open Questions

- PR 校验是否只针对 `main`、`dev`，还是需要覆盖更多长期维护分支？
- 是否需要在实现阶段顺手补充 `prepublishOnly`，让本地手动发布路径也具备相同保障？
- 发布成功后是否需要追加通知、Release 说明或 CHANGELOG 校验，这些是否属于后续增量需求？
