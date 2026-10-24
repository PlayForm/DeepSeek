---
title: The completion spec - the overview and the architecture
category: Plans/Completion-Spec
kind: living-plan
date: 2026-10-23
status: active
registry: Documentation/Plans/Completion-Spec/00-OVERVIEW.md
index: Documentation/INDEX.md
statuses:
    - name: the interview decisions
      state: current
      evidence: the user's answers of 2026-10-23 (this session)
    - name: the per-family specs
      state: draft
      evidence: 01-WORKSPACE-AND-INDEXER.md .. 05-VERIFICATION.md
    - name: the waves
      state: in-progress
      evidence:
          wave 0 (live defects) and wave 1 (the graph trigger) landed; see POC-LEDGER section 7
---

# THE COMPLETION SPEC - THE OVERVIEW AND THE ARCHITECTURE

> The binding spec for the program that takes the family beyond the 2026-10-22 PoC. The user's
> interview (2026-10-23) is the authority for the decisions below; the per-plugin specs are the
> deltas against each plugin's own plan (the plans stay the intent owners - this document specifies
> what "complete" means and in which order). The live matrix: Documentation/Plans/POC-LEDGER.md.

## 1. The intent

The family is the workspace runtime of the harness: it observes the workspace, indexes it, and
suggests the companions a change conventionally requires - across every repository the user works
in, adapting per workspace, without spending LLM tokens on the index. The user's framing:

- Every workspace, adapted: the conventions are learned or configured per repo, never hardcoded to
  this monorepo.
- The index is infrastructure, not a token cost: a background, event-driven indexer with no separate
  process.
- Suggestions are relevance-ranked from the graph, with a quick local decision layer that learns.
- Automation is fully automatic inside a per-plugin policy the user configures.
- Completion is proven live, one plugin at a time.

## 2. The decisions (the interview, 2026-10-23)

D1 SCOPE - every workspace, adapted. This repo is the primary; other repos get their own packs.

D2 PACKS - layered, like a worktree extension. The user-level pack
`~/.dsh/playform/workspaces/<repo-slug>.yml` is read first; an in-repo `.dsh/pack.yml` overrides it;
a pack may `extends:` another pack (a deep link override, e.g. a client repo inheriting a base
workspace pack). A missing pack means silence - the honest default.

D3 PACK CONTENTS - the families, the companion paths, the thresholds, the repo signature. The
indexer scope/excludes and the automation policy live beside the pack (same file, separate sections)
so one file describes one repo.

D4 LEARNING - both: an opt-in bootstrap that reads the repo's own index (Documentation/INDEX.md, the
package layout) and PROPOSES a pack for approval, then continuous refinement from the observed edits
(which companions were actually touched after a suggestion). Learning never writes a pack silently.

D5 INDEXER - no separate process and no separate plugin: the indexer is INFERRED from the event bus.
A small library defines the trace contract; every plugin carries its own adapter module (in its own
source) that hooks its events to and from the bus; adapters may read the global scope. The graph
plugin is the first consumer (the index), the observe hook is the first source (the observation
stamps). A detached loop (the "daemon trace") coalesces and schedules the work.

D6 POLICY - per-plugin allowlists: every plugin declares its actions and, for each, whether it runs
automatically or waits for approval. The default for writes/spawns/batch commits is approval;
read-only, indexing, recording and suggestions are automatic.

D7 RELEVANCE - dual-mode and optional. Programmatic inception (deterministic graph scoring) is the
default; an AI-assisted inception is an add-on behind the same interface. The AI path is a
CONFIGURABLE PROVIDER CHAIN, exactly like the task-routing plugin: the harness's own LLM call is the
first rung, an external provider the next, then the profile-level override, and a local-first-model
option; the chain is extendable and may hook back into routing. Both orders are supported: pre-warm
with a small machine call then decide what to graph, or graph first then rank.

D8 DECISION MODEL - a heuristic scorer first, with every heuristic and every decision pickable and
logged so the family can learn from them; the model adapts continuously. A local small model may
replace the scorer later behind the same interface.

D9 DELIVERY - one note per family, at most three notes per turn per agent, every knob configurable.

D10 SPEC APPROACH - complete the plans as written; the plugins that need a re-spec are listed in
section 6 and the user decides each.

## 3. The architecture

### 3.1 The trace bus (D5)

    source plugin --adapter--> trace bus --adapter--> consumer plugin

- `lib-dsh-trace` (new, Classic + ETS): the trace vocabulary - the event names, the envelope
  (`{ trace, kind, at, actor, payload }`), the adapter registration, the coalescing key, the
  detached-loop contract. Pure, no harness dependency.
- Every plugin's `Source/Trace/` folder: `Contract.ts` (the events it emits/consumes), `Adapter.ts`
  (the hook-up), and optionally `Detach.ts` (the deferred work). The adapter lives in the adapting
  plugin's source, per the user's "Plugin B's adapter functions live as an extension inside Plugin
  A".
- The graph plugin's `Source/Trace/` consumes `fs/observed`, `tool/executed`, `session/started` and
  emits `graph/indexed`, `graph/invalidated`; the observe hook emits the observation stamps; the
  journal emits the pre-image events; the suggesters consume `graph/neighborhood`.
- The "daemon" is the detached loop the trace contract standardises: a coalescing queue (no timers
  in the hot path), one in-flight task per key, fail-open, flushable for smokes.

### 3.2 The packs (D2, D3, D4)

    ~/.dsh/playform/workspaces/<repo-slug>.yml     (user layer, read first)
    <repo>/.dsh/pack.yml                           (repo layer, overrides)
    pack.extends: <slug>                           (inheritance, deep link overrides)

Resolution: load the user layer, then the repo layer, then `extends` chains (cycle-guarded), then
merge per section (families by id, companions by path, thresholds scalar). A pack declares:
`signature` (the marker files that identify the repo), `families` (the companion sets), `indexer`
(scope, excludes, languages, maxFiles), `policy` (the allowlists), `learning` (the proposal
settings). The built-in packs for this monorepo ship as data; a repo without a pack gets silence and
the learner may propose one.

### 3.3 The relevance and decision layer (D7, D8)

    candidate companions -> graph distance score -> heuristic decision -> note
                                            \-> optional AI inception (one small call)

- The scorer ranks a family's companions by graph distance from the call path (definition, importer,
  dependency, doc section), by prior, by recency, and by the learned accept rate.
- The decision is a table of pickable heuristics (`scope`, `graph`, `literal`, `history`,
  `accept-rate`), each with a weight and a logged decision record; the learned weights persist in
  the pattern service (a later wave moves them to `ctx.storage`).
- The AI inception is off by default; when on, it asks a small local model for the missing
  companions and records the answer as a candidate (never as an emission without the gate).

### 3.4 The policy and the activation loop (D6, D10)

- Each plugin's `Config` gains a `policy` block (per action: `auto` | `approve`), defaulted from the
  pack's `policy` section. The tools and listeners consult it before acting.
- Activation is one plugin at a time: flip its profile row, restart, dispatch a subagent that runs
  the plugin's live test plan (Documentation/Testing/<package>.md) plus its smoke folders, collect
  the report, then the next plugin. The 35 disabled rows are the queue.

## 4. The waves

| Wave | Scope                                                                                                                                     | State                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 0    | live defects: workspace-scoped suggesters (base-aware), tilde ledgers                                                                     | landed (POC-LEDGER section 7) |
| 0b   | the log-path standardisation (`~/.dsh/playform/<package>.log`)                                                                            | landed                        |
| 1    | pipeline wiring: graph trigger, inbox splice, spawn, batch wiring, launch seam, trace bus                                                 | landed (all six)              |
| 2    | B/C completions: pack layer + learner, replay producer, test reconciliation, search index/seed/benchmark/dismiss, edit/doc learning layer | landed (all)                  |
| 3    | storage migration (pattern, batchstate) landed; semantics adapters + reflect AST                                                          | in flight                     |
| 4    | client family: 13 adapters, Typert endpoint, live-view ingest                                                                             | open (last)                   |
| 5    | ETS parity for every wave's change                                                                                                        | open                          |
| 6    | verification: both trees green, live dogfood, records                                                                                     | per wave                      |

## 5. The acceptance bar

A plugin is COMPLETE when all four hold:

1. Every non-later-stage item of its own plan is implemented (the plan's "later stage" items are
   listed, not silently dropped).
2. Its smoke folders pass with byte-exact ledger strings, and every new capability has a folder (the
   counts in the README match the printed counts).
3. It builds in both trees (Classic and its ETS twin) with the repo's full chain.
4. Its live test plan (Documentation/Testing/<package>.md) has been run against the running app and
   the report is in the ledger; the user has not rejected the behaviour.

## 6. The re-specs (D10 - approved 2026-10-23)

All eleven are approved: the plan's original mechanism is replaced by the one named below, and the
plugin's own plan document carries a one-line pointer to this table.

| Package                        | Why the plan's mechanism no longer fits                                                                       | Proposed re-spec                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| hook-dsh-convention-suggester  | the plan's "convention compiler" mines the search pack's reasons; the pack model (D2/D4) now owns conventions | the compiler becomes the PACK LEARNER: it proposes a repo's pack from its index and refines it from accepted suggestions |
| hook-dsh-replay-suggester      | the plan's recall store had no producer; the trace bus (D5) is the natural producer                           | the recall store is fed by the trace bus (session history + accepted notes) instead of a bespoke seed                    |
| hook-dsh-test-suggester        | the reconciliation assumed hand-maintained counts                                                             | reconcile against the graph's Test nodes + the smoke READMEs, read-only                                                  |
| plugin-dsh-queue               | the plan's spawn was bespoke; the harness now exposes the agent-team spawn                                    | use the harness subagent service, never a private spawn                                                                  |
| plugin-dsh-batchstate          | the inbox splice assumed a bespoke inbox                                                                      | splice onto the harness agent-team inbox events                                                                          |
| client-dsh-panel-family        | the plan's side registry predates the v4.1 child-slot model                                                   | the v4.1 child-slot model + the harness client bundle preset                                                             |
| client-dsh-panel-family-host   | the Typert endpoint was specified before the harness API gateway                                              | the current Typert registry + gateway                                                                                    |
| client-dsh-workspace-live      | the live view has no producer                                                                                 | ingest from the trace bus (D5)                                                                                           |
| plugin-dsh-workspace-semantics | the lexical adapter predates the harness LSP service                                                          | adopt the harness LSP/AST service if present; keep the lexical adapter as fallback                                       |
| plugin-dsh-workspace-reflect   | the AST engine is hand-rolled                                                                                 | adopt the harness AST/LSP service; keep the textual engine as fallback                                                   |
| hook-dsh-search-suggester      | the P2 generated repo index is superseded by the graph                                                        | the generated index becomes a graph projection; the offline seed and benchmark follow                                    |
| the suggesters' learning layer | the PoC's static pack                                                                                         | the pack learner (D4) + the pattern service (D8)                                                                         |

## 7. The invariants (never violated by a wave)

1. Ledger strings are byte-exact contracts; a new line is documented in SCHEME and the README.
2. Content changes only through the write/raw-write/edit tools; the terminal is for commands.
3. The two trees never share a dependency graph; the ETS twins mirror every behaviour change.
4. A plugin ships silence-first unless its wave's activation says otherwise.
5. The user commits; the lanes report READY-TO-COMMIT.

## 8. Open decisions (the next interview round)

Resolved 2026-10-23: all eleven re-specs approved; the AI inception is a configurable provider chain
(the harness's own LLM call first, then an external provider, then the profile override, a
local-first option, extendable and hooking back into routing); the default allowlist is auto =
read/index/record/suggest, approve = writes/spawns/commits; the user restarts the app.

Still open:

1. The trace envelope's exact shape and the adapter registration API (a service, a plain module, or
   both).
2. The pack schema's exact keys and the `extends` semantics (deep merge vs section replace).
3. The learner's proposal UX (a note, a tool, a panel) and its approval gate.
