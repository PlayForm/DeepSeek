# @playform/hook-dsh-workspace-audit

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/AUDIT](../../../Documentation/Plans/Workspace-Family/AUDIT.md)

## The role

The **workspace-audit hook** is a DeepSeek Harness plugin that is the **accountability** of the
workspace: the event records and the ledger lines.

It is the AUDIT role of the invisible flow of the workspace family:

> ... → the merge commits → the journal records → **the audit lines** → the live view presents

(Documentation/Plans/Workspace-Family/AUDIT.md; Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section
2 item 6.)

## What it does

- **Accountability records.** One line per event is stored in the own KV storage domain
  `workspace_audit` of the plugin and in its ledger.

    A **repeat event** (the same path carrying the same version within the coalescing window)
    records no line, because that observed write was already recorded and the last distinct version
    always wins.

    The guard is on the fs/observed listener only, so the manual lines of the service are never
    coalesced.

- **The traceability graph.** The audit lines are the OutcomeEvidence on the graph of the intent
  model: Announcement → Interpretation → IntentRevision → Commitment → PlanRevision → ProposedChange
  → AuthorizationDecision → ExecutionAttempt → OutcomeEvidence → IntentAssessment.

    `ctx.workspaceAudit.line` records any node, and `ctx.workspaceAudit.assessment` closes the loop
    against the satisfaction contract of the IntentSpecification.

- **The recursion-prevention law.** Every line carries the operation identifier, the parent
  identifier, and the event category, so chains compose without recursion.

- **The fs/observed listener** (ROOT context). Every observed write becomes an OutcomeEvidence line
  (`success` on presence, `failure` on absence).

    The repeat-event guard (`Function/Duplicate`, the clock pattern of the monitor, no timer) drops
    a repeat event for the same path carrying the same version within the coalescing window (2 s,
    which the `State.Now` test seam overrides in tests).

    The version token identifies the file state, so the line for it is already recorded; a different
    version, or the same version after the window, is recorded normally.

## Service

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
| `logFile`  | `~/.dsh/playform/ets-hook-dsh-workspace-audit.log`  | The plugin's own ledger                  |
| `domain`   | `workspace_audit`                                   | The KV domain name                       |
| `maxLines` | `2000`                                              | The line ring bound                      |
| `exclude`  | `["node_modules/**", "**/Target/**", "**/.git/**"]` | Excluded paths                           |
| `policy.*` | see below                                           | The D6 per-action allowlist              |

The plugin ships **disabled**: it never appears in the bundles of the profile and enables only by an
explicit ACTIVATE.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the block of
the factory), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of this package are record, all AUTOMATIC; it has NO gated action (no file write, no
batch commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and the
`policy` section of a resolved pack overrides the defaults per action (the wiring is the next
refinement).

## The plan

- [Workspace-Family/AUDIT](../../../Documentation/Plans/Workspace-Family/AUDIT.md) - the audit role.

## License

CC0-1.0.
