# client-dsh-panel-family - the live test plan

## Identity

- Package: `@playform/client-dsh-panel-family` (Classic/packages/client-dsh-panel-family), version
  0.2.0 (package.json; the only family package above 0.1.0), with uncommitted changes in the tree
  today, so this plan describes the on-disk contract (SCHEME.md v4.1, README.md) without asserting
  build/verification status.
- Profile row id: `client-dsh-panel-family` (bundled in the desktop profile).
- Exposes the slot-aware registry service `playformFamilyPanel` with the methods
  `register(section)`, `unregister(id)`, `entries(slot?)`, `subscribe(listener)`, `getVersion()`
  (bumps on every accepted mutation) and `open(target)` (launches an overlay view, wired by the
  overlay host of the shell). It also exposes two mounts, each declaring its child slot: the
  `conversation.view` tab `playform-family` (order 20) declaring `playform.panel.section` (list,
  session) and the `shell.overlay` panel `playform-family-overlay` declaring
  `playform.panel.overlay` (list, root). Components render their slot through the `renderSlot` prop.
- Adapters: no longer zero adapter logic, because the package ships three reference adapters
  (`Source/Variable/Reference/`): normalize (`@playform/hook-dsh-normalize-dash`, namespace
  `hook-dsh-normalize-dash`, order 10), tool-coach (`@playform/hook-dsh-tool-coach`, order 30), and
  suggester (`@playform/hook-dsh-convention-suggester`, order 40), each wired via
  `Source/Function/Adapter.ts`. The ten residual adapters (the remaining normalize flavors,
  `plugin-dsh-normalize-file`, the three governors, `hook-dsh-ccr`) are documented but not shipped
  here.
- Ledger: no ledger file (pure browser module; the host half of the Loader entry is an empty
  `apply()`), and its lines go through the client logger (`Source/Variable/Lines.ts`), byte-exact:

```text
client-dsh-panel-family: duplicate adapter refused for <bundle> in <slot>
client-dsh-panel-family: plain-field write <namespace> <path>
client-dsh-panel-family: plain-field bridge unavailable for <namespace>
client-dsh-panel-family: plain-field secret refused for <namespace>
```

## Activation checks

1. **The Config.**

    Inspect Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/client-dsh-panel-family"}` for one entry with status schema (defaults:
    enabled true, tabOrder 20, overlayMaxWidth 720, locale "en"; all knobs volatile).

2. **The service check.**

    The `playformFamilyPanel` registry service resolves, and `getVersion()` bumps on every accepted
    mutation.

3. **The ledger line.**

    Activation itself writes no ledger line, so verify activation through checks 1-2, the T5 tab,
    and the refusal line above once an adapter duplicate is forced.

## Test cases

| #   | Trigger                                                                  | Expected                                                                                   | Pass criteria                                                                                                   |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                  | one entry, `status: "schema"`                                                              | the four defaults present                                                                                       |
| T1  | `entries()` after boot                                                   | the three reference adapter sections                                                       | entries ordered by (order, id); `entries("playform.panel.section")` filters to one slot                         |
| T2  | `register(...)` a second adapter id on an occupied `(slot, bundle)` pair | refused                                                                                    | the duplicate-refusal line, nothing changes, a no-op disposer returns                                           |
| T2  | `register(...)` the same id again, then `unregister(id)`                 | replace in place, then release                                                             | re-registration replaces; unregister removes it and releases the (slot, bundle) ownership                       |
| T5  | The user opens the conversation view                                     | the `playform-family` tab renders at order 20 with its `playform.panel.section` child slot | tab visible; adapter sections render through `renderSlot`; a `shell.overlay` panel opens within overlayMaxWidth |
| T5  | A section's status without a trace bus                                   | static fallback                                                                            | `live: false`, empty tail; with a trace, the tail is newest-first, ≤ 8 lines, formatted `<kind> <path>`         |

## Known live gaps

- The package tree has uncommitted changes, so the documented smokes (`Contract-And-Wiring` 13,
  `Registry-And-Sections` 7, `Child-Slot-Model` 10, `Reference-Adapter` 14 per SCHEME §10) are the
  on-disk documentation, not a fresh verification claim from this plan.
- The plain-field bridge resolves, in order, the `panelFamilyHost` package's `panelFamilyBridge`
  client service then `remote.playformFamilyPanel.editFull`, and per that package's docs the browser
  half is inert until the generated Remote contribution lands, so in a live run plain fields may
  stay read-only with the bridge-unavailable refusal line.

## Fix loop

- Fix files: `Source/Library.ts` (host half, the empty `apply()`), `Source/Client.ts`,
  `Source/Function/` (Adapter, Apply, Bridge, Form, Registry, Status), `Source/Variable/Slots.ts`,
  `Source/Variable/Lines.ts`, `Source/Variable/Locale-*.json`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/client-dsh-panel-family run prepublishOnly`
- Smokes: `node Classic/packages/client-dsh-panel-family/Target/Test/<Folder>/Test.js` for each
  folder under `Source/Test/`, then restart the app, and the client half reloads with the client
  module system.

## Report stub

- Plugin: `@playform/client-dsh-panel-family` (v0.2.0)
- Tests run: T1 config - / T1 entries - / T2 duplicate - / T2 replace+unregister - / T5 tab - / T5
  status -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
