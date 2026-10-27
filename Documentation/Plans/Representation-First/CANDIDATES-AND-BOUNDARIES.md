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

> A granular section of the representation-first workspace research, which treats the workspace as
> the runtime for accountable change in round 3. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The private candidates (the multi-agent integration)

- **THE ALTERNATIVE**: separate CANDIDATE BRANCHES instead of the agents freely mutating one shared
  state, which runs from the observed snapshot through the candidates A, B, and C as branches to the
  integration that selects the candidates, resolves the interactions, validates the combined result,
  and authorizes the publication.
- **THE UNIT OF INTEGRATION**: a proposal WITH provenance, which records which candidate introduced
  which change and which assumptions justified it.
- **THE TEXTUAL vs SEMANTIC COMPATIBILITY**: two candidates that modify different files can jointly
  violate an invariant, so passing the non-overlapping-diff check never proves the compatibility.

## 2. The knowledge boundaries (the coverage metadata - CORE)

- **THE COVERAGE SHAPE**: a reference query returns the coverage with sourceFiles complete,
  generatedFiles excluded, dynamicPropertyAccess unresolved, and externalConsumers notInspected.
- **THE CHOICE OF THE AGENT**: proceed within the restricted scope, gather more evidence, or
  escalate the unsupported case.
- **THE CONTRACT STATUS**: the coverage metadata is part of the representation contract and not an
  optional diagnostic.

## 3. The attention projection (the facts vs the attention)

- **THE DISTINCTION**: the durable workspace state against what is currently shown to the model,
  which is REQUIRED context that is needed to interpret the current operation safely, RELEVANT
  context as evidence likely to help, and DEFERRED context as addressable material omitted from the
  view.
- **THE EVICTION SAFEGUARD**: the eviction never erases the authority records, the pending
  proposals, or the recovery checkpoints.
- **THE MEMORY RULE**: retaining a representation in memory never means that the model has seen it.
- **THE QUESTION**: which information must be DISPLAYED, and which merely needs to remain RELIABLY
  ADDRESSABLE?
