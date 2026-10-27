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

The immediate deliverable is the schema, the state machine, the license flow, and the eviction rule
(the vision-and-representation, schema, state-machine, and eviction documents).

The stages beyond it, in the own direction of the user:

## 9.1 The graph stage (the license carry)

The files stay as GRAPHS inside our own internal CARRY: each license carries WEIGHT, and the weights
together are a representation of the file system, which is the weighted graph.

The flat cell map of the machine becomes an edge-typed graph (imports, references, and ownership),
and the license weights are the edge costs (the protection strength, the reconciliation cost, and
the eviction priority).

The eviction rule and the reconciliation walk the graph by weight and not by recency alone.

## 9.2 The code-block stage (the reflective surface)

We deal primarily with CODE BLOCKS and not with files.

From a SINGLE CALL the agent can replace, rename, and connect across the reflective API, which is
the class of language-service operations of the TypeScript SDK: renaming `const State: State = ...`
to `const State: Operational = ...` propagates to every reference in every held file, exactly as the
VSCode rename does, because the representation already knows the identity of the type and its
references.

The mutations (rename, connect, move, extract, and inline) exceed anything that
`write(filename, content)` offers, because the model already holds the structure of the code.

## 9.3 The token-waste elimination

The point of the reflective surface: the model KNOWS the code block that it means, so presenting a
full-file rewrite (or a bash sed) spends tokens, space, and conversational length over something
that the model already has.

The code-block ops present the mutation directly (the symbol, the kind of change, and the scope) and
the machine computes the edit, while the AST layer rides the same license/reconciliation/eviction
contract and only the op vocabulary grows.

The measured cost puts a bound on the worth of this stage
(Documentation/Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md): the dominant term is the step boundary
and the payload is the smaller one.

The code-block stage attacks the payload, so its saving is real but secondary to the boundary count
of the batch engine, which means the engine first and the reflective surface after it.
