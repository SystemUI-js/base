## MODIFIED Requirements

### Requirement: Demo site integrates chameleon components

Demo 展示站 SHALL 通过 `@system-ui-js/base` 的公开导出消费 Window 能力，并以该公开入口承载默认首页展示内容；实现 MUST 不直接依赖深层实现文件作为首页渲染入口。

#### Scenario: Launch demo with public base exports

- **WHEN** 开发者启动 Demo 展示站
- **THEN** 页面 MUST 能通过 `@system-ui-js/base` 的公开导出渲染 Win98 主题窗口界面，而不是停留在默认模板页面或直接引用深层实现入口

### Requirement: Demo homepage showcases window experience

Demo 展示站的默认首屏 SHALL 聚焦展示一个 Win98 主题窗口，使用简洁静态文字内容替换工作台式多窗口布局，并保留对窗口标题栏、内容区与基础排版承载能力的直观展示。

#### Scenario: Open the default demo entry

- **WHEN** 用户访问 Demo 展示站默认入口
- **THEN** 系统 MUST 呈现单一的 Win98 主题窗口作为首屏唯一主体，不展示辅助窗口、模式切换、摘要指标或日志面板等非必要演示元素

#### Scenario: Read the default window content

- **WHEN** 用户查看默认首屏窗口内容区
- **THEN** 系统 MUST 展示少量静态说明文本或列表，以验证窗口内容承载与基础排版可读性，而不是提供工作台式交互反馈
