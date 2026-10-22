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

> Granular section of the representation-first workspace research (the external research's
> extension, round 2). The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The non-destructive eviction (the user's eviction rule refined)

- **THE DEFINITION**: eviction = releasing a representation's ACTIVE RESOURCES, never deleting the
  represented file or discarding unfinished work.
- **THE FIVE DISPOSITIONS**:

| Disposition | Meaning                                                         |
| ----------- | --------------------------------------------------------------- |
| RELEASE     | drop the unmodified representation                              |
| CHECKPOINT  | persist enough to reconstruct the unfinished work               |
| SUSPEND     | preserve the work while withdrawing the execution eligibility   |
| DISCARD     | explicitly abandon a proposal under an authorized decision      |
| REVOKE      | withdraw an operation right without removing the representation |

- **THE REVOCATION TIMING**: the revocation blocks NEW commits; a commit already past its durable
  commit decision follows the recovery protocol
    - "stop" gets a precise meaning without pretending every side effect cancels instantaneously.

## 2. The typed proposals (the State -> Operational example's distinction)

- **THE VOCABULARY**: the operation vocabulary distinguishes the symbol identity from the matching
  text: replaceText, renameSymbol, renameResource, changeSerializedKey, updateDocumentation,
  connectDependency - each declares its resolution rules + uncertainty.
- **THE CONNECT RULE**: connectDependency is not accepted until the language adapter defines what
  connection means: the import? the invocation? the service registration?
- **THE LSP SEAM**: the LSP's WorkspaceEdit (the versioned document changes + the resource
  operations) is the adapter seam to investigate - not evidence that the governance + recovery are
  solved.

## 3. The meaning-preserving execution

- **THE INTENT ATTACHED**: the original intent stays attached to the changes (the proposal yaml: the
  operation, the target, the expectedWorkspaceRevision, the newName + the constraints:
  preserveSerializedKeys, preservePublicExports + the result: the resolution, the changes, the
  validation).
- **THE REVIEW QUESTION**: did the concrete change set satisfy the declared operation +
  constraints? - the different policies for the local-variable rename vs the public-API change vs
  the persisted data-format change, even when all three look like text replacements.
