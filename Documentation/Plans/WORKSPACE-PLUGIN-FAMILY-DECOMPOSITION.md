# Workspace Plugin Family Decomposition

> The user's directive (2026-10-20, binding): the workspace idea and
> everything around it must be distributed across MANY PLUGINS - NOT one
> batch-edit plugin - each commonality broken down, each separate package
> named, very specific functionality, all orchestrating in the WORKSPACE
> AGENT plugin. The OPERATIONAL VIEW (what the conversation sees) is the
> workspace plugin's surface; the rest is INVISIBLE - entirely handled by
> the core/plugin flow, itself governed by the plugin harness
> (~/Developer/Documentation/Module/deepseek-harness). The vision: not
> only simple edits with a conversational view - a GRAPH-LIKE view
> systematically correcting itself, interacting with itself like a LIVING
> SYSTEM, all through the agent's actions.

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