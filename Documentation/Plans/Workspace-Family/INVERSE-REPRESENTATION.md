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

> Granular document of the Workspace Plugin Family Decomposition.
> The parent hub: Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md.
> THE FRAMING (binding): the workspace family is the DEEPSEEK HARNESS'S OWN
> REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by the @playform
> plugin family - never a single plugin.
> The user's paradigm (2026-10-20 - binding).
> THE TYPING (2026-10-20 - the user's directives, the LAST one adopted in
> full): the SITUATED INTERACTION PROTOCOLS below are the authoritative
> typing; the earlier resource-representation-activity + the
> Process<File,State> + the categorical framings are the flagged
> historical sections.

---

## 1. The inverse representation (the design metaphor - SUPERSEDED as a literal claim)

- **THE CORE IDEA**: the workspace is an INVERSE REPRESENTATION of the
  standard UNIX filesystem.
- **THE STANDARD VIEW**: the files are the passive bytes; the tools are
  the active operators.
- **THE INVERSE VIEW** (the metaphor): the files are the ACTIVE
  PROCESSES (the knowledge graphs, the halted processes), and the
  harness's managed state is the substrate.
- **THE ROLE INVERSION** (the metaphor): the representation INVERTS the
  roles - the file holds the process, the state holds the file.
- **THE CORRECTION**: an ordinary file is NOT literally a halted process
  - exec constructs a process image from an executable resource; the
  Linux inodes already carry the metadata. The "living file" stays as
  the DESIGN METAPHOR, never the foundational assertion.
- **THE CONNECTED FRAMINGS** (the naming candidates, the hub): THE
  LIVING FILESYSTEM + THE PROCESS-CENTRIC HARNESS (Process<Halted>) +
  THE INVERSE FILESYSTEM - the final name is the user's choice (the
  RATIFICATION in the hub).

## 2. THE AUTHORITATIVE TYPING (the situated interaction protocols)

- **THE DEEPER ABSTRACTION**: an entity has IDENTITY, but its
  computational meaning = the INTERACTIONS available through a
  particular interface, to a particular participant, under particular
  conditions - ask "to whom, through which interface, with what evidence
  + authority, under which interference assumptions?"
- **THE THREE NOTIONS**: Entity / Presentation / Interaction - never
  synonyms or successive states: the parsedBy / analyzedBy / compiledBy /
  loadedInto arrows have DIFFERENT meanings.
- **THE CORRECTION**: the workspace does NOT reveal a process secretly
  inside every file - it CREATES A NEW INTERACTION PROTOCOL around
  existing entities + their representations.
- **THE FOUNDATIONAL TYPE**: Interface = {State, Command : State -> Type,
  Reply : (s) -> Command(s) -> Type, permits, step, interfere} - the
  reply IS part of the type (the CommitReply union: Applied / Conflict /
  Denied / Rejected / RecoveryRequired / OutcomeUnknown).
- **THE PARTICIPANT'S LOCAL KNOWLEDGE**: SituatedView = {participant,
  endpoint, history, model, authority, assumptions} - K(h) = the external
  states consistent with the local history - the justified assertions
  forall s in K(h) - the design rule: every claim distinguishes the
  OBSERVED / DERIVED / MERELY ASSUMED.
- **THE SIMULTANEOUS DIMENSIONS**: EntityContext = {existence,
  accessibility, knowledge, management, authority, activities} + the
  invariants between the dimensions.
- **AUTHORITY IS NOT KNOWLEDGE** - the five separate judgments.
- **THE TRACE PROPERTIES**: verifiedSuccess/persistence,
  effectfulAttempt/authorization, recoveryRequired/recoveryIdentity.
- **THE INTENT MODEL** (the critique round 5, binding): intent = a
  versioned, attributed declaration of a DESIRED OUTCOME - not a
  command / permission / claim. The six objects: IntentAnnouncement /
  IntentInterpretation / IntentSpecification (the GOAL vs the SCOPE vs
  the CONSTRAINTS vs the PREFERENCES vs the ACTIVATION vs the DURATION
  vs the SATISFACTION assessment contract) / Commitment / Plan /
  Assessment. INTENT CONSTRAINS HISTORIES: I = (G, C, P, D) with
  Acceptable_I(tau) = G(last(tau)) ^ C(tau) ^ D(tau); the four kinds:
  achievement / maintenance / avoidance / investigation. AN INTENT
  MUST NOT AUTHORIZE ITS OWN MEANS (the independent checks: contributes
  + authorized scope + policy + preconditions). The traceability graph:
  Announcement -> Interpretation -> IntentRevision -> Commitment ->
  PlanRevision -> ProposedChange -> AuthorizationDecision ->
  ExecutionAttempt -> OutcomeEvidence -> IntentAssessment (the MISSING
  EDGE: ProposedChange --contributesTo--> IntentRevision). The
  multidimensional statuses: interpretation / commitment / execution /
  assessment / applicability - never a single lifecycle.
- **THE WORKSPACE WITHOUT THE INVERSE OPERATOR**: the existing
  environment + the maintained representations + the proposal protocols
  + the scoped authorization + the validation obligations + the recovery
  protocols + the agent-facing projections - the IMPLEMENTATION
  REFINEMENT as the key relationship.
- **THE FINAL TYPE**: SituatedSystem<Interface, LocalHistory,
  Representation, Authority, InterferenceAssumptions, Invariants,
  OutcomeEvidence>.
- **THE DEEPEST STATEMENT** (the docs' mission section): "the workspace
  makes the relationship between intention, knowledge, authority, and
  external effect a first-class computational object."

## 3. The three regimes (corrected)

- **THE PHYSICAL REGIME (the OS)**: the filesystem + the OS process
  machinery - already true everywhere (the file-as-halted-process stays
  the METAPHOR, never the OS's own truth).
- **THE EXECUTION REGIME (the language runtimes)**: a resource becomes a
  RUNNING process when a runtime executes it - exec constructs a process
  image from an executable resource - the EXECUTION axis.
- **THE WORKSPACE REGIME (our plugin family - NEW)**: the plugin ADDS A
  MANAGEMENT SYSTEM - a NEW INTERACTION PROTOCOL around the existing
  entities + their representations (never the first state/permissions -
  the OS already carries them). What we build = the workspace regime -
  THE THIRD AXIS.
- **THE ORTHOGONALITY**: the axes are different - never exclusive: a .rs
  file sits in the filesystem + runs under rustc + is managed by the
  workspace SIMULTANEOUSLY. The operational mode determines the regime.

## 4. THE FLAGGED HISTORICAL SECTIONS (the superseded formulations)

- **THE CATEGORICAL FRAMING** (superseded): the Process<File> cells
  (observed / running / halted / done / errored) as the file's intrinsic
  states - the file-as-halted-process typed literally.
- **THE RESOURCE-REPRESENTATION-ACTIVITY MODEL** (superseded): the
  Resource<Backend, Kind> / Representation<Resource, Schema> /
  Activity<Inputs, Outputs, Effects> / Capability<Subject, Action,
  Scope> / Observation<Resource, Evidence> / Binding<Resource,
  Controller> typing + the OPEN ComputationalEnvironment + the
  BackendProfile + the open labeled transition system (s --e--> s',
  reconcile(m', s) in {supported, conflict, unknown}).
- BOTH remain as the record of the typing's evolution; the situated
  interaction protocols (section 2) are the authoritative typing.
