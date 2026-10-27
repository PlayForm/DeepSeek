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

> THE FRAMING (the user's reframing, 2026-10-20 - binding): this is NOT one single plugin.
> It is a TOTALLY NEW REFACTOR AND REFRAMING OF THE DEEPSEEK HARNESS ITSELF, through a workspace family of plugins POWERED BY the DeepSeek Harness plugin family for PlayForm.
> The harness's evolution runs from the tool-dispatch shell, the commands that escape, to the WORKSPACE-CENTRIC RUNTIME, where the workspace family (the 16+ packages) becomes the harness's new operating surface, built on the existing @playform family: the factory's shared machinery, the governors' silence, the ccr's compression, the coach's teaching, and the live-containers' assembly.
> The files live as processes in state, the representations are managed, the edits never escape, and the graph-like view corrects itself like a living system, all through the agent's actions.
>
> The user's directives (2026-10-20, binding): everything is distributed across MANY PLUGINS, with each commonality broken down, each separate package named, very specific functionality, and all of it orchestrating in the WORKSPACE AGENT plugin.
> The OPERATIONAL VIEW, which is what the conversation sees, is the workspace plugin's surface, and the rest is INVISIBLE, handled entirely by the core and plugin flow, itself governed by the plugin harness (~/Developer/Documentation/Module/deepseek-harness).
>
> The granular per-package documents live in Documentation/Plans/Workspace-Family/ (NAMING-BY-ROLE, WORKSPACE-AGENT, OBSERVE, SEMANTICS, OPERATE, GOVERN, AUTHORITY, JOURNAL, LIVE, MERGE, MONITOR, CONTEXT, APPROVE, AUDIT, EVIDENCE, GRAPH, REFLECT, SHARED-LIBRARY, PHASED-DELIVERY, INVERSE-REPRESENTATION, ANY-FILE-ADAPTERS, DATABASES-AND-CLOUD, PITFALLS-LOG, RFC-QUEUE, RESEARCH-PLACES).
> Every map node is preserved verbatim there, and this hub keeps the family map as the one-glance picture.

## The naming by role (refined 2026-10-20 - they are NOT all hooks)

The family's existing conventions distinguish the package roles, and the blanket `hook-` prefix was wrong for the service, library, and client members:

- `plugin-dsh-*` marks the SERVICE PROVIDERS and the agent, following the factory precedent, where the shared services are the ones the others consume.
- `hook-dsh-*` marks the EVENT HOOKS, which are the listeners the events fire.
- `client-dsh-*` marks the UI and CLIENT halves, which is the browser half.
- `lib-dsh-*` marks the LIBRARIES, which have no Config and no apply, while the consumers keep their own ledger strings, tools, and configs, and the module leaves are never absorbed.
- The TOOLS live inside their owning hooks, per the family's pattern where the ccr registers ccr_retrieve, so the operate and merge packages register the workspace tools.
- The twins (Classic and ETS) follow the family contract.

**Applied 2026-10-21** (the existing family, the workspace family's precedent): the core took the `lib-` prefix (`lib-dsh-core`, the library role), the file normalizer took the `plugin-` prefix (`plugin-dsh-normalize-file`, the tool plugin role), and the planned panel packages took the `client-` prefix (`client-dsh-panel-family` and `client-dsh-panel-family-host`).
The four role prefixes are the whole contract: plugin, hook, client, and lib.
The original names remain in git history.

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

- THE WORKSPACE AGENT is the ONLY conversational surface, because the agent addresses the workspace (open, insert, commit, pause, resume, close, state, and the graph-like projection), and every hook answers through it.
- THE INVISIBLE FLOW runs in order: the observe stamps, the semantics resolve, the operate proposes, the govern gates, the authority licenses, the approve binds, the merge commits (through Factory.Write), the journal records, the audit lines, and the live view presents.
  All of it is evented by the plugin system (fs/observed, the tools' waterfalls, the lifecycle) and all of it is governed by the plugin harness.
- The distribution law keeps each commonality in a separate package, never one batch-edit monolith, and each package's Config, ledger strings, and tools are its own.
  The recursion prevention applies to every event, which carries the operation identifier, the parent identifier, and the event category.

## The phased delivery (the ablation-aligned order)

1. **The v1 engine.**

    Build lib-dsh-workspace-live plus the observe, the operate, and the merge: the schema, the state machine, the per-file commits, and the smokes with the fake clocks.

2. **The safety layer.**

    Add the govern, the authority, and the journal: the authorization, the leases and evictions, and the recovery.

3. **The operational view.**

    Add the workspace agent's operational view, which is the graph-like projection plus the attention projection via the context.

4. **The reflective layer.**

    Add the semantics, the evidence, and the approve: the reflective rename, connect, and replace, the validation objects, and the exact approvals.

5. **The observation layer.**

    Add the monitor, the live, and the audit: the watch and sweep, the live view, and the accountability.

6. **The later stages.**

    Add the graph and the reflect: the weighted-graph carry and the code-block reflective API, with the State:State -> State:Operational reference case.

## The visibility rule

What the conversation sees is the workspace's operational view, which is graph-like and systematically self-correcting.
Everything else (the stamps, the indexes, the validations, the licenses, the journals, and the gates) is the invisible plugin flow, the harness-governed machinery, until an event surfaces it.
THE LIVING SYSTEM: the graph interacts with itself through the agent's actions, because the corrections propagate, the dependencies invalidate, and the evictions settle, all evented and all governed.

## The inverse representation (the user's paradigm, 2026-10-20 - binding)

THE CORE IDEA: the workspace is an INVERSE REPRESENTATION of the standard UNIX filesystem.
THE STANDARD: the files are the passive bytes, and the tools are the active operators.
THE INVERSE: the files are the ACTIVE PROCESSES (the knowledge graphs, the halted processes), and the harness's managed state is the substrate, so the representation INVERTS the roles, because the file holds the process and the state holds the file.

### The three regimes (the user's delineation, 2026-10-20 - binding)

- THE PHYSICAL REGIME (the OS): a file on any UNIX system IS a halted process, the dormant default, already true everywhere, because the file-as-halted-process is NOT our invention.
- THE EXECUTION REGIME (the language runtimes): the same file becomes a RUNNING process when a runtime executes it, which is the OS's own process notion and the EXECUTION axis.
- THE WORKSPACE REGIME (our plugin family, NEW): enabling the plugin makes the file an OPERABLE process, the managed representation with the Process<File> cells (observed, running, halted, done, errored) plus the workspace verbs, the governance, and the knowledge graph.
  What we build is the workspace regime, THE THIRD AXIS.
- THE CONTRADICTIONS RESOLVED: the plugin creates the OPERABILITY, not the process-ness.
  The two "running" senses are DIFFERENT AXES, the OS execution versus the workspace cell, which are orthogonal and never exclusive, so a .rs file can be halted on disk, running under rustc, and operable in the workspace SIMULTANEOUSLY.
  The operational mode determines the regime, what exists today is the physical and execution regimes, and what we build is the workspace regime.

### The any-file adapters (NOT just .ts)

The system applies to ANY TYPE of halted process: the .ts files (the TypeScript language service), the .rs files (the rust-analyzer), the .docx files (the OOXML and word processing), the images, the binaries, and the data files.
THINK ADAPTERS, THINK GRAPHS, THINK METHODOLOGY: each file type gets its adapter that produces the file's KNOWLEDGE GRAPH, which holds the blocks, the references, the semantics, and the dependencies.
THE MAIN EVIDENCE IS THE CODE BLOCK, the universal atom, so start small with the code blocks and expand from there.
Each file is a knowledge graph, managed by code fully and powered by the DeepSeek Harness.
The adapter's contract is observe (the file's representation), propose (the operations the type supports, such as rename, connect, replace, and transform per the type's semantics), and reconcile (the applied results).

### The databases + the cloud (the harness lifted)

DIFFERENT DATABASES can power and connect the representation, because the inverse representation is storage-agnostic: the local fs/observed events OR the remote block-based feeds.
The harness can be LIFTED ONTO THE CLOUD and fed data other than the normal files, in an "artifact-like", block-based form powered by the cloud or a remote system.
The representation store, the semantic index, the evidence objects, and the journals all have their storage adapters (the SQLite, the Postgres, the object stores, and the remote block stores), and the events' sponsorship extends to the remote sources, because the remote blocks emit their events through the same event system.

### The pitfalls to log (from the day's work + the design's hazards)

- The fs/observed chain is filesystem-centric, so the remote blocks' events need the event sponsorship's extension, and the local-only assumptions sit in the governors' write path and the ledger strings.
- The adapter coverage gaps cover the binary files, the compound documents (the docx's OOXML, the zip-based XML trees), and the large files, and they include the knowledge-graph extraction's cost and the freshness.
- The semantic uncertainty per type means that a rename means different things per format (the .ts symbol, the .docx displayed text, and the .rs item), so the refusal-to-guess rule applies per adapter.
- The representation's staleness comes from the external edits without the events (the editors, the git operations, and the remote syncs), and it needs the qualified freshness plus the digest-based reconciliation.
- The cloud and remote conditions include the latency, the authentication, and the version compatibility, and they follow the authenticated fallback rule.
- The inverse representation's own failure modes are the graph cycles, the dangling references, the evicted states mid-edit, and the crash between the commit and the journal.
- The license and weight conflation keeps the priority, the retention, and the permission never interchangeable.

### The future RFC queue

- THE ADAPTER INTERFACE RFC covers the any-file adapter's contract (observe, propose, and reconcile, plus the per-type operation vocabulary and the uncertainty declaration).
- THE KNOWLEDGE-GRAPH SCHEMA RFC covers the block-based graph's canonical schema (the blocks, the references, the semantics, and the evidence).
- THE INVERSE-REPRESENTATION NOMENCLATURE RFC covers the new vocabulary (the halted process, the representation, the license, the eviction, the block, and the knowledge graph), which is the "standard for working inside a workspace for files".
- THE REMOTE-BLOCK PROTOCOL RFC covers the cloud and remote block-based data feeds' protocol (the events, the blocks, the authentication, and the fallback).
- THE STORAGE-ADAPTER RFC covers the different databases powering the representation (the local and remote, the SQLite, the Postgres, and the object stores).
- THE HARNESS-INTEGRATION RFCs cover the total modification of the harness according to the new nomenclature, and each discovered integration seam from the harness's docs becomes an RFC.

### The places to research (ALWAYS refer the subsequent agents)

- ~/Developer/Documentation/Module/deepseek-harness is the PRIMARY source, because the subsequent agents read it to never discard any single functionality, to search for more integration ways, and to totally modify the harness per the new nomenclature.
- The family's own docs (the Archive and the Skills' references).
- The LSP (the language adapters' seam, the WorkspaceEdit).
- The OOXML spec (the docx adapter).
- The object capabilities (the authority model).
- The bidirectional transformations (Pierce and Foster, the lenses).
- The incremental computation (Acar, the evidence dependencies).
- The optimistic concurrency control (the read and write sets).

## The alternative framings (the naming candidates - the user's exploration, 2026-10-20)

The reframed harness's identity can be expressed in many ways, and each candidate emphasizes a different facet of the inverse representation:

- THE DATA-CENTRIC EDITOR (the user's example): the files are DATA held in state, and the editor operates on the data, not the disk.
- THE WORKSPACE-CENTRIC RUNTIME: the workspace is the primary unit of interaction (the earlier framing).
- THE REPRESENTATION-FIRST WORKSPACE: the managed representations over the raw disk (the research's framing).
- THE LIVING FILESYSTEM: the files are the active processes, which is the reversed UNIX view.
- THE PROCESS-CENTRIC HARNESS: the halted processes are the first-class citizens (Process<Halted>).
- THE INVERSE FILESYSTEM: the roles are inverted, so the files act and the state holds.
- THE KNOWLEDGE-GRAPH WORKSPACE: each file is a knowledge graph, managed by code.
- THE BLOCK-BASED EDITOR: the code blocks are the universal atom plus the evidence.
- THE STATE-FIRST EDITOR: the state machine is the sole filesystem surface, so the edits never escape.
- THE GOVERNED WORKSPACE: the harness is the enforcement boundary, so the proposals become the effects only through the gates.
- THE SEMANTIC WORKSPACE: the symbols, the references, and the semantics over the text.
- THE HARNESS EDITOR: the harness's powers are the DSL the agent operates.
- THE EVENTED EDITOR: the state machine is sponsored, tracked, and evented by the event system.

THE RATIFICATION: the final name is the user's choice, like the package namings, and the candidates above are the exploration's output.
The chosen name becomes the reframed harness's identity in all the docs.
