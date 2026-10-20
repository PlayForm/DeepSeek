---
title: Representation-First Workspace Research - the exact approval, the narrow guarantees, and the useful failures (round 3)
category: Plans/Representation-First
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Plans/Representation-First/APPROVAL-GUARANTEES-FAILURES.md
index: Documentation/INDEX.md
statuses:
	- name: the exact human approval
		state: resolved
		evidence: this document - approval binds to a specific candidate + scope
	- name: the narrow guarantees (never claim the atomicity loosely)
		state: resolved
		evidence: this document - the four guarantees
	- name: the useful failures (the structured next-decision instructions)
		state: resolved
		evidence: this document - bounded, explainable, resumable failures
	- name: the ablation study (the components tested separately)
		state: resolved
		evidence: this document - the five stages + the controlled disruptions
---

# REPRESENTATION-FIRST WORKSPACE RESEARCH - THE EXACT APPROVAL, THE NARROW GUARANTEES, AND THE USEFUL FAILURES (ROUND 3)

> Granular section of the representation-first workspace research (the
> workspace as the runtime for accountable change, round 3). The parent
> hub: Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The exact human approval

- **THE BINDING**: the approval binds to a SPECIFIC candidate + its
  declared scope (the candidate + the candidateDigest + the permits:
  applyDeclaredChanges + the constraints: maximumChangedResources,
  publicAPIChanges prohibited).
- **THE NEW-DECISION RULE**: a material change after the approval
  requires a NEW decision.
- **THE INTENT LIMIT**: the approval of an intention never authorizes
  every implementation the agent later produces.
- **THE INTENT-MODEL REFINEMENT** (the critique round 5, binding): the
  approval = the Commitment (who accepted responsibility - NOT the
  authorization) + the AuthorizationDecision on the traceability graph
  (between the ProposedChange and the ExecutionAttempt); the intent's
  SATISFACTION assessment contract closes the loop (the IntentAssessment
  vs the IntentSpecification). AN INTENT MUST NOT AUTHORIZE ITS OWN
  MEANS - the independent checks: contributes + authorized scope +
  policy + preconditions; the types never eliminate the runtime checks.
- **THE REVIEW PRESENTATION**: the review presents BOTH the semantic
  description AND the concrete diff - neither substitutes for the other.

## 2. The narrow guarantees (never claim the atomicity loosely)

- **CANDIDATE ISOLATION**: the uncommitted changes stay separate from the
  published workspace.
- **SERIALIZED MANAGED COMMITS**: the managed commits follow a controlled
  ordering.
- **CRASH RECOVERY**: the interrupted persistence has a documented
  recovery procedure.
- **EXTERNAL VISIBILITY**: an explicit statement of what the unmanaged
  readers may observe - if the external programs can read the directory
  during the publication, design the publication mechanism or document
  the limitation.
- **THE KEY LINE**: RECOVERABLE IS NOT THE SAME PROMISE AS INVISIBLE
  INTERMEDIATE STATE.

## 3. The useful failures (the structured next-decision instructions)

- **THE SHAPE**: outcome: rejected + reason: semantic-dependencies-
  changed + invalidated: [query: references-to-symbol:4821] + preserved:
  [proposal: proposal:42] + nextActions:
  [refreshReferenceResolution, regenerateCandidate,
  requestReviewIfScopeExpands].
- **THE TAXONOMY**: distinguish the retryable transport failures, the
  stale evidence, the policy denials, the unsupported semantics, the
  partial persistence - each its own recovery path; a universal retry
  counter never blurs them.
- **THE GOAL**: the failure is BOUNDED, EXPLAINABLE, RESUMABLE - never
  eliminated.

## 4. The ablation study (the components tested separately)

- **THE STAGES**: structured-operations-only -> does the better interface
  help?; + the persistent work records -> does the explicit state improve
  the restart recovery?; + the dependency validation -> does it prevent
  the stale proposals?; + the isolated candidates -> does it improve the
  concurrent work?; + the governance -> what control does the policy add
  + at what cost?
- **THE CONTROLLED DISRUPTIONS**: kill an agent after proposing, modify a
  dependency before the commit, revoke the authority during the
  validation, restart the harness during the persistence.
- **THE SCORING**: the successful completion AND the correct refusal of
  the unsafe continuation.
- **THE STRONGEST RESULT**: which guarantees require the infrastructure,
  which benefit from the model reasoning, which should NEVER depend on
  the conversational memory.