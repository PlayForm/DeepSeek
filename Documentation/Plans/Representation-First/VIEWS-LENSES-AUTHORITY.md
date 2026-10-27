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

> A granular section of the representation-first workspace research, which covers the extension of
> the external research in round 2. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The connected views (adopted - the multiple graphs!)

- **THE PRINCIPLE**: NOT one graph, but distinct views that stable identifiers connect.
- **THE FIVE VIEWS**:

| View      | Carries                                                 |
| --------- | ------------------------------------------------------- |
| RESOURCE  | which resources + which versions observed               |
| SEMANTIC  | the symbols/references/dependencies resolved            |
| AUTHORITY | who may perform which operations on which resources     |
| WORK      | which task owns a proposal + what it waits for          |
| HISTORY   | which observations/decisions/effects produced the state |

- **THE WEIGHTED-LICENSE IMPLICATION**: priority, retention value, and permission are NOT
  interchangeable, because a heavily weighted resource may deserve more context or a longer
  retention WITHOUT any additional write authority.

## 2. The bidirectional transformations (the lenses - Pierce/Foster)

- **THE LENSES**: observe(resource, revision) -> representation, propose(representation, operation)
  -> candidate change, and reconcile(resource, candidate) -> applied | conflict | rejection.
- **THE AMBIGUITY RULE**: every abstract edit may have multiple concrete interpretations, such as
  the symbol rename, the docs, the serialized key, or the combination for a displayed name, and the
  system must EXPOSE the ambiguity.
- **THE REFUSAL TO GUESS** is a first-class result.

## 3. Authority vs residency (three independent concepts)

- **CAPABILITY**: the permission to perform a specific operation under the object-capabilities model
  with the unforgeable references and the revocation through the revocable intermediaries, where the
  prototype validates the capability references INSIDE the harness and an agent-created identifier
  or self-declared permission is never proof of authority.
- **OWNERSHIP LEASE**: the temporary coordination claim over the work, which another worker may
  acquire on expiry.
- **RESIDENCY POLICY**: whether a representation stays loaded, because its in-memory state may be
  evicted.
- **THE PREDICTABILITY RULE**: the expiration consequences stay predictable because the three
  concepts are separate.
