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

> Granular section of the representation-first workspace research (the
> workspace as the runtime for accountable change, round 3). The parent
> hub: Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The research contribution (the falsifiable hypothesis)

- **THE RUNTIME**: the workspace is a RUNTIME FOR ACCOUNTABLE CHANGE: the
  agents contribute proposals; the runtime tracks what those proposals
  DEPEND ON, whether they remain VALID, and what ACTUALLY happened.
- **THE HYPOTHESIS (falsifiable)**: "a persistent workspace that records
  observations, proposals, authority, and validation dependencies can
  reduce the coordination failures WITHOUT requiring the agents to
  reconstruct the operational state from the conversation history."
- **THE NEGATIVE OUTCOMES ALLOWED**: the evaluation must allow them (the
  recovery improved but the overhead too high; the coordination improved
  without the token reduction).

## 2. The four kinds of truth (never collapse into a currentState)

- **OBSERVED**: what a particular observation established (file contents
  at revision 93).
- **PROPOSED**: a change not yet accepted (rename a resolved symbol).
- **VALIDATED**: a claim checked under stated conditions (the type check
  passed for candidate 108) - ALWAYS answers: validated against what,
  using which check, at which revision?
- **COMMITTED**: an effect recorded as applied (candidate 108 persisted).
- **THE SEPARATION**: a proposal can be coherent but unauthorized; a
  validation can succeed and later become stale; a commit can complete
  without every downstream consequence checked.

## 3. The evidence dependencies (the validation objects)

- **THE DURABLE OBJECT**: each validation is a durable object with
  dependencies (candidate, checker + its configurationRevision, inputs:
  sourceSnapshot/dependencyLockfile/compilerVersion, outcome).
- **THE INVALIDATION RULE**: if a relevant input changes, the result
  INVALIDATES - never preserve a green badge because the check once
  succeeded.
- **THE CONNECTION**: the self-adjusting computation tracks dependencies
  + propagates the changes - here for the EVIDENCE VALIDITY, not the
  automatic rerunning of every agent thought.
- **THE DISCIPLINE**: track the machine-checkable dependencies first;
  label the untracked assumptions explicitly.

## 4. The unseen changes (the semantic read dependencies)

- **THE NARROW CHECK REJECTED**: version-checking the edited files alone
  is too narrow - the semantic operations record the dependencies on the
  DISCOVERY QUERIES as well as the individual resources (resource:
  file:41 @ revision:93 + query: references-to-symbol:4821 @
  indexRevision: index:26 + scope).
- **THE FOUNDATION**: the optimistic-concurrency foundation (read sets,
  write sets, validation before publication).
- **THE DESIGN QUESTION**: how to represent "these are all the references
  I found" WITHOUT claiming more completeness than the index can
  establish.