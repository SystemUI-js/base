# F1 Plan Compliance Audit (Rerun)

Result: PASS

Missing deliverables: none
Guardrail violations: none

## Verification commands
- yarn install --frozen-lockfile: PASS
- yarn build: PASS
- yarn test --runInBand: PASS (2 suites, 6 tests)
- yarn pack --filename package.tgz: PASS (package.tgz produced)
- legacy web file removal check: PASS
- src/styles removal check: PASS
- root package contract node check: PASS
- example package contract node check: PASS
- grep -R "jest.mock('@system-ui-js/chameleon'" src --line-number: PASS
  - src/lib/window-theme.test.ts:3
  - src/lib/window.test.tsx:4

## Static audit findings
- .yarnrc is present with ignore-engines true, and the frozen install rerun succeeds under the current Node runtime.
- Root package remains publishable as @system-ui-js/base, is not private, and does not declare workspaces.
- Root package pins @system-ui-js/chameleon to 0.3.0, keeps react-native in peerDependencies, keeps react-dom in peerDependencies as required, and does not export ./styles.css.
- Root package scripts expose build, build:lib, and build:example, with no build:demo, preview:demo, or dev:demo leftovers.
- Library surface in src/lib/index.ts exports the wrapper API only and no longer imports demo CSS.
- BaseWindowActionButton in src/lib/window.tsx uses a native-safe inline style merge instead of the removed CSS class path.
- Legacy web entrypoints and config are absent, src/styles is removed, and tsconfig.json no longer references tsconfig.app.json.
- example/package.json is private and consumes @system-ui-js/base via file:.., while example/App.tsx imports the package name instead of deep src/lib paths.
- Jest config exists at jest.config.cjs and the wrapper tests mock @system-ui-js/chameleon.
- CI and publish workflows validate install, test, build, and pack, while publishing only the root package.

## Conclusion
All required F1 rerun checks passed. The implementation satisfies the audited plan deliverables and guardrails for this wave, with zero missing deliverables and zero guardrail violations.
