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

> A granular section of the representation-first workspace research, which treats the workspace as
> the runtime for accountable change in round 3. The parent hub:
> Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md.

---

## 1. The exact human approval

- **THE BINDING**: the approval binds to a SPECIFIC candidate and its declared scope, which is the
  candidate, the candidateDigest, the permits of `applyDeclaredChanges`, and the constraints of
  `maximumChangedResources` with public API changes prohibited.
- **THE NEW-DECISION RULE**: a material change after the approval requires a NEW decision.
- **THE INTENT LIMIT**: the approval of an intention never authorizes every implementation that the
  agent later produces.
- **THE INTENT-MODEL REFINEMENT** (the critique round 5, binding): the approval is the Commitment of
  who accepted responsibility, which is NOT the authorization, plus the AuthorizationDecision on the
  traceability graph between the ProposedChange and the ExecutionAttempt, and the satisfaction
  assessment contract of the intent closes the loop between the IntentAssessment and the
  IntentSpecification. AN INTENT MUST NOT AUTHORIZE ITS OWN MEANS, so the independent checks cover
  the contribution, the authorized scope, the policy, and the preconditions, and the types never
  eliminate the runtime checks.
- **THE REVIEW PRESENTATION**: the review presents BOTH the semantic description AND the concrete
  diff, and neither substitutes for the other.

## 2. The narrow guarantees (never claim the atomicity loosely)

- **CANDIDATE ISOLATION**: the uncommitted changes stay separate from the published workspace.
- **SERIALIZED MANAGED COMMITS**: the managed commits follow a controlled ordering.
- **CRASH RECOVERY**: the interrupted persistence has a documented recovery procedure.
- **EXTERNAL VISIBILITY**: an explicit statement of what the unmanaged readers may observe, so that
  a publication mechanism is designed or the limitation is documented when external programs can
  read the directory during the publication.
- **THE KEY LINE**: RECOVERABLE IS NOT THE SAME PROMISE AS INVISIBLE INTERMEDIATE STATE.

## 3. The useful failures (the structured next-decision instructions)

- **THE SHAPE**: outcome: rejected + reason: semantic-dependencies-changed + invalidated: [query:
  references-to-symbol:4821] + preserved: [proposal: proposal:42] + nextActions:
  [refreshReferenceResolution, regenerateCandidate, requestReviewIfScopeExpands].
- **THE TAXONOMY**: distinguish the retryable transport failures, the stale evidence, the policy
  denials, the unsupported semantics, and the partial persistence, because each one has its own
  recovery path and a universal retry counter never blurs them.
- **THE GOAL**: the failure is BOUNDED, EXPLAINABLE, and RESUMABLE, and it is never eliminated.

## 4. The ablation study (the components tested separately)

- **THE STAGES**: structured operations only, which asks whether the better interface helps, then
  the persistent work records, which ask whether the explicit state improves the restart recovery,
  then the dependency validation, which asks whether it prevents the stale proposals, then the
  isolated candidates, which ask whether they improve the concurrent work, and then the governance,
  which asks what control the policy adds and at what cost.
- **THE CONTROLLED DISRUPTIONS**: kill an agent after proposing, modify a dependency before the
  commit, revoke the authority during the validation, and restart the harness during the
  persistence.
- **THE SCORING**: the successful completion AND the correct refusal of the unsafe continuation.
- **THE STRONGEST RESULT**: which guarantees require the infrastructure, which benefit from the
  reasoning of the model, and which should NEVER depend on the conversational memory.
