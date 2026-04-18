## MODIFIED Requirements

### Requirement: 提供 React + Vite + TypeScript 项目骨架

系统 MUST 提供一个可安装依赖、可启动默认开发环境并可执行仓库级校验的 TypeScript 应用骨架；该默认骨架在本变更后 MUST 以 Expo + React Native 为主运行时，并以 Expo 工作流替代 Vite Web 工具链作为仓库默认应用入口。

#### Scenario: 初始化后可启动开发环境

- **WHEN** 开发者在项目根目录安装依赖并执行默认开发启动命令
- **THEN** 系统 MUST 能够成功进入 Expo 开发流程，且不因缺失基础配置而失败

#### Scenario: 默认应用骨架不再依赖 Vite 工具链

- **WHEN** 开发者按照仓库默认方式运行应用骨架
- **THEN** 系统 MUST 以 Expo 原生应用作为默认运行目标，且 MUST NOT 要求保留 Vite 开发服务、浏览器首页或 Web 构建产物作为成功条件

### Requirement: 提供默认应用入口与示例页面

系统 SHALL 提供开箱即用的 Expo 应用入口、根组件装载流程与初始原生示例页面，使开发者在初始化后即可看到可运行的默认演示内容，并在统一入口上继续扩展后续功能。

#### Scenario: 首次运行展示默认页面

- **WHEN** 开发者首次启动默认应用并进入 Expo 预览
- **THEN** 应用 MUST 完成默认入口装载并展示可运行的原生示例内容

#### Scenario: 应用入口支持后续扩展

- **WHEN** 开发者基于现有默认入口继续新增页面、组件或原生演示场景
- **THEN** 当前项目结构 MUST 能作为统一的原生应用起点承载后续业务开发，而无需重新整理基础入口
