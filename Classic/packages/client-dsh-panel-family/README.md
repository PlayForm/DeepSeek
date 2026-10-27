# @playform/client-dsh-panel-family

> v0.2.0 - UNPUBLISHED - plan: [UI-FAMILY-V4-1](../../Documentation/Plans/UI-FAMILY-V4-1.md)

## The role

The central panel package of the UI family, on the **v4.1 child-slot model**
(Documentation/Plans/Completion-Spec/04-CLIENT.md, Documentation/Plans/UI-FAMILY-V4-1.md).

It owns the panel contract, the slot-aware registry, the adapter contract, and the thirteen
per-bundle adapters; it renders what the adapters contribute and nothing else.

## The surfaces

A pure client package: no host service, no tool, no event listener - the host half of the Loader row
is an empty `apply()`.

The surfaces are the two client mounts (`family-tab` in `conversation.view` and `overlay` in
`shell.overlay`), the client bundle (`exports["./client"]`), and the client logger
(`Source/Variable/Lines.ts`).

## The child-slot model

The panel owns the render sites.

Each mount registration DECLARES its child slot in the registration's `children` table; an adapter's
client half injects the slot its manifest declares and registers one section component there.

```text
conversation.view
  playform-family (the tab)            declares playform.panel.section  (list, session)
    playform.panel.section             <- one child per adapter

shell.overlay
  playform-family-overlay (the panel)  declares playform.panel.overlay  (list, root)
    playform.panel.overlay             <- one child per adapter
```

React travels through the slots (so a section inherits the locale `t`, the session scope, the
priority, and `Slots.listSubTree` visibility); the data travels through the registration's `inject`
face (`{ section, ports }`) and the slot-aware registry.

The two panels prove the model twice: the family tab and the overlay each declare and render their
own child slot.

### The slot-aware registry (`playformFamilyPanel`)

| Method                | Contract                                                                         |
| --------------------- | -------------------------------------------------------------------------------- |
| `register(section)`   | adds the manifest; one adapter per bundle per slot; returns the disposer         |
| `unregister(id)`      | removes it, releases the slot ownership, cascades its overlay views              |
| `entries(slot?)`      | snapshots the sections ordered by `(order, id)`, optionally filtered to one slot |
| `subscribe(listener)` | watches accepted mutations; returns the unlisten                                 |
| `getVersion()`        | bumps on every accepted mutation                                                 |
| `open(target)`        | launches an overlay view (wired by the shell's overlay host)                     |

A legacy registration that omits `slot` maps its `mount` onto a slot (`family-tab` ->
`playform.panel.section`, `overlay` -> `playform.panel.overlay`).

A second adapter id claiming an occupied `(slot, bundle)` pair is REFUSED with the documented line
(see "Ledger lines"); re-registering the same id replaces in place (the HMR rebind).

## The adapter contract

An adapter is one manifest (`Source/Interface/Panel.ts`):

| Field        | Meaning                                                             |
| ------------ | ------------------------------------------------------------------- |
| `id`         | the child registration id (unique)                                  |
| `bundle`     | the owning host package name                                        |
| `namespace`  | the settings namespace (the profile entry id) the config form reads |
| `title`      | the locale key of the section heading                               |
| `order`      | the section order inside its slot                                   |
| `slot`       | the declared child slot the manifest registers into                 |
| `activation` | the static activation posture (`enabled` / `disabled` / `unknown`)  |
| `traceKinds` | the D5 trace names the adapter follows                              |
| `match`      | optional envelope filter for the adapter's tail                     |
| `enabled`    | optional live gate                                                  |

`Source/Function/Adapter.ts` wires a manifest in both directions (the registry entry and the
child-slot registration) inside `ctx.effect`, so plugin unload removes both with no residue.

That function is the template every per-bundle adapter copies into its own client half.

## The three reference adapters

| Adapter    | Bundle                                    | Namespace                       | Order | Why                                                                        |
| ---------- | ----------------------------------------- | ------------------------------- | ----- | -------------------------------------------------------------------------- |
| normalize  | `@playform/hook-dsh-normalize-dash`       | `hook-dsh-normalize-dash`       | 10    | the normalize family (the volatile knob set plus two plain semantic gates) |
| tool-coach | `@playform/hook-dsh-tool-coach`           | `hook-dsh-tool-coach`           | 30    | the v4.1 plan's first real contribution; every knob volatile               |
| suggester  | `@playform/hook-dsh-convention-suggester` | `hook-dsh-convention-suggester` | 40    | the suggesters (the pack learner)                                          |

## The ten residual adapters

The ten remaining per-bundle adapters ship beside the three references, each following the same
pattern (`Source/Variable/Reference/`, wired through `Function/Reference.ts`):

- `hook-dsh-normalize-quotes` (11)
- `hook-dsh-normalize-ellipsis` (12)
- `hook-dsh-normalize-spaces` (13)
- `hook-dsh-normalize-invisible` (14)
- `hook-dsh-normalize-fullwidth` (15)
- `plugin-dsh-normalize-file` (20)
- `hook-dsh-package-governor` (50)
- `hook-dsh-package-pinner` (55)
- `hook-dsh-cargo-governor` (60)
- `hook-dsh-ccr` (70)

All of them declare the `playform.panel.section` slot, the static `enabled` posture (none of the ten
schemas has a master switch; the bundle row decides), and the three D5 trace names.

The workspace/batch/live surfaces are NOT adapters of this package: the workspace-live package owns
its own tab, and the host lane owns the rest.

## Status and the trace live source

Each section renders its plugin's status: the activation state and the live tail.

The panel consumes the **D5 trace bus** as its live source when the host exposes it in the browser
(`ctx.trace`, or any client service under the `trace` name answering `on(kind, listener)`).

It seeds the tail from the bus's recent ring (when exposed) and subscribes to the names each adapter
declares (`observe/stamp`, `graph/indexed`, `graph/invalidated` by default), keeping the recent
envelopes NEWEST FIRST, bounded to eight lines, formatted byte-exactly as `<kind> <path>` (the
payload's path, else the envelope's trace id).

- A missing trace is NOT an error: the status is the adapter's static activation with an empty tail
  and `live: false` (the documented fallback).
- The newest matching envelope carrying `payload.activation` of `"enabled"` or `"disabled"`
  overrides the static posture.

## The config form

Each section renders its plugin's options from its serialized Schemastery schema
(`ctx.configForms.describe()`), flattened to dotted field paths with the values, the composition
base, the provenance (`overridden` is a user-layer key presence, never a value comparison), the enum
options, and the nested volatile objects.

Writes take one of two routes:

| Field                      | Route                                                             | Effect                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| volatile (`meta.volatile`) | `configForms.get(ns).mutate([{op:"set", path, value}], revision)` | applies live, revision-fenced, no remount                                                                              |
| plain                      | the plain-field bridge `editFull(ns, patch)` (PHASE-7)            | applies on remount; the patch is the namespace's whole resolved config with the field path replaced                    |
| `role("secret")`           | never written, never rendered                                     | the marker only; a namespace that declares a secret refuses the bridge write (the redacted value must not be restated) |

The bridge resolves, in order: a client service named `panelFamilyBridge`, then
`remote.playformFamilyPanel.editFull`.

The HOST endpoint that calls `ctx.configEditor.edit()` belongs to the companion package
`@playform/client-dsh-panel-family-host` (the next lane); this package only resolves the client-side
face.

With no bridge, plain fields render read-only and a write attempt logs the documented line.

Without the settings client (`ctx.configForms` absent) the form shows the documented "not composed"
state - the panel never throws over an absent service.

## The configuration

| Field             | Type           | Default | Meaning                                 |
| ----------------- | -------------- | ------- | --------------------------------------- |
| `enabled`         | boolean        | `true`  | the package ships enabled (pure client) |
| `tabOrder`        | number         | `20`    | family tab order in `conversation.view` |
| `overlayMaxWidth` | number         | `720`   | overlay max width (px)                  |
| `locale`          | `"en" \| "zh"` | `"en"`  | the panel's own strings                 |

All knobs are volatile (hot edits commit without remounting).

## The ledger (byte-exact)

The client half keeps no ledger file; its lines go through the client logger
(`Source/Variable/Lines.ts`):

```text
client-dsh-panel-family: duplicate adapter refused for <bundle> in <slot>
client-dsh-panel-family: plain-field write <namespace> <path>
client-dsh-panel-family: plain-field bridge unavailable for <namespace>
client-dsh-panel-family: plain-field secret refused for <namespace>
```

## The build and the tests

`pnpm prepublishOnly` runs the two-step build: the plugin build (ESM `Target/`), then
`Maintain/Build-Client-Bundle.mjs` (the harness closure factory
`window.__ModuleLoader__.load({ id, factory(require) })` written to `Target/Client.bundle.js`), then
the Test build and the harness selfcheck.

`exports["./client"]` points the module system at `Target/Client.bundle.js`; the ESM
`Target/Client.js` stays the dev/test surface.

| Folder                  | Count   | Covers                                                                                                                                                                                                                                                                                                       |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Contract-And-Wiring`   | 13 PASS | the loader row, the Config schema, the client apply wiring, the locale, both mounts with their child-slot declarations, the purity probe                                                                                                                                                                     |
| `Registry-And-Sections` | 7 PASS  | the slot-aware registry body (add/replace/order/subscribe/open/disposer)                                                                                                                                                                                                                                     |
| `Child-Slot-Model`      | 10 PASS | both panels' declarations, the adapters' child registrations and inject faces, the duplicate refusal, the mount-to-slot map, the slot filter, the ownership release, the renderSlot wiring                                                                                                                   |
| `Reference-Adapter`     | 14 PASS | the static/live status, the tail and the ring seed, the activation override, the schema-derived form, the secret field, the volatile write, the plain write and its audit line, the two refusals, the bridge resolution, the roster                                                                          |
| `All-Adapters`          | 9 PASS  | the thirteen-manifest roster (slot/bundle/order/activation/trace vocabulary), the thirteen adapter effects and section registrations, each form's representative volatile and plain fields, the two write routes on the new adapters, and the built bundle executed through a fake `window.__ModuleLoader__` |

## What it is not

No host service, no Typert endpoint, no file read, no config editor.

The host half of the Loader entry is an empty `apply()` - the row exists so the client module system
serves the `./client` half.

The tail/stats endpoint and the plain-field bridge endpoint live in
`@playform/client-dsh-panel-family-host`.

## The plan

- [UI-FAMILY-V4-1](../../Documentation/Plans/UI-FAMILY-V4-1.md) - the plan of record.
- [Completion-Spec/04-CLIENT](../../Documentation/Plans/Completion-Spec/04-CLIENT.md) - the client
  spec.

## License

CC0-1.0.
