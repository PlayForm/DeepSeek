---
title: Representation-First Workspace Research - the accountable change runtime and the four kinds of truth (round 3)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/RUNTIME-AND-TRUTH.md
index: Documentation/INDEX.md
statuses:
	- name: the research contribution (the falsifiable hypothesis)
		state: resolved
		evidence: this document - the workspace as a runtime for accountable change
	- name: the four kinds of truth (never collapse into a currentState)
		state: resolved
		evidence: this document - observed, proposed, validated, committed
	- name: the evidence dependencies (the validation objects)
		state: resolved
		evidence: this document - validation as a durable object; invalidated when inputs change
	- name: the unseen changes (the semantic read dependencies)
		state: resolved
		evidence: this document - discovery queries as dependencies
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE ACCOUNTABLE CHANGE RUNTIME AND THE FOUR KINDS OF TRUTH (ROUND 3)

> A granular section of the representation-first workspace research, which treats the workspace as
> the runtime for accountable change in round 3. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The research contribution (the falsifiable hypothesis)

- **THE RUNTIME**: the workspace is a RUNTIME FOR ACCOUNTABLE CHANGE, where the agents contribute
  proposals and the runtime tracks what those proposals DEPEND ON, whether they remain VALID, and
  what ACTUALLY happened.
- **THE HYPOTHESIS (falsifiable)**: "a persistent workspace that records observations, proposals,
  authority, and validation dependencies can reduce the coordination failures WITHOUT requiring the
  agents to reconstruct the operational state from the conversation history."
- **THE NEGATIVE OUTCOMES ALLOWED**: the evaluation must allow them, such as the recovery improving
  while the overhead is too high, or the coordination improving without the token reduction.

## 2. The four kinds of truth (never collapse into a currentState)

- **OBSERVED**: what a particular observation established, such as the file contents at revision 93.
- **PROPOSED**: a change that is not yet accepted, such as the rename of a resolved symbol.
- **VALIDATED**: a claim checked under stated conditions, such as the type check that passed for
  candidate 108, and it ALWAYS answers: validated against what, using which check, at which revision?
- **COMMITTED**: an effect recorded as applied, such as candidate 108 persisted.
- **THE SEPARATION**: a proposal can be coherent but unauthorized, a validation can succeed and later
  become stale, and a commit can complete without every downstream consequence checked.

## 3. The evidence dependencies (the validation objects)

- **THE DURABLE OBJECT**: each validation is a durable object with dependencies on the candidate, the
  checker and its configurationRevision, the inputs of the sourceSnapshot, the dependencyLockfile,
  and the compilerVersion, and the outcome.
- **THE INVALIDATION RULE**: if a relevant input changes, the result INVALIDATES, and a green badge is
  never preserved because the check once succeeded.
- **THE CONNECTION**: the self-adjusting computation tracks the dependencies and propagates the
  changes, which here serves the EVIDENCE VALIDITY and not the automatic rerunning of every agent
  thought.
- **THE DISCIPLINE**: track the machine-checkable dependencies first, and label the untracked
  assumptions explicitly.

## 4. The unseen changes (the semantic read dependencies)

- **THE NARROW CHECK REJECTED**: version-checking the edited files alone is too narrow, because the
  semantic operations record the dependencies on the DISCOVERY QUERIES as well as the individual
  resources, such as `resource: file:41 @ revision:93` plus
  `query: references-to-symbol:4821 @ indexRevision: index:26` plus the scope.
- **THE FOUNDATION**: the optimistic-concurrency foundation of the read sets, the write sets, and the
  validation before publication.
- **THE DESIGN QUESTION**: how to represent "these are all the references I found" WITHOUT claiming
  more completeness than the index can establish.
