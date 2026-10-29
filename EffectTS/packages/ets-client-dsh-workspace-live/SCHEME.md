# SCHEME - @playform/client-dsh-workspace-live

The contract scheme of the package (Documentation/Plans/Workspace-Family/ LIVE.md).

## 1. Identity

| Place            | Value                                 |
| ---------------- | ------------------------------------- |
| package name     | `@playform/client-dsh-workspace-live` |
| `name` export    | `client-dsh-workspace-live`           |
| service name     | `workspaceLive`                       |
| tab id           | `workspace-live` (order 25)           |
| child slot       | `workspace.live.section`              |
| section id       | `workspace-live-section`              |
| locale namespace | `client-dsh-workspace-live`           |

## 2. The loader contract

Object form: `name`, `apply` (empty, the pure client posture), `Config` (the Schemastery schema),
and `inject` (`[]`), and the default object carries all four.

The `inject` of the client half is `["slots", "locale"]`.

## 3. The presentation contract (`Source/Interface/Presentation.ts`)

- `Representation` = `{ id, kind, label, version, lastSequence }` - the latest observed state of a
  managed workspace entity, never a process.
- `LiveView` = `{ sequence, representations, events }` - everything the store presents and nothing
  else, because the trace tail is a separate bounded source and the snapshot shape is unchanged.

## 4. The sibling mirror (`Source/Interface/Siblings.ts`)

Type-only declarations from the W1 frozen contract: `GraphSnapshot`, `Stamp`, `WorkspaceEvent`,
where every event carries the operation identifier, the parent identifier, and the event category.

The end-phase replaces these with the real type-only imports once the sibling packages land.

## 5. The stable-until-event rule

The store emits a new snapshot ONLY on `ingest()` or `refresh()`, and the trace source emits ONLY on
a new bus envelope (and once at seed time from the recent ring of the bus).

There is no polling, no timer, and no wall clock, and the tab and the section re-render only on a
new snapshot object or a new trace tail.

## 6. The D5 trace ingest (`Source/Function/Trace.ts`, `Source/Variable/Trace.ts`)

- The source resolves `ctx.get("trace")` structurally: `on(kind, listener)` is required, and
  `ring(limit)` is used when present, with no import of `@playform/ets-lib-dsh-trace` or the
  factory.
- Kinds: `observe/stamp`, `graph/indexed`, `graph/invalidated`, `batch/proposed`, `batch/decision`,
  `batch/state-change`, where the batch transitions surface when a batch plugin mirrors them onto
  the bus.
- The tail is NEWEST FIRST and bounded by `Config.maxEvents`, the same bound as the event tail.
- A tail line is `<kind> <path>`: the `path` of the payload when it is a non-empty string, else the
  `trace` id of the envelope.
- A missing trace is the STATIC state: `live: false`, empty tail, a no-op `subscribe`/`dispose`, and
  never an error.

## 7. The child-slot model (`Source/Function/Client.ts`)

When the panel family is composed (`ctx.get("playformFamilyPanel")` is a registry):

- the tab registration declares
  `children: { "workspace.live.section": { kind: "list", scope: "session" } }` and its component
  hands the declared slot to the renderer through `renderSlot("workspace.live.section", {})`;
- the section registers into that declared child slot with the `inject` face of the registration
  `{ section, ports }`, where `section` is the live section manifest (`workspace-live-section`,
  `@playform/client-dsh-workspace-live`, the locale namespace, order = `Config.tabOrder`) and
  `ports` carries the presentation store and the trace source, and the section reads its data
  through the ports and never through the context.

Without the panel family the tab keeps its legacy registration shape (no `children`, no section
registration, one slot point), which is the compatibility rule asserted by the existing
`Contract-And-Wiring` folder.

## 8. The tab render

The pure `Source/Function/View.ts` builds the representations list, the empty note (the existing
locale string), the trace tail list (one `<li>` per envelope, `<kind> <path>`), and the child-slot
element.

The wrappers (`LiveTab`, `Section`) own the subscriptions, and the container carries
`data-live="true" | "false"`, the static-state marker with no new locale string.

## 9. Verification

- `prepublishOnly` builds `Target/`, writes `Target/Client.bundle.js` through
  `Maintain/Build/Client-Bundle/Index.mjs`, builds `Target/Test/`, runs the harness selfcheck, and
  type-checks the Test tree.
- The three smoke folders: `Contract-And-Wiring` 12 PASS, `Store-And-Snapshot` 11 PASS,
  `Child-Slot-And-Trace` 12 PASS.

## 10. The EffectTS twin

Deferred to the ETS parity wave (wave 5 of the completion spec), with the Classic tree as its
contract source.
