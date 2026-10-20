---
title: Representation-First Workspace Research - the private candidates, the knowledge boundaries, and the attention projection (round 3)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/CANDIDATES-AND-BOUNDARIES.md
index: Documentation/INDEX.md
statuses:
	- name: the private candidates (the multi-agent integration)
		state: resolved
		evidence: this document - candidate branches + integration with provenance
	- name: the knowledge boundaries (the coverage metadata - CORE)
		state: resolved
		evidence: this document - coverage metadata part of the representation contract
	- name: the attention projection (the facts vs the attention)
		state: resolved
		evidence: this document - required/relevant/deferred context; eviction never erases authority
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE PRIVATE CANDIDATES, THE KNOWLEDGE BOUNDARIES, AND THE ATTENTION PROJECTION (ROUND 3)

> Granular section of the representation-first workspace research (the
> workspace as the runtime for accountable change, round 3). The parent
> hub: Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The private candidates (the multi-agent integration)

Separate CANDIDATE BRANCHES over the agents freely mutating one shared
state: observed snapshot -> candidate A/B/C (each a branch) -> the
integration: select the candidates -> resolve the interactions -> validate
the combined result -> authorize the publication. The unit of integration
= a proposal WITH provenance (which candidate introduced which change +
which assumptions justified it). The TEXTUAL vs SEMANTIC compatibility:
two candidates modifying different files can jointly violate an invariant
- passing the non-overlapping-diff check never proves the compatibility.

## 2. The knowledge boundaries (the coverage metadata - CORE)

A reference query returns the coverage: sourceFiles (complete),
generatedFiles (excluded), dynamicPropertyAccess (unresolved),
externalConsumers (notInspected) - the agent chooses: proceed within the
restricted scope / gather more evidence / escalate the unsupported case.
The coverage metadata is part of the representation contract, not an
optional diagnostic.

## 3. The attention projection (the facts vs the attention)

The durable workspace state vs what is currently shown to the model:
REQUIRED context (needed to interpret the current operation safely),
RELEVANT context (evidence likely to help), DEFERRED context (addressable
material omitted from the view). The eviction never erases the authority
records, the pending proposals, or the recovery checkpoints; retaining a
representation in memory never means the model has seen it. The question:
which information must be DISPLAYED vs which merely needs to remain
RELIABLY ADDRESSABLE?
