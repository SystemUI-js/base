## ADDED Requirements

### Requirement: Base exports system and screen components

`@system-ui-js/base` SHALL publicly export `System` and `Screen` components, plus their prop types, so consumers can build desktop-like composition trees without importing from deep implementation files or `@system-ui-js/chameleon` directly.

#### Scenario: Import system primitives from base package

- **WHEN** a consumer imports system primitives from `@system-ui-js/base`
- **THEN** the package MUST provide `System`, `Screen`, and their corresponding prop types from its public entrypoint

### Requirement: System provides desktop host lifecycle

`System` SHALL establish the system-level host and theme context for its descendants, accept children, and expose `onBoot` and `onLoad` lifecycle callbacks that run once per component mount in boot-before-load order.

#### Scenario: Render children inside a default system host

- **WHEN** a consumer renders `System` with child content and no explicit system or theme props
- **THEN** the system MUST render the children inside a Windows-style host using the default Win98-compatible theme context

#### Scenario: Notify system lifecycle callbacks

- **WHEN** a `System` instance is mounted with `onBoot` and `onLoad` callbacks
- **THEN** the system MUST call `onBoot` during the boot phase before calling `onLoad` during the loaded phase, and MUST NOT call either callback more than once during the same mount

### Requirement: Screen provides widget positioning container

`Screen` SHALL represent a single screen within a `System`, support multiple sibling screens under the same system, and provide a relative-positioned, full-size, overflow-clipped container suitable for Window, future Start Bar, and other `CWidget`-based descendants.

#### Scenario: Render a screen inside a system

- **WHEN** a consumer renders `Screen` as a child of `System`
- **THEN** the screen MUST create a bounded screen container that can host positioned widget descendants without relying on page-level layout selectors

#### Scenario: Render multiple screens in one system

- **WHEN** a consumer renders multiple `Screen` components inside the same `System`
- **THEN** the system MUST preserve each screen as an independent screen container and MUST NOT require a single-screen-only structure
