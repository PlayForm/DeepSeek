---
title: Representation-First Workspace Research - the research questions and the first experiment (round 1)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/RESEARCH-QUESTIONS-AND-EXPERIMENT.md
index: Documentation/INDEX.md
statuses:
	- name: the seven research questions (the priorities before building)
		state: resolved
		evidence: this document - identity, freshness, authority, commit semantics, recovery, context economy, semantic uncertainty
	- name: the first experiment (the recommended scope)
		state: open
		evidence: this document - the symbol rename on one language; the interfaces validated independently before the architectural commitments
	- name: the connection to the family's design
		state: resolved
		evidence: this document - the layers map onto the batch-edit engine, the code-block stage, the five government layers, the live-view framework
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE RESEARCH QUESTIONS AND THE FIRST EXPERIMENT (ROUND 1)

> Granular section of the representation-first workspace research (the external distillation, round
> 1). The parent hub: Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The research questions (the priorities before building)

- **Identity**: what identifies a resource/symbol across renames, moves, reparsing?
- **Freshness**: how does the harness detect the agent acted on an outdated representation?
- **Authority**: can a plugin restrict an operation without another silently widening it?
- **Commit semantics**: what happens if only part of a multi-file change persists?
- **Recovery**: unapplied proposal vs partial application vs completed application after
  interruption?
- **Context economy**: which projections actually reduce the tokens + the repeated reads?
- **Semantic uncertainty**: when must an operation refuse or request clarification?

## 2. The first experiment (the recommended scope)

- **THE SCOPE**: ONE language, the symbol rename, the preview/apply, the revision checks, the audit
  record.
- **THE COMPARISON**: against the conventional read/edit workflows on: correctness, tokens,
  interaction count, conflict handling, recovery effort.
- **THE REFERENCE CASE**: the user's `State: State -> State: Operational` example.
- **THE HONESTY RULE**: the implementation progress reported in the family's docs is BACKGROUND, not
  feasibility evidence - the relevant interfaces get validated independently before the
  architectural commitments.

## 3. The connection to the family's design

- **THE LAYER MAPPING**: the filesystem adapter + representation store = the batch-edit engine's
  core; the semantic model + operation engine = the code-block stage (the reflective API); the
  governance pipeline = the five government layers; the agent-facing projection = the live-view
  framework (the commonality split).
- **THE QUESTIONS AS ACCEPTANCE**: the research questions become the implementation agent's
  acceptance criteria (the identity/freshness/
  authority/commit/recovery/context-economy/semantic-uncertainty checks).
- **THE EXPERIMENT AS V1**: the first experiment's scope = the implementation's v1 (the symbol
  rename, one language, the preview/apply, the revisions, the audit).
