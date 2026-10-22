# SCHEME - @playform/client-dsh-panel-family

The package's contract scheme (Documentation/Plans/UI-Family/ PHASE-2-PANEL-CONTRACT.md).

## 1. Identity

| Place            | Value                               |
| ---------------- | ----------------------------------- |
| package name     | `@playform/client-dsh-panel-family` |
| `name` export    | `client-dsh-panel-family`           |
| service name     | `playformFamilyPanel`               |
| tab id           | `playform-family` (order 20)        |
| locale namespace | `client-dsh-panel-family`           |

## 2. The loader contract

Object form: `name`, `apply` (empty - the pure client posture), `Config` (the Schemastery schema),
`inject` (`[]` - no host services). The default object carries all four.

## 3. The panel contract (`Source/Interface/Panel.ts`)

- `PanelMount` = `"family-tab" | "overlay" | "sidebar"`.
- `SectionProps` = `{ sessionId?, useTrajectory?, open(LaunchTarget) }`.
- `LaunchTarget` = `{ view, focus? }`.
- `PanelSection` = `{ id, bundle, title, order, mount, render(props) }`.
- `PanelRegistry` = `{ register, unregister, entries, subscribe, getVersion, open }`.

Adapter rule: `import type` only; no runtime import from an adapter into this package or the
reverse.

## 4. The client half (`./client`)

Named exports `inject = ["slots", "locale"]` and `apply(ctx)`. The body:

1. `ctx.reflect.provide("playformFamilyPanel", registry)`.
2. `ctx.effect` - locale dictionaries (`Variable/Locale-en.json`, `Variable/Locale-zh.json`).
3. `ctx.effect` - `conversation.view` tab `playform-family` (family-tab sections, ordered
   `(order, id)`).
4. `ctx.effect` - `shell.overlay` mount (overlay sections; `open()` wired through the registry).

Everything unwinds with the plugin.

## 5. The ledger

This package keeps no ledger file (pure client, no host writes).
