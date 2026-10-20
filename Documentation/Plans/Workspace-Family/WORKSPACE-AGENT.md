---
title: The Workspace Family - the workspace agent (the operational view)
category: Plans/Workspace-Family
kind: living-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/Workspace-Family/WORKSPACE-AGENT.md
index: Documentation/INDEX.md
statuses:
	- name: the workspace agent (the only conversational surface)
		state: open
		evidence: this document + the parent hub - the operational view, the orchestration contract, the visibility rule
---

# THE WORKSPACE FAMILY - THE WORKSPACE AGENT (THE OPERATIONAL VIEW)

> Granular document of the Workspace Plugin Family Decomposition.
> The parent hub: Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md.
> THE FRAMING (binding): the workspace family is the DEEPSEEK HARNESS'S OWN
> REFACTORING into the WORKSPACE-CENTRIC RUNTIME, powered by the @playform
> plugin family - never a single plugin.

---

## 1. The package

- `@playform/plugin-dsh-workspace` (THE WORKSPACE AGENT) - the
  OPERATIONAL VIEW - what the conversation sees: the graph-like
  projection, the agent's actions, the systematic self-correction.
- It orchestrates EVERY hook.
- Its own Config = the family's surface knobs.
- The INVISIBLE internals = the plugin flow, governed by the plugin
  harness (the `plugin-dsh-*` service-provider role - the factory
  precedent).

## 2. The orchestration contract

- **THE ONLY CONVERSATIONAL SURFACE**: the agent addresses the workspace
  (open/insert/commit/pause/resume/close/state + the graph-like
  projection). Every hook answers through it.
- **THE INVISIBLE FLOW**: the observe stamps -> the semantics resolve ->
  the operate proposes -> the govern gates -> the authority licenses ->
  the approve binds -> the merge commits (through Factory.Write) -> the
  journal records -> the audit lines -> the live view presents - all
  evented by the plugin system (fs/observed, the tools' waterfalls, the
  lifecycle), all governed by the plugin harness.
- **THE DISTRIBUTION LAW**: each commonality a separate package (never
  one batch-edit monolith); each package's Config + ledger strings +
  tools its own; the recursion prevention: every event carries the
  operation identifier, the parent identifier, the event category.

## 3. The visibility rule

- **THE VISIBLE**: the workspace's operational view (the graph-like,
  systematically self-correcting).
- **THE INVISIBLE**: everything else (the stamps, the indexes, the
  validations, the licenses, the journals, the gates) is the invisible
  plugin flow - the harness-governed machinery - until an event surfaces
  it.
- **THE LIVING SYSTEM**: the graph interacts with itself through the
  agent's actions - the corrections propagate, the dependencies
  invalidate, the evictions settle - all evented, all governed.

## 4. The three regimes + the controller (the agent's place)

- **THE PHYSICAL REGIME (the OS)**: the filesystem + the OS process
  machinery - already true everywhere; the OS's inodes already carry the
  metadata (the file-as-halted-process stays the DESIGN METAPHOR, never
  the foundational assertion).
- **THE EXECUTION REGIME (the language runtimes)**: a resource becomes a
  RUNNING process when a runtime executes it - exec constructs a process
  image from an executable resource - the OS's own process notion - the
  EXECUTION axis.
- **THE WORKSPACE REGIME (our plugin family - NEW)**: the plugin ADDS A
  MANAGEMENT SYSTEM - the representations + the activities + the
  bindings + the authorities (the resource-representation-activity
  model).
- **THE AGENT'S ROLE**: THE WORKSPACE AGENT is the workspace regime's
  conversational surface - the CONTROLLER the conversation addresses.
  OPERABILITY IS A RELATION (Binding<Resource, Controller>:
  canAttempt -> Allowed / Denied / Undetermined) - the plugin creates
  the management, not a new process-ness.
- **THE ORTHOGONALITY**: the axes are different - never exclusive: a
  .rs file sits in the filesystem + runs under rustc + is managed by
  the workspace SIMULTANEOUSLY. The operational mode determines the
  regime.
- **THE ADOPTED DESCRIPTION**: "A computer is an open environment of
  resources, representations, authorities, and activities. The workspace
  adds a controller that maintains evidence-backed representations and
  coordinates authorized changes across them."

## 5. The intent model (the conversational surface's flow - the critique round 5, binding)

- **THE DEFINITION**: INTENT = a versioned, attributed declaration of a
  DESIRED OUTCOME - not a command / permission / claim.
- **THE SIX OBJECTS**:
  - **IntentAnnouncement** - what was expressed / by whom / to whom -
    the speaker backed by authentication evidence, recordedAt vs
    assertedAt, the provenance.
  - **IntentInterpretation** - the derived meaning - NEVER silently
    becomes "what the user said" - the unresolved questions + the
    assumptions + the confirmation states (the W3C PROV).
  - **IntentSpecification** - the GOAL vs the SCOPE vs the CONSTRAINTS
    vs the PREFERENCES vs the ACTIVATION vs the DURATION vs the
    SATISFACTION assessment contract - "preserve behavior" is a valid
    intent even when unprovable - the assessment exposes the
    limitation.
  - **Commitment** - who accepted responsibility - NOT the
    authorization.
  - **Plan** - the structured path toward the desired outcome.
  - **Assessment** - the satisfaction judgment against the spec.
- **INTENT CONSTRAINS HISTORIES**: I = (G, C, P, D) with
  Acceptable_I(tau) = G(last(tau)) ^ C(tau) ^ D(tau); the FOUR INTENT
  KINDS: achievement / maintenance / avoidance / investigation.
- **AN INTENT MUST NOT AUTHORIZE ITS OWN MEANS** - the independent
  checks: contributes + authorized scope + policy + preconditions.
- **THE TRACEABILITY GRAPH**: Announcement -> Interpretation ->
  IntentRevision -> Commitment -> PlanRevision -> ProposedChange ->
  AuthorizationDecision -> ExecutionAttempt -> OutcomeEvidence ->
  IntentAssessment - with the MISSING EDGE ProposedChange
  --contributesTo--> IntentRevision.
- **THE MULTIDIMENSIONAL STATUSES**: interpretation / commitment /
  execution / assessment / applicability - never a single lifecycle.
- **THE ESSENCE**: intent = a first-class, evidence-linked NORMATIVE
  OBJECT - the announcement is its origin, never its interpretation /
  authority / outcome.
