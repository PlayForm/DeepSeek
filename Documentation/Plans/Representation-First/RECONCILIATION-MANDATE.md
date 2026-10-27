---
title: Representation-First Workspace Research - the reconciliation mandate (round 4)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/RECONCILIATION-MANDATE.md
index: Documentation/INDEX.md
statuses:
	- name: the main suggestion (stop expanding, reconcile into one executable contract)
		state: open
		evidence: this document - the short normative WORKSPACE-CONTRACT.md with the supersede links + the acceptance tests
	- name: the contradictions to settle (before the implementation dispatch)
		state: open
		evidence: this document - the five contradictions (first release, authority, failure behavior, atomicity, context delivery)
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE RECONCILIATION MANDATE (ROUND 4)

> A granular section of the representation-first workspace research, which covers the reconciliation
> mandate in round 4. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

- **THE MAIN SUGGESTION**: STOP EXPANDING THE CONCEPT and RECONCILE THE DOCUMENTS into ONE
  EXECUTABLE CONTRACT, which is a short normative WORKSPACE-CONTRACT.md with the explicit
  "supersedes" links and the acceptance tests, while the research documents are preserved as the
  RATIONALE and never as competing implementation instructions.

## 1. The contradictions to settle (before the implementation dispatch)

- **FIRST RELEASE**: the research names the one-language SEMANTIC RENAME as v1, while the batch
  plans start with the TEXT operations and defer the semantics. The text engine is therefore an
  INTERNAL MILESTONE, and the semantic rename is the first END-TO-END experiment.
- **AUTHORITY**: the feature plan treats the machine IDs and version stamps as licenses, while the
  research separates the capabilities, the ownership leases, and the residency. The newer separation
  is adopted EVERYWHERE, because an identifier LOCATES the authority and does not ESTABLISH it.
- **FAILURE BEHAVIOR**: the suggestions make the layers independently fail-open, while the research
  requires the authorization, the mandatory validation, and the recovery protections to BLOCK when
  they are unavailable. The failure behavior is therefore declared PER OBLIGATION and not per
  plugin.
- **ATOMICITY**: the suggestions promise the all-or-nothing batches, while the feature plan
  describes the individually guarded writes and the per-file failures. The validation atomicity, the
  visibility, the crash recovery, and the compensation are therefore specified SEPARATELY.
- **CONTEXT DELIVERY**: the batch-state proposes replacing the injected slots, while the feature
  research says that the conversation-body rewriting is unavailable and uses the prompt assembly.
  The supported carrier is therefore made EXPLICIT, and "replace in place" never remains an assumed
  capability.
