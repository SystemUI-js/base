# Draft: Fullscreen Window Behavior

## Requirements (confirmed)
- 用户原话："现在按了全屏按钮，窗口并没有全屏，我期望是按了全屏按钮，窗口的宽高都变为 100%，且因为是全屏，应该表现为不允许 resize，现在窗口有一个 props 是 resizable 的，如果是全屏状态应该强制 false，movable 也是强制 false"
- 点击全屏按钮后，窗口宽高都应变为 `100%`。
- 全屏状态下应强制不可 resize，即即使 `props.resizable` 为 `true`，实际行为也应为 `false`。
- 全屏状态下应强制不可 movable，即即使 `props.movable` 为 `true`，实际行为也应为 `false`。

## Technical Decisions
- 仓库检测到 OpenSpec：已读取 `openspec/specs/window-demo-showcase/spec.md` 与 `openspec/specs/base-package-distribution/spec.md`，本次修复属于 Window demo / base component 行为修正。
- 包管理器约束：仓库要求统一使用 `yarn`，计划中的验证命令不得使用 npm。

## Research Findings
- OpenSpec `window-demo-showcase` 要求 demo 默认入口展示 Window 场景界面内容与基础交互反馈。
- OpenSpec `base-package-distribution` 要求基础包可独立构建与交付。
- 已启动代码探索任务：定位 Window 组件、fullscreen 状态、`resizable`/`movable` 处理、移动/缩放行为与测试基础设施。

## Open Questions
- 退出全屏时是否必须恢复进入全屏前的宽高和位置。
- `100%` 的参照范围应是窗口父容器/工作区，还是浏览器 viewport。
- 测试策略待探索结果确认后选择。

## Scope Boundaries
- INCLUDE: 修复全屏按钮行为；全屏时强制禁用 resize 和 move；补充对应验证/测试任务。
- EXCLUDE: 新增窗口管理系统能力；更换 UI 设计；改动发布流程；引入非必要依赖。
