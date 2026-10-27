---
title: The Workspace Family - the inverse representation (the user's paradigm)
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/Workspace-Family/INVERSE-REPRESENTATION.md
index: Documentation/INDEX.md
statuses:
	- name: the inverse representation of the UNIX filesystem (the design metaphor)
		state: resolved
		evidence: this document + the parent hub - the roles inverted: the file holds the process, the state holds the file; flagged as the metaphor, never the foundational assertion
	- name: the typing (the situated interaction protocols - authoritative)
		state: resolved
		evidence: this document - Entity/Presentation/Interaction, the Interface type, the SituatedView, the SituatedSystem; the earlier resource-representation-activity + the Process<File,State> + the categorical framings flagged historical
---

# THE WORKSPACE FAMILY - THE INVERSE REPRESENTATION (THE USER'S PARADIGM)

> This is a granular document of the Workspace Plugin Family Decomposition. The parent hub is
> Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md. THE FRAMING (binding): the workspace
> family is the DEEPSEEK HARNESS'S OWN REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by
> the @playform plugin family, and never a single plugin. The user's paradigm (2026-10-20 -
> binding). THE TYPING (2026-10-20 - the user's directives, the LAST one adopted in full): the
> SITUATED INTERACTION PROTOCOLS below are the authoritative typing, and the earlier
> resource-representation-activity, the Process<File,State>, and the categorical framings are the
> flagged historical sections.

---

## 1. The inverse representation (the design metaphor - SUPERSEDED as a literal claim)

- **THE CORE IDEA**: the workspace is an INVERSE REPRESENTATION of the standard UNIX filesystem.
- **THE STANDARD VIEW**: the files are the passive bytes, and the tools are the active operators.
- **THE INVERSE VIEW** (the metaphor): the files are the ACTIVE PROCESSES (the knowledge graphs, the
  halted processes), and the harness's managed state is the substrate.
- **THE ROLE INVERSION** (the metaphor): the representation INVERTS the roles, so the file holds the
  process and the state holds the file.
- **THE CORRECTION**: an ordinary file is NOT literally a halted process, because exec constructs a
  process image from an executable resource and the Linux inodes already carry the metadata. The
  "living file" stays as the DESIGN METAPHOR, never the foundational assertion.
- **THE CONNECTED FRAMINGS** (the naming candidates, the hub): THE LIVING FILESYSTEM, THE
  PROCESS-CENTRIC HARNESS (Process<Halted>), and THE INVERSE FILESYSTEM, and the final name is the
  user's choice (the RATIFICATION in the hub).

## 2. THE AUTHORITATIVE TYPING (the situated interaction protocols)

- **THE DEEPER ABSTRACTION**: an entity has IDENTITY, but its computational meaning is the
  INTERACTIONS available through a particular interface, to a particular participant, under
  particular conditions. The question is "to whom, through which interface, with what evidence and
  authority, under which interference assumptions?"
- **THE THREE NOTIONS**: Entity, Presentation, and Interaction are never synonyms or successive
  states, because the parsedBy, analyzedBy, compiledBy, and loadedInto arrows have DIFFERENT
  meanings.
- **THE CORRECTION**: the workspace does NOT reveal a process secretly inside every file, because it
  CREATES A NEW INTERACTION PROTOCOL around existing entities and their representations.
- **THE FOUNDATIONAL TYPE**: Interface = {State, Command : State -> Type, Reply : (s) -> Command(s)
  -> Type, permits, step, interfere}, where the reply IS part of the type (the CommitReply union:
  Applied, Conflict, Denied, Rejected, RecoveryRequired, OutcomeUnknown).
- **THE PARTICIPANT'S LOCAL KNOWLEDGE**: SituatedView = {participant, endpoint, history, model,
  authority, assumptions}, where K(h) is the external states consistent with the local history and
  the justified assertions hold forall s in K(h). The design rule makes every claim distinguish the
  OBSERVED, DERIVED, and MERELY ASSUMED cases.
- **THE SIMULTANEOUS DIMENSIONS**: EntityContext = {existence, accessibility, knowledge, management,
  authority, activities}, plus the invariants between the dimensions.
- **AUTHORITY IS NOT KNOWLEDGE**, which gives the five separate judgments.
- **THE TRACE PROPERTIES**: verifiedSuccess and persistence, effectfulAttempt and authorization,
  recoveryRequired and recoveryIdentity.
- **THE INTENT MODEL** (the critique round 5, binding): intent is a versioned, attributed
  declaration of a DESIRED OUTCOME, not a command, a permission, or a claim. The six objects are
  IntentAnnouncement, IntentInterpretation, IntentSpecification (the GOAL versus the SCOPE versus
  the CONSTRAINTS versus the PREFERENCES versus the ACTIVATION versus the DURATION versus the
  SATISFACTION assessment contract), Commitment, Plan, and Assessment. INTENT CONSTRAINS HISTORIES:
  I = (G, C, P, D) with Acceptable_I(tau) = G(last(tau)) ^ C(tau) ^ D(tau), and the four kinds are
  achievement, maintenance, avoidance, and investigation. AN INTENT MUST NOT AUTHORIZE ITS OWN
  MEANS, so the independent checks cover the contributes, the authorized scope, the policy, and the
  preconditions. The traceability graph runs Announcement -> Interpretation -> IntentRevision ->
  Commitment -> PlanRevision -> ProposedChange -> AuthorizationDecision -> ExecutionAttempt ->
  OutcomeEvidence -> IntentAssessment, and the MISSING EDGE is ProposedChange --contributesTo-->
  IntentRevision. The multidimensional statuses are interpretation, commitment, execution,
  assessment, and applicability, and they never form a single lifecycle.
- **THE WORKSPACE WITHOUT THE INVERSE OPERATOR**: the existing environment plus the maintained
  representations plus the proposal protocols, the scoped authorization, the validation obligations,
  the recovery protocols, and the agent-facing projections, with the IMPLEMENTATION REFINEMENT as
  the key relationship.
- **THE FINAL TYPE**: SituatedSystem<Interface, LocalHistory, Representation, Authority,
  InterferenceAssumptions, Invariants, OutcomeEvidence>.
- **THE DEEPEST STATEMENT** (the docs' mission section): "the workspace makes the relationship
  between intention, knowledge, authority, and external effect a first-class computational object."

## 3. The three regimes (corrected)

- **THE PHYSICAL REGIME (the OS)**: the filesystem and the OS process machinery, already true
  everywhere, and the file-as-halted-process stays the METAPHOR, never the OS's own truth.
- **THE EXECUTION REGIME (the language runtimes)**: a resource becomes a RUNNING process when a
  runtime executes it, because exec constructs a process image from an executable resource, and this
  is the EXECUTION axis.
- **THE WORKSPACE REGIME (our plugin family, NEW)**: the plugin ADDS A MANAGEMENT SYSTEM, which is a
  NEW INTERACTION PROTOCOL around the existing entities and their representations, and never the
  first state or permissions, because the OS already carries them. What we build is the workspace
  regime, THE THIRD AXIS.
- **THE ORTHOGONALITY**: the axes are different and never exclusive, so a .rs file sits in the
  filesystem, runs under rustc, and is managed by the workspace SIMULTANEOUSLY. The operational mode
  determines the regime.

## 4. THE FLAGGED HISTORICAL SECTIONS (the superseded formulations)

- **THE CATEGORICAL FRAMING** (superseded): the Process<File> cells (observed, running, halted,
  done, errored) as the file's intrinsic states, which typed the file-as-halted-process literally.
- **THE RESOURCE-REPRESENTATION-ACTIVITY MODEL** (superseded): the Resource<Backend, Kind>,
  Representation<Resource, Schema>, Activity<Inputs, Outputs, Effects>, Capability<Subject, Action,
  Scope>, Observation<Resource, Evidence>, and Binding<Resource, Controller> typing, plus the OPEN
  ComputationalEnvironment, the BackendProfile, and the open labeled transition system (s --e--> s',
  reconcile(m', s) in {supported, conflict, unknown}).
- BOTH sections remain as the record of the typing's evolution, and the situated interaction
  protocols in section 2 are the authoritative typing.
