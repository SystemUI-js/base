# Design: Chameleon File List & Window Fixes

## Context
- Existing `FileManager` component uses `CList` for rendering.
- Existing `WindowManager` manages window lifecycle.
- Chameleon `CWindow` lacks some native fullscreen behaviors.

## Decisions
- **File List API**: `displayMode: 'list' | 'icon'`, `sizeRatio: 0..1`, `renderItem` with 4 args.
- **Drag Behavior**: Use `CList.onItemDragInto` with `position === 'inside'` only.
- **Move Implementation**: `fileSystem.promises.rename` with no service wrapper.
- **Fullscreen Strategy**: Use `data-system-ui-fullscreen` attribute for CSS styling and disable `resizable`/`movable` via props/wrapper.
- **Window Stacking**: Monotonically increasing `zIndex` assigned on focus.

## Risks
- CList `dragTo()` is unreliable for custom components; use manual pointer sequence.
- Fullscreen state requires wrapper component to prevent move-handle injection.
