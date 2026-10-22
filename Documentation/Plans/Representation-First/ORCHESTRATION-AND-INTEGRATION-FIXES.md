---
title: Representation-First Workspace Research - the orchestration recoverability and the two integration assumptions (round 4)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/ORCHESTRATION-AND-INTEGRATION-FIXES.md
index: Documentation/INDEX.md
statuses:
	- name: the orchestration recoverability (the queue's three quantities)
		state: open
		evidence: this document - the queued work, the retained continuable sessions, the active execution slots modeled separately
	- name: the compression retrieval contract fix
		state: open
		evidence: this document - the 102400 vs 2048 expectation reconciliation; the retrieval bound to the permitted scope
	- name: the native integration crash containment fix
		state: open
		evidence: this document - process-isolated native host tested against in-process FFI + the authenticated fallback
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE ORCHESTRATION RECOVERABILITY AND THE TWO INTEGRATION ASSUMPTIONS (ROUND 4)

> Granular section of the representation-first workspace research (the reconciliation mandate, round
> 4). The parent hub: Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The orchestration recoverability (the queue's three quantities)

- **THE PROBLEM**: the queue plan's capacity table still says the idle lanes need the active slots
  despite the documented release.
- **THE FIX**: model THREE separate quantities: the queued work, the retained continuable sessions,
  the active execution slots.
- **THE DISPATCH RECORDS**: add the attempt ids, the reservation ids, the ownership fencing, the
  duplicate-completion handling.
- **THE TEST**: a parent occupying the capacity while waiting for the children that cannot acquire
  the capacity - specify the reservation/yielding/admission before claiming the fan-out policy
  prevents the workflow floods.
- **THE ROUTING HONESTY**: keep the silent execution, but provide the INSPECTABLE EXPLANATION (the
  resolved role, the matching rule, the policy revision, the correction, the escalation budget) -
  the uncertainty gets a deterministic policy outcome, never an implied certainty.

## 2. The two integration assumptions (to fix)

- **THE COMPRESSION RETRIEVAL CONTRACT**: the ccr needs a RETRIEVAL CONTRACT, not just a marker
  format: the ccr plan defaults to the full-output expansion below 102400 bytes while a live test
  expects a marker for a 2048-byte result - the expectations reconcile; the retrieval binds to the
  caller's permitted session/resource scope; the replayable reads are distinguished from the
  non-repeatable tool results; an expired marker never generically tells the agent to rerun an
  operation unless the rerun is KNOWN safe.
- **THE NATIVE CRASH CONTAINMENT**: the native integration cannot promise the host survival merely
  by wrapping the FFI calls (its own risk table acknowledges the native crash can take down the
  host!) - the crash containment is a SEPARATE decision from the transport: test a process-isolated
  native host against the in-process FFI + require the authenticated, version-compatible fallback
  (never accept any healthy local endpoint).
