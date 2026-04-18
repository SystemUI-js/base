## MODIFIED Requirements

### Requirement: Demo site integrates chameleon components

Demo 演示载体 SHALL 通过 `@system-ui-js/base` 的公开导出消费 Window 能力，并以该公开入口承载默认演示内容；在本变更后，该演示载体 MUST 为 Expo 原生应用中的默认演示入口，且实现 MUST NOT 直接依赖基础包深层实现文件。

#### Scenario: Launch demo with public base exports

- **WHEN** 开发者启动默认 Demo 演示入口
- **THEN** 系统 MUST 通过 `@system-ui-js/base` 的公开导出渲染 Win98 主题窗口界面，而不是停留在 Expo 初始模板页面或直接引用深层实现入口

### Requirement: Demo homepage showcases window experience

Demo 默认演示入口的首屏 SHALL 聚焦展示一个 Win98 主题窗口，使用简洁静态文字内容替换工作台式多窗口布局，并保留对窗口标题栏、内容区与基础排版承载能力的直观展示；该首屏在本变更后 MUST 以 Expo 原生应用界面呈现，而不是以 Web 展示站页面呈现。

#### Scenario: Open the default demo entry

- **WHEN** 用户打开 Expo 示例应用的默认演示入口
- **THEN** 系统 MUST 呈现单一的 Win98 主题窗口作为首屏唯一主体，不展示辅助窗口、模式切换、摘要指标或日志面板等非必要演示元素

#### Scenario: Read the default window content

- **WHEN** 用户查看默认首屏窗口内容区
- **THEN** 系统 MUST 展示少量静态说明文本或列表，以验证窗口内容承载与基础排版可读性，而不是提供工作台式交互反馈

### Requirement: Demo delivery is independently buildable

Demo 演示载体 SHALL 具备独立于基础包发布流程的校验与交付能力；在本变更后，该能力 MUST 适配 Expo 原生项目，使演示应用能够单独执行原生校验或等价的可交付验证流程，而不要求同步执行基础包发布。

#### Scenario: Build the demo site only

- **WHEN** 维护者执行 Demo 演示载体的独立校验或交付流程
- **THEN** 系统 MUST 单独完成 Expo 演示应用的有效性验证或交付准备，且不要求同步执行基础包发布流程
