---
title: Representation-First Workspace Research - the non-destructive eviction and the typed proposals (round 2)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/EVICTION-AND-PROPOSALS.md
index: Documentation/INDEX.md
statuses:
	- name: the non-destructive eviction (the user's eviction rule refined)
		state: resolved
		evidence: this document - the five dispositions + the revocation timing
	- name: the typed proposals (the State -> Operational distinction)
		state: resolved
		evidence: this document - the operation vocabulary with per-op resolution rules
	- name: the meaning-preserving execution
		state: resolved
		evidence: this document - the review question for the concrete change set
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE NON-DESTRUCTIVE EVICTION AND THE TYPED PROPOSALS (ROUND 2)

> A granular section of the representation-first workspace research, which covers the extension of
> the external research in round 2. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The non-destructive eviction (the user's eviction rule refined)

- **THE DEFINITION**: eviction releases the ACTIVE RESOURCES of a representation and never deletes
  the represented file or discards unfinished work.
- **THE FIVE DISPOSITIONS**:

| Disposition | Meaning                                                         |
| ----------- | --------------------------------------------------------------- |
| RELEASE     | drop the unmodified representation                              |
| CHECKPOINT  | persist enough to reconstruct the unfinished work               |
| SUSPEND     | preserve the work while withdrawing the execution eligibility   |
| DISCARD     | explicitly abandon a proposal under an authorized decision      |
| REVOKE      | withdraw an operation right without removing the representation |

- **THE REVOCATION TIMING**: the revocation blocks NEW commits, and a commit that is already past
  its durable commit decision follows the recovery protocol, so "stop" gets a precise meaning
  without pretending that every side effect cancels instantaneously.

## 2. The typed proposals (the State -> Operational example's distinction)

- **THE VOCABULARY**: the operation vocabulary distinguishes the symbol identity from the matching
  text through replaceText, renameSymbol, renameResource, changeSerializedKey, updateDocumentation,
  and connectDependency, and each operation declares its resolution rules and its uncertainty.
- **THE CONNECT RULE**: connectDependency is not accepted until the language adapter defines what
  connection means: the import, the invocation, or the service registration?
- **THE LSP SEAM**: the WorkspaceEdit of the LSP with the versioned document changes and the
  resource operations is the adapter seam to investigate, and it is not evidence that the governance
  and recovery are solved.

## 3. The meaning-preserving execution

- **THE INTENT ATTACHED**: the original intent stays attached to the changes in the proposal yaml
  with the operation, the target, the expectedWorkspaceRevision, the newName, the constraints of
  `preserveSerializedKeys` and `preservePublicExports`, and the result of the resolution, the
  changes, and the validation.
- **THE REVIEW QUESTION**: did the concrete change set satisfy the declared operation and its
  constraints? This requires different policies for the local-variable rename, the public-API
  change, and the persisted data-format change, even when all three look like text replacements.
