## ADDED Requirements

### Requirement: Demo site integrates chameleon components
Demo 展示站 SHALL 集成 `@system-ui-js/chameleon` 作为底层组件能力来源，并通过该组件库承载首批展示内容。

#### Scenario: Launch demo with chameleon-based UI
- **WHEN** 开发者启动 Demo 展示站
- **THEN** 页面 MUST 能基于 `@system-ui-js/chameleon` 渲染展示界面，而不是停留在默认模板页面

### Requirement: Demo homepage showcases window experience
Demo 展示站的默认首屏 SHALL 提供 Window 相关界面与交互展示，用于替换当前最小示例页面并作为首个演示场景。

#### Scenario: Open the default demo entry
- **WHEN** 用户访问 Demo 展示站默认入口
- **THEN** 系统 MUST 展示 Window 场景的界面内容与基础交互反馈

### Requirement: Demo delivery is independently buildable
Demo 展示站 SHALL 具备独立构建能力，使展示产物能够在不发布基础包的情况下单独生成和部署。

#### Scenario: Build the demo site only
- **WHEN** 维护者执行 Demo 展示站构建流程
- **THEN** 系统 MUST 单独生成可部署的展示站产物，且不要求同步执行基础包发布流程
