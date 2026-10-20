---
title: Representation-First Workspace Research - the connected views, the lenses, and the authority (round 2)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/VIEWS-LENSES-AUTHORITY.md
index: Documentation/INDEX.md
statuses:
	- name: the connected views (the multiple graphs)
		state: resolved
		evidence: this document - five views connected by stable identifiers + the weighted-license implication
	- name: the bidirectional transformations (the lenses - Pierce/Foster)
		state: resolved
		evidence: this document - the refusal to guess is a first-class result
	- name: the authority vs residency separation (three independent concepts)
		state: resolved
		evidence: this document - capability, ownership lease, residency policy
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE CONNECTED VIEWS, THE LENSES, AND THE AUTHORITY (ROUND 2)

> Granular section of the representation-first workspace research (the
> external research's extension, round 2). The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The connected views (adopted - the multiple graphs!)

NOT one graph - distinct views connected by stable identifiers: the
RESOURCE view (which resources + which versions observed), the SEMANTIC
view (the symbols/references/dependencies resolved), the AUTHORITY view
(who may perform which operations on which resources), the WORK view
(which task owns a proposal + what it waits for), the HISTORY view (which
observations/decisions/effects produced the state). THE WEIGHTED-LICENSE
IMPLICATION: priority, retention value, and permission are NOT
interchangeable - a heavily weighted resource may deserve more context or
longer retention WITHOUT any additional write authority.

## 2. The bidirectional transformations (the lenses - Pierce/Foster)

observe(resource, revision) -> representation; propose(representation,
operation) -> candidate change; reconcile(resource, candidate) ->
applied | conflict | rejection. Every abstract edit may have multiple
concrete interpretations (a displayed name = the symbol rename? the docs?
the serialized key? the combination?) - the system must EXPOSE the
ambiguity; the REFUSAL TO GUESS is a first-class result.

## 3. Authority vs residency (three independent concepts)

- CAPABILITY: the permission to perform a specific operation (the object-
  capabilities model - the unforgeable references; the revocation via the
  revocable intermediaries); the prototype validates the capability
  references INSIDE the harness - an agent-created identifier or self-
  declared permission is never proof of authority.
- OWNERSHIP LEASE: the temporary coordination claim over the work
  (another worker may acquire the claim on expiry).
- RESIDENCY POLICY: whether a representation stays loaded (its in-memory
  state may be evicted).
The expiration consequences stay predictable because the three concepts
are separate.
