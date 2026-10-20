---
title: Representation-First Workspace Research - the framing and the layers (round 1)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/FRAMING-AND-LAYERS.md
index: Documentation/INDEX.md
statuses:
	- name: the representation-first framing (adopted)
		state: resolved
		evidence: this document - the workspace, not the tool-call sequence, is the primary unit
	- name: the six layers (adopted)
		state: resolved
		evidence: this document - the layer/responsibility table
	- name: the tightened claims (adopted, refining the user's vision)
		state: resolved
		evidence: this document - the four tightened claims
	- name: the representation store separate from the agent context
		state: resolved
		evidence: this document - the KEY DISTINCTION
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE FRAMING AND THE LAYERS (ROUND 1)

> Granular section of the representation-first workspace research (the
> external distillation, round 1). The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.
> Distilled 2026-10-20 from the user's external research (a third-party
> analysis of the batch-edit-tool / representation proposal). The user's own
> paradigms (the file-as-process, the representation management, the
> licenses + eviction rule, the code-block graphs) remain the binding
> vision; this document's architecture + tightened claims refine the path.

---

## 1. The framing (adopted)

The proposal is a **representation-first agent workspace** - NOT merely a
batch-edit tool: the agent expresses INTENT, and the harness owns
validation, authorization, execution, and presentation of the result. The
distinction: requesting a filesystem side effect vs proposing a
transformation inside a managed workspace. The core question: "What would
an agent environment look like if the workspace - not a sequence of tool
calls - were the primary unit of interaction?"

## 2. The layers (adopted)

| Layer | Responsibility |
|---|---|
| Filesystem adapter | Read + persist resources under the actual OS permissions |
| Representation store | Resource identities, observed versions, proposed changes |
| Semantic model | Symbols, references, dependencies, code relationships |
| Operation engine | Structured intentions: rename, move, transform, connect |
| Governance pipeline | Scope, permissions, constraints, approvals, conflicts |
| Agent-facing projection | Relevant state within a bounded context budget |

THE KEY DISTINCTION: the representation store is separate from the agent's
context - the store holds the authoritative workspace state; the context is
a selective, versioned VIEW of it (the "immediately accessible" gets a
testable meaning: address a known resource without re-requesting its
contents, while being told when the view is stale).

## 3. The tightened claims (adopted, refining the user's vision)

1. **"Eliminate tools" -> "replace the low-level tool choreography"**: keep
   an explicit operation boundary (a compact DSL / structured action
   interface) even as the bash/file-tool calls disappear. The user's
   measured direction (R-BET-2's escape-elimination tracking) records the
   calls replaced.
2. **ProcessHalted = the workspace lifecycle abstraction**: separate from
   the OS execution state - a resource's editing lifecycle is distinct
   from its program execution (the ambiguity avoided).
3. **Licenses = concrete authority records**: the holder, the resource,
   the permitted operations, the expiration, the delegation rules, the
   revocation - the scheduling priority / graph weight live in SEPARATE
   fields (the license is the authority; the weight is the representation).
4. **The never-escape promise = a security requirement**: identify EVERY
   write path available to the agent + specify which are mediated,
   prohibited, or explicitly outside the guarantee.

## 4. The concrete interaction (the prototype shape)

```
workspace.propose:
  operation: renameSymbol
  target: symbol:4821
  expectedRevision: revision:93
  newName: Operational
  scope: project
```

The harness contract: (1) resolve the target against the revision,
(2) compute the affected references, (3) check the permissions + policy,
(4) produce a reviewable change set, (5) reject or reconcile the
intervening changes, (6) apply the approved result + report the new
revision. Semantic operations never get authority merely because they are
compact - they must expose their scope and evidence.
