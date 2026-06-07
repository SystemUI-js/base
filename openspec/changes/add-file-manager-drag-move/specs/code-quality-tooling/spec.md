## ADDED Requirements

### Requirement: Playwright 作为 Vitest 之外的追加 E2E 工具层

系统 SHALL 引入 `@playwright/test` 作为真实浏览器 E2E 测试工具，作为既有 Vitest 工具链的**追加**层，而 NOT 作为 Vitest 的替代。Vitest MUST 继续作为单元与组件测试的主跑器，Playwright MUST 仅承担需要真实浏览器 HTML5 拖拽等 Vitest 无法覆盖的端到端场景。

#### Scenario: Vitest 与 Playwright 同时存在且职责分离

- **WHEN** 维护者执行单元/组件测试入口与 E2E 入口
- **THEN** 单元/组件测试入口 MUST 仍然由 Vitest 执行并覆盖 FileManager 与 Demo 组件逻辑，E2E 入口 MUST 由 Playwright 执行并覆盖真实浏览器拖拽场景，两者 MUST NOT 互相替代

#### Scenario: 移除 Playwright 不影响 Vitest 主跑器

- **WHEN** 维护者临时禁用 Playwright 相关 scripts 与配置
- **THEN** Vitest 主跑器 MUST 仍然能正常执行既有单元与组件测试，MUST NOT 出现因依赖 Playwright 而无法运行的失败

### Requirement: Playwright 仅安装 Chromium 且不在 CI 缓存浏览器二进制

Playwright 工具层 SHALL 仅依赖 Chromium 浏览器执行 E2E，MUST 提供独立的 `pw:install` 脚本用于按需安装 Chromium 及其系统依赖，MUST 提供独立的 `test:e2e` 脚本用于执行 E2E。CI 工作流 MUST NOT 缓存 Playwright 浏览器二进制目录，每次 CI 运行 MUST 通过 `pw:install` 现取现用。

#### Scenario: 本地按需安装 Chromium 并运行 E2E

- **WHEN** 开发者依次执行 `pw:install` 与 `test:e2e` 脚本
- **THEN** `pw:install` MUST 安装 Chromium 与其系统依赖，`test:e2e` MUST 在 Chromium 中运行 E2E 用例

#### Scenario: CI 不复用 Playwright 浏览器缓存

- **WHEN** CI 工作流中安排 E2E 步骤
- **THEN** 步骤 MUST 在执行 `test:e2e` 之前调用 `pw:install` 现取浏览器，MUST NOT 通过 CI 缓存键复用 Playwright 浏览器二进制目录
