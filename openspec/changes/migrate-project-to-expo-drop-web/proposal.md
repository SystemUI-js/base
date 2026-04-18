## Why

当前仓库以 Vite Web Demo 为主线组织开发、构建与交付流程，但目标产品正转向原生端体验，这使现有工程结构、运行方式与验证链路不再匹配。现在启动整体迁移到 Expo，可以尽早统一应用入口、开发体验与后续原生能力扩展方向，并明确停止维护原生 Web 形态，避免继续在错误的基础设施上叠加功能。

## What Changes

- 将仓库主应用工程从 `React + Vite + TypeScript` 调整为 `Expo + React Native + TypeScript`，以 Expo 作为默认开发与运行入口。
- **BREAKING** 移除对原生 Web 应用形态的支持，不再以 Vite 站点作为默认 Demo、开发环境或交付目标。
- 为示例与演示能力提供基于 Expo 的承载方式，使 Window Demo 能在原生运行时中继续展示。
- 调整仓库脚本、构建校验与 CI 流程，使其围绕 Expo/React Native 工作流执行，而不是围绕 Vite Web 构建执行。
- 重新梳理基础包与示例应用的交付边界，确保包分发能力在迁移后仍可独立维护。

## Capabilities

### New Capabilities
- `expo-native-app`: 定义仓库提供 Expo 原生应用骨架、默认入口、开发启动与原生验证流程的能力边界。

### Modified Capabilities
- `react-vite-typescript-app`: 将仓库默认应用骨架要求从 Vite Web 工程切换为 Expo 原生工程，并移除对 Web 页面入口与 Vite 构建结果的要求。
- `window-demo-showcase`: 将 Demo 展示载体从 Web 展示站调整为 Expo 原生应用中的默认演示入口，同时保持通过公开导出展示窗口能力。
- `github-actions-automation`: 将 Pull Request 校验与相关自动化命令从 Vite Web 构建链路切换为 Expo 原生项目可执行的校验链路。
- `base-package-distribution`: 调整基础包与示例应用并行交付的约束，使其适配 Expo 示例应用替代原 Demo 站点后的交付模型。

## Impact

- 受影响代码与配置：`package.json`、TypeScript 配置、应用入口文件、Demo 相关目录、Vite 配置、Expo 配置与可能新增的原生工程目录。
- 受影响依赖：将引入 `expo`、`react-native` 及相关 Expo SDK 依赖，并评估或移除 `vite` 及其配套插件的主路径职责。
- 受影响系统：本地开发命令、CI 校验流程、Demo 展示方式、包分发与文档说明。
- 对使用者的影响：依赖当前 Web Demo 或 Vite 工作流的开发方式将不再成立，后续开发与验证需转入 Expo 工作流。
