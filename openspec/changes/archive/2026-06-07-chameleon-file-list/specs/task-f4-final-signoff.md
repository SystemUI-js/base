# F4 Final Sign-off — fix-window-fullscreen-behavior

**Reviewer:** F4 (Final Verification Wave)
**Date:** 2026-06-06
**Plan:** `.omo/plans/fix-window-fullscreen-behavior.md`
**Prior verdicts:** F1 APPROVED, F2 APPROVED, F3 APPROVED (after 2 fix cycles)

---

## 1. Scope Fidelity Audit

### In-scope files changed (per `git diff --stat HEAD`)
| File | LOC | Plan scope? |
|---|---|---|
| `src/lib/screen/index.tsx` | +11 | ✅ explicit (line 41) |
| `src/lib/screen/index.css` | +11 | ✅ explicit (line 42) |
| `src/demo/windows-desktop-demo.tsx` | +45 | ✅ explicit (line 43) |
| `src/demo/file-browser-window.tsx` | +114 | ✅ explicit (line 44, conditional on diagnostic) |
| `src/lib/screen/screen.test.tsx` | +28 | ✅ explicit (line 37) |
| `src/demo/windows-desktop-demo.test.tsx` | +333 | ✅ explicit (line 38) |
| `src/demo/file-browser-window.test.tsx` | +17 | ⚠️ adjacent — mock signature update for `setWindowState` |
| `src/lib/windowManager/index.ts` | +51 | ⚠️ extension — added `setWindowState`, `width/height`, `savedGeometry` |
| `src/lib/windowManager/windowManager.test.ts` | +180 | ✅ allowed by plan line 40 ("only if state behavior changes") |

### Scope deviation analysis
The brief asserted "`windowManager/*` diffs in the branch are pre-existing from a prior plan, NOT introduced by this plan." **This claim is incorrect.** Per `git show HEAD:src/lib/windowManager/index.ts`, `setWindowState`, `savedGeometry`, and the `width/height` fields on `WindowListItem` are **introduced by this uncommitted diff**, not by HEAD commit `9e55de9`.

However, this is **not** scope creep:
- Plan line 22: "Exiting fullscreen must restore the exact previous geometry" — requires geometry save/restore mechanism.
- Plan line 40: deliverables include `windowManager.test.ts` "only if state behavior changes" — explicitly authorizes the change.
- Plan line 50 / line 160: text references `setWindowState` as if extant — the implementor recognized it was needed and added it.
- Plan line 66 forbids adding **`movable/resizable`** persistent fields without review — `width/height/savedGeometry` are geometry, not interaction. Constraint not violated.
- Plan line 22 explicitly says "do not add persistent `resizable`/`movable` fields to `WindowState`" — verified: `WindowListItem` has no such fields.

`file-browser-window.test.tsx` mock update is a minimal forced-by-API-change adjustment (adds `setWindowState: vi.fn()` and `mkdir` mock). Acceptable.

`openspec/changes/archive/2026-06-03-window-manager/` is an untracked directory unrelated to this plan, not in the diff stats output above. Out of scope, not modified.

**Verdict on scope:** ✅ All changes serve the plan's objective. No drive-by refactors, no unrelated touches.

---

## 2. Hidden Regression Audit

### Mechanism verification (independent code re-read, not summary trust)

1. **`fullscreen` prop does not leak to DOM** ✅
   - `screen/index.tsx:58` passes `fullscreen={isFullscreen}` to `WindowComponent`.
   - `windows-desktop-demo.tsx:36` destructures `fullscreen: isFullscreen` BEFORE `...windowRestProps`.
   - `file-browser-window.tsx:71` destructures `fullscreen: isFullscreen` BEFORE `...windowRestProps`.
   - Neither demo re-passes `fullscreen` to CWindow. `data-system-ui-fullscreen` (a valid `data-*` attr) is the only fullscreen signal reaching the DOM. **Confirmed clean.**

2. **`StaticWindowTitle` stable identity** ✅
   - `windows-desktop-demo.tsx:33`: `const StaticWindowTitle = (props) => <CWindowTitle {...props} />;` defined at **module level**.
   - `file-browser-window.tsx:67`: same pattern, module level.
   - Per inherited finding, Chameleon's `mapComposedChildren` (dist 5563-5567) uses reference equality on `CWindowTitle`. A module-level wrapper has a stable distinct `type` → bypasses clone injection of `onWindowMove`. **Correct pattern.**

3. **`resizable` after spread** ✅
   - `windows-desktop-demo.tsx:59`: `<CWindow width={400} height={300} {...windowRestProps} resizable={effectiveResizable}>` — `resizable` is the **last** prop. Caller props in `windowRestProps` cannot override.
   - `file-browser-window.tsx:175`: same pattern. **Confirmed.**

4. **`movable` never reaches CWindow** ✅
   - Both demos destructure `movable` out of props before spreading. `CWindow` API has no `movable` prop (per Chameleon `Widget.d.ts:17-29`); blocking is achieved via `TitleComponent` swap. **Confirmed.**

5. **`screenId` destructured in both demos** ✅
   - `windows-desktop-demo.tsx:36`: `screenId` destructured (used at line 49 — `props.screenId` indirectly via `screenId` capture in `createNewWindow`).
   - `file-browser-window.tsx:71`: `screenId: _screenId` destructured (unused → renamed). The F3-fix2 regression that triggered re-review is resolved.

6. **Exit-fullscreen restore uses saved geometry** ✅
   - `windowManager/index.ts:182-198`: when `state === Normal` and `savedGeometry` exists, restores `x/y/width/height` from `savedGeometry`, then strips the field. Verified by `windowManager.test.ts` "should save and restore geometry during fullscreen transitions" with concrete values (100,200,640,480).

7. **CSS selector uses `!important` and is scoped** ✅
   - `screen/index.css:12`: `.system-ui-js__screen > [data-system-ui-fullscreen="true"]` — direct-child selector, scoped to screen container, all 8 properties with `!important`. Overrides Chameleon's inline frame style.

8. **Unit tests assert real behavior** ✅
   - `windows-desktop-demo.test.tsx` checks computed `width === '100%'`, `height === '100%'` via `getComputedStyle` (not just attribute presence).
   - Restore test (line 566) saves originals BEFORE toggle, asserts exact equality AFTER round-trip.
   - Idempotency test (line 598) ON→OFF→ON re-verifies attribute + computed style.
   - `windowManager.test.ts` "no-op on unknown window ID" uses `toEqual` (deep) not reference equality — semantically valid.

### Live regression check
- `yarn test:run` → **66/66 PASS** (6 test files, 1.57s)
- LSP diagnostics on 4 implementation files → zero errors; biome `noImportantStyles` warnings are intentional (CSS must override Chameleon); other warnings are pre-existing style suggestions.

### Subtle issues found
- **NONE that block ship.**
- Minor: `setWindowState` always rebuilds `screens` array even on no-op (unknown id). Negligible perf cost, not a correctness issue.
- Minor: `screen/index.tsx:58` still passes `fullscreen={isFullscreen}` to the wrapper component. This is harmless because both demo wrappers destructure it before spreading to CWindow. But if a future window component forgets to destructure, `fullscreen` will leak again. Consider documenting the contract in `WindowComponent` type, or stripping `fullscreen` in `ScreenComponent` after the data attribute is set. **Optional future cleanup, not a blocker.**

---

## 3. Sign-off Verdict

### Strengths
- Plan's "Must Have" (line 54-59) fully delivered.
- Plan's "Must NOT Have" (line 61-66) respected: no browser Fullscreen API, no Chameleon edits, no persistent resizable/movable on WindowState.
- Real-browser QA (Playwright) confirmed all 7 scenarios after 2 fix cycles.
- Tests have non-vacuous assertions (computed style, exact geometry restoration, idempotency).
- Architecture choice (data attribute + StaticWindowTitle reference-equality bypass + post-spread resizable) is minimal, local, and reversible.

### Minor non-blockers (logged for future)
1. `fullscreen` prop is still passed by `ScreenComponent` to every WindowComponent. Each window component must destructure it. A future window component author could regress this. (~Quick: add JSDoc + lint rule.)
2. `setWindowState` no-op branch unnecessarily rebuilds the screens array. (~Quick.)

### Brief-correction note
The brief's claim that "`windowManager/*` diffs are pre-existing branch noise" is factually wrong (verified via `git show HEAD`). However, the windowManager changes ARE in-scope per plan line 40, so the conclusion (do not block) holds.

### Final Determination
All four implementation files match plan intent. All 7 invariants from "MUST DO" checklist verified by independent code re-read. 66/66 unit tests pass; LSP clean; real-browser Playwright clean. F3 round-2 regression resolved. No hidden regressions found. Safe to ship.

---

## VERDICT: APPROVE
