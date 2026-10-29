# SCHEME - @playform/ets-client-dsh-panel-family

This file states the contract scheme of the package at v4.1, which follows
Documentation/Plans/Completion-Spec/04-CLIENT.md and Documentation/Plans/UI-FAMILY-V4-1.md.

Everything below is what the code does today, and the file claims nothing else.

## 1. Identity

| Place            | Value                                              |
| ---------------- | -------------------------------------------------- |
| package name     | `@playform/ets-client-dsh-panel-family`            |
| `name` export    | `client-dsh-panel-family`                          |
| service name     | `playformFamilyPanel`                              |
| tab id           | `playform-family` (order 20)                       |
| overlay id       | `playform-family-overlay`                          |
| locale namespace | `client-dsh-panel-family`                          |
| child slots      | `playform.panel.section`, `playform.panel.overlay` |

## 2. The loader contract

The object form carries `name`, `apply` (empty, which is the pure client posture), `Config` (the
Schemastery schema), and `inject` (`[]`, because there are no host services).

The default object carries all four.

## 3. The panel contract (`Source/Interface/Panel.ts`)

- `PanelSlot` = `"playform.panel.section" | "playform.panel.overlay"` (the runtime vocabulary is
  `Source/Variable/Slots.ts`, which `satisfies` the type).
- `PanelMount` = `"family-tab" | "overlay" | "sidebar"` (legacy; mapped onto a slot).
- `PanelActivation` = `"enabled" | "disabled" | "unknown"`.
- `SectionProps` = `{ sessionId?, useTrajectory?, open(LaunchTarget) }`.
- `LaunchTarget` = `{ view, focus? }`.
- `PanelEnvelope` = `{ trace, kind, at, actor?, payload }` (the D5 envelope, mirrored structurally
  from `@playform/ets-lib-dsh-trace`; no import).
- `PanelStatus` = `{ bundle, activation, live, tail }`.
- `PanelSection` =
  `{ id, bundle, namespace, title, order, slot?, mount?, activation?, traceKinds?, match?, enabled?, render? }`.
- `PanelRegistry` = `{ register, unregister, entries, subscribe, getVersion, open }`.

The contract is types only and it emits nothing, so adapters import it with `import type` only.

The supporting contracts live beside it: `Interface/Trace.ts` for the live source,
`Interface/Form.ts` for the settings view and the generated form, `Interface/Bridge.ts` for the
plain-field bridge, `Interface/Ports.ts` for what a section receives, and `Interface/Client.ts` for
the client context face, which is the `Context` of cordis INTERSECTED with `locale` and `slots` and
never a module augmentation, because an augmentation would shadow the re-exported `Context`.

## 4. The child-slot model

Each mount registration declares its child slot in `children`:

| Registration                                | Declares                 | Kind / scope       |
| ------------------------------------------- | ------------------------ | ------------------ |
| `conversation.view` / `playform-family`     | `playform.panel.section` | `list` / `session` |
| `shell.overlay` / `playform-family-overlay` | `playform.panel.overlay` | `list` / `root`    |

The components render their declared slot through the `renderSlot` prop, and the registry supplies
the data, which is the occupancy count for the empty state and the manifests.

An adapter registers one child per slot through `Source/Function/Adapter.ts`, which also registers
the manifest.

The registry is SLOT-AWARE, so sections are keyed by id and owned per `(slot, bundle)`.

One adapter per bundle per slot runs, and a second adapter id that claims an occupied pair is
refused with the documented line, changes nothing, and returns a no-op disposer.

Re-registering the same id replaces in place, and unregister releases the ownership.

A registration without `slot` maps its `mount`, where `family-tab` becomes `playform.panel.section`
and `overlay` becomes `playform.panel.overlay`.

`entries(slot?)` orders by `(order, id)`.

## 5. The adapter contract and the reference adapters

`Source/Function/Adapter.ts` is the wiring template: inside `ctx.effect` it first registers the
manifest in the registry, and then it injects the declared child slot and registers the section
component, whose registration `inject` face carries `{ section, ports }`.

The three reference adapters (`Source/Variable/Reference/`):

| Adapter    | Bundle                                        | Namespace                       | Order | Activation                                    |
| ---------- | --------------------------------------------- | ------------------------------- | ----- | --------------------------------------------- |
| normalize  | `@playform/ets-hook-dsh-normalize-dash`       | `hook-dsh-normalize-dash`       | 10    | `enabled` (no master switch; the row decides) |
| tool-coach | `@playform/ets-hook-dsh-tool-coach`           | `hook-dsh-tool-coach`           | 30    | `enabled` (Config default)                    |
| suggester  | `@playform/ets-hook-dsh-convention-suggester` | `hook-dsh-convention-suggester` | 40    | `enabled` (Config default)                    |

The ten residual adapters follow the same pattern and ship beside them in
`Source/Variable/Reference/`, wired through Function/Reference.ts: the five remaining normalize
flavors (`hook-dsh-normalize-quotes` 11, `-ellipsis` 12, `-spaces` 13, `-invisible` 14, `-fullwidth`
15), `plugin-dsh-normalize-file` 20, the three governors (`hook-dsh-package-governor` 50,
`hook-dsh-package-pinner` 55, `hook-dsh-cargo-governor` 60), and `hook-dsh-ccr` 70.

All of them declare the `playform.panel.section` slot, the static `enabled` posture, because none of
their schemas has a master switch, and the three D5 trace names.

## 6. The status and the trace source

The panel resolves the D5 trace from the client context through `ctx.get("trace")`, where only `on`
is required and `ring` is used when present.

It seeds the tail from the recent ring of the bus, filtered to the adapter kinds, and then
subscribes to the names that each adapter declares (`Variable/Trace.ts`: `observe/stamp`,
`graph/indexed`, `graph/invalidated`), keeping the recent envelopes newest first and bounded to 8.

A tail line is `<kind> <path>`, which is the `path` of the payload when it is a non-empty string and
otherwise the `trace` id of the envelope.

The status is `live: true` when the trace exists.

The activation is the static posture of the adapter unless the newest matching envelope carries
`payload.activation` (`"enabled"` or `"disabled"`).

A missing trace gives the documented static fallback, with `live: false` and an empty tail.

## 7. The config form and the plain-field bridge

`Source/Function/Form.ts` derives the form from the serialized Schemastery schema of the namespace,
which is a `{ uid, refs }` envelope with the refs resolved, and it flattens the object fields to
dotted paths:

- `volatile` comes from `meta.volatile` of the node or of an ancestor object; `secret` comes from
  `meta.role === "secret"`; `hidden` comes from `meta.hidden === true` and is skipped; `options` is
  a union of const nodes.
- `value` and `base` come from the namespace view, and `overridden` is the presence of the path in
  the user layer rather than a value comparison.
- The form status is `unavailable` without the settings client, `loading` before the namespace view
  arrives, and `ready` otherwise, and `secret` marks a namespace that declares a secret.

Writes (`Source/Function/Apply.ts`):

| Field                            | Route                                                                | Line                                             |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| secret                           | refused                                                              | none                                             |
| volatile                         | `configForms.get(ns).mutate([{ op: "set", path, value }], revision)` | none                                             |
| plain, bridge exposed, no secret | `bridge.editFull(ns, wholeValueWithPathReplaced)`                    | `plain-field write <ns> <path>` (info)           |
| plain, namespace has a secret    | refused                                                              | `plain-field secret refused for <ns>` (warn)     |
| plain, no bridge                 | refused                                                              | `plain-field bridge unavailable for <ns>` (warn) |

The bridge resolution order tries the `panelFamilyBridge` client service first and then
`remote.playformFamilyPanel.editFull`.

The host endpoint over `ctx.configEditor.edit()` belongs to the companion package
(`@playform/ets-client-dsh-panel-family-host`) and not to this one.

## 8. The client half (`./client`)

The module has the named exports `inject = ["slots", "locale"]` and `apply(ctx)`.

The body does six things:

1. `ctx.reflect.provide("playformFamilyPanel", registry)`.
2. `ctx.effect` - locale dictionaries (`Variable/Locale-en.json`, `Variable/Locale-zh.json`).
3. `ctx.effect` - the live trace tail (subscriptions drop with the plugin).
4. `ctx.effect` - the `conversation.view` tab `playform-family`, declaring `playform.panel.section`
   and rendering it through `renderSlot`.
5. `ctx.effect` - the `shell.overlay` panel `playform-family-overlay`, declaring
   `playform.panel.overlay` and rendering it through `renderSlot`.
6. `ctx.effect` per shipped adapter (thirteen) - `panel: adapter <id>` (the registry entry and the
   child registration).

Everything unwinds with the plugin.

The `dsh.client.inject` entry of the package manifest lists `@deepseek-ai/dsh-client-ui-settings`
(the `ctx.configForms` owner) alongside the locale, the layout, and the api-remotes gateway.

## 9. The ledger lines

The client half keeps no ledger file, because it is a pure browser module, so its documented lines
go through the client logger (`Source/Variable/Lines.ts`) and stay byte-exact:

```text
client-dsh-panel-family: duplicate adapter refused for <bundle> in <slot>
client-dsh-panel-family: plain-field write <namespace> <path>
client-dsh-panel-family: plain-field bridge unavailable for <namespace>
client-dsh-panel-family: plain-field secret refused for <namespace>
```

## 10. Verification

- `prepublishOnly` builds `Target/`, writes `Target/Client.bundle.js` through
  `Maintain/Build-Client-Bundle.mjs`, builds `Target/Test/`, runs the selfcheck of the harness, and
  type-checks the Test tree.
- The five smoke folders hold the counts: `Contract-And-Wiring` 13 PASS, `Registry-And-Sections` 7
  PASS, `Child-Slot-Model` 10 PASS, `Reference-Adapter` 14 PASS, and `All-Adapters` 9 PASS, which
  covers the thirteen-manifest roster, the forms, the two write routes, and the built bundle
  executed through a fake `window.__ModuleLoader__`.

## 11. The EffectTS twin

This twin is deferred to the ETS parity wave, which is wave 5 of the completion spec, and the
Classic tree is its contract source.
