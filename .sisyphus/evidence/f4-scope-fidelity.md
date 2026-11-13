# F4 Scope Fidelity Check

Result: PASS

Scope deviations: none

Checks performed:
- Web demo artifacts absent: `src/main.tsx`, `src/App.tsx`, `vite.config.ts`, `index.html`, and `src/styles/` do not exist.
- Root package is not converted to Yarn workspaces and is not marked `private`; root remains publishable via `package.json` exports/build scripts.
- `example/package.json` is `private: true` and contains no `publishConfig`.
- Root package remains the sole publishable package; publish CI still targets root package only.
- Native orientation preserved: root peers include `react-native`, `example/` is Expo-based, and CI contains no standalone web-demo build steps.
- No banned scope regressions found: no deep imports from `src/lib/*` inside `example/`, and no remaining `src/lib/styles/base.css` usage.

Supporting references:
- `.sisyphus/plans/chameleon-expo-migration.md`
- `package.json`
- `example/package.json`
- `example/App.tsx`
- `example/app.json`
- `.github/workflows/ci-pr.yml`
- `.github/workflows/publish.yml`
