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

> A granular section of the representation-first workspace research, which covers the external
> distillation in round 1. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md. It was distilled 2026-10-20 from
> the external research of the user, which is a third-party analysis of the batch-edit-tool and
> representation proposal. The own paradigms of the user (the file-as-process, the representation
> management, the licenses and eviction rule, and the code-block graphs) remain the binding vision,
> and the architecture and tightened claims of this document refine the path.

---

## 1. The framing (adopted)

- **THE PROPOSAL**: a **representation-first agent workspace** and NOT merely a batch-edit tool,
  where the agent expresses INTENT and the harness owns the validation, the authorization, the
  execution, and the presentation of the result.
- **THE DISTINCTION**: requesting a filesystem side effect against proposing a transformation inside
  a managed workspace.
- **THE CORE QUESTION**: "What would an agent environment look like if the workspace, and not a
  sequence of tool calls, were the primary unit of interaction?"

## 2. The layers (adopted)

| Layer                   | Responsibility                                           |
| ----------------------- | -------------------------------------------------------- |
| Filesystem adapter      | Read + persist resources under the actual OS permissions |
| Representation store    | Resource identities, observed versions, proposed changes |
| Semantic model          | Symbols, references, dependencies, code relationships    |
| Operation engine        | Structured intentions: rename, move, transform, connect  |
| Governance pipeline     | Scope, permissions, constraints, approvals, conflicts    |
| Agent-facing projection | Relevant state within a bounded context budget           |

- **THE KEY DISTINCTION**: the representation store is SEPARATE from the context of the agent,
  because the store holds the authoritative workspace state and the context is a selective and
  versioned VIEW of it.
- **THE TESTABLE MEANING**: the "immediately accessible" property gets a testable meaning, which is
  to address a known resource without re-requesting its contents while being told when the view is
  stale.

## 3. The tightened claims (adopted, refining the user's vision)

1. **"Eliminate tools" becomes "replace the low-level tool choreography".**

    Keep an explicit operation boundary as a compact DSL or a structured action interface even as
    the bash and file-tool calls disappear, and let the measured direction of the user (the
    escape-elimination tracking of R-BET-2) record the calls that are replaced.

2. **ProcessHalted becomes the workspace lifecycle abstraction.**

    It is separate from the OS execution state, because the editing lifecycle of a resource is
    distinct from its program execution, and the ambiguity is avoided.

3. **Licenses become concrete authority records.**

    The record holds the holder, the resource, the permitted operations, the expiration, the
    delegation rules, and the revocation, while the scheduling priority and the graph weight live in
    SEPARATE fields, because the license is the authority and the weight is the representation.

4. **The never-escape promise becomes a security requirement.**

    Identify EVERY write path available to the agent, and specify which paths are mediated,
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

- **THE HARNESS CONTRACT** (the six steps): (1) resolve the target against the revision, (2) compute
  the affected references, (3) check the permissions and the policy, (4) produce a reviewable change
  set, (5) reject or reconcile the intervening changes, and (6) apply the approved result and report
  the new revision.
- **THE AUTHORITY RULE**: semantic operations never get authority merely because they are compact,
  because they must expose their scope and their evidence.
