---
title: The plugin suite - the one-file summary (what we built, what is new, what is unreleased)
category: Plugins
kind: standard
date: 2026-10-22
status: active
registry: Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md
index: Documentation/INDEX.md
---

# THE PLUGIN SUITE - THE ONE-FILE SUMMARY

> Every plugin of the @playform DSH family: one line each, the NEW ones marked, the release state,
> and the plan/role each relates to in parentheses. The live matrix with the evidence:
> Documentation/Plans/POC-LEDGER.md. The per-plugin live test plans: Documentation/Testing/. Release
> state: every package is version 0.1.0 except `client-dsh-panel-family` (0.2.0), all UNPUBLISHED
> (the npm bootstrap tiers: 2-planned or 3-candidates); the 15 pre-existing packages were never
> published either.

## 1. The 36 NEW plugins (built 2026-10-22)

### The workspace family - the ten-step invisible flow (15)

| Package                        | What it is                                                                                      | ETS twin | Context                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| plugin-dsh-workspace           | The workspace agent: the operational view + the four navigation tools (map/find/expand/context) | yes      | (the workspace family's conversational surface; WORKSPACE-AGENT.md) |
| hook-dsh-workspace-observe     | The first flow step: stamps every fs/observed version into the observation store                | yes      | (the observe stamps; WAVE-1-BRIEF)                                  |
| plugin-dsh-workspace-semantics | The semantic model: resolve symbols/references, plan renames (lexical TS adapter)               | yes      | (the semantics resolver; SEMANTICS.md)                              |
| hook-dsh-workspace-operate     | The operation engine: typed proposals (rename/connect/replace) + the refusal-to-guess           | yes      | (the operate proposes; OPERATE.md)                                  |
| hook-dsh-workspace-govern      | The gate: four means-checks on every tool call + the recovery table                             | yes      | (the govern gates; GOVERN.md)                                       |
| plugin-dsh-workspace-authority | The authority service: capability/lease/residency + the eviction dispositions                   | yes      | (the authority licenses; AUTHORITY.md)                              |
| hook-dsh-workspace-approve     | The approval binder: exact-candidate bindings + version invalidation                            | yes      | (the approve binds; APPROVE.md)                                     |
| hook-dsh-workspace-merge       | The batch merge: atomic gates, per-file Factory.Write commits, the CommitReply union            | yes      | (the merge commits; MERGE.md)                                       |
| hook-dsh-workspace-journal     | The journal: per-batch pre-images, revert, crash recovery                                       | yes      | (the journal records; JOURNAL.md)                                   |
| hook-dsh-workspace-audit       | The audit lines: the accountability records                                                     | yes      | (the audit lines; AUDIT.md)                                         |
| plugin-dsh-workspace-context   | The orientation packet: WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS + the token budget                  | yes      | (the context packet; CONTEXT.md)                                    |
| hook-dsh-workspace-monitor     | The monitor: watch/sweep check sets, clock-based                                                | yes      | (the monitors; MONITOR.md)                                          |
| plugin-dsh-workspace-evidence  | The evidence records: the four truth kinds + invalidation                                       | yes      | (the evidence; EVIDENCE.md)                                         |
| plugin-dsh-workspace-graph     | The graph: the file/symbol/block index + the KV store + the query (v0 scanner)                  | yes      | (the graph core; WORKSPACE-FAMILY-V4-1 §3)                          |
| plugin-dsh-workspace-reflect   | The reflective ops: one-call rename/connect/replace via GuardedWrite                            | yes      | (the reflect later stage; REFLECT.md)                               |

### The library (1)

| Package                | What it is                                                            | ETS twin | Context                                    |
| ---------------------- | --------------------------------------------------------------------- | -------- | ------------------------------------------ |
| lib-dsh-workspace-live | The shared client library: section types + render helpers (no plugin) | yes      | (the live-view library; SHARED-LIBRARY.md) |

### The client family (3)

| Package                      | What it is                                                            | ETS twin | Context                             |
| ---------------------------- | --------------------------------------------------------------------- | -------- | ----------------------------------- |
| client-dsh-panel-family      | The panel contract: the playformFamilyPanel registry + the family tab | no       | (the UI panel; UI-FAMILY PHASE-2)   |
| client-dsh-panel-family-host | The panel host half: the tail/stats endpoints                         | no       | (the panel host; UI-FAMILY PHASE-5) |
| client-dsh-workspace-live    | The workspace live tab: stable-until-event presentation               | yes      | (the workspace live view; LIVE.md)  |

### The suggesters (7)

| Package                       | What it is                                                | ETS twin | Context                                         |
| ----------------------------- | --------------------------------------------------------- | -------- | ----------------------------------------------- |
| hook-dsh-search-suggester     | Suggests companion searches from the post-execute signals | yes      | (the search suggester; SEARCH-SUGGESTER-PLUGIN) |
| hook-dsh-edit-suggester       | Suggests the convention companions after an edit          | yes      | (the edit suggester; SEARCH-SUGGESTER §9)       |
| hook-dsh-doc-suggester        | Suggests the doc-graph companions after a read/edit       | yes      | (the doc suggester; SEARCH-SUGGESTER §9)        |
| hook-dsh-convention-suggester | Suggests the naming/layout/ledger conventions             | yes      | (the convention suggester; SEARCH-SUGGESTER §9) |
| hook-dsh-graph-suggester      | Suggests the graph-neighborhood companions                | yes      | (the graph suggester; SEARCH-SUGGESTER §9)      |
| hook-dsh-replay-suggester     | Suggests replays from the recalled history record         | yes      | (the replay suggester; SEARCH-SUGGESTER §9)     |
| hook-dsh-test-suggester       | Suggests the test suites/coverage companions              | yes      | (the test suggester; SEARCH-SUGGESTER §9)       |

### The orchestration plugins (10)

| Package                 | What it is                                                                              | ETS twin | Context                                            |
| ----------------------- | --------------------------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| plugin-dsh-batch-edit   | The batch edit engine: files as processes, one commit, governed writes, the atomic gate | yes      | (the batch edit tool; BATCH-EDIT-TOOL-FEATURE)     |
| plugin-dsh-batchstate   | The live batch state board: members/tasks/queue + the compiled context                  | yes      | (the batch board; BATCH-STATE-PLUGIN)              |
| plugin-dsh-gitguard     | The git guard: classify and deny dangerous git commands                                 | yes      | (the git guard; ORCHESTRATION-PLUGINS §3)          |
| plugin-dsh-route        | The routing enforcer: resolve/correct the subagent model routes                         | yes      | (the routing law; ROUTING-ENFORCER-PLUGIN)         |
| plugin-dsh-queue        | The subagent queue: seat/release, capacity, dispatch                                    | yes      | (the queue; SUBAGENT-QUEUE-PLUGIN)                 |
| plugin-dsh-feedback     | The honest feedback: intake/classify/summary + the journal                              | yes      | (the feedback; HONEST-FEEDBACK-PLUGIN)             |
| plugin-dsh-pass-on      | The pass-on: prepare/resolve proposals for the batch flow                               | no       | (the pass-on; PASS-ON-AND-INGESTER)                |
| plugin-dsh-ingester     | The ingester: validate/apply the approved proposals                                     | no       | (the ingester; PASS-ON-AND-INGESTER)               |
| plugin-dsh-pattern      | The pattern graph service: match/record/decay the learned patterns                      | no       | (the pattern graph; PATTERN-GRAPH-PLUGIN)          |
| hook-dsh-batch-decision | The batch decision: the conservative auto-approve policy + the decision tool            | no       | (the batch decision flow; PASS-ON-AND-INGESTER §5) |

## 2. The 14 pre-existing plugins (the family before this delivery)

| Package                      | What it is                                                                   | ETS twin | Context                                         |
| ---------------------------- | ---------------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| plugin-dsh-factory           | The service: State builder, the write executor, the ledger, the gates        | yes      | (the config machinery; the family's foundation) |
| hook-dsh-package-governor    | The package.json governance: the ncu update stages                           | yes      | (the governance trio; Governor-TRIO-GRAPH)      |
| hook-dsh-package-pinner      | The dependency pinning + the version guard                                   | yes      | (the governance trio)                           |
| hook-dsh-cargo-governor      | The Cargo.toml governance: the cargo update stages                           | yes      | (the governance trio)                           |
| plugin-dsh-normalize-file    | The six-transform file normalizer tool                                       | yes      | (the normalize family)                          |
| hook-dsh-normalize-dash      | The dash/emdash stream flavor                                                | yes      | (the normalize family)                          |
| hook-dsh-normalize-quotes    | The curly-quote stream flavor                                                | yes      | (the normalize family)                          |
| hook-dsh-normalize-ellipsis  | The ellipsis stream flavor                                                   | yes      | (the normalize family)                          |
| hook-dsh-normalize-spaces    | The unicode-space stream flavor                                              | yes      | (the normalize family)                          |
| hook-dsh-normalize-invisible | The invisible-character stream flavor                                        | yes      | (the normalize family)                          |
| hook-dsh-normalize-fullwidth | The fullwidth stream flavor                                                  | yes      | (the normalize family)                          |
| hook-dsh-ccr                 | The tool-output compression (CCR): the retrieve/store pipeline               | yes      | (the guardians; CCR)                            |
| hook-dsh-tool-coach          | The tool-coach: the discipline notes on tool results                         | yes      | (the guardians; TOOL-COACH)                     |
| hook-dsh-live-containers     | The live blocks: the dynamic system-prompt stanzas + the live tool transform | yes      | (the live blocks; LIVE-CONTAINERS)              |

## 3. The completion program's libraries (2)

| Package       | What it is                                                                                                                | ETS twin                | Context                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------ |
| lib-dsh-trace | The trace bus's library half: the envelope, the event names, the guards, the detached loop (no plugin)                    | yes (ets-lib-dsh-trace) | (the trace bus; Completion-Spec 01)              |
| lib-dsh-pack  | The pack layer's library: the pack schema, the YAML-subset parser, the layered resolution, the workspace gate (no plugin) | yes (ets-lib-dsh-pack)  | (the pack-driven suggesters; Completion-Spec 03) |

## 4. The counts

| Measure                        | Value                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEW plugins (built 2026-10-22) | 36 Classic + 30 ETS twins                                                                                                                                                                                                                                                                                                                                                                                                        |
| Pre-existing plugins           | 14 Classic + 14 ETS twins                                                                                                                                                                                                                                                                                                                                                                                                        |
| Completion program libraries   | 2 Classic (lib-dsh-trace, lib-dsh-pack) + their 2 ETS twins (ets-lib-dsh-trace, ets-lib-dsh-pack)                                                                                                                                                                                                                                                                                                                                |
| Total Classic packages         | 54 (incl. the factory, the two libraries and hook-dsh-comment-filter)                                                                                                                                                                                                                                                                                                                                                            |
| Total EffectTS packages        | 48 (incl. the two library twins)                                                                                                                                                                                                                                                                                                                                                                                                 |
| Release state                  | ALL 0.1.0 except `client-dsh-panel-family` (0.2.0), UNPUBLISHED (npm bootstrap: 2-planned / 3-candidates)                                                                                                                                                                                                                                                                                                                        |
| Verified                       | 102 packages; 511 smoke suites / 6,612 checks; the aggregate green                                                                                                                                                                                                                                                                                                                                                               |
| Live                           | fully activated in the desktop profile (50 @playform rows: 49 enabled + the factory); the batch-edit inject defect is fixed and the empty-graph gap is CLOSED (the graph trigger + the live index: `map @ 220: 220 files, 20 modules`); the activation sweep verified the suggesters, the foundation and the orchestration live; hook-dsh-comment-filter is wired (link + bundle + full-default row) and awaits the next restart |

The new packages WITHOUT an ETS twin: the two client panels (client-dsh-panel-family,
client-dsh-panel-family-host) and four orchestration candidates (plugin-dsh-pass-on,
plugin-dsh-ingester, plugin-dsh-pattern, hook-dsh-batch-decision) - the MANIFEST declares no `ets-*`
entries for them. The two completion program's libraries now HAVE ETS twins (ets-lib-dsh-trace,
ets-lib-dsh-pack), so they are no longer in that set. The option-B Learning-Loop exclusion remains
the only Classic-only test surface, plus the pattern/batch-decision Classic-only candidates.
