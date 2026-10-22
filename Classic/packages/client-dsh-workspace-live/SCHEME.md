# SCHEME - @playform/client-dsh-workspace-live

The package's contract scheme (Documentation/Plans/Workspace-Family/ LIVE.md).

## 1. Identity

| Place            | Value                                 |
| ---------------- | ------------------------------------- |
| package name     | `@playform/client-dsh-workspace-live` |
| `name` export    | `client-dsh-workspace-live`           |
| service name     | `workspaceLive`                       |
| tab id           | `workspace-live` (order 25)           |
| locale namespace | `client-dsh-workspace-live`           |

## 2. The loader contract

Object form: `name`, `apply` (empty - the pure client posture), `Config` (the Schemastery schema),
`inject` (`[]`). The default object carries all four.

## 3. The presentation contract (`Source/Interface/Presentation.ts`)

- `Representation` = `{ id, kind, label, version, lastSequence }` - a managed workspace entity's
  latest observed state, never a process.
- `LiveView` = `{ sequence, representations, events }` - everything the tab renders, and nothing
  else.

## 4. The sibling mirror (`Source/Interface/Siblings.ts`)

Type-only declarations from the W1 frozen contract: `GraphSnapshot`, `Stamp`, `WorkspaceEvent`
(every event carries the operation identifier, the parent identifier, the event category). The
end-phase replaces these with the real type-only imports once the sibling packages land.

## 5. The stable-until-event rule

The store emits a new snapshot ONLY on `ingest()` or `refresh()`. No polling, no timer, no wall
clock. The tab re-renders only on a new snapshot object.
