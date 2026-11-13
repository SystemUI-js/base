# Task 4 — OpenSpec Review: No Delta Required

## Decision

**No OpenSpec delta required.**

## Reasoning

Reviewed `openspec/specs/window-demo-showcase/spec.md` end-to-end (32 lines total).

### Relevant requirement (lines 16–23)

```markdown
### Requirement: Demo homepage showcases window experience

Demo 展示站的默认首屏 SHALL 提供 Window 相关界面与交互展示，用于替换当前最小示例页面并作为首个演示场景。

#### Scenario: Open the default demo entry

- **WHEN** 用户访问 Demo 展示站默认入口
- **THEN** 系统 MUST 展示 Window 场景的界面内容与基础交互反馈
```

### Analysis

The existing requirement (line 18) states the demo "SHALL provide Window-related UI and interaction showcase" ("Window 相关界面与交互展示"). The scenario acceptance criterion (line 23) says the system "MUST display Window scene interface content and basic interaction feedback" ("界面内容与基础交互反馈").

Fullscreen behavior — where a fullscreen Window fills the screen and disables resize/move — is **basic interaction feedback** already covered by this requirement. The fix ensures the Window correctly fills the viewport in fullscreen state and properly disables resize handles and move dragging, which are correctness fixes to existing behavior, not new user-visible capabilities.

No new requirement scenario is needed because:
1. Fullscreen is an existing Window feature already exposed by Chameleon (`isFullscreen()` gates resize at chameleon lines 8516-8528).
2. The bug was that the demo didn't apply correct layout/styling for fullscreen state — a CSS + prop-passing fix, not a new capability.
3. The spec's "basic interaction feedback" (line 23) already encompasses fullscreen as a standard window interaction pattern.

### Other requirements reviewed

- **Lines 7–14**: "Demo site integrates chameleon components" — not affected.
- **Lines 25–32**: "Demo delivery is independently buildable" — not affected.
