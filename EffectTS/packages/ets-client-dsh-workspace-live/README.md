# @playform/client-dsh-workspace-live

The workspace family's **live client**: the client half of the workspace live view
(Documentation/Plans/Workspace-Family/LIVE.md).

## The role

The presentation, **stable-until-event**:

- The live view does NOT re-render continuously. It stays stable until a workspace event surfaces a
  change; it presents at the END of the invisible flow (... -> the audit lines -> the live view
  presents).
- It presents the workspace's REPRESENTATIONS of the Entity/Presentation/Interaction model. It never
  conflates a running OS process with a managed entity (the OS execution axis stays orthogonal).
- The machinery behind the view stays invisible; the presentation IS the visible part.

## What it does

- **The workspaceLive service** (client): `getSnapshot`, `subscribe`, `ingest(event)`,
  `refresh(graph)`. The store emits a NEW snapshot object only when an event or a graph refresh
  arrives - no polling, no timer.
- **The tab**: `conversation.view` entry `workspace-live` (default order 25) rendering the
  representations and the bounded recent-event tail.
- **The event contract** (`Source/Interface/Siblings.ts`): every event carries the operation
  identifier, the parent identifier, and the event category (the distribution law's recursion
  prevention).

## Self-contained PoC

The sibling services (`workspaceGraph`, `workspaceObserve`, the workspace event stream) are declared
locally in `Source/Interface/Siblings.ts` from the W1 frozen contract
(Documentation/Plans/Workspace-Family/ WAVE-1-BRIEF.md sections 4-5). No runtime import of a sibling
package exists yet; the end-phase wires the real imports and the real channels.

## Config

| Field                | Type    | Default | Meaning                          |
| -------------------- | ------- | ------- | -------------------------------- |
| `enabled`            | boolean | `false` | the family's idle posture        |
| `tabOrder`           | number  | `25`    | tab order in `conversation.view` |
| `maxEvents`          | number  | `50`    | the recent-event tail bound      |
| `maxRepresentations` | number  | `100`   | the presented-entity bound       |

All knobs are volatile.

## Ledger

This package keeps no ledger file (pure client, no host writes).
