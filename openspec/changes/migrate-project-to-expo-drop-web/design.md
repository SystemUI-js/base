## Context

当前仓库将 `@system-ui-js/base` 基础包与 Vite Demo 站点放在同一个包内维护：根目录 `package.json` 同时承担包发布元数据、Vite 开发入口、Demo 构建与库构建脚本；`src/App.tsx` 通过浏览器环境与 CSS 展示 Window Demo；`src/lib/*` 则通过 `@system-ui-js/chameleon` 和样式文件提供公开导出。现有 PR 校验也默认执行 `yarn build`，其本质是串行执行基础包构建与 Vite Demo 构建。

本次变更要求把仓库主应用形态切换到 Expo 原生应用，并明确停止维护原生 Web Demo。与此同时，`@system-ui-js/base` 仍需要保持独立构建与可发布能力，Demo 也必须继续通过公开导出验证窗口能力，而不能退回到深层实现直接拼装。迁移的难点在于：当前代码和构建链路强绑定浏览器运行时、Vite 工具链与 CSS 产物，而仓库内尚不存在 Expo / React Native 相关依赖或配置。

## Goals / Non-Goals

**Goals:**
- 建立 Expo 作为仓库默认应用入口、开发命令与原生验证载体。
- 拆清基础包与示例应用的边界，使 `@system-ui-js/base` 能继续独立构建、打包和发布。
- 用 Expo 原生应用替代现有 Vite Demo 首页，并继续通过基础包公开导出展示窗口能力。
- 将 CI 校验链路从 Vite Web 构建迁移为适配 Expo 与基础包并行交付的校验流程。
- 让迁移后的目录、脚本与依赖边界更贴近最终消费方式，减少“Demo 直接吃源码别名”的偏差。

**Non-Goals:**
- 不保留 Vite Web Demo、`index.html` 页面入口或 Web 构建产物兼容层。
- 不在本次设计中引入 iOS / Android 原生自定义工程能力；首阶段以 Expo Managed Workflow 为前提。
- 不扩大为完整的组件体系重设计；仅处理 Expo 迁移所需的公开 API、运行时与交付边界调整。
- 不改变版本分支发布的产品目标；发布对象仍以 `@system-ui-js/base` 包为主，而不是发布 Expo 应用。

## Decisions

### 决策 1：将仓库重组为“基础包 + Expo 示例应用”的 Yarn workspace 结构

仓库将从“单包同时承载库与 Demo”调整为最小 workspace 形态，建议至少拆分为：
- `packages/base`：承载 `@system-ui-js/base` 的源码、类型、构建与发布配置。
- `apps/expo-demo`：承载 Expo 示例应用、原生入口与演示用资源。

这样做的原因是 Expo 应用和可发布基础包的依赖、脚本、构建产物与校验方式已经明显不同，继续塞在单个 `package.json` 中会让发布边界、CI 与依赖治理持续耦合。workspace 还能让 Expo 应用以工作区依赖的形式消费基础包，更接近真实安装方式，而不是像现在这样通过 `tsconfig.app.json` 把 `@system-ui-js/base` 直接别名到 `src/lib/index.ts`。

备选方案：继续保留单包结构，只把 Expo 文件放到根目录。该方案改动表面更小，但会让发布包元数据、Expo 运行依赖与应用脚本继续互相污染，也无法自然表达“包发布”和“应用验证”是两条独立交付链路，因此不采用。

### 决策 2：采用 Expo Managed Workflow 作为唯一默认运行时，并移除 Vite Web 入口

根级开发入口改为启动 Expo，而不再启动 Vite；默认示例应用通过 Expo Router 或单入口 App 形式承载原生演示页面，但对外统一表现为“仓库默认运行命令进入 Expo 原生预览”。根目录保留少量代理脚本，将常用命令映射到 workspace 内部实现，避免使用者必须记住内部路径。

这项决策直接响应“drop web”的变更边界：删除 `vite.config.ts`、`index.html`、`src/main.tsx` 与 `dist-demo` 这条 Web 站点链路，避免形成“名义迁移到 Expo，实际上还在维护双入口”的长期负担。

备选方案：同时保留 Expo 与 Web 双运行时。该方案能降低短期切换成本，但与本次变更的破坏性边界相冲突，也会显著抬高后续维护和规范复杂度，因此不采用。

### 决策 3：基础包以公开 API 稳定为目标，引入原生实现边界而不是让 Expo Demo 直接依赖深层文件

Expo Demo 仍然只能通过 `@system-ui-js/base` 的公开导出来展示 `System`、`Screen`、`BaseWindow` 等能力，不允许直接从 `src/lib/window.tsx` 之类的内部文件取组件。为支撑这一点，基础包内部将建立明确的原生实现边界：
- 保留现有公开组件名称与主要组合方式，尽量降低示例应用和未来消费者的迁移成本。
- 将当前依赖 DOM/CSS 的实现迁移为可在 React Native / Expo 运行的实现。
- 对 `@system-ui-js/chameleon` 的使用收敛到包内部适配层，避免示例应用直接承担底层运行时差异。

这样可以把“公开 API 稳定”和“底层实现从 Web 转向 Native”分离开。Expo 示例应用验证的是包的真实消费路径，而不是内部源码偶然还能跑通。

备选方案：先让 Expo 应用直接引用内部实现，等以后再回填公开 API。该方案短期更快，但会破坏现有 capability 对“公开导出承载展示”的要求，也会让后续包边界再次失真，因此不采用。

### 决策 4：将 `@system-ui-js/chameleon` 视为迁移门槛依赖，并通过适配策略降低不确定性

当前基础包的窗口与系统能力几乎全部薄封装自 `@system-ui-js/chameleon`，而仓库里还没有任何证据表明它已具备 Expo / React Native 兼容实现。因此设计上将其视为显式风险源：
- 若 `@system-ui-js/chameleon` 已支持 React Native / Expo，则基础包继续复用其能力，但适配逻辑集中在 `packages/base` 内部。
- 若其暂不支持，则基础包需要提供最小可运行的内部替代实现或兼容层，以先满足 Expo 演示与公开 API 要求。

该决策避免把整次迁移阻塞在外部包能力完全确认之后，也避免 Expo 示例应用直接感知底层依赖是否兼容。

备选方案：在确认 chameleon 完全兼容前暂停整个迁移。该方案能降低实现返工，但会使仓库继续停留在错误的主运行时上，不符合本次变更目标，因此不采用。

### 决策 5：CI 与发布流程拆分为“包发布校验”和“Expo 应用校验”两条通路

PR 校验不再以单一 `yarn build` 隐式覆盖所有目标，而是显式校验：
- 基础包：安装依赖、Lint、类型检查、独立构建、`yarn pack` / 发布前校验。
- Expo 应用：Lint、类型检查，以及至少一次无交互的 Expo 工程有效性校验（如 `expo export`、`expo-doctor` 或等价脚本）。

版本分支发布流程继续只针对 `@system-ui-js/base`，不把 Expo 应用纳入 npm 发布目标。这样可以保持原有“包可独立发版”的语义，同时避免 Expo 示例应用对发布流程造成干扰。

备选方案：继续依赖单个聚合构建脚本。该方案不利于定位失败原因，也无法表达两类交付物的边界，因此不采用。

## Risks / Trade-offs

- [`@system-ui-js/chameleon` 可能不支持 Expo / React Native] → 先做兼容性探针与最小原型，必要时在 `packages/base` 内提供过渡适配实现。
- [workspace 重组会放大脚本、路径与配置迁移成本] → 保持目录拆分最小化，并在根目录保留统一脚本入口，降低日常使用差异。
- [移除 Web Demo 后，调试方式从浏览器切到原生预览，反馈速度可能变慢] → 通过 Expo 的热更新、固定演示入口和轻量示例内容降低调试负担。
- [现有样式导出 `./styles.css` 与 Native 运行时不一致] → 将 CSS 导出是否保留视为兼容性议题；若保留，则仅用于包的非默认消费路径，不再作为主运行时要求。
- [CI 中的 Expo 校验在无设备环境下可能不稳定] → 采用纯静态、无交互、可在 CI 运行的校验脚本，并避免把模拟器启动作为必需前置条件。

## Migration Plan

1. 建立 workspace 目录结构，把现有基础包源码、构建配置和发布元数据迁移到 `packages/base`。
2. 初始化 `apps/expo-demo`，配置 Expo 入口、基础路由/单页入口与根级代理脚本。
3. 将 Expo 示例应用改为通过工作区依赖消费 `@system-ui-js/base`，删除源码级路径别名与 Vite Web 入口。
4. 在基础包内部完成原生实现边界调整，保证 `System`、`Screen`、`BaseWindow` 等公开导出可在 Expo 中运行。
5. 删除 Vite Demo 构建链路与相关配置，替换为 Expo 原生校验脚本，并更新 GitHub Actions。
6. 保留并验证基础包独立构建、`yarn pack` 与版本分支发布流程，确保 Expo 应用不影响包发版。

回滚策略：在迁移分支内按“目录重组 → Expo 应用 → 基础包适配 → CI 切换”顺序提交；若在基础包原生适配阶段受阻，可回滚到 workspace 重组完成但尚未删除 Vite 的中间提交，恢复旧 Demo 链路后再继续验证依赖兼容性。

## Open Questions

- `@system-ui-js/chameleon` 当前是否已有可直接运行在 Expo / React Native 的组件实现或兼容层？
- `@system-ui-js/base` 在迁移后是否仍需要保留 `./styles.css` 导出以兼容历史消费方式，还是直接收敛为 Native-first 包？
- Expo 示例应用是否需要引入 Expo Router，还是保持单入口 App 即可满足当前演示需求？
- PR 校验中的 Expo 校验脚本最终选型是什么：`expo export`、`expo-doctor`，还是仓库自定义组合命令？
- 是否需要在首阶段提交 `ios/`、`android/` 目录，还是明确保持 Managed Workflow，不提交原生工程文件？
