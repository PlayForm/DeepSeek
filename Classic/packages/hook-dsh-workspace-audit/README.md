# @playform/hook-dsh-workspace-audit

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/AUDIT](../../../Documentation/Plans/Workspace-Family/AUDIT.md)

## The role

The **workspace-audit hook**: a DeepSeek Harness plugin that is the workspace's **accountability** -
the event records and the ledger lines. It is the AUDIT role of the workspace family's invisible
flow:

> ... → the merge commits → the journal records → **the audit lines** → the live view presents

(Documentation/Plans/Workspace-Family/AUDIT.md; Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section
2 item 6.)

## What it does

- **Accountability records**: one line per event, stored in the plugin's own KV storage domain
  `workspace_audit` and in the plugin's ledger. A **repeat event** - the same path carrying the same
  version within the coalescing window - records no line: that observed write was already recorded,
  and the last distinct version always wins (the guard is on the fs/observed listener only; the
  service's manual lines are never coalesced).
- **The traceability graph**: the audit lines are the OutcomeEvidence on the intent model's graph -
  Announcement → Interpretation → IntentRevision → Commitment → PlanRevision → ProposedChange →
  AuthorizationDecision → ExecutionAttempt → OutcomeEvidence → IntentAssessment.
  `ctx.workspaceAudit.line` records any node; `ctx.workspaceAudit.assessment` closes the loop
  against the IntentSpecification's satisfaction contract.
- **The recursion-prevention law**: every line carries the operation identifier, the parent
  identifier, and the event category - chains compose without recursion.
- **The fs/observed listener** (ROOT context): every observed write becomes an OutcomeEvidence line
  (`success` on presence, `failure` on absence). The repeat-event guard (`Function/Duplicate`, the
  monitor's clock pattern - no timer) drops a repeat event for the same path carrying the same
  version within the coalescing window (2 s, the `State.Now` test seam overrides it in tests): the
  version token identifies the file state, so the line for it is already recorded; a different
  version, or the same version after the window, is recorded normally.

## The surfaces

`ctx.workspaceAudit` (registered from apply):

| Method                                      | Description                                  |
| ------------------------------------------- | -------------------------------------------- |
| `line(input)`                               | Record one traceability-graph node's line    |
| `assessment(operation, satisfied, detail?)` | Close the loop with an IntentAssessment line |
| `chain(operation)`                          | One operation's lines, in recording order    |
| `lines(limit?)`                             | The ring, newest first                       |
| `statistics()`                              | `{ operations, lines, sequence }`            |

## The configuration

Every knob is a volatile cell (hot edits commit without remounting):

| Field      | Default                                             | Description                              |
| ---------- | --------------------------------------------------- | ---------------------------------------- |
| `enabled`  | `false`                                             | Master switch (the IDLE-forever posture) |
| `log`      | `true`                                              | Ledger enabled                           |
| `logFile`  | `~/.dsh/playform/hook-dsh-workspace-audit.log`      | The plugin's own ledger                  |
| `domain`   | `workspace_audit`                                   | The KV domain name                       |
| `maxLines` | `2000`                                              | The line ring bound                      |
| `exclude`  | `["node_modules/**", "**/Target/**", "**/.git/**"]` | Excluded paths                           |
| `policy.*` | see below                                           | The D6 per-action allowlist              |

The plugin ships **disabled** - it never appears in the profile's bundles and enables only by an
explicit ACTIVATE.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

This package's actions are record, all AUTOMATIC; it has NO gated action (no file write, no batch
commit, no spawn), so the block documents the posture and refuses nothing. The block is one volatile
object, so a policy flip is hot-editable without a remount; a resolved pack's `policy` section
overrides the defaults per action (the wiring is the next refinement).

## The ledger

One line per distinct version within the coalescing window (the repeat-event guard coalesces the
rest), prefixed `audit: ` (byte-exact; see also the smoke folders' expected-string sections):

```text
activated (domain=workspace_audit, maxLines=2000)
disabled (enabled=false)
audit outcome-evidence <path> (success) <path>
audit outcome-evidence <path> (failure) <path>
ignored <path> (excluded)
ignored <path> (own actor)
failed unknown (malformed event: displayPath is not a string)
```

## The build and the tests

The build is `pnpm prepublishOnly` (Source/prepublishOnly.sh): the plugin build (ESM `Target/`, Test
tree excluded), the Test build, the harness selfcheck, and the Test type-check.

## The plan

- [Workspace-Family/AUDIT](../../../Documentation/Plans/Workspace-Family/AUDIT.md) - the audit role.
- [WORKSPACE-FAMILY-V4-1](../../../Documentation/Plans/WORKSPACE-FAMILY-V4-1.md) - section 2 item 6.

## License

CC0-1.0.
