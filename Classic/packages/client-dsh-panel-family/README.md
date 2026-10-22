# @playform/client-dsh-panel-family

The central panel package of the UI family. It owns the **panel contract**
and nothing else (Documentation/Plans/UI-Family/PHASE-2-PANEL-CONTRACT.md).

## What it does

- **The contract types** (`Source/Interface/Panel.ts`): `PanelMount`,
  `PanelSection`, `SectionProps`, `LaunchTarget`, `PanelRegistry`. They are
  the ONLY shared artifact in the whole UI family design; every adapter
  imports them with `import type` only (no runtime import between the
  central package and any adapter).
- **The registry service**: the client half provides
  `playformFamilyPanel` (`register`, `unregister`, `entries`, `subscribe`,
  `getVersion`, `open`). Re-registering replaces in place; unregistering
  cascades the overlay views the section opened; `entries()` returns
  sections ordered by `(order, id)`.
- **The mount points**: the `conversation.view` family tab
  (`id: playform-family`, default order 20) renders every section with
  mount `family-tab`; the `shell.overlay` mount renders sections with
  mount `overlay`, opened via `open({ view, focus })`.
- **Zero adapter logic**: the 13 per-bundle adapters register their own
  sections; this package renders whatever is registered.

## What it is not

No host service, no Typert endpoint, no adapter. The host half of the
Loader entry is an empty `apply()` - the row exists so the client module
system serves the `./client` half. The tail/stats endpoint lives in
`@playform/client-dsh-panel-family-host`.

## Config

| Field            | Type                | Default | Meaning                                  |
| ---------------- | ------------------- | ------- | ---------------------------------------- |
| `enabled`        | boolean             | `true`  | the package ships enabled (pure client)  |
| `tabOrder`       | number              | `20`    | family tab order in `conversation.view`  |
| `overlayMaxWidth`| number              | `720`   | overlay max width (px)                   |
| `locale`         | `"en" \| "zh"`      | `"en"`  | the panel's own strings                  |

All knobs are volatile (hot edits commit without remounting).

## Build

`pnpm prepublishOnly` (Build + tsc). The `./client` export is built to
`Target/Client.js`; the locale JSON ships from `Source/Variable/`.
