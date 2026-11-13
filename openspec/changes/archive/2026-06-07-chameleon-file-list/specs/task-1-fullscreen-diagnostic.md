# Task 1 — Fullscreen Diagnostic & API Verification

> READ-ONLY diagnostic. No source files were modified.

---

## 1. Root Cause Confirmed

### 1a. Missing fullscreen modifier class on window frame

`CWindow.getWindowFrameClassName()` returns a static `"cm-window-frame"` string with **no fullscreen modifier**:

```js
// chameleon.es.js:8535-8537
getWindowFrameClassName() {
    return this.mergeThemeClassName("cm-window-frame", this.props.theme) ?? "cm-window-frame";
}
```

`CWindow.isFullscreen()` (line 8518-8519) exists but **only gates resize** — it does NOT influence the frame className:

```js
// chameleon.es.js:8516-8528
class V_ extends on {
  isFullscreen() {
    return this.props.fullscreen === !0;
  }
  renderResizeHandles() {
    return this.isFullscreen() ? null : super.renderResizeHandles();
  }
  setupResizeDrags() {
    this.isFullscreen() || super.setupResizeDrags();
  }
```

**Conclusion**: Chameleon provides no reliable fullscreen class or selector on the frame element. CSS cannot target fullscreen windows via Chameleon's built-in API.

### 1b. Movement callbacks always injected into CWindowTitle regardless of fullscreen

`CWindow.getFrameMoveHandleProps()` **unconditionally** returns move callbacks:

```js
// chameleon.es.js:8562-8572
isFrameMoveHandleElement(s) {
    return this.isWindowTitleElement(s);
}
getFrameMoveHandleProps() {
    return {
      onWindowMove: this.applyFrameMovePosition,
      onWindowMovePreview: this.applyFrameMovePreviewPosition,
      onWindowMovePreviewClear: this.clearFrameMovePreview,
      getWindowPose: this.getDragPose,
      moveBehavior: this.getMoveBehavior()
    };
}
```

There is **no fullscreen check** in `getFrameMoveHandleProps()`. The `isFrameMoveHandleElement` (line 8562-8563) delegates to `isWindowTitleElement`:

```js
// chameleon.es.js:8529-8530
isWindowTitleElement(s) {
    return s === Jl ? !0 : typeof s != "function" ? !1 : s.prototype instanceof Jl;
}
```

Where `Jl` is the minified reference to `CWindowTitle`. This means **any child whose `type` is exactly `CWindowTitle` (or inherits from it) will receive move callbacks** — regardless of fullscreen state.

The parent class `CWidget.mapComposedChildren` performs the clone injection:

```js
// chameleon.es.js:5563-5567
mapComposedChildren(n = this.props.children) {
    return y.Children.map(n, (a) => !y.isValidElement(a) || !this.isFrameMoveHandleElement(a.type) ? a : y.cloneElement(
      a,
      this.getFrameMoveHandleProps()
    ));
}
```

**Conclusion**: `CWindow` always injects `onWindowMove` callbacks into direct `CWindowTitle` children. A fullscreen window still has a draggable title bar.

---

## 2. Frame Prop Spread & Style Filtering

`CWidget.renderFrame()` (line 5739-5775) destructures known props and spreads the rest onto the frame `<div>`:

```js
// chameleon.es.js:5739-5775 (excerpt)
renderFrame(n, a, u) {
    const { x: h, y: m, width: g, height: P } = a ?? this.getFrameState(), {
      style: E, x: D, y: I, width: F, height: O, children: $,
      theme: w, active: C, onActive: R, resizable: G,
      moveBehavior: X, resizeBehavior: K, resizeOptions: V,
      ...ne                               // <-- all remaining props
    } = this.props,
    // ...
    return /* @__PURE__ */ b("div", {
      "data-testid": (u == null ? void 0 : u.testId) ?? "widget-frame",
      className: N,
      style: ie,
      ...ne,                              // <-- spread onto frame div
      children: n
    });
}
```

`filterLayoutStyle()` (line 5733-5738) strips layout fields from the `style` prop:

```js
// chameleon.es.js:5733-5738
filterLayoutStyle(n) {
    if (!n) return {};
    const a = { ...n };
    return delete a.position, delete a.top, delete a.right,
           delete a.bottom, delete a.left, delete a.width, delete a.height, a;
}
```

**Key insight**: `data-*` attributes passed as props to `CWindow` will propagate through `...ne` onto the frame `<div>`. However, `style` layout fields (`position`, `top`, `width`, etc.) are stripped by `filterLayoutStyle`. This justifies using `data-system-ui-fullscreen="true"` (an HTML attribute) rather than `style` for fullscreen layout overrides.

**className concern**: If a caller passes `className` to `CWindow`, it ends up in `...ne` and **overrides** the computed `N` (which includes theme classes from `mergeThemeClassName`). This makes `className` an unreliable marker for fullscreen. A `data-*` attribute avoids this conflict entirely.

---

## 3. No `movable` Prop Exists

### CWindowProps (Window.d.ts:5-12)

```ts
export interface CWindowProps extends CWidgetProps {
    children?: React.ReactNode;
    theme?: string;
    moveBehavior?: CWindowInteractionBehavior;
    resizeBehavior?: CWindowInteractionBehavior;
    /** 全屏模式下自动禁用 resize */
    readonly fullscreen?: boolean;
}
```

### CWidgetPropsBase (Widget.d.ts:17-28)

```ts
export interface CWidgetPropsBase extends WidgetLayoutProps {
    children?: React.ReactNode;
    theme?: string;
    active?: boolean;
    onActive?: (active: boolean) => void;
    resizable?: boolean;
    moveBehavior?: WidgetInteractionBehavior;
    resizeBehavior?: WidgetInteractionBehavior;
    resizeOptions?: CWidgetResizeOptions;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}
```

**Confirmed**: `resizable` exists as a boolean prop. There is **no `movable` boolean** anywhere in the type declarations. Grep for `movable` across `node_modules/@system-ui-js/chameleon/dist/components` returned **zero matches**.

---

## 4. Chosen LOCAL Mechanisms

Since we cannot modify Chameleon, the fix uses three local mechanisms:

### Mechanism 1: `data-system-ui-fullscreen="true"` attribute on the frame

- **Why**: `data-*` attributes propagate through CWindow's `...ne` prop spread onto the frame `<div>` (line 5774). They do not conflict with Chameleon's `className` merging (line 5763-5766) or `style` filtering (line 5733-5738).
- **How**: Pass `data-system-ui-fullscreen="true"` as a prop to `<CWindow>`. CSS in `screen/index.css` targets `[data-system-ui-fullscreen="true"]` for 100vw/100vh layout.

### Mechanism 2: `resizable={false}` AFTER prop spreads

- **Why**: `CWindow` already supports `resizable` boolean (Widget.d.ts:22). Placing `resizable={false}` after any caller prop spreads ensures fullscreen always overrides.
- **How**: In the fullscreen window component, spread caller props first, then `resizable={false}`.

### Mechanism 3: StaticWindowTitle wrapper to bypass clone injection

- **Why**: Chameleon's `cloneElement` move-handle injection at line 5563-5567 checks `this.isFrameMoveHandleElement(a.type)` which compares element type against `CWindowTitle` via reference equality (`s === Jl`) or prototype chain (`s.prototype instanceof Jl`) at line 8529-8530. A thin wrapper component (e.g., `StaticWindowTitle`) has a **different `type` reference** and does NOT inherit from `CWindowTitle`, so it bypasses the clone injection entirely.
- **How**: Create a wrapper that renders `<CWindowTitle>` internally but is itself a distinct component type. In fullscreen mode, use this wrapper instead of raw `<CWindowTitle>`.

---

## 5. Evidence Sources

| Finding | File | Lines |
|---------|------|-------|
| Fullscreen only gates resize | `chameleon.es.js` | 8516-8528 |
| Frame class has no fullscreen modifier | `chameleon.es.js` | 8535-8537 |
| Move callbacks unconditionally returned | `chameleon.es.js` | 8562-8572 |
| CWindowTitle type check (reference + prototype) | `chameleon.es.js` | 8529-8530 |
| CWidget clone injection of move handles | `chameleon.es.js` | 5563-5567 |
| Frame props spread (data-* propagates) | `chameleon.es.js` | 5739-5775 |
| Style layout fields filtered | `chameleon.es.js` | 5733-5738 |
| CWindow.render passes frameClassName + theme | `chameleon.es.js` | 8587-8600 |
| CWindowProps: fullscreen, resizable, no movable | `Window.d.ts` | 5-12 |
| CWidgetPropsBase: resizable exists, no movable | `Widget.d.ts` | 17-28 |
| Grep for `movable` in .d.ts files | N/A | **0 matches** |

---

## 6. Git Diff Verification

`git diff -- src node_modules .yalc` was captured to `.omo/evidence/task-1-no-source-diff.log`.

**Result**: 7 files changed, 457 insertions(+), 125 deletions(-) — **all pre-existing changes in `src/`**, NOT introduced by this diagnostic task. The diagnostic task is purely read-only and did not modify any source, node_modules, or .yalc files.

Changed files (pre-existing):
- `src/demo/file-browser-window.test.tsx`
- `src/demo/file-browser-window.tsx`
- `src/demo/windows-desktop-demo.test.tsx`
- `src/demo/windows-desktop-demo.tsx`
- `src/lib/screen/index.tsx`
- `src/lib/windowManager/index.ts`
- `src/lib/windowManager/windowManager.test.ts`
