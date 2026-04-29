# Chameleon Expo Migration Learnings

## Initial State
- Root package: `@system-ui-js/base` v0.1.0
- Current chameleon: `0.2.0`
- Package type: module (ESM)
- Build: Vite for both lib and demo
- Current exports: `.` and `./styles.css`
- Peer deps: react, react-dom (no react-native)

## Key Files
- `src/lib/index.ts` - imports `./styles/base.css` (demo CSS) and exports wrappers
- `src/lib/window.tsx` - wrapper components using `className` with `sb-base-window-action`
- `src/lib/window-theme.ts` - theme definitions from chameleon
- `src/lib/styles/base.css` - demo-only CSS with `sb-base-window-action` class
- `vite.lib.config.ts` - library build config
- `vite.config.ts` - demo build config (to be removed)

## Plan
- Wave 1: Tasks 1, 2, 4 in parallel → Task 3 after 1,2 complete
- Wave 2: Tasks 5, 7 in parallel → Task 6 after 5,7 complete
- Wave 3: F1-F4 final verification

## Critical Constraints
- NO yarn workspaces
- NO web demo entrypoints after removal
- Root package must remain publishable
- Example app must be private, no Expo Router
- Must consume root package by name, not deep imports

## Task 1 Learnings
- Root package contract now targets `@system-ui-js/chameleon@0.3.0` and mirrors upstream native support by adding `react-native@>=0.74` as a peer.
- `build:example` is wired to Expo export smoke commands at the root contract level even before the `example/` app lands in later tasks.
- On this machine, `yarn install` needs `Node v24.15.0` in `PATH` because `eslint-visitor-keys@5.0.1` rejects the default `Node v23.11.1` engine range.

## Task 3 Learnings
- Wrapper prop types stay aligned with Chameleon `0.3.0` most safely when derived from `ComponentProps<typeof CButton | typeof CWindow | typeof CWindowBody | typeof CWindowTitle>` instead of re-stating web/native-facing fields locally.
- The wrapper layer can remain native-safe without importing `react-native` types directly by reusing Chameleon component prop types for `style` and keeping action button sizing as inline style composition.
- `window-theme.ts` should keep using the package-entry `defaultThemeDefinition`, `win98ThemeDefinition`, and `winXpThemeDefinition`; wrapper code should only resolve their `className` tokens and not reintroduce CSS-side assumptions.

## Task 5 Learnings
- Yarn 1 `file:..` dependencies behave like install-time snapshots here, so the Expo example must rebuild the root library and run `yarn install --force --frozen-lockfile` in `prestart`/`prebuild` to refresh the package contents before Expo commands.
- Pointing `example/tsconfig.json` at `../dist/index.d.ts` keeps `@system-ui-js/base` imports on the package name while still type-checking against the publishable declaration surface.
- `tsconfig.lib.json` should exclude `src/lib/**/*.test.*` so `build:lib` stays focused on publishable library sources and remains usable as the example refresh hook.

## Task 7 Learnings
- Minimal wrapper-contract tests can stay in `node` Jest environment by calling wrapper functions directly and asserting forwarded React element props, without pulling in DOM or `@testing-library/react`.
- `@system-ui-js/chameleon` should be mocked at the module boundary so regression coverage stays focused on wrapper concerns like theme token resolution, resize option merging, title action prop mapping, and inline native-safe button style composition.
- With root ESM enabled, `jest.config.cjs` plus a dedicated `tsconfig.jest.json` keeps Jest isolated from library build settings and avoids leaking test files into declaration output.
- On this machine, Jest install and execution also need `Node v24.15.0` in `PATH`; the default `v23.11.1` still trips ecosystem engine constraints.

## Task 6 Learnings
- Root `tsconfig.json` works better as a no-emit umbrella project for lint/editor coverage after the web demo removal; `build:lib` should keep using `tsconfig.lib.json` so publishable output stays isolated.
- `tsconfig.lib.json` can keep library artifacts self-contained by placing its `tsBuildInfoFile` under `dist/`, which matches the library-only publish surface.
- Root `build:example` should refresh `example/` with `yarn --cwd example install --force --frozen-lockfile` before Expo export, otherwise the `file:..` dependency can lag behind freshly built library output.
- Root dev tooling needs `react-native` installed as a dev dependency so ESLint type-aware rules can fully resolve Chameleon `0.3.0` props that expose `react-native` style types.
- `example/dist-*` should be ignored by ESLint once Expo smoke exports become part of the root verification flow.

## F2 Code Quality Review Learnings
- Wrapper API stability is acceptable in `src/lib/window.tsx` when prop types continue to derive from Chameleon component `ComponentProps` and native sizing stays in `style` objects rather than CSS classes.
- Keeping the root package `build` script tied to the Expo example is too fragile for package-quality verification; CI/publish flows should validate the library independently from the demo app.
- Yarn 1 `file:..` installs are especially brittle when the source tree contains generated example artifacts; ignoring `example/node_modules`, `example/dist-*`, and other local outputs is necessary to keep local package snapshots reproducible.
- The remaining `react-dom` peer dependency is now a contract smell because the example proves it is present only as peer-dependency baggage, not because the native wrapper needs it.

- 2026-04-26 F1 audit: static deliverables for tasks 1-7 are present, and CI-shape/runtime checks pass when run in plan order (`build`, `test`, `pack`, Expo exports).

- 2026-04-26: F1 rerun passed after adding .yarnrc with ignore-engines true; frozen install, build, test, pack, manifest checks, and jest mock verification all succeeded.
- 2026-04-26 F2 rerun: `yarn build`, `yarn test --runInBand`, and `yarn lint` all pass; the reviewed wrapper/theme/example/CI files have no high-severity code-quality defects under the plan constraints.
- 2026-04-26 F2 rerun: YAML LSP is unavailable in this container, so `.github/workflows/ci-pr.yml` required manual review even though runtime validation passed.
