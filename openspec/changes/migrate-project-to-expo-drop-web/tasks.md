## 1. 工作区与仓库骨架重组

- [x] 1.1 将仓库调整为 Yarn workspace 结构，新增 `packages/base` 与 `apps/expo-demo` 目录并梳理根级工作区配置
- [x] 1.2 把 `@system-ui-js/base` 的源码、构建配置、包元数据与发布脚本迁移到 `packages/base`，保持包边界独立
- [x] 1.3 在根目录保留统一代理脚本，确保默认安装、启动与校验命令通过 `yarn` 指向新的 workspace 结构

## 2. Expo 默认应用入口落地

- [x] 2.1 初始化 `apps/expo-demo` 的 Expo Managed Workflow 与 TypeScript 入口，使根级默认启动命令进入 Expo 开发流程
- [x] 2.2 建立 Expo 默认应用入口与基础页面结构，确保首轮运行即可看到可扩展的原生示例页面
- [x] 2.3 将 Expo 示例应用改为通过工作区依赖消费 `@system-ui-js/base`，移除源码级路径别名与深层实现引用

## 3. 基础包原生能力与窗口演示适配

- [x] 3.1 评估 `@system-ui-js/chameleon` 在 Expo / React Native 下的可用性，并在 `packages/base` 内实现必要的适配层或过渡实现
- [x] 3.2 调整 `@system-ui-js/base` 的公开导出与内部实现，使 `System`、`Screen`、`BaseWindow` 等公开能力可在 Expo 中运行
- [x] 3.3 用 Expo 默认首页替换现有 Web Demo，基于基础包公开导出渲染单一 Win98 主题窗口与静态说明内容

## 4. 交付链路与遗留 Web 清理

- [x] 4.1 删除 Vite Web 入口、构建配置与相关产物要求，移除对 `index.html`、`vite.config.*`、Web 挂载入口和浏览器首页的依赖
- [x] 4.2 为基础包补齐独立构建、类型产物与 `yarn pack` 校验能力，确保其不依赖 Expo 应用交付流程
- [x] 4.3 为 Expo 示例应用补齐无交互校验命令，并在根级脚本中明确区分基础包与 Expo 应用两条可独立执行的流程

## 5. 自动化与文档收尾

- [x] 5.1 更新 GitHub Actions 的 PR 校验流程，使用 `yarn install --frozen-lockfile`、基础包检查/打包校验与 Expo 无交互校验替代原 Vite Web 构建链路
- [x] 5.2 更新 `version/*` 分支发布流程，确保自动化仅发布 `@system-ui-js/base`，而不将 Expo 示例应用作为 npm 发布对象
- [x] 5.3 更新仓库文档与使用说明，说明 Expo 成为默认开发入口、Web Demo 已移除，以及基础包与示例应用的独立交付方式
