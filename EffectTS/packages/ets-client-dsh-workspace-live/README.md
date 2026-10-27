# @playform/ets-client-dsh-workspace-live

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/LIVE](../../Documentation/Plans/Workspace-Family/LIVE.md)

The **live client** of the workspace family, which is the client half of the workspace live view
(Documentation/Plans/Workspace-Family/LIVE.md).

## The role

The presentation, **stable-until-event**:

- The live view does NOT re-render continuously.

    It stays stable until a workspace event or a D5 trace envelope surfaces a change, and it
    presents at the END of the invisible flow (... -> the audit lines -> the live view presents).

- It presents the REPRESENTATIONS of the workspace in the Entity/Presentation/Interaction model.

    It never conflates a running OS process with a managed entity, because the OS execution axis
    stays orthogonal.

- The machinery behind the view stays invisible, and the presentation IS the visible part.

## What it does

- **The workspaceLive service** (client): `getSnapshot`, `subscribe`, `ingest(event)`,
  `refresh(graph)`.

    The store emits a NEW snapshot object only when an event or a graph refresh arrives, with no
    polling and no timer.

- **The D5 trace is the live source**: the client half resolves `ctx.get("trace")` structurally
  (`on`/`ring`), seeds the tail from the recent ring of the bus, follows `observe/stamp`,
  `graph/indexed`, `graph/invalidated`, and the batch transitions `batch/proposed`,
  `batch/decision`, `batch/state-change` (when a batch plugin mirrors them onto the bus), and keeps
  the recent envelopes NEWEST FIRST, bounded by `maxEvents`.

    A new envelope notifies the view, and a missing trace is the documented STATIC state
    (`live: false`, empty tail) and never an error.

- **The tab**: the `conversation.view` entry `workspace-live` (default order 25) renders the
  representations, the empty note, and the stored trace tail.
- **The child-slot model** (when the panel family is composed, i.e. `playformFamilyPanel` is
  present): the tab registration declares `workspace.live.section` in its `children` table and
  renders it through the `renderSlot` prop of the renderer, the live section registers into that
  declared child slot, and the `inject` face of its registration (`{ section, ports }`) is the data
  path.

    The standalone composition (no panel family) keeps the legacy tab shape, which is the
    compatibility rule.

- **The event contract** (`Source/Interface/Siblings.ts`): every workspace event carries the
  operation identifier, the parent identifier, and the event category (the recursion prevention of
  the distribution law).

## Self-contained PoC

The sibling services (`workspaceGraph`, `workspaceObserve`, the workspace event stream) are declared
locally in `Source/Interface/Siblings.ts` from the W1 frozen contract
(Documentation/Plans/Workspace-Family/ WAVE-1-BRIEF.md sections 4-5).

No runtime import of a sibling package exists yet, and the end-phase wires the real imports and the
real channels.

The trace source needs no sibling import, because the bus is read structurally from the client
context.

## The configuration

| Field                | Type    | Default | Meaning                                              |
| -------------------- | ------- | ------- | ---------------------------------------------------- |
| `enabled`            | boolean | `false` | the family's idle posture                            |
| `tabOrder`           | number  | `25`    | tab order in `conversation.view`                     |
| `maxEvents`          | number  | `50`    | the recent-event tail bound AND the trace tail bound |
| `maxRepresentations` | number  | `100`   | the presented-entity bound                           |

All knobs are volatile.

## The ledger

This package keeps no ledger file, because it is a pure client with no host writes.

## The build and the tests

| Folder                 | Count   | Covers                                                                                                                                                         |
| ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Contract-And-Wiring`  | 12 PASS | the loader row, the Config schema, the client apply wiring, the locale, the tab                                                                                |
| `Store-And-Snapshot`   | 11 PASS | the stable-until-event store, the ingest fold, the bounds, the refresh                                                                                         |
| `Child-Slot-And-Trace` | 12 PASS | the child-slot declaration + the section inject face (panel family composed), the D5 ingest, the newest-first bounded tail, the static state, the built bundle |

## The plan

- [Workspace-Family/LIVE](../../Documentation/Plans/Workspace-Family/LIVE.md) - the live-view plan.

## License

CC0-1.0.
