## ADDED Requirements

### Requirement: 提供统一的 ESLint 代码检查能力

系统 MUST 集成适用于 React 与 TypeScript 源码的 ESLint 检查能力，并提供统一入口以验证项目代码是否符合约定的质量规则。

#### Scenario: 示例项目通过静态检查

- **WHEN** 开发者在未修改初始脚手架代码的情况下执行代码检查命令
- **THEN** 系统能够完成 ESLint 检查且不报告阻止开发的基础错误

#### Scenario: 违规代码可被检查发现

- **WHEN** 开发者在受管控的源码文件中引入违反既定规则的代码
- **THEN** 系统能够通过 ESLint 输出对应的检查结果并提示修正

### Requirement: 提供与 ESLint 兼容的 Prettier 格式化能力

系统 SHALL 集成 Prettier 作为统一代码格式化工具，并确保其在项目中的使用方式不会与既有 ESLint 质量规则产生冲突。

#### Scenario: 开发者执行格式化命令

- **WHEN** 开发者对项目源码执行统一格式化命令
- **THEN** 系统能够按统一格式整理代码文件

#### Scenario: 格式化后的代码仍可继续检查

- **WHEN** 开发者先执行代码格式化再执行代码检查
- **THEN** 系统能够在不因工具配置冲突而失败的情况下完成检查
