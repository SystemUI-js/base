## Why

当前 Demo 首页已经能展示 Window 能力，但界面是偏工作台式的多面板场景，与“只展示一个 Win98 主题窗口”的目标不一致，也会分散对基础窗口能力本身的关注。现在需要把默认 Demo 收敛为更聚焦的 Win98 风格单窗口展示，以便让首屏观感更直观、演示意图更明确。

## What Changes

- 将 Demo 默认首屏调整为单一的 Win98 主题窗口展示，替换当前较复杂的工作台式布局。
- 移除默认场景中的多窗口、模式切换、摘要指标、日志面板等非必要演示元素。
- 在窗口内容区保留少量静态文字，用于展示基础排版与窗口承载效果。
- 继续通过 `@system-ui-js/base` 的公开导出渲染窗口能力，保持 Demo 对公共 API 的验证价值。

## Capabilities

### New Capabilities
<!-- 无新增能力 -->

### Modified Capabilities
- `window-demo-showcase`: 收紧默认首页展示要求，使 Demo 首屏呈现单一 Win98 主题窗口，并以简洁文字内容完成基础展示。

## Impact

- `openspec/specs/window-demo-showcase/spec.md`
- `src/App.tsx`
- `src/styles/app.css`
- Demo 首屏的视觉结构与默认交互范围
