# Task F3 Fix 2: screenId Leak Fix

## Root Cause
`FileBrowserWindow` (`src/demo/file-browser-window.tsx` line 70) did NOT destructure `screenId` from its props. Since `screenId` is passed to every WindowComponent by `ScreenComponent` (via `screenId={props.screenId}`), it remained in `...windowRestProps` and was spread to `<CWindow {...windowRestProps}>`. Chameleon's CWindow then forwarded it to the underlying DOM `<div>`, causing the React warning:

> "React does not recognize the `screenId` prop on a DOM element."

## Fix Applied
**File:** `src/demo/file-browser-window.tsx` line 70

**Before:**
```ts
const { windowProps, store, fullscreen: isFullscreen, resizable, movable, ...windowRestProps } = props;
```

**After:**
```ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { windowProps, store, fullscreen: isFullscreen, resizable, movable, screenId: _screenId, ...windowRestProps } = props;
```

Added `screenId: _screenId` to the destructure, prefixed with underscore since it's unused by this component. Added `eslint-disable-next-line` to suppress unused-vars lint warning.

## Verification
- **Unit tests:** 66/66 PASS (`yarn test:run`)
- **LSP diagnostics:** Zero errors on changed file
- **Playwright Scenario G:** PASS — opened Demo Window + File Browser + fullscreen toggle, zero React console warnings
- **Playwright Scenario A:** PASS — open/close windows, zero warnings
- **Playwright Scenario F:** PASS — fullscreen toggle, zero warnings

## Pattern Match
Confirmed by comparing with `windows-desktop-demo.tsx` line 36 which already correctly destructures `screenId`:
```ts
const { screenId, windowProps, store, fullscreen: isFullscreen, resizable, movable, ...windowRestProps } = props;
```
