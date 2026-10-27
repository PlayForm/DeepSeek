# The Family Inventory

Two release groups, one contract, one version.

The package directories are the source of truth; the prose counts in older documents lag.

## The two groups

| Group    | Names                                                                                             | Runtime                          | Version |
| -------- | ------------------------------------------------------------------------------------------------- | -------------------------------- | ------- |
| Classic  | `@scope/lib-dsh-*`, `@scope/hook-dsh-*`, `@scope/plugin-dsh-*`, `@scope/client-dsh-*`             | Plain TypeScript                 | 0.3.0   |
| EffectTS | `@scope/ets-*` (the base `ets-base-dsh` plus one twin per covered package)                        | Effect 4.0.5 services and layers | 0.3.0   |

Counts: 58 Classic packages, 48 EffectTS packages.

The original 14 plugins (plus `lib-dsh-core`) were joined on 2026-10-22 by 36 new Classic packages
(the workspace family, the suggesters, the orchestration set, the client family) and 30 of their ETS
twins (all but the two client panels and `plugin-dsh-pass-on`, `plugin-dsh-ingester`,
`plugin-dsh-pattern`, `hook-dsh-batch-decision`).

Since that delivery the tree has added seven more Classic packages (`plugin-dsh-cost`,
`plugin-dsh-cost-analysis`, `plugin-dsh-lesson-review`, `hook-dsh-comment-filter`,
`hook-dsh-lesson-nudge`, and the `lib-dsh-pack` and `lib-dsh-trace` libraries) and two more ETS
twins (`ets-lib-dsh-pack`, `ets-lib-dsh-trace`).

All packages are 0.3.0 and UNPUBLISHED.

Verify:

```sh
ls Classic/packages EffectTS/packages
grep -h '"version"' Classic/packages/*/package.json EffectTS/packages/*/package.json
grep -h '"effect"' EffectTS/packages/*/package.json
```

## The roles

| Role           | Package                                                 | What it does                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Service        | `plugin-dsh-factory`                                    | `ctx.pluginFactory`, 19 methods: ledger, match, discovery, keep-list, gate, write executor, re-emit, continuation, State, wiring, attach, journal, schema, seam, inflight key, direct-govern |
| Machinery      | `lib-dsh-core`                                          | Section lists, exclusions, suppression composer, policy loader, refusal guard, update envelope, activation composer, normalize machinery                                                     |
| Governor       | `hook-dsh-package-governor`                             | Chain-pin rewrites and the update stage on `fs/observed`                                                                                                                                     |
| Pinner         | `hook-dsh-package-pinner`                               | Ranged versions to static versions, keep-list protected                                                                                                                                      |
| Cargo governor | `hook-dsh-cargo-governor`                               | TOML surgery, full-version normalization, `cargo upgrade`                                                                                                                                    |
| Stream flavors | six `normalize-*` hooks                                 | `llm/stream` rewrites: dash, quotes, ellipsis, spaces, invisible, fullwidth                                                                                                                  |
| File plugin    | `plugin-dsh-normalize-file`                             | The read-count-write whole-file pass                                                                                                                                                         |
| Compression    | `ccr`                                                   | Tool-result compression, retrieval, the marker contract                                                                                                                                      |
| Coach          | `tool-coach`                                            | Behavioral coaching through the tool surface, tiered                                                                                                                                         |
| Live blocks    | `live-containers`                                       | System-prompt blocks recomputed per request; ships disabled                                                                                                                                  |
| Workspace      | 15 workspace-family packages + `lib-dsh-workspace-live` | The observe->operate->approve->merge flow: stamps, semantics, proposals, gates, authority, merge, journal, audit, context, monitor, evidence, graph, reflect                                 |
| Suggesters     | seven `*-suggester` hooks                               | Companion suggestions from post-execute signals (search, edit, doc, convention, graph, replay, test)                                                                                         |
| Orchestration  | 10 packages                                             | batch-edit, batchstate, gitguard, route, queue, feedback, pass-on, ingester, pattern, batch-decision                                                                                         |
| Client         | three `client-dsh-*` packages                           | The panel contract, its host half, the workspace live tab                                                                                                                                    |

The full one-line roster: `Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md`.

## The event surfaces

| Surface       | Who uses it                                         |
| ------------- | --------------------------------------------------- |
| `llm/stream`  | The six stream flavors                              |
| `fs/observed` | The governance trio                                 |
| Tool surface  | The factory gating, ccr, tool-coach, normalize-file |
| Loader        | The profile bundle list and the patch inserts       |

## The counts

The aggregate runner is `node Maintain/Run/Smokes/Index.mjs` (`pnpm test`): **359 smoke suites /
5,337 checks across both trees** (184 Classic + 175 EffectTS test folders), all green at the
2026-10-22 delivery.

The smoke manifest line names the 14 mechanics suites: core, factory, governor, pinner, cargo,
dash, quotes, ellipsis, spaces, invisible, fullwidth, normalize-file, ccr, and tool-coach.

The per-folder READMEs are the arbiter; the manifest must be regenerated or derived, never quoted
as-is, because the manifest line is a summary that lags the per-folder tests.

When you quote a total, say which set it covers.

Verify:

```sh
node Maintain/Run/Smokes/Index.mjs
find Classic/packages/*/Target/Test EffectTS/packages/*/Target/Test -mindepth 1 -maxdepth 1 -type d | wc -l
```

## What is planned, not shipped

The orchestration, UI, and workspace family packages now EXIST as PoCs (the 2026-10-22 delivery) -
do not describe them as "planned, no packages".

What remains plan-level is the PoC gap: the PoC-vs-plan grades live in
`Documentation/Reports/POC-GAP-ANALYSIS.md`, and the product and release-polish plans remain
designs.

Check the plan statuses before claiming either way.

## Failure modes

- **Counting by memory**: repeating "12 packages" or "25 packages" after the tree grew.
- **Counting the wrong set**: quoting 1008 as the family total while live-containers' 280 checks are
  excluded.
- **Promoting plans**: describing a planned plugin as shipped.
