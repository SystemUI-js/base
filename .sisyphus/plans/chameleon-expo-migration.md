# Chameleon 0.3.0 Expo Migration for `@system-ui-js/base`

## TL;DR
> **Summary**: Upgrade `@system-ui-js/chameleon` to `0.3.0`, remove the existing web demo pipeline, keep `@system-ui-js/base` as the only published package, and add a private native Expo example app that validates the library against the new Chameleon runtime model.
> **Deliverables**:
> - Root package upgraded to `@system-ui-js/chameleon@0.3.0`
> - Web demo entrypoints/config removed
> - Library wrappers made native-safe and free of demo CSS exports
> - Private `example/` Expo app added for iOS/Android validation
> - Minimal Jest coverage and CI updated for the new shape
> **Effort**: Large
> **Parallel**: YES - 3 waves
> **Critical Path**: 1 → 2 → 3 → 5 → 6

## Context
### Original Request
Update `chameleon` to `0.3.0`, adapt this repo to Chameleon’s Expo-era changes, convert the current project to an Expo-oriented project, and completely abandon the current web side.

### Interview Summary
- User selected `Expo Managed` as the target mode.
- User wants this repo to remain a library and also include an example app.
- User wants all current web-specific code and build chain removed, not merely disabled.
- User wants scripts, build config, and CI migrated as part of the same work.
- User wants minimal automated tests added and wired into CI.

### Metis Review (gaps addressed)
- Treat `src/lib/styles/base.css` as demo-only styling, not a library asset.
- Do not convert the publishable root package into a Yarn 1 workspace root; keep the root publishable and keep `example/` private.
- Make the remaining library CSS coupling explicit: replace `sb-base-window-action` class-based styling in `src/lib/window.tsx:141` with a native-safe style path.
- Keep acceptance criteria explicit for package output, example validation, CI, and peer dependency policy.

## Work Objectives
### Core Objective
Ship a native-oriented `@system-ui-js/base` package that wraps `@system-ui-js/chameleon@0.3.0`, publishes only the root library package, and validates usage through a private Expo example app instead of the removed Vite web demo.

### Deliverables
- Root `package.json` and `yarn.lock` updated for `@system-ui-js/chameleon@0.3.0` and native-oriented scripts.
- `src/lib/` wrappers updated for Chameleon `0.3.0` and stripped of demo CSS coupling.
- Web demo files and web-only config removed from the repo.
- `example/` Expo app added with local root-package consumption and native smoke validation.
- Jest-based regression coverage for the wrapper contract.
- CI workflows updated to validate library build, tests, package packing, and native example export smoke.

### Definition of Done (verifiable conditions with commands)
- `yarn install --frozen-lockfile` succeeds at repo root.
- `yarn build` succeeds and emits a publishable root `dist/` without rebuilding the deleted Vite demo.
- `yarn test --runInBand` succeeds.
- `yarn pack --filename package.tgz` succeeds from repo root.
- `yarn --cwd example expo export --platform ios --output-dir dist-example-ios` succeeds.
- `yarn --cwd example expo export --platform android --output-dir dist-example-android` succeeds.
- `test ! -f src/main.tsx && test ! -f src/App.tsx && test ! -f vite.config.ts && test ! -f tsconfig.app.json && test ! -f index.html` succeeds.

### Must Have
- Upgrade dependency from `@system-ui-js/chameleon@0.2.0` in `package.json:33` to `0.3.0`.
- Keep the root package publishable via `.github/workflows/publish.yml:15`.
- Remove the demo-only CSS export rooted at `src/lib/index.ts:1` and `package.json:10`.
- Preserve the public wrapper surface exported from `src/lib/index.ts:3` unless an upstream breaking change forces a documented rename.
- Validate the package in a native Expo example app without reintroducing a web demo.

### Must NOT Have
- No Yarn workspace conversion for the publishable root package.
- No new Vite demo entrypoint, `react-dom` mount root, or `index.html`-driven preview.
- No remaining import of `src/lib/styles/base.css` from the publishable library surface.
- No deep imports from `src/lib/*` inside the example app; consume the root package name only.
- No release of the `example/` app as a second npm package.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after with Jest + `ts-jest` using wrapper-contract tests and module mocks.
- QA policy: Every task includes agent-executed happy-path and edge/failure validation.
- Evidence bootstrap: Run `mkdir -p .sisyphus/evidence` before any task-level QA scenario.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Tasks 1-4 (`package contract`, `native-safe wrapper styling`, `chameleon wrapper refactor`, `web demo removal`)
Wave 2: Tasks 5-7 (`Expo example app`, `tooling + CI migration`, `Jest regression coverage`)
Wave 3: Final verification wave F1-F4

### Dependency Matrix (full, all tasks)
- `1` blocks `3`, `5`, `6`, `7`
- `2` blocks `3`, `7`
- `3` blocks `5`, `7`
- `4` blocks `5`, `6`
- `5` blocks `6`
- `6` depends on `1`, `4`, `5`, `7`
- `7` depends on `1`, `2`, `3`
- `F1-F4` depend on `1-7`

### Agent Dispatch Summary
- Wave 1 → 4 tasks → `unspecified-high`, `quick`
- Wave 2 → 3 tasks → `unspecified-high`, `quick`
- Wave 3 → 4 tasks → `oracle`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Rebuild the root package contract around Chameleon `0.3.0`

  **What to do**: Update `package.json:23` so the root package remains the only published package while switching `@system-ui-js/chameleon` from `0.2.0` to `0.3.0`. Add `react-native` to root `peerDependencies`, keep `react-dom` as a compatibility peer while upstream Chameleon still declares it, remove the demo-facing `./styles.css` export from `package.json:10`, and redefine scripts so `yarn build` validates the library plus the native example instead of `build:demo`. Update `yarn.lock` accordingly.
  **Must NOT do**: Do not add Yarn workspaces to the root package. Do not leave `build:demo`, `preview:demo`, or `dev:demo` scripts behind. Do not create a second publishable package manifest under `example/`.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: package contract, peer dependency, and script changes affect publish, install, and downstream consumption.
  - Skills: `[]` - No extra skill is required beyond precise repo edits.
  - Omitted: `git-master` - No git history operation is required for this task.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: `3`, `5`, `6`, `7` | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `package.json:23` - Current scripts and dependency contract to replace.
  - Pattern: `package.json:33` - Current `@system-ui-js/chameleon` dependency pinned to `0.2.0`.
  - Pattern: `.github/workflows/ci-pr.yml:30` - Root install/build/pack pipeline that still assumes the old build scripts.
  - Pattern: `.github/workflows/publish.yml:68` - Publish job currently trusts `yarn build` before `npm publish`.
  - Pattern: `vite.lib.config.ts:8` - Existing library build output path and externals.
  - External: `https://r.cnpmjs.org/@system-ui-js/chameleon/-/chameleon-0.3.0.tgz` - `0.3.0` archive confirms peer deps `react`, `react-dom`, `react-native` and Expo-era dev scripts.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `node -e "const pkg=require('./package.json'); if(pkg.dependencies['@system-ui-js/chameleon']!=='0.3.0') process.exit(1); if(!pkg.peerDependencies['react-native']) process.exit(1); if(pkg.exports['./styles.css']) process.exit(1);"`
  - [ ] `node -e "const pkg=require('./package.json'); ['build:demo','preview:demo','dev:demo'].forEach((key)=>{ if(pkg.scripts[key]) process.exit(1); }); if(!pkg.scripts.build || !pkg.scripts['build:lib'] || !pkg.scripts['build:example']) process.exit(1);"`
  - [ ] `yarn install --frozen-lockfile`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Root manifest matches the native-only library contract
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'node -e "const pkg=require(\"./package.json\"); console.log(JSON.stringify({dep:pkg.dependencies[\"@system-ui-js/chameleon\"], peers:pkg.peerDependencies, scripts:pkg.scripts}, null, 2));" | tee .sisyphus/evidence/task-1-package-contract.json'`; then run the two acceptance `node -e` checks.
    Expected: Evidence file shows Chameleon `0.3.0`, root peers include `react-native`, and no `./styles.css` export or demo scripts remain.
    Evidence: .sisyphus/evidence/task-1-package-contract.json

  Scenario: Old script names are rejected
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'node -e "const pkg=require(\"./package.json\"); const old=[\"build:demo\",\"preview:demo\",\"dev:demo\"]; const leftovers=old.filter((key)=>pkg.scripts[key]); if(leftovers.length){console.error(leftovers.join(\",\")); process.exit(1);} console.log(\"ok\");" | tee .sisyphus/evidence/task-1-package-contract-error.txt'`.
    Expected: Command prints `ok`; any leftover demo script fails the task.
    Evidence: .sisyphus/evidence/task-1-package-contract-error.txt
  ```

  **Commit**: NO | Message: `chore(base): refresh package contract for expo migration` | Files: `package.json`, `yarn.lock`

- [x] 2. Remove demo CSS from the library surface and make button sizing native-safe

  **What to do**: Delete the publish-path CSS import from `src/lib/index.ts:1`, remove the demo-only stylesheet `src/lib/styles/base.css:1`, and replace the `sb-base-window-action` class-based width behavior in `src/lib/window.tsx:141`/`src/lib/window.tsx:151` with an inline/native-safe style merge that uses Chameleon `0.3.0`'s `style` prop instead of `className`. Preserve the public `BaseWindowActionButtonProps` contract unless a type conflict with `0.3.0` forces a documented change.
  **Must NOT do**: Do not keep any CSS file under `src/lib/`. Do not reintroduce another generated CSS export for button sizing. Do not remove caller-provided `className` or `style` pass-through unless required by upstream types.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: the fix is tightly scoped to the wrapper layer and the root cause is already known.
  - Skills: `[]` - No external skill needed.
  - Omitted: `ai-slop-remover` - This is a targeted API/style migration, not a polish pass.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: `3`, `7` | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/index.ts:1` - Current library import that pulls demo CSS into the published surface.
  - Pattern: `src/lib/window.tsx:141` - `BaseWindowActionButton` implementation to convert from class-based sizing.
  - Pattern: `src/lib/window.tsx:151` - Current `sb-base-window-action` class merge.
  - Pattern: `src/lib/styles/base.css:50` - The only library-referenced CSS class slated for removal.
  - External: `https://r.cnpmjs.org/@system-ui-js/chameleon/-/chameleon-0.3.0.tgz` - `dist/components/Button/Button.d.ts` shows `style?: StyleProp<ViewStyle>` on `CButtonProps`, enabling a native-safe replacement.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `! grep -q "styles/base.css" src/lib/index.ts`
  - [ ] `! grep -q "sb-base-window-action" src/lib/window.tsx`
  - [ ] `test ! -f src/lib/styles/base.css`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Library surface no longer ships demo CSS
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c '(grep -n "styles/base.css\\|sb-base-window-action" src/lib/index.ts src/lib/window.tsx || true) | tee .sisyphus/evidence/task-2-native-style-scan.txt'`; then run `test ! -f src/lib/styles/base.css`.
    Expected: Evidence file contains no matches and the old stylesheet path no longer exists.
    Evidence: .sisyphus/evidence/task-2-native-style-scan.txt

  Scenario: Wrapper still accepts caller styling after class removal
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'node -e "const src=require(\"fs\").readFileSync(\"src/lib/window.tsx\",\"utf8\"); if(!src.includes(\"style\")) process.exit(1); console.log(\"style-pass-through-present\");" | tee .sisyphus/evidence/task-2-native-style-error.txt'`.
    Expected: Evidence shows the component still handles `style` rather than relying on the removed CSS class.
    Evidence: .sisyphus/evidence/task-2-native-style-error.txt
  ```

  **Commit**: NO | Message: `refactor(base): remove demo css from library surface` | Files: `src/lib/index.ts`, `src/lib/window.tsx`, `src/lib/styles/base.css`

- [x] 3. Refactor wrapper components to the Chameleon `0.3.0` runtime contract

  **What to do**: Update `src/lib/window.tsx:1`, `src/lib/window-theme.ts:1`, and `src/lib/index.ts:3` to match Chameleon `0.3.0`'s hybrid runtime: keep using `Theme`, `CButton`, `CWindow`, `CWindowBody`, and `CWindowTitle`, preserve the wrapper export names, and ensure all forwarded props align with the new `react-native`-aware types. Keep default resize behavior, theme resolution, and title action mapping intact, but explicitly validate that no DOM-only assumptions remain in the wrapper layer.
  **Must NOT do**: Do not rename `BaseThemeProvider`, `BaseWindow`, `BaseWindowTitle`, `BaseWindowBody`, or `BaseWindowActionButton` unless the TypeScript build proves it is unavoidable. Do not deep-import from Chameleon internals; stay on package-entry exports only.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this is the contract-preserving core of the migration.
  - Skills: `[]` - No additional skill is required.
  - Omitted: `refactor` - This task is API migration work, not a broad architecture refactor.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: `5`, `7` | Blocked By: `1`, `2`

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/window.tsx:1` - Current wrapper implementation over Chameleon `0.2.0`.
  - Pattern: `src/lib/window-theme.ts:1` - Theme definition mapping that must keep working with `0.3.0` exports.
  - Pattern: `src/lib/index.ts:3` - Public API surface that must remain stable.
  - Pattern: `tsconfig.lib.json:3` - Current declaration-only build path for published types.
  - External: `https://r.cnpmjs.org/@system-ui-js/chameleon/-/chameleon-0.3.0.tgz` - `dist/components/Window/Window.d.ts`, `WindowTitle.d.ts`, `WindowBody.d.ts`, and `Theme/Theme.d.ts` confirm the retained component names and `react-native` style types.
  - External: `https://r.cnpmjs.org/@system-ui-js/chameleon/-/chameleon-0.3.0.tgz` - README states `CButton`, `Theme`, `CWindow`, `CWindowTitle`, and `CWindowBody` are inside the RN-primitive boundary, matching this package’s actual usage surface.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn build:lib`
  - [ ] `node -e "const fs=require('fs'); const src=fs.readFileSync('src/lib/index.ts','utf8'); ['BaseThemeProvider','BaseWindow','BaseWindowTitle','BaseWindowBody','BaseWindowActionButton'].forEach((name)=>{ if(!src.includes(name)) process.exit(1); });"`
  - [ ] `node -e "const src=require('fs').readFileSync('src/lib/window-theme.ts','utf8'); ['defaultThemeDefinition','win98ThemeDefinition','winXpThemeDefinition'].forEach((name)=>{ if(!src.includes(name)) process.exit(1); });"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Wrapper API remains stable after the dependency upgrade
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'yarn build:lib | tee .sisyphus/evidence/task-3-wrapper-build.txt'`; then run the two `node -e` export checks.
    Expected: The library builds cleanly and the public wrapper exports remain present.
    Evidence: .sisyphus/evidence/task-3-wrapper-build.txt

  Scenario: Wrapper source no longer assumes the old CSS-backed contract
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'node -e "const src=require(\"fs\").readFileSync(\"src/lib/window.tsx\",\"utf8\"); if(src.includes(\"styles/base.css\")||src.includes(\"sb-base-window-action\")) process.exit(1); console.log(\"native-safe-wrapper\");" | tee .sisyphus/evidence/task-3-wrapper-error.txt'`.
    Expected: Evidence prints `native-safe-wrapper`; any leftover demo CSS dependency fails the task.
    Evidence: .sisyphus/evidence/task-3-wrapper-error.txt
  ```

  **Commit**: NO | Message: `refactor(base): align wrappers with chameleon 0.3.0` | Files: `src/lib/index.ts`, `src/lib/window.tsx`, `src/lib/window-theme.ts`

- [x] 4. Remove the current web demo application and its web-only config chain

  **What to do**: Delete the DOM demo entrypoints and web-only config chain: `src/main.tsx:1`, `src/App.tsx:1`, `src/styles/app.css`, `src/styles/index.css`, `vite.config.ts:1`, `tsconfig.app.json:1`, and `index.html:1`. Update `tsconfig.json:3` so it no longer references the removed app config. Keep `vite.lib.config.ts:1` only as the root library build config unless task 6 proves a better equivalent.
  **Must NOT do**: Do not leave dead references to removed files in scripts, TS project references, or ESLint scopes. Do not remove `vite.lib.config.ts` unless its replacement is already implemented in the same branch.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: files to remove are already enumerated and isolated.
  - Skills: `[]` - No extra skill needed.
  - Omitted: `review-work` - Final review belongs to F1-F4, not this task.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: `5`, `6` | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/main.tsx:1` - Current `react-dom` mount root to remove.
  - Pattern: `src/App.tsx:1` - Current Vite demo UI to remove.
  - Pattern: `src/styles/app.css:1` - Demo-only styling file.
  - Pattern: `src/styles/index.css:1` - Demo entry styling file.
  - Pattern: `vite.config.ts:1` - Current demo dev/build config.
  - Pattern: `tsconfig.app.json:1` - Demo-only TS config and alias.
  - Pattern: `tsconfig.json:3` - Root project references that must stop pointing at the removed demo.
  - Pattern: `index.html:1` - Vite HTML entry to delete.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `test ! -f src/main.tsx && test ! -f src/App.tsx && test ! -f vite.config.ts && test ! -f tsconfig.app.json && test ! -f index.html`
  - [ ] `test ! -d src/styles`
  - [ ] `node -e "const ts=require('./tsconfig.json'); if((ts.references||[]).some((ref)=>String(ref.path).includes('tsconfig.app.json'))) process.exit(1);"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: All known web demo files are gone
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'for path in src/main.tsx src/App.tsx src/styles/app.css src/styles/index.css vite.config.ts tsconfig.app.json index.html; do if [ -e "$path" ]; then echo "leftover:$path"; exit 1; fi; done | tee .sisyphus/evidence/task-4-web-removal.txt'`.
    Expected: Command exits 0 and evidence file stays empty or contains only success output.
    Evidence: .sisyphus/evidence/task-4-web-removal.txt

  Scenario: Root TS project no longer references the removed app config
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'node -e "const ts=require(\"./tsconfig.json\"); const bad=(ts.references||[]).find((ref)=>String(ref.path).includes(\"tsconfig.app.json\")); if(bad) process.exit(1); console.log(\"ok\");" | tee .sisyphus/evidence/task-4-web-removal-error.txt'`.
    Expected: Evidence prints `ok`; any remaining app reference fails the task.
    Evidence: .sisyphus/evidence/task-4-web-removal-error.txt
  ```

  **Commit**: NO | Message: `chore(base): remove legacy web demo files` | Files: `src/main.tsx`, `src/App.tsx`, `src/styles/*`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.json`, `index.html`

- [x] 5. Add a private native Expo example app under `example/`

  **What to do**: Create `example/` as a private Expo Managed app with a single `App.tsx` entry (no router), `app.json`, `babel.config.js`, `tsconfig.json`, and `package.json`. Make the app consume the root package by package name, using a local `file:..` dependency rather than Yarn workspaces. Add prestart/prebuild scripts that refresh the root library build before Expo commands so `example/` validates the same surface that `npm publish` would ship. Include `react-dom` in the example only if needed to satisfy Chameleon’s current peer contract; document that this is compatibility plumbing, not restored web support.
  **Must NOT do**: Do not publish `example/`. Do not use Expo Router. Do not import `../src/lib/*` directly from the example app. Do not convert the repo root to `private: true` just to enable workspaces.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Expo app scaffolding and local package consumption need careful coordination.
  - Skills: `[]` - No extra skill required.
  - Omitted: `frontend-ui-ux` - This is a validation app, not a design task.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: `6` | Blocked By: `1`, `3`, `4`

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `package.json:2` - Root package name is `@system-ui-js/base`; the example must consume this exact package name.
  - Pattern: `src/lib/index.ts:3` - Public API the example app must consume.
  - Pattern: `src/lib/window.tsx:68` - `BaseWindow` wrapper to exercise in the example app.
  - Pattern: `src/lib/window.tsx:96` - `BaseWindowTitle` wrapper to exercise in the example app.
  - Pattern: `src/lib/window.tsx:119` - `BaseWindowBody` wrapper to exercise in the example app.
  - Pattern: `src/lib/window.tsx:141` - `BaseWindowActionButton` wrapper to exercise in the example app.
  - External: `https://r.cnpmjs.org/@system-ui-js/chameleon/-/chameleon-0.3.0.tgz` - Upstream package metadata shows Expo-era dev scripts and confirms the package is intended to be previewed through Expo.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `test -f example/package.json && test -f example/App.tsx && test -f example/app.json && test -f example/babel.config.js && test -f example/tsconfig.json && test -f example/yarn.lock`
  - [ ] `node -e "const pkg=require('./example/package.json'); if(!pkg.private) process.exit(1); if(pkg.main && pkg.main.includes('expo-router')) process.exit(1); if(pkg.dependencies['@system-ui-js/base']!=='file:..') process.exit(1);"`
  - [ ] `yarn --cwd example install --frozen-lockfile`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Example app consumes the root package and stays private
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'node -e "const pkg=require(\"./example/package.json\"); console.log(JSON.stringify({private:pkg.private, main:pkg.main, baseDep:pkg.dependencies[\"@system-ui-js/base\"]}, null, 2));" | tee .sisyphus/evidence/task-5-example-manifest.json'`; then run the acceptance `node -e` check.
    Expected: Evidence shows `private: true`, no Expo Router entry, and `@system-ui-js/base` wired through `file:..`.
    Evidence: .sisyphus/evidence/task-5-example-manifest.json

  Scenario: Example app rejects deep source imports
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c '(grep -R "\.\./src/lib\|src/lib/" example --line-number || true) | tee .sisyphus/evidence/task-5-example-manifest-error.txt'`; then run `test ! -s .sisyphus/evidence/task-5-example-manifest-error.txt`.
    Expected: No deep-import match exists; the example uses only `@system-ui-js/base`.
    Evidence: .sisyphus/evidence/task-5-example-manifest-error.txt
  ```

  **Commit**: NO | Message: `feat(example): add native expo validation app` | Files: `example/*`, `example/yarn.lock`

- [x] 6. Rework build, lint, and CI around the library + native example split

  **What to do**: Keep the root library build focused on `dist/` by adapting `vite.lib.config.ts:1`, `tsconfig.lib.json:1`, and `package.json:23`. Update `tsconfig.json:3` and `eslint.config.js:13` for the post-demo layout. Keep `tsconfig.base.json:5`'s DOM libs unless the Chameleon `0.3.0` type surface proves they can be dropped, because upstream still exposes HTML-flavored props on some types. Update `.github/workflows/ci-pr.yml:16` to run install, lint, library build, tests, package pack, and native example smoke export. Update `.github/workflows/publish.yml:15` so publishing still builds the library artifact and only validates the example as a non-published smoke step.
  **Must NOT do**: Do not make CI depend on a web build. Do not drop `yarn pack` validation from PR CI unless an equivalent package-integrity check is added in the same change. Do not force the publish job to package `example/`.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: this task crosses build config, lint config, and release automation.
  - Skills: `[]` - No extra skill required.
  - Omitted: `opsx-apply` - This is not an OpenSpec execution task.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: none | Blocked By: `1`, `4`, `5`, `7`

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `vite.lib.config.ts:1` - Current library build config to retain/adapt.
  - Pattern: `tsconfig.lib.json:3` - Current declaration-only library build config.
  - Pattern: `tsconfig.base.json:5` - DOM libs currently enabled; keep unless upstream types no longer require them.
  - Pattern: `tsconfig.json:3` - Root TS references that must reflect the new layout.
  - Pattern: `eslint.config.js:13` - Root lint scope and ignored paths.
  - Pattern: `.github/workflows/ci-pr.yml:16` - Current PR CI job to rewrite around tests + native export smoke.
  - Pattern: `.github/workflows/publish.yml:15` - Current publish job that builds before `npm publish`.
  - Pattern: `package.json:23` - New root scripts wired by task 1 must be consumed by CI.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `yarn build`
  - [ ] `yarn pack --filename package.tgz`
  - [ ] `yarn --cwd example expo export --platform ios --output-dir dist-example-ios && yarn --cwd example expo export --platform android --output-dir dist-example-android`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Root build and package integrity still work after demo removal
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'yarn build | tee .sisyphus/evidence/task-6-toolchain-build.txt'`; then run `bash -o pipefail -c 'yarn pack --filename package.tgz | tee .sisyphus/evidence/task-6-toolchain-pack.txt'`.
    Expected: Both commands exit 0 and `package.tgz` is produced from the root package only.
    Evidence: .sisyphus/evidence/task-6-toolchain-build.txt

  Scenario: Native example smoke export passes for both platforms
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'yarn --cwd example expo export --platform ios --output-dir dist-example-ios | tee .sisyphus/evidence/task-6-toolchain-ios.txt'`; then run `bash -o pipefail -c 'yarn --cwd example expo export --platform android --output-dir dist-example-android | tee .sisyphus/evidence/task-6-toolchain-android.txt'`.
    Expected: Both exports complete without invoking a web build path.
    Evidence: .sisyphus/evidence/task-6-toolchain-android.txt
  ```

  **Commit**: NO | Message: `build(base): wire expo-native validation into toolchain` | Files: `package.json`, `vite.lib.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.github/workflows/*`

- [x] 7. Add minimal Jest regression coverage for the wrapper contract

  **What to do**: Introduce root-level Jest infrastructure aligned with the new wrapper-only test scope: add `jest.config.*`, any setup file needed, and focused tests for `src/lib/window.tsx` and `src/lib/window-theme.ts`. Mock `@system-ui-js/chameleon` so the tests verify wrapper behavior rather than upstream rendering internals. Cover at least: theme class resolution, resize option merging, title action mapping, and the native-safe action-button style path that replaced the deleted CSS class.
  **Must NOT do**: Do not add browser-E2E tooling. Do not build tests around the deleted demo app. Do not assert Chameleon’s internal rendering details beyond the props this library forwards.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: test design must stay stable across the dependency upgrade while covering the wrapper contract precisely.
  - Skills: `[]` - No extra skill required.
  - Omitted: `playwright` - Browser automation is unnecessary for wrapper-contract testing.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: `6` | Blocked By: `1`, `2`, `3`

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/window.tsx:22` - Default resize options that need regression coverage.
  - Pattern: `src/lib/window.tsx:32` - Theme class resolution helper to cover.
  - Pattern: `src/lib/window.tsx:96` - `BaseWindowTitle` prop mapping to `actionButton`.
  - Pattern: `src/lib/window.tsx:141` - `BaseWindowActionButton` implementation after the native-safe styling change.
  - Pattern: `src/lib/window-theme.ts:7` - Theme class-name mapping to assert.
  - External: `https://r.cnpmjs.org/@system-ui-js/chameleon/-/chameleon-0.3.0.tgz` - Upstream package metadata uses Jest, making Jest the lowest-friction alignment for this repo too.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `test -f jest.config.cjs || test -f jest.config.js || test -f jest.config.ts`
  - [ ] `yarn test --runInBand`
  - [ ] `grep -R "jest.mock('@system-ui-js/chameleon'" src --line-number`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Wrapper regression suite passes end-to-end
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'yarn test --runInBand | tee .sisyphus/evidence/task-7-jest-suite.txt'`.
    Expected: Jest exits 0 and covers the wrapper contract without touching the removed demo app.
    Evidence: .sisyphus/evidence/task-7-jest-suite.txt

  Scenario: Tests fail if the Chameleon wrapper contract stops being mocked
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c '(grep -R "jest.mock('\''@system-ui-js/chameleon'\''" src --line-number || true) | tee .sisyphus/evidence/task-7-jest-suite-error.txt'`; then run `test -s .sisyphus/evidence/task-7-jest-suite-error.txt`.
    Expected: Evidence proves the suite mocks the upstream package instead of asserting Chameleon internals directly.
    Evidence: .sisyphus/evidence/task-7-jest-suite-error.txt
  ```

  **Commit**: NO | Message: `test(base): cover wrapper contract after expo migration` | Files: `jest.config.*`, `tests/*`, `src/lib/__tests__/*`, `package.json`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle

  **What to do**: Run an Oracle audit against the completed diff plus `.sisyphus/plans/chameleon-expo-migration.md` and verify every deliverable, guardrail, and acceptance criterion is represented in the implementation or explicitly called out as not applicable.
  **Must NOT do**: Do not accept partial compliance. Do not collapse missing deliverables into "follow-up work" during this wave.

  **Acceptance Criteria**:
  - [ ] Oracle returns `PASS` with zero missing deliverables and zero guardrail violations.

  **QA Scenarios**:
  ```
  Scenario: Full plan-to-implementation audit passes
    Tool: Task
    Steps: Run `task(subagent_type="oracle", load_skills=[], run_in_background=false, prompt="Audit the implementation against .sisyphus/plans/chameleon-expo-migration.md. Return PASS/FAIL, list missing deliverables, broken acceptance criteria, and guardrail violations.")`; save the full result to `.sisyphus/evidence/f1-plan-compliance.md`.
    Expected: Oracle returns `PASS` and reports no missing deliverables or guardrail violations.
    Evidence: .sisyphus/evidence/f1-plan-compliance.md

  Scenario: Any plan mismatch blocks completion
    Tool: Task
    Steps: If Oracle returns `FAIL`, save the failure report to `.sisyphus/evidence/f1-plan-compliance-fail.md`, fix the cited gaps, and rerun F1 before any other final-wave task is marked complete.
    Expected: No final-wave completion is reported while Oracle is in `FAIL` state.
    Evidence: .sisyphus/evidence/f1-plan-compliance-fail.md
  ```

- [x] F2. Code Quality Review — unspecified-high

  **What to do**: Run a hands-on code-quality review over the changed files, focusing on native-safety, dependency hygiene, dead config removal, and maintainability of the new example-app integration.
  **Must NOT do**: Do not re-open closed scope by proposing unrelated refactors. Do not approve with unresolved type, packaging, or dependency inconsistencies.

  **Acceptance Criteria**:
  - [ ] Reviewer returns `PASS` with zero high-severity code-quality defects.

  **QA Scenarios**:
  ```
  Scenario: Code-quality review approves the changed surface
    Tool: Task
    Steps: Run `task(category="unspecified-high", load_skills=[], run_in_background=false, prompt="Review the completed diff for code quality. Focus on wrapper API stability, native-safe styling, package/build config consistency, and example-app maintainability. Return PASS/FAIL with severity-tagged findings.")`; save the result to `.sisyphus/evidence/f2-code-quality.md`.
    Expected: Review returns `PASS` with zero high-severity findings.
    Evidence: .sisyphus/evidence/f2-code-quality.md

  Scenario: High-severity findings trigger a fix-and-rerun loop
    Tool: Task
    Steps: If review returns `FAIL` or any high-severity issue, save the report to `.sisyphus/evidence/f2-code-quality-fail.md`, fix every cited issue, and rerun F2 until the report is `PASS`.
    Expected: F2 cannot be marked complete while any high-severity issue remains open.
    Evidence: .sisyphus/evidence/f2-code-quality-fail.md
  ```

- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)

  **What to do**: Execute the real validation commands from the plan on the finished implementation: root install, root build, root test, root pack, Expo iOS export, and Expo Android export. If the example app has an interactive surface worth checking, use Playwright only for any web-free screenshot or harness step that still exists locally; otherwise keep this wave command-driven.
  **Must NOT do**: Do not substitute static inspection for the required command execution. Do not skip either native export path.

  **Acceptance Criteria**:
  - [ ] All required commands exit `0` and produce the expected artifacts/evidence.

  **QA Scenarios**:
  ```
  Scenario: End-to-end command validation passes
    Tool: Bash
    Steps: Run `mkdir -p .sisyphus/evidence`; then run `bash -o pipefail -c 'yarn install --frozen-lockfile | tee .sisyphus/evidence/f3-install.txt'`; `bash -o pipefail -c 'yarn build | tee .sisyphus/evidence/f3-build.txt'`; `bash -o pipefail -c 'yarn test --runInBand | tee .sisyphus/evidence/f3-test.txt'`; `bash -o pipefail -c 'yarn pack --filename package.tgz | tee .sisyphus/evidence/f3-pack.txt'`; `bash -o pipefail -c 'yarn --cwd example expo export --platform ios --output-dir dist-example-ios | tee .sisyphus/evidence/f3-ios.txt'`; `bash -o pipefail -c 'yarn --cwd example expo export --platform android --output-dir dist-example-android | tee .sisyphus/evidence/f3-android.txt'`.
    Expected: Every command exits `0`, `package.tgz` exists, and both native export directories are generated.
    Evidence: .sisyphus/evidence/f3-android.txt

  Scenario: Any failed validation command blocks sign-off
    Tool: Bash
    Steps: If any command above fails, capture the failing output in the corresponding `.sisyphus/evidence/f3-*.txt` file, fix the root cause, and rerun the entire F3 sequence.
    Expected: F3 is not marked complete until the full command sequence succeeds in one clean pass.
    Evidence: .sisyphus/evidence/f3-build.txt
  ```

- [x] F4. Scope Fidelity Check — deep

  **What to do**: Run a scope-fidelity review that compares the completed implementation to the original user request and confirms no web target, workspace conversion, or second publishable package slipped back in.
  **Must NOT do**: Do not approve if any removed web artifact is reintroduced or if the implementation adds unrequested features.

  **Acceptance Criteria**:
  - [ ] Reviewer returns `PASS` with zero scope deviations.

  **QA Scenarios**:
  ```
  Scenario: Final scope review confirms the branch stayed within request boundaries
    Tool: Task
    Steps: Run `task(category="deep", load_skills=[], run_in_background=false, prompt="Compare the completed implementation to the original user request and .sisyphus/plans/chameleon-expo-migration.md. Return PASS/FAIL and list any scope drift, especially any remaining web target, workspace conversion, or extra published package.")`; save the result to `.sisyphus/evidence/f4-scope-fidelity.md`.
    Expected: Review returns `PASS` and reports no remaining web target or unrequested scope expansion.
    Evidence: .sisyphus/evidence/f4-scope-fidelity.md

  Scenario: Scope drift forces remediation before completion
    Tool: Task
    Steps: If the review returns `FAIL`, save it to `.sisyphus/evidence/f4-scope-fidelity-fail.md`, remove every cited drift item, and rerun F4.
    Expected: F4 remains open until the drift report is empty and the reviewer returns `PASS`.
    Evidence: .sisyphus/evidence/f4-scope-fidelity-fail.md
  ```

## Commit Strategy
- Create a single final commit only after F1-F4 all pass and the user explicitly approves completion.
- Commit message: `feat(base): migrate chameleon wrappers to expo-native example workflow`
- Do not create intermediate commits per task unless the executor encounters a repo policy that requires smaller reviewable slices.

## Success Criteria
- Root package remains publishable as `@system-ui-js/base`.
- Current web demo chain is fully removed rather than left dormant.
- Root library no longer exports or depends on demo CSS.
- Native example app proves the package can render and bundle on Expo iOS and Android.
- Automated tests cover wrapper contract regressions introduced by the Chameleon `0.3.0` migration.
