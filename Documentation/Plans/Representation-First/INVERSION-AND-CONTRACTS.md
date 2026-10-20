---
title: Representation-First Workspace Research - the central inversion and the representation contracts (round 2)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/INVERSION-AND-CONTRACTS.md
index: Documentation/INDEX.md
statuses:
	- name: the central inversion (adopted)
		state: resolved
		evidence: this document - the responsibility at the proposal-becomes-external-effect boundary
	- name: the representation contracts (adopted)
		state: resolved
		evidence: this document - the ManagedRepresentation shape + the provenance principle
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE CENTRAL INVERSION AND THE REPRESENTATION CONTRACTS (ROUND 2)

> Granular section of the representation-first workspace research (the
> external research's extension, round 2). The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The central inversion (adopted)

intent -> proposed transformation -> workspace validation -> authorized
reconciliation -> verified result. The responsibility lives at the
proposal-becomes-external-effect boundary: the harness enforces the
restrictions there, instead of the agent remembering them. The execution
becomes SUBORDINATE to the workspace protocol - never an independent
source of authority.

## 2. The representation contracts (adopted)

A representation is more than cached content - it carries a CONTRACT:
what it represents, where its evidence came from, how fresh it is, which
changes it can express. The ManagedRepresentation shape: identifier,
resource, observedRevision, representationRevision, origin (the
ObservationRecord), completeness (complete|partial|unknown), freshness
(current|stale|unverified - a QUALIFIED claim: current relative to a
specified observation mechanism + revision, never a guarantee against
external actors), permittedOperations, pendingChanges. THE PRINCIPLE: a
representation without provenance is convenient state; with provenance it
can support accountable decisions.
