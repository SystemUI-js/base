## Why

当前仓库还没有一个统一的 React 前端项目初始化方案，开始开发前需要手动拼装基础工程与代码规范工具。现在创建一个基于 Vite 的 React + TypeScript 脚手架，并内置 ESLint 与 Prettier，可以让后续功能开发直接建立在一致、可维护的基础上。

## What Changes

- 新建一个基于 React、Vite 和 TypeScript 的前端项目基础结构。
- 配置项目启动、构建与开发所需的基础脚本和目录约定。
- 集成 ESLint，用于静态检查与统一代码质量规则。
- 集成 Prettier，用于统一代码格式，并与 ESLint 的使用方式保持兼容。
- 提供初始示例页面与入口文件，确保项目可直接启动和扩展。

## Capabilities

### New Capabilities

- `react-vite-typescript-app`: 定义基于 React + Vite + TypeScript 的项目脚手架、入口结构与基础运行能力。
- `code-quality-tooling`: 定义 ESLint 与 Prettier 的集成方式、基础配置以及开发时的代码规范保障能力。

### Modified Capabilities

- 无

## Impact

- 影响代码：项目根目录初始化文件、`src/` 应用代码、TypeScript 配置、Vite 配置、Lint/Format 配置文件。
- 影响依赖：新增 React、Vite、TypeScript、ESLint、Prettier 及相关插件依赖。
- 影响开发流程：增加统一的启动、构建、检查与格式化入口，降低后续协作成本。
