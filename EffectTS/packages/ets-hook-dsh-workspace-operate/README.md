# @playform/hook-dsh-workspace-operate

The operation engine of the workspace family: the typed proposals - **rename**, **connect**,
**replace** - with the resolution rules that decide what CAN be proposed and the first-class
**refusal-to-guess** that declares what CANNOT. Plan:
`Documentation/Plans/Workspace-Family/OPERATE.md` + `Documentation/Plans/WORKSPACE-FAMILY-V4-1.md`
(sections 3.7-3.8).

## What it does

- Registers the `workspaceOperate` service (`proposeRename`, `proposeConnect`, `proposeReplace`,
  `list`, `get`, `withdraw`, `statistics`).
- Registers two tools from apply (`workspace_propose`, `workspace_proposals`) - the tools live
  inside their owning hook.
- Runs the resolution rules on every propose call: the request shape, the graph availability, the
  graph resolution, the version fence, the staleness, and the replace span. Every failure returns a
  typed refusal (`bad-request`, `graph-unavailable`, `unknown-symbol`, `name-collision`,
  `duplicate-edge`, `incompatible-edge`, `missing-version`, `stale-version`, `span-beyond-file`,
  `full`) - never a guessed proposal.
- Maintains its own version fence tracker from `fs/observed` (root context, silent) so a proposal
  made against a moved-past version is refused.
- Persists proposals in its own KV domain (`workspace_operate`), best-effort.

## What it does not do

- It **never writes a file**. A proposal is recorded; applying it is the approve and merge steps'
  work (the later steps of the flow).
- It does not fake graph data: without the `workspaceGraph` service the rename and connect rules
  refuse with `graph-unavailable`.
- No wall clocks: ids and sequences are the hook's own monotonic counter.

## Ledger lines (byte-stable, module-owned)

```text
operate: activated (domain=<domain>)
operate: disabled (enabled=false)
operate: proposed <id> <kind> <path>
operate: refused <reason>
operate: refused full (<n> live proposals)
operate: withdrawn <id>
operate: storage open failed: <reason>
```

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This hook's action class is SUGGEST (it records a typed proposal and never applies it), and that
class is **automatic**. The hook has **NO gated action** - it never writes a file, commits a batch
or spawns an agent - so the block documents the posture and refuses nothing. The block is one
volatile object, so a policy flip is hot-editable without a remount; a resolved pack's `policy`
section overrides the defaults per action (the wiring is the next refinement).

## Status

The plugin ships **disabled** (`enabled: false` - the IDLE-forever posture); it enables only by an
explicit ACTIVATE. This is the PoC build: the smoke suite and the ETS twin land at the end phase.
