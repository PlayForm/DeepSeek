# Representation-First Workspace Research (external distillation)

> Distilled 2026-10-20 from the user's external research (a third-party
> analysis of the batch-edit-tool / representation proposal). Persisted as
> the design's frame of reference. The user's own paradigms (the file-as-
> process, the representation management, the licenses + eviction rule,
> the code-block graphs) remain the binding vision; this document's
> architecture + tightened claims refine the path.

## The framing (adopted)

The proposal is a **representation-first agent workspace** - NOT merely a
batch-edit tool: the agent expresses INTENT, and the harness owns
validation, authorization, execution, and presentation of the result. The
distinction: requesting a filesystem side effect vs proposing a
transformation inside a managed workspace. The core question: "What would
an agent environment look like if the workspace - not a sequence of tool
calls - were the primary unit of interaction?"

## The layers (adopted)

| Layer | Responsibility |
|---|---|
| Filesystem adapter | Read + persist resources under the actual OS permissions |
| Representation store | Resource identities, observed versions, proposed changes |
| Semantic model | Symbols, references, dependencies, code relationships |
| Operation engine | Structured intentions: rename, move, transform, connect |
| Governance pipeline | Scope, permissions, constraints, approvals, conflicts |
| Agent-facing projection | Relevant state within a bounded context budget |

THE KEY DISTINCTION: the representation store is separate from the agent's
context - the store holds the authoritative workspace state; the context is
a selective, versioned VIEW of it (the "immediately accessible" gets a
testable meaning: address a known resource without re-requesting its
contents, while being told when the view is stale).

## The tightened claims (adopted, refining the user's vision)

1. **"Eliminate tools" -> "replace the low-level tool choreography"**: keep
   an explicit operation boundary (a compact DSL / structured action
   interface) even as the bash/file-tool calls disappear. The user's
   measured direction (R-BET-2's escape-elimination tracking) records the
   calls replaced.
2. **ProcessHalted = the workspace lifecycle abstraction**: separate from
   the OS execution state - a resource's editing lifecycle is distinct
   from its program execution (the ambiguity avoided).
3. **Licenses = concrete authority records**: the holder, the resource,
   the permitted operations, the expiration, the delegation rules, the
   revocation - the scheduling priority / graph weight live in SEPARATE
   fields (the license is the authority; the weight is the representation).
4. **The never-escape promise = a security requirement**: identify EVERY
   write path available to the agent + specify which are mediated,
   prohibited, or explicitly outside the guarantee.

## The concrete interaction (the prototype shape)

```
workspace.propose:
  operation: renameSymbol
  target: symbol:4821
  expectedRevision: revision:93
  newName: Operational
  scope: project
```

The harness contract: (1) resolve the target against the revision,
(2) compute the affected references, (3) check the permissions + policy,
(4) produce a reviewable change set, (5) reject or reconcile the
intervening changes, (6) apply the approved result + report the new
revision. Semantic operations never get authority merely because they are
compact - they must expose their scope and evidence.

## The research questions (the priorities before building)

- **Identity**: what identifies a resource/symbol across renames, moves,
  reparsing?
- **Freshness**: how does the harness detect the agent acted on an
  outdated representation?
- **Authority**: can a plugin restrict an operation without another
  silently widening it?
- **Commit semantics**: what happens if only part of a multi-file change
  persists?
- **Recovery**: unapplied proposal vs partial application vs completed
  application after interruption?
- **Context economy**: which projections actually reduce the tokens + the
  repeated reads?
- **Semantic uncertainty**: when must an operation refuse or request
  clarification?

## The first experiment (the recommended scope)

ONE language, the symbol rename, the preview/apply, the revision checks,
the audit record - compared against the conventional read/edit workflows
on: correctness, tokens, interaction count, conflict handling, recovery
effort. The user's `State: State -> State: Operational` example is the
reference case. The implementation progress reported in the family's docs
is BACKGROUND, not feasibility evidence - the relevant interfaces get
validated independently before the architectural commitments.

## The connection to the family's design

- The layers map onto the family's structure: the filesystem adapter +
  representation store = the batch-edit engine's core; the semantic model +
  operation engine = the code-block stage (the reflective API); the
  governance pipeline = the five government layers; the agent-facing
  projection = the live-view framework (the commonality split).
- The research questions become the implementation agent's acceptance
  criteria (the identity/freshness/authority/commit/recovery/context-
  economy/semantic-uncertainty checks).
- The first experiment's scope = the implementation's v1 (the symbol
  rename, one language, the preview/apply, the revisions, the audit).
## The second round (distilled 2026-10-20 - the external research's extension)

### The central inversion (adopted)

intent -> proposed transformation -> workspace validation -> authorized
reconciliation -> verified result. The responsibility lives at the
proposal-becomes-external-effect boundary: the harness enforces the
restrictions there, instead of the agent remembering them. The execution
becomes SUBORDINATE to the workspace protocol - never an independent
source of authority.

### The representation contracts (adopted)

A representation is more than cached content - it carries a CONTRACT:
what it represents, where its evidence came from, how fresh it is, which
changes it can express. The ManagedRepresentation shape: identifier,
resource, observedRevision, representationRevision, origin (the
ObservationRecord), completeness (complete|partial|unknown), freshness
(current|stale|unverified - a QUALIFIED claim: current relative to a
specified observation mechanism + revision, never a guarantee against
external actors), permittedOperations, pendingChanges. THE PRINCIPLE: a
representation without provenance is convenient state; with provenance it
can support accountable decisions.

### The connected views (adopted - the multiple graphs!)

NOT one graph - distinct views connected by stable identifiers: the
RESOURCE view (which resources + which versions observed), the SEMANTIC
view (the symbols/references/dependencies resolved), the AUTHORITY view
(who may perform which operations on which resources), the WORK view
(which task owns a proposal + what it waits for), the HISTORY view (which
observations/decisions/effects produced the state). THE WEIGHTED-LICENSE
IMPLICATION: priority, retention value, and permission are NOT
interchangeable - a heavily weighted resource may deserve more context or
longer retention WITHOUT any additional write authority.

### The bidirectional transformations (the lenses - Pierce/Foster)

observe(resource, revision) -> representation; propose(representation,
operation) -> candidate change; reconcile(resource, candidate) ->
applied | conflict | rejection. Every abstract edit may have multiple
concrete interpretations (a displayed name = the symbol rename? the docs?
the serialized key? the combination?) - the system must EXPOSE the
ambiguity; the REFUSAL TO GUESS is a first-class result.

### Authority vs residency (three independent concepts)

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

### The non-destructive eviction (the user's eviction rule refined)

Eviction = releasing a representation's ACTIVE RESOURCES, never deleting
the represented file or discarding unfinished work. The dispositions:
RELEASE (drop the unmodified representation), CHECKPOINT (persist enough
to reconstruct the unfinished work), SUSPEND (preserve the work while
withdrawing the execution eligibility), DISCARD (explicitly abandon a
proposal under an authorized decision), REVOKE (withdraw an operation
right without removing the representation). THE REVOCATION TIMING: the
revocation blocks NEW commits; a commit already past its durable commit
decision follows the recovery protocol - "stop" gets a precise meaning
without pretending every side effect cancels instantaneously.

### The typed proposals (the State -> Operational example's distinction)

The operation vocabulary distinguishes the symbol identity from the
matching text: replaceText, renameSymbol, renameResource,
changeSerializedKey, updateDocumentation, connectDependency - each
declares its resolution rules + uncertainty (connectDependency is not
accepted until the language adapter defines what connection means: the
import? the invocation? the service registration?). The LSP's
WorkspaceEdit (the versioned document changes + the resource operations)
is the adapter seam to investigate - not evidence that the governance +
recovery are solved.

### The meaning-preserving execution

The original intent stays attached to the changes (the proposal yaml: the
operation, the target, the expectedWorkspaceRevision, the newName + the
constraints: preserveSerializedKeys, preservePublicExports + the result:
the resolution, the changes, the validation). THE REVIEW QUESTION: did
the concrete change set satisfy the declared operation + constraints? -
the different policies for the local-variable rename vs the public-API
change vs the persisted data-format change, even when all three look like
text replacements.

### The recovery before the rollback (the early requirement)

The work persists INDEPENDENTLY of the agent's conversational memory: the
workItem (identifier, objective, scope, ownerLease, proposal, status,
lastDurableCheckpoint) - a restarted agent receives the EXPLICIT work
record + inspects its status - never infers the ownership from the
sibling edits or reconstructs the assignment from an old transcript. THE
UNDO: requires the revision checks - if another actor changed the file
after the original operation, the undo is a NEW reconciliation problem -
never permission to overwrite the newer work.

### The governance failure explicitness (the fail-open revision)

The user's earlier fail-open suggestion is refined per what each layer
protects: AUTHORIZATION denies the mutation if the authority cannot be
established; the REQUIRED VALIDATION blocks the commit if the required
result is unavailable; the DURABLE RECOVERY RECORD blocks the mutations
that require the recoverability; the OPTIONAL DISPLAY continues with the
degraded marker; the NONESSENTIAL ANALYTICS continues if no security
obligation depends on it. THE PRINCIPLE: optional conveniences may
degrade; the mandatory protections must not silently disappear. THE
RECURSION PREVENTION: every event carries the operation identifier, the
parent identifier, and the event category - a validator's own activity
cannot endlessly retrigger the mutation pipeline.

### The hypothesis test (the honest measurement)

NOT "one call replaces twenty" - the complete workflow's cost + reliability
(indexing, validation, conflicts, recovery). The three implementations
measured on the SAME tasks: the read/edit workflow (the baseline), the
semantic editing adapter (the structured operations alone), the governed
workspace (the persistent state + policy). The measures: the task
correctness, the unintended changes, the model tokens, the elapsed time,
the stale-proposal rejection, the interruption recovery, the human review
effort - with the deliberately difficult cases: the duplicate names, the
unresolved references, the external edits, the expired leases, the
failure midway through the persistence. THE STRONGEST CLAIM: the
demonstrated improvement in the COORDINATION AND CONTROL - not merely a
more expressive interface.

## The third round (distilled 2026-10-20 - the workspace as the runtime for accountable change)

### The research contribution (the falsifiable hypothesis)

The workspace is a RUNTIME FOR ACCOUNTABLE CHANGE: the agents contribute
proposals; the runtime tracks what those proposals DEPEND ON, whether they
remain VALID, and what ACTUALLY happened. The hypothesis (falsifiable):
"a persistent workspace that records observations, proposals, authority,
and validation dependencies can reduce the coordination failures WITHOUT
requiring the agents to reconstruct the operational state from the
conversation history." The evaluation must allow the negative outcomes
(the recovery improved but the overhead too high; the coordination
improved without the token reduction).

### The four kinds of truth (never collapse into a currentState)

- OBSERVED: what a particular observation established (file contents at
  revision 93).
- PROPOSED: a change not yet accepted (rename a resolved symbol).
- VALIDATED: a claim checked under stated conditions (the type check
  passed for candidate 108) - ALWAYS answers: validated against what,
  using which check, at which revision?
- COMMITTED: an effect recorded as applied (candidate 108 persisted).

A proposal can be coherent but unauthorized; a validation can succeed and
later become stale; a commit can complete without every downstream
consequence checked.

### The evidence dependencies (the validation objects)

Each validation is a durable object with dependencies (candidate,
checker + its configurationRevision, inputs: sourceSnapshot/
dependencyLockfile/compilerVersion, outcome). If a relevant input changes,
the result INVALIDATES - never preserve a green badge because the check
once succeeded. THE CONNECTION: the self-adjusting computation tracks
dependencies + propagates the changes - here for the EVIDENCE VALIDITY,
not the automatic rerunning of every agent thought. Track the machine-
checkable dependencies first; label the untracked assumptions explicitly.

### The unseen changes (the semantic read dependencies)

Version-checking the edited files alone is too narrow: the semantic
operations record the dependencies on the DISCOVERY QUERIES as well as
the individual resources (resource: file:41 @ revision:93 + query:
references-to-symbol:4821 @ indexRevision: index:26 + scope). The
optimistic-concurrency foundation (read sets, write sets, validation
before publication) - the design question: how to represent "these are
all the references I found" WITHOUT claiming more completeness than the
index can establish.

### The private candidates (the multi-agent integration)

Separate CANDIDATE BRANCHES over the agents freely mutating one shared
state: observed snapshot -> candidate A/B/C (each a branch) -> the
integration: select the candidates -> resolve the interactions -> validate
the combined result -> authorize the publication. The unit of integration
= a proposal WITH provenance (which candidate introduced which change +
which assumptions justified it). The TEXTUAL vs SEMANTIC compatibility:
two candidates modifying different files can jointly violate an invariant
- passing the non-overlapping-diff check never proves the compatibility.

### The knowledge boundaries (the coverage metadata - CORE)

A reference query returns the coverage: sourceFiles (complete),
generatedFiles (excluded), dynamicPropertyAccess (unresolved),
externalConsumers (notInspected) - the agent chooses: proceed within the
restricted scope / gather more evidence / escalate the unsupported case.
The coverage metadata is part of the representation contract, not an
optional diagnostic.

### The attention projection (the facts vs the attention)

The durable workspace state vs what is currently shown to the model:
REQUIRED context (needed to interpret the current operation safely),
RELEVANT context (evidence likely to help), DEFERRED context (addressable
material omitted from the view). The eviction never erases the authority
records, the pending proposals, or the recovery checkpoints; retaining a
representation in memory never means the model has seen it. The question:
which information must be DISPLAYED vs which merely needs to remain
RELIABLY ADDRESSABLE?

### The exact human approval

The approval binds to a SPECIFIC candidate + its declared scope (the
candidate + the candidateDigest + the permits: applyDeclaredChanges + the
constraints: maximumChangedResources, publicAPIChanges prohibited) - a
material change after the approval requires a NEW decision. The approval
of an intention never authorizes every implementation the agent later
produces. The review presents BOTH the semantic description AND the
concrete diff - neither substitutes for the other.

### The narrow guarantees (never claim the atomicity loosely)

- CANDIDATE ISOLATION: the uncommitted changes stay separate from the
  published workspace.
- SERIALIZED MANAGED COMMITS: the managed commits follow a controlled
  ordering.
- CRASH RECOVERY: the interrupted persistence has a documented recovery
  procedure.
- EXTERNAL VISIBILITY: an explicit statement of what the unmanaged
  readers may observe - if the external programs can read the directory
  during the publication, design the publication mechanism or document
  the limitation. RECOVERABLE IS NOT THE SAME PROMISE AS INVISIBLE
  INTERMEDIATE STATE.

### The useful failures (the structured next-decision instructions)

outcome: rejected + reason: semantic-dependencies-changed +
invalidated: [query: references-to-symbol:4821] + preserved: [proposal:
proposal:42] + nextActions: [refreshReferenceResolution,
regenerateCandidate, requestReviewIfScopeExpands]. Distinguish the
retryable transport failures, the stale evidence, the policy denials, the
unsupported semantics, the partial persistence - each its own recovery
path; a universal retry counter never blurs them. The goal: the failure
is BOUNDED, EXPLAINABLE, RESUMABLE - never eliminated.

### The ablation study (the components tested separately)

structured-operations-only -> does the better interface help?; + the
persistent work records -> does the explicit state improve the restart
recovery?; + the dependency validation -> does it prevent the stale
proposals?; + the isolated candidates -> does it improve the concurrent
work?; + the governance -> what control does the policy add + at what
cost? The controlled disruptions: kill an agent after proposing, modify a
dependency before the commit, revoke the authority during the validation,
restart the harness during the persistence - scored on the successful
completion AND the correct refusal of the unsafe continuation. THE
STRONGEST RESULT: which guarantees require the infrastructure, which
benefit from the model reasoning, which should NEVER depend on the
conversational memory.

## The fourth round (distilled 2026-10-20 - the reconciliation mandate)

THE MAIN SUGGESTION: STOP EXPANDING THE CONCEPT - RECONCILE THE DOCUMENTS
into ONE EXECUTABLE CONTRACT (a short normative WORKSPACE-CONTRACT.md with
the explicit "supersedes" links + the acceptance tests; the research
documents preserved as the RATIONALE, never the competing implementation
instructions).

### The contradictions to settle (before the implementation dispatch)

- FIRST RELEASE: the research names the one-language SEMANTIC RENAME as
  v1; the batch plans start with the TEXT operations + defer the
  semantics -> the text engine is an INTERNAL MILESTONE; the semantic
  rename is the first END-TO-END experiment.
- AUTHORITY: the feature plan treats the machine IDs + version stamps as
  licenses; the research separates the capabilities, the ownership
  leases, the residency -> the newer separation is adopted EVERYWHERE -
  an identifier LOCATES the authority, it does not ESTABLISH it.
- FAILURE BEHAVIOR: the suggestions make the layers independently
  fail-open; the research requires the authorization/mandatory
  validation/recovery protections to BLOCK when unavailable -> the
  failure behavior is declared PER OBLIGATION, not per plugin.
- ATOMICITY: the suggestions promise the all-or-nothing batches; the
  feature plan describes the individually guarded writes + the per-file
  failures -> the validation atomicity, the visibility, the crash
  recovery, the compensation are specified SEPARATELY.
- CONTEXT DELIVERY: the batch-state proposes replacing the injected
  slots; the feature research says the conversation-body rewriting is
  unavailable + uses the prompt assembly -> the supported carrier is made
  EXPLICIT; "replace in place" never remains an assumed capability.

### The commit governance (the approved preview = the exact change on disk)

THE TRANSACTION-WIDE PREPARATION SEQUENCE: (1) resolve the semantic
intent into the candidate edits; (2) run the permitted normalization +
governance transformations against the STAGED candidate; (3) expand the
affected-resource set if the transformations introduce additional
changes; (4) validate the resulting candidate + obtain the approval for
that EXACT changeset; (5) recheck the authority + the base revisions
before the persistence; (6) verify the persisted result + record the
final revisions. THE CHANGESET DIGEST: if a governor changes the
candidate afterward, the approval INVALIDATES - the approval never
silently expands. "The preview matches the applied bytes" becomes a
property of the ENTIRE pipeline, not just the text-edit engine.

### The partial failure honesty (the recovery states)

prepared -> approved -> commit-decided -> applying -> verified; applying
-> recovery-required -> verified | compensation-required | conflict. For
each transition: what is DURABLE + what a restarted process must INSPECT.
Include the case where the file write succeeded but the success-record
failed. THE RECOVERY vs THE UNDO: completing an interrupted approved
operation is DIFFERENT from proposing a new operation that reverses a
completed one - the revision-checked undo carries the distinction into
the engine API.

### The authority beneath the plugins

- ONE MANDATORY authorization boundary immediately before the external
  effects.
- The effective permissions = the INTERSECTION of the applicable
  restrictions.
- The delegation NARROWS the authority, never enlarges it.
- The policy + capability revisions attach to the approval records.
- The revocation is handled BEFORE and AFTER the durable commit decision.
- The plugin-per-protection architecture stays, but the OPTIONAL
  EXTENSIONS are distinguished from the REQUIRED PROTECTIONS - disabling
  a required protection disables the affected mutation, never quietly
  removes its restriction.

### The observations as evidence (the qualified freshness)

The feature plan sometimes describes the fs/observed stamp as reality's
attestation; the research qualifies the freshness by the observation
mechanism - ADOPT the qualified formulation throughout: the resource
identity + the content digest + the observation source + the observed
revision + the known completeness limits. THE TWO TESTS: (a) an external
edit occurs WITHOUT the corresponding harness event; (b) the resource
changes BETWEEN the final freshness check and the persistence. The
adapter documents its ACTUAL concurrency guarantee - a fresh check, a
cooperative lease, and the exclusion of the arbitrary external writers
never share the same label.

### The orchestration recoverability (the queue's three quantities)

The queue plan's capacity table still says the idle lanes need the active
slots despite the documented release - model THREE separate quantities:
the queued work, the retained continuable sessions, the active execution
slots. Add the attempt ids, the reservation ids, the ownership fencing,
the duplicate-completion handling to the dispatch records. THE TEST: a
parent occupying the capacity while waiting for the children that cannot
acquire the capacity - specify the reservation/yielding/admission before
claiming the fan-out policy prevents the workflow floods. THE ROUTING:
keep the silent execution, but provide the INSPECTABLE EXPLANATION (the
resolved role, the matching rule, the policy revision, the correction,
the escalation budget) - the uncertainty gets a deterministic policy
outcome, never an implied certainty.

### The two integration assumptions (to fix)

- THE COMPRESSION NEEDS A RETRIEVAL CONTRACT, not just a marker format:
  the ccr plan defaults to the full-output expansion below 102400 bytes
  while a live test expects a marker for a 2048-byte result - the
  expectations reconcile; the retrieval binds to the caller's permitted
  session/resource scope; the replayable reads are distinguished from the
  non-repeatable tool results; an expired marker never generically tells
  the agent to rerun an operation unless the rerun is KNOWN safe.
- THE NATIVE INTEGRATION cannot promise the host survival merely by
  wrapping the FFI calls (its own risk table acknowledges the native
  crash can take down the host!) - the crash containment is a SEPARATE
  decision from the transport: test a process-isolated native host
  against the in-process FFI + require the authenticated, version-
  compatible fallback (never accept any healthy local endpoint).

### What to build next (the ONE narrow vertical slice)

1. Reconcile the normative contract (WORKSPACE-CONTRACT.md).
2. Implement the TypeScript symbol rename with the preview, the scoped
   authority, the revision checks, the durable recovery, the verified
   results.
3. Inject the interruptions + the conflicting external edits at EVERY
   persistence boundary.
4. Compare the conventional editing, the semantic adapter alone, the
   governed workspace on the IDENTICAL tasks.
5. Extract the shared infrastructure ONLY after the slice exposes the
   real commonality.
The three-way experiment is the strongest next step: it tests whether the
persistent governance adds value beyond merely offering a better semantic
editing interface.
