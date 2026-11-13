# Bug 2: React DOM Warning "Received `true` for a non-boolean attribute `fullscreen`"

## Problem
Both `CWindow` render sites passed `fullscreen={isFullscreen || undefined}` as a prop. Chameleon's `CWindow` forwards this to its root DOM element, but `fullscreen` is not a valid HTML attribute, causing React DOM warnings.

The `data-system-ui-fullscreen` data attribute (spread via `...windowRestProps` from `src/lib/screen/index.tsx` line 59) is the canonical CSS hook that drives fullscreen styling. The `fullscreen` prop was redundant and harmful.

## Fix Applied
Removed `fullscreen={isFullscreen || undefined}` from both CWindow render sites:

### File: `src/demo/windows-desktop-demo.tsx` line 59
```diff
- <CWindow width={400} height={300} {...windowRestProps} fullscreen={isFullscreen || undefined} resizable={effectiveResizable}>
+ <CWindow width={400} height={300} {...windowRestProps} resizable={effectiveResizable}>
```

### File: `src/demo/file-browser-window.tsx` line 174
```diff
- <CWindow width={500} height={400} {...windowRestProps} fullscreen={isFullscreen || undefined} resizable={effectiveResizable}>
+ <CWindow width={500} height={400} {...windowRestProps} resizable={effectiveResizable}>
```

## Why This Works
1. `src/lib/screen/index.tsx` line 58-59 passes both `fullscreen={isFullscreen}` and `data-system-ui-fullscreen={isFullscreen ? 'true' : undefined}` to the WindowComponent.
2. Both demo components destructure `fullscreen: isFullscreen` from props (removing it from `...windowRestProps`).
3. The `data-system-ui-fullscreen` attribute flows through `...windowRestProps` to CWindow's DOM element.
4. Removing the explicit `fullscreen={isFullscreen || undefined}` stops the invalid HTML attribute from reaching the DOM.

## Verification
- Playwright confirmed no "non-boolean attribute" warnings in console
- `data-system-ui-fullscreen="true"` still correctly applied to fullscreen windows
- All 66 unit tests pass
