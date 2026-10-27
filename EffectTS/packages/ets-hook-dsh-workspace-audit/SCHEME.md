# SCHEME - @playform/hook-dsh-workspace-audit

The formal scheme of the workspace-audit hook: the domain schema, the line shape, the traceability
graph, and the ledger lines.

## 1. The storage domain

One KV domain, named by config `domain` (default `workspace_audit`), version 1, layout `per-record`,
`invalidRecords: backup-and-skip`, with two tables:

| Table   | Key                  | Record                                    |
| ------- | -------------------- | ----------------------------------------- |
| `lines` | `id` (`a<sequence>`) | AuditLine                                 |
| `ring`  | `__ring`             | `AuditLine[]` - the bounded ring snapshot |

An absent `storageDomain` facility is a silent skip, and the lines live in memory only.

A failed open is loud: one `storage open failed: <reason>` ledger line, never rethrown.

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

The fs/observed listener records the OutcomeEvidence nodes, the `line` of the service records the
rest as the other services feed them, and `assessment` closes the loop against the satisfaction
contract of the IntentSpecification.

The repeat-event guard (`Function/Duplicate`, the clock pattern of the monitor, no timer): a repeat
event for the same path carrying the same version within the coalescing window (2 s, which the
`State.Now` test seam overrides) records no line.

The version token identifies the file state, so the line for it is already recorded; a different
version, or the same version after the window, is recorded normally.

The guard lives on the listener only, so the manual lines of the service are never coalesced.

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

Every line is prefixed by the `Append` of the factory with the module identity (`audit: `).

The strings live in the modules (the factory never owns them) and are renamed mechanically, never
edited ad hoc.

The repeat-event guard adds no line, because a coalesced repeat event records nothing.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`), mapped to `State.Allow`:

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

No new ledger line exists, because the package has no gated action.
