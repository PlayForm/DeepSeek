---
title: The Workspace Plugin Family Decomposition - the hub
category: Plans
kind: living-plan
date: 2026-10-20
status: superseded
registry: Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md
index: Documentation/INDEX.md
statuses:
	- name: the v4.1 distillation
		state: superseded
		evidence: Documentation/Plans/WORKSPACE-FAMILY-V4-1.md - the distilled plan; this hub and the granular set remain the detailed record
	- name: the family decomposition (17 members + the shared library)
		state: planned
		evidence: this hub + the granular per-package documents under Documentation/Plans/Workspace-Family/ - nothing built yet
	- name: the naming by role (refined - NOT all hooks)
		state: resolved
		evidence: Workspace-Family/NAMING-BY-ROLE.md
	- name: the phased delivery (the ablation-aligned order)
		state: open
		evidence: Workspace-Family/PHASED-DELIVERY.md
	- name: the granular split (25 topic documents)
		state: implemented
		evidence: Documentation/Plans/Workspace-Family/ - the naming, the agent, the 16 packages, the library, the phases, the inverse representation, the adapters, the databases/cloud, the pitfalls, the RFC queue, the research places
---

# Workspace Plugin Family Decomposition - The Hub

> THE FRAMING (the user's reframing, 2026-10-20 - binding): this is NOT
> one single plugin - it is a TOTALLY NEW REFACTOR + REFRAMING OF THE
> DEEPSEEK HARNESS ITSELF, through a workspace family of plugins POWERED
> BY the DeepSeek Harness plugin family for PlayForm. The harness's
> evolution: from the tool-dispatch shell (the commands that escape) to
> the WORKSPACE-CENTRIC RUNTIME - where the workspace family (the 16+
> packages) becomes the harness's new operating surface, built on the
> existing @playform family (the factory's shared machinery, the
> governors' silence, the ccr's compression, the coach's teaching, the
> live-containers' assembly): the files live as processes in state, the
> representations are managed, the edits never escape, the graph-like
> view corrects itself like a living system - all through the agent's
> actions.
>
> The user's directives (2026-10-20, binding): everything distributed
> across MANY PLUGINS - each commonality broken down, each separate
> package named, very specific functionality, all orchestrating in the
> WORKSPACE AGENT plugin. The OPERATIONAL VIEW (what the conversation
> sees) is the workspace plugin's surface; the rest is INVISIBLE -
> entirely handled by the core/plugin flow, itself governed by the
> plugin harness (~/Developer/Documentation/Module/deepseek-harness).
>
> The granular per-package documents live in
> Documentation/Plans/Workspace-Family/ (NAMING-BY-ROLE, WORKSPACE-AGENT,
> OBSERVE, SEMANTICS, OPERATE, GOVERN, AUTHORITY, JOURNAL, LIVE, MERGE,
> MONITOR, CONTEXT, APPROVE, AUDIT, EVIDENCE, GRAPH, REFLECT,
> SHARED-LIBRARY, PHASED-DELIVERY, INVERSE-REPRESENTATION,
> ANY-FILE-ADAPTERS, DATABASES-AND-CLOUD, PITFALLS-LOG, RFC-QUEUE,
> RESEARCH-PLACES) - every map node preserved verbatim
> there; this hub keeps the family map as the one-glance picture.

## The naming by role (refined 2026-10-20 - they are NOT all hooks)

The family's existing conventions distinguish the package roles; the
blanket `hook-` prefix was wrong for the service + library + client
members:

- `plugin-dsh-*` = the SERVICE PROVIDERS + the agent (the factory
  precedent - the shared services the others consume).
- `hook-dsh-*` = the EVENT HOOKS (the listeners the events fire).
- `client-dsh-*` = the UI/CLIENT halves (the browser half).
- `lib-dsh-*` = the LIBRARIES (no Config/apply; the consumers keep their
  own ledger strings, tools, configs; the module leaves never absorbed).
- The TOOLS live inside their owning hooks (per the family's pattern:
  the ccr registers ccr_retrieve) - the operate/merge register the
  workspace tools.
- The twins (Classic + ETS) per the family contract.

## The family map

```
                       @playform/plugin-dsh-workspace   (THE WORKSPACE AGENT)
                       the OPERATIONAL VIEW - what the conversation sees:
                       the graph-like projection, the agent's actions, the
                       systematic self-correction; orchestrates every hook;
                       its own Config = the family's surface knobs; the
                       INVISIBLE internals = the plugin flow, governed by
                       the plugin harness.
                       |
        +-------------+------------+----------------+----------------+ ...
        |             |            |                |                |
   @playform/    @playform/   @playform/       @playform/       @playform/
   hook-dsh-     plugin-dsh-  hook-dsh-        hook-dsh-        plugin-dsh-
   workspace-    workspace-   workspace-       workspace-       workspace-
   observe       semantics    operate          govern           authority
   (the EVENT    (the SER-    (the operation    (the EVENT       (the SER-
   HOOK: the     VICE: the    engine: the ty-   HOOK: the        VICE: the
   revisions,    semantic     ped proposals -   scope/permiss-   capabilities
   the observe-  model: the   rename/connect/   ions/constraints + the lea-
   stamps, the   symbols +    replace + the     + the approvals   ses + the
   origin re-    the refe-    resolution rules  + the conflicts +  eviction
   cords)        rences +     + the refusal-    the recursion      rule - the
                 the deps +   to-guess)         prevention)       grant/hold/
                 the index)                     (the tools/       revoke - the
                 (the others                   pre+post-execute  licenses)
                 consume)                      waterfalls)
   |             |            |                |                |
   @playform/    @playform/   @playform/       @playform/       @playform/
   hook-dsh-     client-dsh-  hook-dsh-        hook-dsh-        plugin-dsh-
   workspace-    workspace-   workspace-       workspace-       workspace-
   journal       live         merge            monitor          context
   (the EVENT    (the CLIENT  (the EVENT       (the EVENT       (the SER-
   HOOK: the     half + the   HOOK + the       HOOK: the        VICE: the
   undo + the    framework:   tool: the        watch + the      attention
   recovery      the pre-     batch merge -    sweep forms -    projection -
   checkpoints   sentation,   the atomic       the wave-3       the requir-
   + the crash   stable-      gates, the       machinery, no    ed/relevant/
   recovery)     until-       per-file         real timers)     deferred -
                 event)       commits                           the context
                 through                           economy)
                 Factory.
                 Write, the
                 all-or-
                 nothing /
                 survivors)
   |             |            |                |                |
   @playform/    @playform/   @playform/       @playform/       @playform/
   hook-dsh-     hook-dsh-    plugin-dsh-      plugin-dsh-      plugin-dsh-
   workspace-    workspace-   workspace-       workspace-       workspace-
   approve       audit        evidence         graph            reflect
   (the EVENT    (the EVENT   (the SER-        (THE LATER       (THE LATER
   HOOK: the     HOOK: the    VICE: the        STAGE: the       STAGE: the
   exact human   event re-    validation       files as the     code-block
   approval -    cords +      objects + the    weighted graphs  reflective
   the candi-    the ledger   evidence deps +  in our internal  ops: the
   date-bound    lines -      the four kinds   carry - the      AST-aware
   approval +    the ac-      of truth + the   license weights  rename/
   the con-      counta-      stale-validat-   = the filesys-   connect/
   straints)     bility)      ion invalida-    tem's represen-  replace from
                              tion)            tation)          a single
                                                                call)
   AND the shared library:  lib-dsh-workspace-live (the commonality split:
   the state cells, the clock/deadline scans, the write wrapper, the
   P5 storage, the render/collapse, the ingest, the lease, the wiring -
   extracted after two consumers exist)
```

## The orchestration contract

- THE WORKSPACE AGENT is the ONLY conversational surface: the agent
  addresses the workspace (open/insert/commit/pause/resume/close/state +
  the graph-like projection). Every hook answers through it.
- THE INVISIBLE FLOW: the observe stamps -> the semantics resolve -> the
  operate proposes -> the govern gates -> the authority licenses -> the
  approve binds -> the merge commits (through Factory.Write) -> the
  journal records -> the audit lines -> the live view presents - all
  evented by the plugin system (fs/observed, the tools' waterfalls, the
  lifecycle), all governed by the plugin harness.
- The distribution law: each commonality a separate package (never one
  batch-edit monolith); each package's Config + ledger strings + tools
  its own; the recursion prevention: every event carries the operation
  identifier, the parent identifier, the event category.

## The phased delivery (the ablation-aligned order)

1. lib-dsh-workspace-live + the observe + the operate + the merge (the
   v1 engine: the schema, the state machine, the per-file commits, the
   smokes with the fake clocks).
2. The govern + the authority + the journal (the safety: the
   authorization, the leases/evictions, the recovery).
3. The workspace agent's operational view (the graph-like projection +
   the attention projection via the context).
4. The semantics + the evidence + the approve (the reflective rename/
   connect/replace + the validation objects + the exact approvals).
5. The monitor + the live + the audit (the watch/sweep + the live view +
   the accountability).
6. The graph + the reflect (the later stages: the weighted-graph carry +
   the code-block reflective API - the State:State -> State:Operational
   reference case).

## The visibility rule

What the conversation sees = the workspace's operational view (the graph-
like, systematically self-correcting). Everything else (the stamps, the
indexes, the validations, the licenses, the journals, the gates) is the
invisible plugin flow - the harness-governed machinery - until an event
surfaces it. THE LIVING SYSTEM: the graph interacts with itself through
the agent's actions - the corrections propagate, the dependencies
invalidate, the evictions settle - all evented, all governed.
## The inverse representation (the user's paradigm, 2026-10-20 - binding)

THE CORE IDEA: the workspace is an INVERSE REPRESENTATION of the standard
UNIX filesystem. THE STANDARD: the files are the passive bytes; the tools
are the active operators. THE INVERSE: the files are the ACTIVE PROCESSES
(the knowledge graphs, the halted processes), and the harness's managed
state is the substrate - the representation INVERTS the roles: the file
holds the process, the state holds the file.

### The three regimes (the user's delineation, 2026-10-20 - binding)

- THE PHYSICAL REGIME (the OS): a file on any UNIX system IS a halted
  process - the dormant default - already true everywhere (the
  file-as-halted-process is NOT our invention).
- THE EXECUTION REGIME (the language runtimes): the same file becomes a
  RUNNING process when a runtime executes it - the OS's own process
  notion - the EXECUTION axis.
- THE WORKSPACE REGIME (our plugin family - NEW): enabling the plugin
  makes the file an OPERABLE process - the managed representation (the
  Process<File> cells: observed/running/halted/done/errored + the
  workspace verbs + the governance + the knowledge graph). What we build
  = the workspace regime - THE THIRD AXIS.
- THE CONTRADICTIONS RESOLVED: the plugin creates the OPERABILITY, not
  the process-ness. The two "running" senses are DIFFERENT AXES (the OS
  execution vs the workspace cell - orthogonal, never exclusive): a .rs
  file can be halted on disk + running under rustc + operable in the
  workspace SIMULTANEOUSLY. The operational mode determines the regime;
  what exists today = the physical + execution regimes; what we build =
  the workspace regime.

### The any-file adapters (NOT just .ts)

The system applies to ANY TYPE of halted process: the .ts files (the
TypeScript language service), the .rs files (the rust-analyzer), the
.docx files (the OOXML/word processing), the images, the binaries, the
data files - THINK ADAPTERS, THINK GRAPHS, THINK METHODOLOGY: each file
type gets its adapter that produces the file's KNOWLEDGE GRAPH (the
blocks + the references + the semantics + the dependencies). THE MAIN
EVIDENCE = THE CODE BLOCK (the universal atom - start small with the
code blocks + expand from there). Each file = a knowledge graph, managed
by code fully (powered by the DeepSeek Harness). The adapter's contract:
observe (the file's representation), propose (the operations the type
supports - rename/connect/replace/transform per the type's semantics),
reconcile (the applied results).

### The databases + the cloud (the harness lifted)

DIFFERENT DATABASES can power and connect the representation - the
inverse representation is storage-agnostic: the local fs/observed events
OR the remote block-based feeds - the harness can be LIFTED ONTO THE
CLOUD and fed data other than the normal files - the "artifact-like",
block-based, powered by the cloud or a remote system. The representation
store, the semantic index, the evidence objects, the journals all have
their storage adapters (the SQLite, the Postgres, the object stores, the
remote block stores) - the events' sponsorship extends to the remote
sources (the remote blocks emit their events through the same event
system).

### The pitfalls to log (from the day's work + the design's hazards)

- The fs/observed chain is filesystem-centric: the remote blocks' events
  need the event sponsorship's extension - the local-only assumptions in
  the governors' write-path + the ledger strings.
- The adapter coverage gaps: the binary files, the compound documents
  (the docx's OOXML - the zip-based XML trees!), the large files - the
  knowledge-graph extraction's cost + the freshness.
- The semantic uncertainty per type: the rename means different things
  per format (the .ts symbol vs the .docx displayed text vs the .rs
  item) - the refusal-to-guess rule applies per adapter.
- The representation's staleness: the external edits without the events
  (the editors, the git operations, the remote syncs) - the qualified
  freshness + the digest-based reconciliation.
- The cloud/remote latency + the authentication + the version
  compatibility - the authenticated fallback rule.
- The inverse representation's own failure modes: the graph cycles, the
  dangling references, the evicted states mid-edit, the crash between
  the commit and the journal.
- The license/weight conflation: the priority, the retention, the
  permission never interchangeable.

### The future RFC queue

- THE ADAPTER INTERFACE RFC: the any-file adapter's contract (observe/
  propose/reconcile + the per-type operation vocabulary + the uncertainty
  declaration).
- THE KNOWLEDGE-GRAPH SCHEMA RFC: the block-based graph's canonical
  schema (the blocks, the references, the semantics, the evidence).
- THE INVERSE-REPRESENTATION NOMENCLATURE RFC: the new vocabulary (the
  halted process, the representation, the license, the eviction, the
  block, the knowledge graph) - the "standard for working inside a
  workspace for files".
- THE REMOTE-BLOCK PROTOCOL RFC: the cloud/remote block-based data feeds'
  protocol (the events, the blocks, the authentication, the fallback).
- THE STORAGE-ADAPTER RFC: the different databases powering the
  representation (the local/remote, the SQLite/Postgres/object stores).
- THE HARNESS-INTEGRATION RFCs: the total modification of the harness
  according to the new nomenclature - each discovered integration seam
  (from the harness's docs) becomes an RFC.

### The places to research (ALWAYS refer the subsequent agents)

- ~/Developer/Documentation/Module/deepseek-harness (the PRIMARY source -
  the subsequent agents read it to never discard any single functionality
  + to search for more integration ways + to totally modify the harness
  per the new nomenclature).
- The family's own docs (the Archive + the Skills' references).
- The LSP (the language adapters' seam - the WorkspaceEdit).
- The OOXML spec (the docx adapter).
- The object capabilities (the authority model).
- The bidirectional transformations (Pierce/Foster - the lenses).
- The incremental computation (Acar - the evidence dependencies).
- The optimistic concurrency control (the read/write sets).

## The alternative framings (the naming candidates - the user's exploration, 2026-10-20)

The reframed harness's identity can be expressed in many ways - each
candidate emphasizes a different facet of the inverse representation:

- THE DATA-CENTRIC EDITOR (the user's example): the files as DATA held
  in state - the editor operates on the data, not the disk.
- THE WORKSPACE-CENTRIC RUNTIME: the workspace as the primary unit of
  interaction (the earlier framing).
- THE REPRESENTATION-FIRST WORKSPACE: the managed representations over
  the raw disk (the research's framing).
- THE LIVING FILESYSTEM: the files as the active processes - the
  reversed UNIX view.
- THE PROCESS-CENTRIC HARNESS: the halted processes as the first-class
  citizens (Process<Halted>).
- THE INVERSE FILESYSTEM: the roles inverted - the files act, the state
  holds.
- THE KNOWLEDGE-GRAPH WORKSPACE: each file = a knowledge graph, managed
  by code.
- THE BLOCK-BASED EDITOR: the code blocks as the universal atom + the
  evidence.
- THE STATE-FIRST EDITOR: the state machine as the sole filesystem
  surface - the edits never escape.
- THE GOVERNED WORKSPACE: the harness as the enforcement boundary - the
  proposals become the effects only through the gates.
- THE SEMANTIC WORKSPACE: the symbols + the references + the semantics
  over the text.
- THE HARNESS EDITOR: the harness's powers as the DSL the agent
  operates.
- THE EVENTED EDITOR: the state machine sponsored/tracked/evented by
  the event system.

THE RATIFICATION: the final name is the user's choice (like the package
namings) - the candidates above are the exploration's output; the chosen
name becomes the reframed harness's identity in all the docs.
