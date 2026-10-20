---
title: Representation-First Workspace Research - recovery, fail-open, and honest measurement (round 2)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/RECOVERY-FAIL-OPEN-MEASUREMENT.md
index: Documentation/INDEX.md
statuses:
	- name: the recovery before the rollback (the early requirement)
		state: resolved
		evidence: this document - the workItem record + the revision-checked undo
	- name: the governance failure explicitness (the fail-open revision)
		state: resolved
		evidence: this document - per-obligation failure behavior + the recursion prevention
	- name: the hypothesis test (the honest measurement)
		state: resolved
		evidence: this document - the three implementations measured on the same tasks
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - RECOVERY, FAIL-OPEN, AND HONEST MEASUREMENT (ROUND 2)

> Granular section of the representation-first workspace research (the
> external research's extension, round 2). The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The recovery before the rollback (the early requirement)

- **THE INDEPENDENT WORK**: the work persists INDEPENDENTLY of the
  agent's conversational memory: the workItem (identifier, objective,
  scope, ownerLease, proposal, status, lastDurableCheckpoint).
- **THE RESTART PROTOCOL**: a restarted agent receives the EXPLICIT work
  record + inspects its status - never infers the ownership from the
  sibling edits or reconstructs the assignment from an old transcript.
- **THE UNDO**: requires the revision checks - if another actor changed
  the file after the original operation, the undo is a NEW reconciliation
  problem - never permission to overwrite the newer work.

## 2. The governance failure explicitness (the fail-open revision)

- **THE REFINEMENT**: the user's earlier fail-open suggestion is refined
  per what each layer protects:

| Layer | Failure behavior |
|---|---|
| AUTHORIZATION | denies the mutation if the authority cannot be established |
| REQUIRED VALIDATION | blocks the commit if the required result is unavailable |
| DURABLE RECOVERY RECORD | blocks the mutations that require the recoverability |
| OPTIONAL DISPLAY | continues with the degraded marker |
| NONESSENTIAL ANALYTICS | continues if no security obligation depends on it |

- **THE PRINCIPLE**: optional conveniences may degrade; the mandatory
  protections must not silently disappear.
- **THE RECURSION PREVENTION**: every event carries the operation
  identifier, the parent identifier, and the event category - a
  validator's own activity cannot endlessly retrigger the mutation
  pipeline.

## 3. The hypothesis test (the honest measurement)

- **THE HONEST METRIC**: NOT "one call replaces twenty" - the complete
  workflow's cost + reliability (indexing, validation, conflicts,
  recovery).
- **THE THREE IMPLEMENTATIONS** measured on the SAME tasks: the
  read/edit workflow (the baseline), the semantic editing adapter (the
  structured operations alone), the governed workspace (the persistent
  state + policy).
- **THE MEASURES**: the task correctness, the unintended changes, the
  model tokens, the elapsed time, the stale-proposal rejection, the
  interruption recovery, the human review effort.
- **THE DIFFICULT CASES** (deliberately): the duplicate names, the
  unresolved references, the external edits, the expired leases, the
  failure midway through the persistence.
- **THE STRONGEST CLAIM**: the demonstrated improvement in the
  COORDINATION AND CONTROL - not merely a more expressive interface.