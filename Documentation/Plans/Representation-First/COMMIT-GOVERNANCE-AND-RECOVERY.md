---
title: Representation-First Workspace Research - the commit governance and the partial failure honesty (round 4)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/COMMIT-GOVERNANCE-AND-RECOVERY.md
index: Documentation/INDEX.md
statuses:
	- name: the commit governance (the approved preview = the exact change on disk)
		state: open
		evidence: this document - the six-step preparation sequence + the changeset digest
	- name: the partial failure honesty (the recovery states)
		state: open
		evidence: this document - the state machine from prepared to verified with the durable per-state
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE COMMIT GOVERNANCE AND THE PARTIAL FAILURE HONESTY (ROUND 4)

> Granular section of the representation-first workspace research (the reconciliation mandate, round
> 4). The parent hub: Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The commit governance (the approved preview = the exact change on disk)

- **THE TRANSACTION-WIDE PREPARATION SEQUENCE** (the six steps):
    1. resolve the semantic intent into the candidate edits;
    2. run the permitted normalization + governance transformations against the STAGED candidate;
    3. expand the affected-resource set if the transformations introduce additional changes;
    4. validate the resulting candidate + obtain the approval for that EXACT changeset;
    5. recheck the authority + the base revisions before the persistence;
    6. verify the persisted result + record the final revisions.
- **THE CHANGESET DIGEST**: if a governor changes the candidate afterward, the approval
  INVALIDATES - the approval never silently expands.
- **THE INTENT-MODEL REFINEMENT** (the critique round 5, binding): the "semantic intent" of step 1
  is the IntentSpecification (the GOAL vs the SCOPE vs the CONSTRAINTS vs the PREFERENCES -
  "preserve behavior" is a valid intent even when unprovable - the assessment exposes the
  limitation); the approval in step 4 = the Commitment + the AuthorizationDecision on the
  traceability graph; the intent constrains the histories (Acceptable_I(tau) = G(last(tau)) ^ C(tau)
  ^ D(tau)) - a governor's change invalidating the approval IS the intent's constraint firing. AN
  INTENT MUST NOT AUTHORIZE ITS OWN MEANS - the independent checks (contributes + authorized scope +
  policy + preconditions) run before the authorization decision.
- **THE PIPELINE PROPERTY**: "The preview matches the applied bytes" becomes a property of the
  ENTIRE pipeline, not just the text-edit engine.

## 2. The partial failure honesty (the recovery states)

- **THE STATE MACHINE**: prepared -> approved -> commit-decided -> applying -> verified; applying ->
  recovery-required -> verified | compensation-required | conflict.
- **THE DURABILITY QUESTION**: for each transition: what is DURABLE + what a restarted process must
  INSPECT.
- **THE HARD CASE**: include the case where the file write succeeded but the success-record failed.
- **THE RECOVERY vs THE UNDO**: completing an interrupted approved operation is DIFFERENT from
  proposing a new operation that reverses a completed one - the revision-checked undo carries the
  distinction into the engine API.
