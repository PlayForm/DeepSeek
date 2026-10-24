---
title: The PoC gap analysis - how barebones each plugin is against its original idea
category: Reports
kind: report
date: 2026-10-22
status: complete
registry: Documentation/Reports/POC-GAP-ANALYSIS.md
index: Documentation/INDEX.md
---

# THE POC GAP ANALYSIS - HOW BAREBONES IS EACH PLUGIN AGAINST ITS ORIGINAL IDEA

> SUPERSEDED AS THE LIVE STATE (2026-10-24): the completion program closed the graded gaps - the
> workspace-scoped suggesters, the working ledgers, the graph indexing trigger, the
> batch/queue/route wiring, the trace bus, the pack layer + learner, the storage migration, the
> D4-D8 layers, the client adapters, and the ETS twin parity (0 stale). The current state, the
> evidence and the documented residuals are in `Documentation/Plans/POC-LEDGER.md` (sections 7+) and
> `Documentation/Plans/Completion-Spec/`; the grades below remain the 2026-10-22 baseline.

> Three read-only lanes compared every plugin's plan document against its Source (not the README
> claims): the workspace family (16), the orchestration/batch set (10), the suggesters + client
> family (10). The evidence blocks: `/tmp/gap-analysis/<package>.md`. The live matrix:
> Documentation/Plans/POC-LEDGER.md. Grade scale - A = the plan's core is genuinely implemented (the
> surfaces behave, the ledger contracts exist, the smokes prove it); B = the shape + the core paths
> exist, several plan-promised capabilities deferred; C = essentially the contract skeleton.
> Baseline: the grade compares the PoC against the plugin's OWN plan; the plan's
> explicitly-later-stage items are listed under "missing" but do not lower the grade.

## 1. The distribution

| Grade | Count | Packages                                                                                  |
| ----- | ----- | ----------------------------------------------------------------------------------------- |
| A     | 22    | the workspace family's core (14), the orchestration set (8)                               |
| B     | 9     | semantics, reflect, search, edit, doc, graph-suggester, panel-family, batchstate, queue   |
| C     | 5     | convention-suggester, replay-suggester, test-suggester, panel-family-host, workspace-live |

## 2. The per-plugin verdicts

### The workspace family (16)

| Package                        | Grade                                          | The plan promised                                         | The PoC has                                                                    | Missing / deferred                                                                                                 |
| ------------------------------ | ---------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| plugin-dsh-workspace           | A                                              | the operational view + the four navigation tools          | the four tools + cursor pagination + honest budget clamping                    | the living operational view's depth (the tools depend on a populated graph)                                        |
| hook-dsh-workspace-observe     | A                                              | the stamps + the ring + the guards                        | version stamps, the ring, the own-actor/excluded guards, the sequence          | -                                                                                                                  |
| plugin-dsh-workspace-semantics | B                                              | the semantic model (resolve/references/rename)            | ONE lexical TypeScript adapter; dotted-word references (not scope-resolved)    | the other adapters; the consumer wiring (nothing injects the service)                                              |
| hook-dsh-workspace-operate     | A                                              | the typed proposals + the refusal-to-guess                | the full refusal vocabulary + the fence + the tools                            | -                                                                                                                  |
| hook-dsh-workspace-govern      | A                                              | the four means-checks + the recovery table                | the four independent checks + the fail-open/fail-closed table + the loop guard | -                                                                                                                  |
| plugin-dsh-workspace-authority | A                                              | capability/lease/residency + the evictions                | the three records + the five dispositions + the shields                        | -                                                                                                                  |
| hook-dsh-workspace-approve     | A                                              | the exact-candidate bindings                              | the bindings + the check chain + the invalidation                              | -                                                                                                                  |
| hook-dsh-workspace-merge       | A                                              | the batch merge through Factory.Write                     | the gates + the commits + the CommitReply union + the read-back                | the three-way merge (deferred by v4.1)                                                                             |
| hook-dsh-workspace-journal     | A                                              | the pre-images + revert + recovery                        | open/seal/revert/recover + the reverse replay                                  | -                                                                                                                  |
| hook-dsh-workspace-audit       | A                                              | the audit lines                                           | the lines + the recursion-prevention fields                                    | -                                                                                                                  |
| plugin-dsh-workspace-context   | A                                              | the orientation packet + the budget                       | the eight-section packet + the budget clamp + the lenses                       | -                                                                                                                  |
| hook-dsh-workspace-monitor     | A                                              | the watch/sweep + the check sets                          | the timerless watch + the sweep + the classification                           | -                                                                                                                  |
| plugin-dsh-workspace-evidence  | A                                              | the four truth kinds + the invalidation                   | the validation objects + the invalidation + the supersede                      | -                                                                                                                  |
| plugin-dsh-workspace-graph     | A (vs the frozen W1 brief) / **B vs the epic** | the graph as the epic's core: the index + the orientation | the schema, the v0 scanner, the KV store, the query (contains/imports)         | THE INDEXING TRIGGER (the live graph is empty), the fs/observed wiring, the references/calls/tests/ConfigKey edges |
| plugin-dsh-workspace-reflect   | B                                              | the AST-aware reflective ops                              | textual whole-word span replacement (honestly documented)                      | the AST engine, the block fingerprint targeting                                                                    |
| lib-dsh-workspace-live         | A                                              | the shared section/render library                         | the section types + render/collapse/packet helpers                             | -                                                                                                                  |

### The orchestration set (10)

| Package                 | Grade  | The plan promised                       | The PoC has                                                                                                                                                       | Missing / deferred                                                                                                                                                                                                                                  |
| ----------------------- | ------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| plugin-dsh-batch-edit   | A (v1) | the batch engine: ranks 1-3 + 11        | ranks 1 (the Process<File> machine + verbs + schema + preview), 2 (Factory.Write only + the govern marker + silence), 3 (the file-atomic gate), 11 (the ETS twin) | ranks 4 (undo journal), 6 (live view), 7 (confirmations), 9 (dependency edges), 10 (leases), 12 (event sourcing), 14 (escape tracking); rank 5 partial (no review stage), 8 partial (monitors as labels only), 13 partial (constraint + audit only) |
| plugin-dsh-batchstate   | B      | the live batch board + the inbox splice | the service + the compiled context + the JSON fallback                                                                                                            | THE INBOX SPLICE (no listener), the Gates block, the queue projection, the templates                                                                                                                                                                |
| plugin-dsh-gitguard     | A      | the git guard                           | the classifier + the deny/allow lists + the strict mode + the ledger                                                                                              | -                                                                                                                                                                                                                                                   |
| plugin-dsh-route        | A      | the routing enforcer                    | the resolver + the keyword classifier + the escalation + the silent injection                                                                                     | the real launch seam (the subagent pre-execute fallback)                                                                                                                                                                                            |
| plugin-dsh-queue        | B      | the subagent queue                      | the seat/release + the deterministic schedule + the tools                                                                                                         | the SPAWN (assigns but never launches), the idle-slot automation, the restart reconcile                                                                                                                                                             |
| plugin-dsh-feedback     | A      | the honest feedback                     | the inbox listener + Push + the journal + the summary                                                                                                             | the queue/batch integration (caller-side)                                                                                                                                                                                                           |
| plugin-dsh-pass-on      | A      | the pass-on                             | the prepare/resolve/preview + the kinds                                                                                                                           | the real batch-contract wiring (caller-side)                                                                                                                                                                                                        |
| plugin-dsh-ingester     | A      | the ingester                            | the validate/apply + the content fence                                                                                                                            | -                                                                                                                                                                                                                                                   |
| plugin-dsh-pattern      | A      | the pattern graph service               | the match/record/decay + the JSON snapshot                                                                                                                        | the offline session mining (deferred); the ctx.storage store                                                                                                                                                                                        |
| hook-dsh-batch-decision | A      | the batch decision                      | the conservative policy + the tool + the handoff                                                                                                                  | -                                                                                                                                                                                                                                                   |

### The suggesters + the client family (10)

| Package                       | Grade | The plan promised                                           | The PoC has                                                                                        | Missing / deferred                                                                                                                   |
| ----------------------------- | ----- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| hook-dsh-search-suggester     | B     | the 10-intent pack + the algebra + the learning + the index | the 10 intents + the sigmoid/gate algebra + the sticky section + the online learning (atomic 0600) | the P2 generated repo index (a neutral 0.5 placeholder), the offline seed, the replay benchmark, the dismiss tool, 6 of the 9 suites |
| hook-dsh-edit-suggester       | B     | the 7 conventions + the companions                          | the 7 intents + the notes (live)                                                                   | the learning/persistence layer                                                                                                       |
| hook-dsh-doc-suggester        | B     | the 7 doc families                                          | the 7 intents + the notes (live)                                                                   | the learning/persistence layer                                                                                                       |
| hook-dsh-convention-suggester | C     | the CONVENTION COMPILER (mining the search pack's reasons)  | the gate + the notes (live)                                                                        | the compiler (the plan's defining mechanism)                                                                                         |
| hook-dsh-graph-suggester      | B     | the graph neighborhood suggestions                          | the service inject + the neighborhood query                                                        | the live graph is empty; only FakeGraph-proven                                                                                       |
| hook-dsh-replay-suggester     | C     | the replay suggestions from the recalled history            | the recall reader                                                                                  | THE STORE'S PRODUCER (the seed/learner never built - recall is always empty)                                                         |
| hook-dsh-test-suggester       | C     | the suite/count reconciliation                              | 2 intents + the note path                                                                          | the reconciliation, the learning                                                                                                     |
| client-dsh-panel-family       | B     | the panel contract + the child-slot model + the adapters    | the contract types + the registry + both mounts + the locale + the closure-factory bundle          | the v4.1 child-slot model (it follows the old side-registry), the 13 adapters, the configForms                                       |
| client-dsh-panel-family-host  | C     | the host half: the Typert remote endpoints                  | a plain `ctx.provide` tail/stats service                                                           | the Typert endpoint, every consumer, the adapters                                                                                    |
| client-dsh-workspace-live     | C     | the workspace live view                                     | the stable-until-event store + the tab contract                                                    | anything feeding ingest/refresh; the rendering of the stored tail                                                                    |

## 3. The systemic gaps (bigger than any single plugin)

1. **The family does not run as a pipeline.** The packages stand alone behind their own service/tool
   surfaces: nothing emits `batch/proposed`, the queue assigns but never spawns, the client trio are
   three unwired islands, the suggesters duplicate the algebra instead of consuming
   `plugin-dsh-pattern`, and the graph has no indexing trigger - so the workspace tools return empty
   live.
2. **The live graph is empty** (`map @ 0: 0 files`) - the epic's core orientation loop cannot run
   until an indexing trigger exists (an index tool or the fs/observed wiring).
3. **The client family is a contract without adapters**: the panel renders whatever registers, and
   nothing registers - the 13 per-bundle adapters are absent; the host half has no Typert endpoint;
   the live tab is fed by nothing.
4. **The ETS twins are verified mirrors**, not hand-ported Effect idioms.
5. **The deferred-later-stage layers** are exactly the plans' own later stages: the batch tool's
   ranks 4-14, the suggester index/seed/benchmark, the offline mining, the AST reflect, the
   three-way merge, the government stack's permission/rollback/observation layers.
6. **The PoC-posture stores**: `plugin-dsh-pattern` and `plugin-dsh-batchstate` use plain JSON files
   instead of `ctx.storage`.

## 4. The honest headline

Nothing is a stub: 22 of 36 plugins are substantively implemented against their own plan, 9 are
partial, 5 are contract-level. The real distance from the ORIGINAL idea is not inside the plugins -
it is in the WIRING BETWEEN them: the pipeline that makes the family a workspace runtime (the index,
the inbox splice, the spawn, the adapters, the event chain) is the next build, and the single
highest-leverage fix is the graph's indexing trigger because three plugins (the workspace tools, the
graph suggester, the live view) depend on it.
