## 1. 组件与公开 API

- [x] 1.1 梳理现有 `src/lib` 导出、主题类型以及 `@system-ui-js/chameleon` 中 `SystemHost`、`CScreen` 的可用 props
- [x] 1.2 新增 `System` 组件与 `SystemProps` 类型，组合 `SystemHost` 和 `BaseThemeProvider` 并提供默认 `systemType="windows"`、`theme="win98"`
- [x] 1.3 实现 `System` 的 `onBoot` 与 `onLoad` 生命周期，确保同一次挂载内各调用一次且 `onBoot` 先于 `onLoad`
- [x] 1.4 新增 `Screen` 组件与 `ScreenProps` 类型，基于 `CScreen` 薄封装并支持同一 `System` 下多个兄弟屏幕
- [x] 1.5 为 `Screen` 增加基础 className 与样式，提供相对定位、全尺寸和溢出裁剪的 widget 容器语义
- [x] 1.6 更新 `src/lib/index.ts` 导出 `System`、`Screen` 及其 prop 类型，并保持既有 `BaseWindow` API 不变

## 2. Demo 展示集成

- [x] 2.1 更新 `src/App.tsx`，通过 `@system-ui-js/base` 公开入口消费 `System`、`Screen` 与 `BaseWindow`
- [x] 2.2 将 Demo 默认结构调整为 `System -> Screen -> BaseWindow`，呈现单一 Win98 主题窗口
- [x] 2.3 将默认窗口内容精简为少量静态说明文本或列表，移除非必要工作台式交互展示
- [x] 2.4 重构 `src/styles/app.css`，移除依赖页面首个子节点的布局规则并迁移为 Demo 专用屏幕与窗口样式

## 3. 验证与收尾

- [x] 3.1 根据现有测试结构补充或更新 `System` 导出、生命周期顺序和 `Screen` 容器行为的验证
- [x] 3.2 运行类型检查或构建命令，确认公开导出、组件类型与 Demo 渲染链路可用
- [x] 3.3 检查变更未新增依赖、未修改 `BaseWindow` 公开行为，并记录无法自动验证的事项
