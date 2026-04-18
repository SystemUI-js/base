## ADDED Requirements

### Requirement: Expo 原生应用作为仓库默认应用骨架

系统 MUST 提供一个基于 Expo Managed Workflow 的 React Native + TypeScript 示例应用，作为仓库默认应用骨架与默认开发入口；开发者在仓库根目录执行默认启动命令时 MUST 进入 Expo 工作流，而不是进入 Vite Web 开发服务。

#### Scenario: 从仓库根目录启动默认开发环境

- **WHEN** 开发者在仓库根目录安装依赖后执行默认开发启动命令
- **THEN** 系统 MUST 成功进入 Expo 开发流程，并能够为原生预览提供可运行的应用入口

#### Scenario: 默认开发入口不再指向 Web 服务

- **WHEN** 开发者按照仓库文档或根级脚本启动默认应用
- **THEN** 系统 MUST 进入 Expo 原生预览流程，且 MUST NOT 要求启动 Vite 服务、访问浏览器页面或依赖 HTML 挂载入口

### Requirement: Expo 示例应用通过基础包公开导出展示窗口能力

系统 SHALL 提供一个 Expo 示例应用默认演示入口，用于通过 `@system-ui-js/base` 的公开导出展示窗口能力；该演示入口 MUST NOT 直接依赖基础包内部深层实现文件。

#### Scenario: 启动默认 Expo 演示入口

- **WHEN** 开发者或用户打开 Expo 示例应用的默认入口
- **THEN** 系统 MUST 通过 `@system-ui-js/base` 的公开导出渲染窗口演示界面，而不是直接导入基础包内部源码文件拼装界面

### Requirement: Expo 应用具备可自动化执行的原生校验流程

系统 SHALL 为 Expo 示例应用提供无需启动模拟器或提交原生工程目录即可执行的校验流程，用于验证 Expo 工程配置、依赖与默认入口在 CI 环境中有效。

#### Scenario: 在无设备 CI 环境中校验 Expo 应用

- **WHEN** 维护者在无交互的 CI 环境执行 Expo 应用校验命令
- **THEN** 系统 MUST 完成对 Expo 工程有效性的自动化校验，且 MUST NOT 以启动浏览器、模拟器或手动操作作为前置条件
