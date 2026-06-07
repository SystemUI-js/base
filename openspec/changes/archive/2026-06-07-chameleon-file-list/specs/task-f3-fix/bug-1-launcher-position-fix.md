# Bug 1: Launcher Button Overlays Fullscreen Window Close Button

## Problem
The "打开文件浏览器" launcher button was positioned at `position: fixed; top: 10px; right: 10px; z-index: 9999` in `src/demo/windows-desktop-demo.tsx` line 162. When a window entered fullscreen (filling the `.system-ui-js__screen` container), the window's title-bar close button (around x=1120, y=6) fell underneath this launcher button, making it unclickable.

## Fix Applied
Changed `right: 10px` to `left: 10px` in the launcher button's inline style. This moves it to the top-left corner of the viewport, far from the fullscreen window's close button zone (right side).

### File: `src/demo/windows-desktop-demo.tsx` line 162
```diff
- <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
+ <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 9999 }}>
```

## Trade-off
- **Chosen approach (B)**: Top-left corner positioning. Simplest fix, no refactoring needed.
- **Alternative (A)**: Adding launcher to the existing CStartBar (taskbar) would be semantically cleaner but requires more refactoring of the DemoBar component.
- **Alternative (C)**: Lowering z-index would make the button invisible when any window is focused, not just fullscreen.

## Verification
- Playwright confirmed launcher button is at x=0, y=0 (top-left)
- Fullscreen window close button is now clickable
- All 66 unit tests pass
