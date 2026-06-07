# Tasks

## Plan: chameleon-file-list
- [x] 1. Extend FileManager public API types
- [x] 2. Preserve default rendering while adding renderItem inputs
- [x] 3. Wire CList displayMode and icon mode without grid scope creep
- [x] 4. Implement drag-into-folder move validation and rename flow
- [x] 5. Polish FileManager CSS and drag-visible states without redesign
- [x] 6. Opt in Demo file browser to draggable moves and external errors
- [x] 7. Expand FileManager Vitest coverage for render and drag contracts
- [x] 8. Update Demo tests and mocks for draggable FileManager
- [x] 9. Add Playwright dependency, scripts, and config
- [x] 10. Add real browser drag-into-folder E2E and CI step
- [x] 11. Add OpenSpec change artifacts for file manager drag and Playwright tooling
- [x] 12. Run final local verification and package checks

## Plan: fix-window-fullscreen-behavior
- [x] 1. Diagnostic and API Verification
- [x] 2. Fullscreen 100% Layout TDD + Fix
- [x] 3. Force Resize and Move Disabled in Fullscreen TDD + Fix
- [x] 4. OpenSpec Review and Regression Gates

## Plan: window-manager-layering
- [x] 1. Add red tests for WindowManager active, z-index, minimize, maximize, restore
- [x] 2. Implement WindowManager state model and APIs
- [x] 3. Export new manager types and adjust base CSS for observable states
- [x] 4. Wire WindowsDesktopDemo to manager-backed behavior with titlebar controls

## Plan: window-manager
- [x] 1. Add Vitest + React Testing Library test foundation
- [x] 2. Define WindowManager public types and lifecycle contract
- [x] 3. Implement browser render host and native slot adapter
- [x] 4. Implement WindowManager and WindowInstance lifecycle behavior
- [x] 5. Compose managed window UI and package styles
- [x] 6. Export WindowManager API and protect build/CI hygiene
- [x] 7. Add minimal demo usage for on-screen creation
