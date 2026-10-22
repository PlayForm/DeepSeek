---
title: The Batch Edit Tool - the later stages (the vision)
category: Plans/Batch-Edit-Tool
kind: research-report
date: 2026-10-20
status: researched
registry: Documentation/Plans/Batch-Edit-Tool/LATER-STAGES.md
index: Documentation/INDEX.md
statuses:
	- name: the graph stage (the license carry)
		state: open
		evidence: this document only - needs the edge-extraction source decision first
	- name: the code-block stage (the reflective surface)
		state: open
		evidence: this document only
	- name: the token-waste elimination
		state: open
		evidence: this document; the measured split is in TRAJECTORY-EVIDENCE.md
---

# THE BATCH EDIT TOOL - THE LATER STAGES (THE VISION)

> Granular section of the Batch Edit Tool feature research (R-BET-1). The parent hub:
> Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md. This document carries section 9 of the research,
> byte-preserved.

---

The immediate deliverable is the schema + the state machine + the license flow + the eviction rule
(the vision-and-representation, schema, state-machine and eviction documents). The stages beyond it,
in the user's own direction:

## 9.1 The graph stage (the license carry)

Files kept as GRAPHS inside our own internal CARRY: each license carries WEIGHT, and the weights
together are a representation of the file system - the weighted graph. The machine's flat cell map
becomes an edge-typed graph (imports, references, ownership); the license weights are the edge costs
(the protection strength, the reconciliation cost, the eviction priority). The eviction rule and the
reconciliation walk the graph by weight, not by recency alone.

## 9.2 The code-block stage (the reflective surface)

We are primarily dealing with CODE BLOCKS, not files. From a SINGLE CALL the agent can replace /
rename / connect across the reflective API - the TypeScript SDK's language-service class of
operations: renaming `const State: State = ...` to `const State: Operational = ...` propagates to
every reference in every held file, exactly as the VSCode rename does - because the representation
already knows the type's identity and its references. The mutations (rename, connect, move, extract,
inline) exceed anything `write(filename, content)` offers, because the model already holds the
code's structure.

## 9.3 The token-waste elimination

The point of the reflective surface: the model KNOWS the code block it means - presenting a
full-file rewrite (or a bash sed) spends tokens, space, and conversational length over something the
model already has. The code-block ops present the mutation directly (the symbol, the kind of change,
the scope) and the machine computes the edit - the AST layer rides the same
license/reconciliation/eviction contract; only the op vocabulary grows.

The measured cost puts a bound on this stage's worth
(Documentation/Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md): the dominant term is the step
boundary, and the payload is the smaller one. The code-block stage attacks the payload, so its
saving is real but secondary to the batch engine's boundary count - the engine first, the reflective
surface after it.
