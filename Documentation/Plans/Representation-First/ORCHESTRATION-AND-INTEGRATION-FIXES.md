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

> A granular section of the representation-first workspace research, which covers the reconciliation
> mandate in round 4. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The orchestration recoverability (the queue's three quantities)

- **THE PROBLEM**: the capacity table of the queue plan still says that the idle lanes need the
  active slots despite the documented release.
- **THE FIX**: model THREE separate quantities, which are the queued work, the retained continuable
  sessions, and the active execution slots.
- **THE DISPATCH RECORDS**: add the attempt ids, the reservation ids, the ownership fencing, and the
  duplicate-completion handling.
- **THE TEST**: a parent occupies the capacity while it waits for the children that cannot acquire
  the capacity, so specify the reservation, yielding, and admission before claiming that the fan-out
  policy prevents the workflow floods.
- **THE ROUTING HONESTY**: keep the silent execution but provide the INSPECTABLE EXPLANATION of the
  resolved role, the matching rule, the policy revision, the correction, and the escalation budget,
  so the uncertainty gets a deterministic policy outcome and never an implied certainty.

## 2. The two integration assumptions (to fix)

- **THE COMPRESSION RETRIEVAL CONTRACT**: the ccr needs a RETRIEVAL CONTRACT and not just a marker
  format. The ccr plan defaults to the full-output expansion below 102400 bytes while a live test
  expects a marker for a 2048-byte result, so the expectations reconcile. The retrieval binds to the
  permitted session and resource scope of the caller, the replayable reads are distinguished from
  the non-repeatable tool results, and an expired marker never generically tells the agent to rerun
  an operation unless the rerun is KNOWN safe.
- **THE NATIVE CRASH CONTAINMENT**: the native integration cannot promise the survival of the host
  merely by wrapping the FFI calls, because its own risk table acknowledges that the native crash
  can take down the host. The crash containment is a SEPARATE decision from the transport, so test a
  process-isolated native host against the in-process FFI and require the authenticated and
  version-compatible fallback, and never accept any healthy local endpoint.
