---
title: The Tomorrow Review - the batch-edit-tool + the workspace-family feature log (2026-10-20)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-20
status: complete
registry: Documentation/Archive/Tomorrow-Review/BATCH-LOG-FEATURE-LOG-2026-10-20.md
index: Documentation/INDEX.md
statuses:
	- name: the batch-edit-tool feature log (the user's directive)
		state: open
		evidence: the master record Documentation/Plans/TOMORROW-REVIEW.md - the feature log section; the research agents R-BET-1/2 dispatched, the implementation agent 3 awaits the two
	- name: the representation-first workspace research (the four external rounds)
		state: complete
		evidence: Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md + the 14 granular topic documents
	- name: the workspace plugin family decomposition (the user's distribution directive)
		state: planned
		evidence: Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md + the 25 granular documents - nothing built yet
	- name: the grand-sweep (the consolidated agent)
		state: complete
		evidence: `3b165bf9` - all four mandates + every arbiter green; the user committed 77ad96a mid-run
---

# THE BATCH-EDIT-TOOL + THE WORKSPACE-FAMILY FEATURE LOG (2026-10-20)

> Granular topic document distilled from the master record's chronological
> batch log (Documentation/Plans/TOMORROW-REVIEW.md - the BATCH-EDIT-TOOL
> FEATURE LOG section; the master record remains the authoritative
> source).

---

## 1. THE FEATURE (the user's directive, binding)

- THE FEATURE: a NEW family plugin - the BATCH EDIT TOOL - a tool the
  model calls INSTEAD of the bash-sed replaces and the literal per-file
  manual edits.
- IT FUNCTIONS LIKE A LIVE CONTAINER (borrowing the live-containers
  plugin's features - the live view / framework style).
- THE DESIGN: the agent prepares itself a SCHEMA and dynamically inserts
  FILES into it; the inserted files process like a STATE MACHINE - all
  in one go - like a code execution block - FULLY propagated + controlled
  by the plugin system: the state machine is SPONSORED / TRACKED /
  EVENTED by the event system (the fs/observed + the tools/post-execute
  + the lifecycle events) - so it is much better than the regular bash
  calls for: SEARCH, BATCH EDITS, MONITORING.
- THE PHILOSOPHY (the user's paradigm): EACH FILE ON THE SYSTEM IS A
  PROCESS (Process<Halted>) - it just depends on whether it is running
  or not - the files are no longer just files, they are LIVING BEINGS,
  PROCESSES - the reversed/counter-intuitive view opposing the default
  UNIX view - this types the system so the developer/agent holds all
  these processes.
- THE COMMONALITIES: the live container + the new tool's shared
  machinery split into a SEPARATE package (the live-view framework).
- THE PHASES: agent 1 = the research (the feasibility of the
  crate/plugin), agent 2 = the suggestions + improvements, agent 3 = the
  implementation (after the two land).
- THE RESEARCH AGENTS DISPATCHED: R-BET-1 (`...`) + R-BET-2 (`...`).

## 2. THE REPRESENTATION-FIRST WORKSPACE RESEARCH PERSISTED (2026-10-20)

- The external research distilled to
  Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md - the
  framing (the representation-first agent workspace - the intent vs the
  side effect), the six layers (filesystem adapter, representation
  store, semantic model, operation engine, governance pipeline,
  agent-facing projection - the store separate from the context!), the
  tightened claims (the tool-choreography replacement vs the
  elimination; ProcessHalted = the workspace lifecycle separate from the
  OS execution; the licenses = concrete authority records with the
  weight in separate fields; the never-escape = the security requirement
  over every write path), the workspace.propose interaction (the 6-step
  harness contract), the seven research questions (identity/freshness/
  authority/commit/recovery/context-economy/semantic-uncertainty) and
  the first-experiment scope (one language, symbol rename, preview/apply,
  revisions, audit - the State:State -> State:Operational reference
  case).
- THE FAMILY'S DESIGN CONNECTION: the layers map to the batch-edit
  engine + the code-block stage + the government layers + the live-view
  framework; the questions become the implementation's acceptance
  criteria; the first experiment = the v1 scope.

## 3. THE REPRESENTATION-FIRST RESEARCH ROUND 2 PERSISTED (2026-10-20)

- The external research's extension distilled into
  REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md - the central inversion
  (the intent -> the proposed transformation -> the workspace validation
  -> the authorized reconciliation -> the verified result; the execution
  subordinate to the workspace protocol), the representation contracts
  (the ManagedRepresentation: identifier/resource/revisions/origin/
  completeness/freshness (the qualified claim!)/permittedOperations/
  pendingChanges - the provenance principle), the connected views
  (resource/semantic/authority/work/history - the weight != permission!),
  the bidirectional transformations (the lenses: observe/propose/
  reconcile - the refusal-to-guess first-class), the authority-vs-
  residency split (capability/ownership lease/residency policy - the
  object capabilities validated inside the harness), the non-destructive
  eviction (release/checkpoint/suspend/discard/revoke + the revocation
  timing), the typed proposals (the 6-op vocabulary + the LSP
  WorkspaceEdit seam), the meaning-preserving execution (the intent +
  the constraints attached to the changes), the recovery-before-rollback
  (the workItem + the undo as a new reconciliation), the governance
  failure explicitness (the fail-open revised: the mandatory protections
  never silently disappear + the recursion prevention), the hypothesis
  test (the 3 implementations x the same tasks + the difficult cases -
  the strongest claim = the coordination/control improvement).

## 4. THE WORKSPACE PLUGIN FAMILY DECOMPOSITION (2026-10-20 - the user's distribution directive)

- The batch-edit idea is DISTRIBUTED across MANY plugins - NEVER one
  monolith - the decomposition doc (Documentation/Plans/
  WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md) names the family: the
  WORKSPACE AGENT (@playform/plugin-dsh-workspace - the ONLY operational
  view, what the conversation sees - the graph-like, self-correcting
  living view) + the 14 invisible hooks (observe, semantics, operate,
  govern, authority, journal, live, merge, monitor, context, approve,
  audit, evidence, + the later-stage graph + reflect) + the shared
  lib-dsh-live-view library.
- THE ORCHESTRATION: observe stamps -> semantics resolve -> operate
  proposes -> govern gates -> authority licenses -> approve binds ->
  merge commits (through Factory.Write) -> journal records -> audit
  lines -> live presents - all evented, all governed by the plugin
  harness.
- THE PHASED DELIVERY (the ablation-aligned: the engine -> the safety ->
  the operational view -> the reflective ops -> the monitors -> the
  graph/reflect later stages).
- THE VISIBILITY RULE: the conversation sees only the operational view;
  the machinery is invisible until an event surfaces it.
- The third-round distillation appended to
  REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md (the four kinds of truth,
  the evidence dependencies, the unseen changes, the private candidates,
  the knowledge boundaries, the attention projection, the exact
  approvals, the narrow guarantees, the useful failures, the ablation
  study). R-BET-1/2 + the external research = the full brief.

## 5. THE GRAND-SWEEP COMPLETE (2026-10-20, `3b165bf9` - the single consolidated agent, NO subagents, per the user's directive)

- All four mandates + every arbiter green.
- M1: the naming sweep - Ccr/Svg = 0 everywhere (incl. the live profile
  patches); the 220+ lowercase-ccr prose sites -> CCR (the machine-read
  contracts byte-preserved: ccr_retrieve, __ccrState, the package names,
  the ccr: ledger prefix); CallId->CallID; the FULL WORDS (mirrored both
  trees): Spec->Specification (162 + the compounds), Dep->Dependency,
  Max->Maximum, Meta->Metadata (196 site sites!), Prev->Previous,
  Info->Information, Sync->Synchronous, El->Element, Async->Asynchronous,
  Repo->Repository; the DELIBERATE deviation: Num->Numeric/
  MonitorNumber (the Number shadow - a smoke caught a partial pass
  mid-run!); the deferred residuals with reasons (CheckAsync ~150,
  OurRepo ~90, the docs' Spec vocabulary, one demo string); the
  exception classes respected.
- M2: the diagram labels (~45 across 28 files) + the latent render
  defect fix (coach-family-position's long token!) + the FULL 319
  re-render, 0 failures.
- M3: the copy-style - the docs already reflowed by the user's commits,
  one dense paragraph reflowed, the frontmatter untouched.
- M4: the build exit 0 + "All 207 smoke suites passed" + the astro build
  24 pages zero errors + the Drift 310/310 (twice) + the guards 0/0.
- THE USER committed the sweep mid-run (77ad96a - 383 files).
- THE RESIDUE: 35 EffectTS Target .d.ts files - the tsc-alias import-form
  churn - the user's choice: discard (git checkout -- EffectTS) or
  commit as "chore(build): Regenerate EffectTS Target declarations
  (tsc-alias import-form)". NO ESCALATION - the consolidated mandate
  complete.

## 6. THE RECONCILIATION MANDATE DISTILLED (2026-10-20 - the fourth external round)

- STOP EXPANDING - RECONCILE the docs into ONE executable
  WORKSPACE-CONTRACT.md (the supersedes links + the acceptance tests;
  the research docs = the rationale).
- THE CONTRADICTIONS SETTLED: the semantic rename = the first end-to-end
  experiment (the text engine = the internal milestone); the authority =
  the capabilities/leases/residency separation everywhere; the failure
  behavior per OBLIGATION (the mandatory protections block); the
  atomicity = the validation/visibility/crash/compensation specified
  separately; the prompt assembly = the supported context carrier.
- THE COMMIT GOVERNANCE: the 6-step transaction-wide preparation + the
  changeset digest (a governor change invalidates the approval).
- THE RECOVERY STATES (prepared/approved/commit-decided/applying/
  verified + recovery-required/compensation-required/conflict) + the
  recovery-vs-undo distinction.
- THE AUTHORITY BENEATH THE PLUGINS: ONE mandatory authorization
  boundary + the intersecting permissions + the narrowing delegation +
  the revisions attached + the revocation before/after the commit - the
  required protections never quietly disable.
- THE OBSERVATIONS = the qualified evidence (the digest/source/revision/
  completeness + the two external-edit tests).
- THE ORCHESTRATION: three capacity quantities + the attempt/reservation/
  fencing/duplicate handling + the reservation test + the inspectable
  routing explanation.
- THE TWO INTEGRATION FIXES: the ccr retrieval contract (the scope-bound
  retrieval + the replayable-vs-non-repeatable + the safe-rerun rule) +
  the native crash containment (process-isolated vs in-process FFI + the
  authenticated fallback).
- THE NEXT SLICE: the WORKSPACE-CONTRACT.md reconciliation -> the TS
  symbol rename vertical slice -> the interruption injections -> the
  three-way comparison -> the shared extraction after. This becomes
  agent 3's first mandate.

## 7. THE INVERSE-REPRESENTATION PARADIGM (2026-10-20 - the user's extension)

- The workspace = the INVERSE REPRESENTATION of the standard UNIX
  filesystem (the files = the ACTIVE processes/knowledge graphs; the
  harness's state = the substrate - the roles inverted!).
- The ANY-FILE adapters (NOT just .ts - the .rs, the .docx, the
  binaries, the data files - each type's adapter produces its knowledge
  graph; the MAIN EVIDENCE = the code block - the universal atom - start
  small + expand).
- The DATABASES + CLOUD: the different databases powering/connecting the
  representation; the harness lifted onto the cloud; the artifact-like
  block-based remote feeds.
- The PITFALLS LOG + the RFC QUEUE (the adapter interface, the
  knowledge-graph schema, the inverse-representation nomenclature, the
  remote-block protocol, the storage adapters, the harness-integration
  RFCs) + the RESEARCH PLACES (~/Developer/Documentation/Module/
  deepseek-harness PRIMARY - the subsequent agents always read it: never
  discard any functionality + search more integration ways + totally
  modify the harness per the new nomenclature).
- The GRAND-REWRITE (`ad3a86f2`) relayed the framing + this extension.