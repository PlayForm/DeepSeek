# SCHEME - @playform/hook-dsh-workspace-audit

The formal scheme of the workspace-audit hook: the domain schema, the line shape, the traceability
graph, and the ledger lines.

## 1. The storage domain

One KV domain, named config `domain` (default `workspace_audit`), version 1, layout `per-record`,
`invalidRecords: backup-and-skip`, two tables:

| Table   | Key                  | Record                                    |
| ------- | -------------------- | ----------------------------------------- |
| `lines` | `id` (`a<sequence>`) | AuditLine                                 |
| `ring`  | `__ring`             | `AuditLine[]` - the bounded ring snapshot |

An absent `storageDomain` facility is a silent skip: the lines live in memory only. A failed open is
loud: one `storage open failed: <reason>` ledger line, never rethrown.

## 2. AuditLine

```ts
{
	id: string; // "a<sequence>" - the monotonic counter
	operation: string; // the operation identifier
	parent: string; // the parent operation identifier
	// one node kind of the traceability graph:
	category: "announcement" |
		"interpretation" |
		"intent-revision" |
		"commitment" |
		"plan-revision" |
		"proposed-change" |
		"authorization" |
		"execution-attempt" |
		"outcome-evidence" |
		"intent-assessment";
	path: string; // the subject path ("" for pathless events)
	outcome: "success" | "failure" | "conflict" | "pending" | "refused";
	assessment: string; // the IntentAssessment verdict detail ("" otherwise)
	sequence: number; // the plugin's monotonic counter, never a wall clock
	at: number; // epoch ms
}
```

## 3. The traceability graph

```
Announcement → Interpretation → IntentRevision → Commitment
  → PlanRevision → ProposedChange → AuthorizationDecision
  → ExecutionAttempt → OutcomeEvidence → IntentAssessment
```

The fs/observed listener records the OutcomeEvidence nodes; the service's `line` records the rest as
the other services feed them; `assessment` closes the loop against the IntentSpecification's
satisfaction contract.

## 4. The ledger lines (module-owned, byte-stable)

```
disabled (enabled=false)
activated (domain=<domain>, maxLines=<n>)
audit <category> <operation> (<outcome>) <path>
audit intent-assessment <operation> (satisfied)
audit intent-assessment <operation> (unsatisfied[: <detail>])
capped <id> (maxLines <n>)
ignored <path> (own actor)
ignored <path> (excluded)
failed <path> (<reason>)
storage open failed: <reason>
```

Every line is prefixed by the factory's Append with the module identity (`audit: `). The strings
live in the modules (the factory never owns them) and are renamed mechanically, never edited ad hoc.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`), mapped to `State.Allow`:

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

No new ledger line: the package has no gated action.
