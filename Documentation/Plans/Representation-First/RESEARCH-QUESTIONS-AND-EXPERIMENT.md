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

> A granular section of the representation-first workspace research, which covers the external
> distillation in round 1. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The research questions (the priorities before building)

- **Identity**: what identifies a resource or a symbol across renames, moves, and reparsing?
- **Freshness**: how does the harness detect that the agent acted on an outdated representation?
- **Authority**: can a plugin restrict an operation without another plugin silently widening it?
- **Commit semantics**: what happens if only part of a multi-file change persists?
- **Recovery**: what is the state of an unapplied proposal, a partial application, or a completed
  application after an interruption?
- **Context economy**: which projections actually reduce the tokens and the repeated reads?
- **Semantic uncertainty**: when must an operation refuse or request clarification?

## 2. The first experiment (the recommended scope)

- **THE SCOPE**: ONE language, the symbol rename, the preview and apply, the revision checks, and
  the audit record.
- **THE COMPARISON**: against the conventional read and edit workflows on correctness, tokens,
  interaction count, conflict handling, and recovery effort.
- **THE REFERENCE CASE**: the `State: State -> State: Operational` example of the user.
- **THE HONESTY RULE**: the implementation progress that the docs of the family report is BACKGROUND
  and not feasibility evidence, because the relevant interfaces get validated independently before
  the architectural commitments.

## 3. The connection to the family's design

- **THE LAYER MAPPING**: the filesystem adapter and the representation store are the core of the
  batch-edit engine, the semantic model and the operation engine are the code-block stage of the
  reflective API, the governance pipeline is the five government layers, and the agent-facing
  projection is the live-view framework of the commonality split.
- **THE QUESTIONS AS ACCEPTANCE**: the research questions become the acceptance criteria of the
  implementation agent, which are the checks of the identity, the freshness, the authority, the
  commit, the recovery, the context economy, and the semantic uncertainty.
- **THE EXPERIMENT AS V1**: the scope of the first experiment is v1 of the implementation, which is
  the symbol rename on one language with the preview and apply, the revisions, and the audit.
