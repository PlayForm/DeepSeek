# @playform/hook-dsh-workspace-audit

The **workspace-audit hook**: a DeepSeek Harness plugin that is the workspace's **accountability** -
the event records and the ledger lines. It is the AUDIT role of the workspace family's invisible
flow:

> ... → the merge commits → the journal records → **the audit lines** → the live view presents

(Documentation/Plans/Workspace-Family/AUDIT.md; Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section
2 item 6.)

## What it does

- **Accountability records**: one line per event, stored in the plugin's own KV storage domain
  `workspace_audit` and in the plugin's ledger.
- **The traceability graph**: the audit lines are the OutcomeEvidence on the intent model's graph -
  Announcement → Interpretation → IntentRevision → Commitment → PlanRevision → ProposedChange →
  AuthorizationDecision → ExecutionAttempt → OutcomeEvidence → IntentAssessment.
  `ctx.workspaceAudit.line` records any node; `ctx.workspaceAudit.assessment` closes the loop
  against the IntentSpecification's satisfaction contract.
- **The recursion-prevention law**: every line carries the operation identifier, the parent
  identifier, and the event category - chains compose without recursion.
- **The fs/observed listener** (ROOT context): every observed write becomes an OutcomeEvidence line
  (`success` on presence, `failure` on absence).

## Service

`ctx.workspaceAudit` (registered from apply):

| Method                                      | Description                                  |
| ------------------------------------------- | -------------------------------------------- |
| `line(input)`                               | Record one traceability-graph node's line    |
| `assessment(operation, satisfied, detail?)` | Close the loop with an IntentAssessment line |
| `chain(operation)`                          | One operation's lines, in recording order    |
| `lines(limit?)`                             | The ring, newest first                       |
| `statistics()`                              | `{ operations, lines, sequence }`            |

## Config

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
