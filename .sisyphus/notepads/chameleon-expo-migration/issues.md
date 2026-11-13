# Chameleon Expo Migration Issues

## Task 6
- `lsp_diagnostics` cannot validate `.yml` or `.json` changes in this container because `yaml-language-server` and `biome` are configured but not installed.

## F2 Code Quality Review
- Root `yarn build` still depends on `build:example`, so CI/publish verification is coupled to the demo app instead of the publishable library only.
- `example/package.json` refreshes `@system-ui-js/base` through `file:..` plus `yarn install --force --frozen-lockfile`; on this branch that flow fails with `ENOENT` while copying `example/dist-example-android/metadata.json` during `yarn build`.
- `.gitignore` does not ignore `example/node_modules`, `example/dist-*`, or `package.tgz`, so normal example/build activity leaves commitable artifacts in the worktree.
- `react-dom` is still required only to satisfy the package peer contract, leaving a native-package dependency inconsistency unresolved.

- 2026-04-26 F1 audit: implementation scope matches the plan, but root `yarn install --frozen-lockfile` fails under Node v23.11.1 because `eslint-visitor-keys@5.0.1` rejects that engine range; all other audited build/test/export checks passed.

- 2026-04-26: Previous Node 23 engine mismatch is resolved for this audit path by .yarnrc with ignore-engines true; no blocking F1 issues remain.
- 2026-04-26 F2 rerun: `example/package.json` still contains `yarn install --force --frozen-lockfile` in `prestart` and `prebuild`; current `yarn build` passes, so this is now a medium-severity brittleness issue rather than a blocking failure.
