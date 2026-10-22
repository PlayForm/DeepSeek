---
title: The Planned Plugin Suite - the PoC ledger (the live knowledge pool)
category: Plans
kind: living-record
date: 2026-10-22
status: active
registry: Documentation/Plans/POC-LEDGER.md
index: Documentation/INDEX.md
statuses:
	- name: the Classic PoC set (36 packages, 16 lane groups)
		state: in-progress
		evidence: this document section 1; the lanes are running
	- name: the ETS twins (29 packages)
		state: planned
		evidence: the end-phase, Documentation/Plans/POC-BRIEF.md section 8
	- name: the verification (build, tsc, smokes, wiring)
		state: planned
		evidence: the end-phase
---

# THE PLANNED PLUGIN SUITE - THE POC LEDGER (THE LIVE KNOWLEDGE POOL)

> The Lead's live matrix of the PoC-first delivery. The lanes do not edit this
> file; the Lead updates it from the lanes' reports and the read-only checks.
> The brief: Documentation/Plans/POC-BRIEF.md.
> Status: pending | running | written (the lane reported) | verified (the
> Lead's read-only check passed) | blocked.

## 1. The Classic set (36 packages, 16 groups)

| Group | Packages                                                        | Status  | Lane / task |
| ----- | --------------------------------------------------------------- | ------- | ----------- |
| W1    | plugin-dsh-workspace-graph                                      | verified | 8080af03 / task-1 |
| W1    | hook-dsh-workspace-observe                                      | verified | 45e8949f / task-2 |
| G1    | hook-dsh-workspace-operate, hook-dsh-workspace-merge            | written | b6a14052 / task-3 |
| G2    | hook-dsh-workspace-govern, plugin-dsh-workspace-authority       | written | 2886ed2f / task-8 |
| G3    | hook-dsh-workspace-journal, hook-dsh-workspace-audit            | written | 35e2d889 / task-9 |
| G4    | plugin-dsh-workspace-context, hook-dsh-workspace-monitor        | written | 51384a12 / task-10 |
| G5    | plugin-dsh-workspace-semantics, plugin-dsh-workspace-evidence   | written | 3c2f4ef2 / task-13 |
| G6    | hook-dsh-workspace-approve, plugin-dsh-workspace-reflect        | written | 426bc4e3 / task-14 |
| G7    | plugin-dsh-workspace, lib-dsh-workspace-live                    | written | 20a921b3 / task-11 |
| G8    | client-dsh-panel-family, client-dsh-panel-family-host, client-dsh-workspace-live | written | ad71d1dc / task-15 |
| G9    | plugin-dsh-batch-edit                                           | written | 3c20354b / task-4 |
| G10   | plugin-dsh-batchstate, plugin-dsh-gitguard                      | written | d1094256 / task-5 |
| G11   | plugin-dsh-route, plugin-dsh-queue                              | written | 718973d4 / task-6 |
| G12   | plugin-dsh-feedback, plugin-dsh-pass-on, plugin-dsh-ingester    | written | fc9d6c47 / task-12 |
| G13   | plugin-dsh-pattern, hook-dsh-batch-decision                     | written | 4a979774 / task-16 |
| G14   | hook-dsh-search-suggester, hook-dsh-edit-suggester, hook-dsh-doc-suggester | written | 69a5398d / task-7 |
| G15   | hook-dsh-convention-suggester, hook-dsh-graph-suggester, hook-dsh-replay-suggester, hook-dsh-test-suggester | written | 056b4092 / task-17 |

Not built: `hook-dsh-batch-edit` (rejected in the MANIFEST in favour of
`plugin-dsh-batch-edit`).

## 2. The ETS twins (29 packages, the end-phase)

26 from the 2-planned tier + `ets-client-dsh-workspace-live`,
`ets-lib-dsh-workspace-live`, and the candidate twins. Generated or ported
after the Classic set lands, with the ledger strings byte-identical.

## 3. The counts (re-verify before quoting)

| Measure                   | Value |
| ------------------------- | ----- |
| Classic packages to build | 36 new + 15 pre-existing |
| ETS twins generated       | 30    |
| Lane groups (Classic PoC) | 16    |
| Smoke lanes (E3)          | 9     |
| Classic build             | 51/51 PASS (pass 3) |
| Classic smoke folders     | 82 folders, 1,132 checks green |
| ETS build                 | 46/46 PASS |
| ETS smoke folders         | 172 PASS / 0 FAIL (sweep) + the batch-edit twin being fixed |

## 4. The log

- 2026-10-22: the goal armed; the POC brief and this ledger written; all 16
  Classic groups dispatched in parallel on the glm-5.3-flash/low route (17
  subagent lanes including the two W1 lanes). The next steps: collect the
  reports, mark `written`, spot-check the trees, close the board tasks,
  dispatch the end-phase (build/tsc, smokes, ETS twins, wiring).
- 2026-10-22 08:07: G13 (plugin-dsh-pattern, hook-dsh-batch-decision)
  reported written. Lead verification: both package trees present, 53 files,
  no Target/ (PoC mode honored), the loader contract correct in both entries
  (the object form with name/apply/Config/inject on the default object; the
  class form with static Config/inject). task-16 completed. End-phase
  residual: the pattern snapshot writes ~/.dsh/pattern/registry.json through
  node:fs - it must move to ctx.storage (the family's seam-only rule).
- 2026-10-22 08:14: G10 (plugin-dsh-batchstate, plugin-dsh-gitguard)
  reported written. Lead verification: 49 files, no Target/, the loader
  contract correct, the patch rows `enabled: false`. task-5 completed.
  End-phase residuals: the Configuration/ set carries only ESBuild.ts +
  TypeScript.noemit.json (the Test-ESBuild.ts and TypeScript-Test.noemit.json
  are missing because no Test tree exists - the end-phase adds the full set
  to every PoC); batchstate persists ~/.dsh/batch-state.json through plain fs
  (move to ctx.storage); gitguard's tools/pre-execute payload and deny return
  need typing against the real dsh-tools shapes.
- Global end-phase note: every PoC package must receive the full
  Configuration 4-file set and the plain-fs stores (pattern, batchstate)
  must move to ctx.storage during the build pass.
- 2026-10-22 08:22: W1-B `hook-dsh-workspace-observe` VERIFIED. The lane's
  build was green (`prepublishOnly` exit 0) and the Lead re-ran the three
  smoke folders independently: `16 PASS - Wiring-And-Stamps`,
  `15 PASS - Guards-And-Ring`, `14 PASS - Storage-And-Service` - every
  printed count matches its README `## Expected count`. The build chain
  works for a greenfield package (the anatomy template is proven).
  task-2 completed. B1-B10 all pass per the lane's report.
- 2026-10-22 08:26: the observe lane's full report added four end-phase
  findings: (1) the Build CLI loads the `.js` TWIN of `--ESBuild` - every
  package needs `Configuration/ESBuild.js` and `Configuration/Test-ESBuild.js`
  (14 of the new packages lack the twin today; a global end-phase fix);
  (2) the durable ledger lines are `[ISO] message` - the `observe: ` prefix
  is logger-only, and the smokes assert the durable form; every end-phase
  smoke author follows the observe precedent; (3) the storage-domain v1
  declares no compatible predecessors (the library rejects
  `compatibleVersions: [1]` against `version: 1`); (4) packages importing the
  event vocabulary need `@deepseek-ai/dsh-fs` in devDependencies.
- 2026-10-22 08:17: G2 (hook-dsh-workspace-govern,
  plugin-dsh-workspace-authority) reported written. Lead verification: 61
  files, the full Configuration 4-file set present in both, no Target/, the
  object-form loader contract with the service registered from apply.
  task-8 completed. End-phase: smoke suites, KV persistence for the
  authority/govern records (in-memory + ledger in the slice), and the real
  operate-proposal import wiring.
- 2026-10-22 08:19: G11 (plugin-dsh-route, plugin-dsh-queue) reported
  written. Lead verification: 55 files, both loader entries present, the
  `Configuration/ESBuild.js` twin included, no Target/. task-6 completed.
  End-phase: Test trees + the Test-* config twins, the real sibling imports
  (route/queue declared shapes), the pool-semantics probe (auto-dispatch
  lifecycle hook, ESCALATION-marker trigger).
- 2026-10-22 08:24: G8 (client-dsh-panel-family, -host,
  client-dsh-workspace-live) reported written. Lead verification: 59 files,
  the client anatomy (Source/Client.ts + Library.ts), no Target/. task-15
  completed. Knowledge-pool note: the runtime's checkout path
  (/Applications/DeepSeek Harness.app/.../app.asar/dsh/) is an archive, not a
  directory; the harness source checkout lives at
  ~/Developer/Documentation/Module/deepseek-harness/ - the client-API lanes
  read it there. End-phase: patch-row flip, smoke suites, the client bundle
  step (tsdown.client), the Typert-vs-plain-service decision, the live slot
  verification.
- 2026-10-22 08:27: G9 `plugin-dsh-batch-edit` reported written - the real
  machine (Process<File> cells, the 6 actions), the op grammar + executor,
  the governed write path (Factory.Write only, the govern actor marker, the
  Factory.Govern fold for package.json/Cargo.toml), the atomic gate, the
  deadline/jobs continuation, the capped-LCS preview diff, the ledger
  contract. Lead verification: 28 files, the full Configuration 6-file set
  (including the .js twins), no Target/, the `batch_edit` defineTool is a
  real implementation (279 lines, machine lookup + action dispatch + the
  jobs seam). task-4 completed. End-phase: real typed imports for the
  factory/dsh-fs/tools shapes, tsc, the smoke suite (byte-exact ledger,
  silence invariant, fake clock), the ETS twin.
- 2026-10-22 08:30: G1 (hook-dsh-workspace-operate, hook-dsh-workspace-merge)
  reported written. Lead verification: the full Configuration 4-file set in
  both, no Target/, object-form entries with the services registered from
  apply, `inject: ["pluginFactory", "fs"]`. task-3 completed. End-phase:
  builds/tsc/smokes, the real workspaceGraph import swap-in (the structural
  mirror is the PoC posture), the ETS twins.
- 2026-10-22 08:27: G6 (hook-dsh-workspace-approve, plugin-dsh-workspace-reflect)
  reported written, both builds exit 0 (Target/ present for both, the
  Configuration 6-file set, the loader entries present). task-14 completed.
  PROCESS LAPSE DISCLOSED BY THE LANE: a `perl -pi` was used to switch four
  Operation imports to named type imports - a code-authoring violation. The
  Lead re-read the four sites: all four now carry the consistent
  `import type { Operation } from "@Interface/Operation.js"` and the build
  is green, so the result is correct; the end-phase review re-reads those
  files and the lane's lapse is recorded, not hidden.
- 2026-10-22 08:32: G5 (plugin-dsh-workspace-semantics,
  plugin-dsh-workspace-evidence) reported written. Lead verification: both
  entries present, no Target/, the Configuration set carries the four .ts
  configs but NOT the `.js` twins (end-phase fix). task-13 completed.
  End-phase: smokes, the `.js` twins, the ctx.lsp-backed TS adapter
  deepening, the real factory import swap, the ETS twins.
- 2026-10-22 08:35: W1-A `plugin-dsh-workspace-graph` VERIFIED. Build exit 0
  and the Lead re-ran the four smoke folders independently: 11 PASS -
  Entry-And-Config, 8 PASS - Parse-And-Fingerprint, 4 PASS - Stability,
  13 PASS - Store-And-Limits (36 total) - every count matches its README.
  task-1 completed. Knowledge pool: the build loader REQUIRES the
  Configuration/ESBuild.js + Test-ESBuild.js twins (the brief omitted them;
  every PoC package needs them); the graph's devDependencies add
  @deepseek-ai/dsh-fs, dsh-storage, dsh-storage-domain and zod on top of the
  live-containers set; the parser is a line/regex scanner (deferred kinds
  not faked: ConfigKey, references/calls/tests edges).
- 2026-10-22 08:40: G7 (plugin-dsh-workspace, lib-dsh-workspace-live)
  reported written. Lead verification: the full Configuration 6-file set in
  both (the .js twins included), no Target/, the workspace entry registers
  the four navigation tools and injects ["workspaceGraph", "pluginFactory",
  "tools"] - a real consumer of the W1 graph contract. task-11 completed.
  End-phase: real graph/lib imports (the local twins are the PoC posture),
  smokes, ETS twins, bundle wiring.
- 2026-10-22 08:42: G3 (hook-dsh-workspace-journal, hook-dsh-workspace-audit)
  reported written. Lead verification: the full Configuration 6-file set in
  both (the .js twins included), no Target/, object-form entries with the
  services registered from apply. task-9 completed. End-phase: smokes, the
  real sibling-import wiring (the audit journal chain is a later slice), the
  build pass, the ETS twins.
- 2026-10-22 08:44: G4 (plugin-dsh-workspace-context,
  hook-dsh-workspace-monitor) reported written. Lead verification: both
  entries present, no Target/, the Configuration carries the four .ts configs
  but NOT the `.js` twins (end-phase fix). task-10 completed. End-phase:
  smokes, the `.js` twins, the real workspaceGraph import, the tokenMeter
  signature check, the ETS twins.
- 2026-10-22 08:47: G14 (search/edit/doc suggester hooks) reported written.
  Lead verification: the full Configuration 6-file set (the .js twins
  included), no Target/, the three loader entries present. task-7 completed.
  End-phase: the nine search suites + the edit/doc suites per the plan, the
  generated index + Maintain/Index-Search-Targets.mjs, the optional
  query/dismiss tool, the ETS twins. The suggester algebra is duplicated per
  package by design (the core extraction waits for the end-phase
  two-consumer rule).
- 2026-10-22 08:50: G15 (convention, graph, replay, test suggester hooks)
  reported written. Lead verification: the full Configuration 6-file set (the
  .js twins included) in all four, no Target/, the four loader entries
  present. task-17 completed. End-phase: the four smoke suites, the real
  workspaceGraph import for graph-suggester, the replay history seed
  adapter, the build pass, the ETS twins.
- 2026-10-22 08:52: end-phase preparation. The build-pass blocker list is
  exact: 15 packages lack the mandatory `Configuration/ESBuild.js` twin
  (client-dsh-panel-family, -host, client-dsh-workspace-live,
  hook-dsh-workspace-govern, -merge, -monitor, -operate,
  plugin-dsh-batchstate, -feedback, -gitguard, -pass-on,
  plugin-dsh-workspace-authority, -context, -evidence, -semantics). The
  `Test-ESBuild.js` twin is byte-identical across packages (verified by
  diff); the `ESBuild.js` differs only in its header comment, so the fix is
  mechanical. The end-phase order: E1 the twin fix (one lane) -> E2 the
  serialized build pass (`pnpm run build:classic`) + fix lanes -> E3 the
  smoke suites (grouped lanes) -> E4 the ETS twins (ETS-TWINS-BRIEF.md) ->
  E5 the wiring + the ledger finalize.
- 2026-10-22 08:55: E1 COMPLETE (task-18, task-19). The two lanes wrote 33
  Configuration `.js` twins (17 + 16), all `node --check` clean. The only
  remaining Test twin gap is plugin-dsh-batchstate (it has no
  Test-ESBuild.ts at all - a pre-existing .ts-level gap, not a twin gap).
- 2026-10-22 08:58: E2 BUILD PASS 1 (51 packages, serialized). Result: 26
  PASS, 18 FAIL, 16 SKIP (the SKIPs were the twin-less packages before E1).
  Two DISTINCT root causes: (a) the build tool's implicit `pnpm install`
  fails on the new workspace packages - `ERR_PNPM_NO_MATCHING_VERSION
  @playform/lib-dsh-core@0.1.0` fetched from the registry instead of the
  workspace link (this also fails the pre-existing normalize family); the
  fix is a root `pnpm install` to register the 36 new packages in the
  lockfile; (b) REAL tsc errors in 13 new packages - the systematic families:
  the factory `Context`/`State.On` augmentation not in scope, the
  `export default` of a type under verbatimModuleSyntax, default-vs-named
  Interface imports, `exactOptionalPropertyTypes` spreads, the
  `tools/pre-execute` / `agent/pre-step` payload typings, and the dsh-tools
  ToolResult/defineTool shapes. The PASSING new packages are the fix
  references (observe, context, authority, evidence, doc/edit/search
  suggesters, ingester, pass-on, graph, reflect, lib-workspace-live).
- 2026-10-22 09:02: E2 root cause isolated. The pnpm deps-status check
  (`verify-deps-before-run`) runs a PACKAGE-DIR `pnpm install` that resolves
  the workspace deps (@playform/lib-dsh-core@0.1.0) from the registry and
  dies with ERR_PNPM_NO_MATCHING_VERSION. A root `pnpm install` is a no-op
  (409 ms, lockfile already carries the new importers). THE FIX: every build
  runs with `--config.verify-deps-before-run=false`. Build pass 2 started
  with the flag; five fix lanes (F1 the four suggesters, F2 journal/audit/
  semantics, F3 batch-edit/batch-decision, F4 route/queue/gitguard, F5
  workspace/pattern) are dispatched with the passing sibling packages as the
  pattern references. The normalize-family tsc errors (4 per package) are
  separate and appear environmental/pre-existing - to be diagnosed after
  the new packages are green.
- 2026-10-22 09:12: E2 BUILD PASS 2 (with the flag): 35 PASS, 15 FAIL, 0
  SKIP. The normalize family is GREEN again (the pass-1 failures were the
  pnpm check, not the code). Newly PASSING since pass 1: the normalize
  family, normalize-file, workspace, monitor, merge, govern, operate,
  feedback, semantics (the fix lanes already landing). Remaining FAILs: the
  four suggesters, journal, audit, batch-edit, batch-decision, route, queue,
  gitguard, pattern, batchstate, and the two client halves (the client
  Context augmentations - ctx.locale/ctx.slots - are not in scope; the
  client host half PASSES). F6 dispatched for the client halves +
  batchstate. The five fix lanes F1-F5 are still running.
- 2026-10-22 09:04: F1 GREEN - the four suggesters (convention, graph,
  replay, test) build exit 0; the Lead re-ran all four independently (PASS x4).
  The fixes were type-only: default-import `State`, contextual pre-step
  listener typing, `Compile(Intent[])`, the unused-import cleanups, the dead
  helper removal. The loader contract and runtime logic untouched.
- 2026-10-22 09:08: E3 SMOKE PASS OPENED in parallel with the fixes. The
  smoke brief is Documentation/Plans/SMOKE-PASS-BRIEF.md. Four smoke lanes
  dispatched on the packages already green (S1 approve/reflect/
  lib-workspace-live/feedback, S2 doc/edit/search/convention suggesters,
  S3 graph/replay/test suggesters + ingester, S4 pass-on/context/evidence/
  authority) - 16 packages. Each writes the Harness + 1-3 test folders +
  the two-step build and reports the printed counts. The W1 pair (observe,
  graph) already carries its verified suites (45 + 36 checks).
- 2026-10-22 09:14: F2 GREEN - journal, audit, semantics all build exit 0;
  the Lead re-ran all three independently (PASS x3). The fixes were type-only
  and they generalize: `export default interface State extends ...` +
  `On: boolean`, the `declare module "@deepseek-ai/cordis"` pluginFactory
  augmentation (the observe pattern), the typed fs/observed Wire callback,
  the default `Result` imports, the exactOptionalPropertyTypes conditional
  spread, and the cross-Interface imports. Classic green count: 41 of 50;
  remaining fixes: F3 (batch-edit, batch-decision), F4 (route, queue,
  gitguard), F5 (pattern), F6 (client halves + batchstate).
- 2026-10-22 09:18: F3 GREEN - plugin-dsh-batch-edit + hook-dsh-batch-decision
  build exit 0 (Lead re-ran both: PASS x2). Fixes were type/shape-only; the
  batch-decision Events augmentation now declares batch/proposed +
  batch/decision; the batch-edit presentResult reads `result.meta` (ToolResult
  has no `.value`). BUILD-SCRIPT finding: both packages' prepublishOnly.sh
  still carried the 4-step test pipeline with no Source/Test tree, so the
  build died on the missing Harness - aligned to the PoC single-step shape
  with the negation; the smoke pass restores the 4-step form when the Test
  trees land. Classic green count: 43 of 50; remaining: F4 (route/queue/
  gitguard), F5 (pattern), F6 (client halves + batchstate).
- 2026-10-22 09:22: F5 GREEN - plugin-dsh-workspace + plugin-dsh-pattern
  build exit 0 (Lead re-ran both: PASS x2). The fixes: the split default+named
  `State` import, the Matcher undefined narrowing, the
  exactOptionalPropertyTypes conditional spreads, the full defineTool output
  ValueSchemaSpec items (the `never` inference), the unused imports. Classic
  green count: 45 of 50. Remaining: F4 (route/queue/gitguard) + F6 (client
  halves + batchstate). S5 and S6 smoke lanes dispatched (monitor/merge/
  govern/operate; workspace/pattern/batch-edit/batch-decision).
- 2026-10-22 09:26: F4 GREEN - plugin-dsh-route + plugin-dsh-queue +
  plugin-dsh-gitguard build exit 0 (Lead re-ran all three: PASS x3). The
  fixes: the pluginFactory Context augmentation, the KeywordTable typing,
  the RouteHint exactOptionalPropertyTypes shape, the State.Policy rename
  (the factory's shared State owns Policy), the split default+named imports,
  the `export default interface State extends` form + On field, and the
  typed tools/pre-execute listener with the null guards moved before the
  switch. Classic green count: 47 of 50. Remaining: F6 (client halves +
  batchstate).
- 2026-10-22 09:30: F6 GREEN - the two client halves + batchstate build
  exit 0 (Lead re-ran all three: PASS x3). THE CLASSIC BUILD SET IS GREEN:
  all 51 packages build (36 from pass 2 + the 15 fixed and individually
  re-verified by the Lead). Notable shape fixes: the client Context
  augmentation declared locally (the client SDK types are not a resolvable
  dependency), and batchstate's idle queue renamed Queue -> IdleQueue (it
  collided with the factory's shared journal Queue field - a real collision
  the type-alias form masked). S7-S9 smoke lanes dispatched (journal/audit/
  semantics/route; queue/gitguard/batchstate/panel-host; the two client
  halves) - the full 36-package smoke coverage is now in flight.
- 2026-10-22 09:45: S9 GREEN - the two client halves carry their smoke
  suites: panel-family 13 + 7 PASS, workspace-live 12 + 11 PASS (the Lead
  re-ran all four folders: counts match). Both build with the full 4-step
  pipeline (plugin build -> test build -> Harness selfcheck -> Test tsc).
  The lane solved the built-client import gap with per-package
  module.registerHooks alias hooks (the real Target is exercised, not mocks).
  Residuals: the overlay-view unregister cascade is unobservable (untested),
  the tab components are asserted by binding/options not rendered (no React
  renderer), no ETS parity yet. Smoke coverage: 6 of 36 packages green
  (observe, graph, panel-family, workspace-live + S1-S8 in flight).
- 2026-10-22 09:52: S1 GREEN - approve 13+18+16, reflect 13+19+9,
  lib-workspace-live 7+3, feedback 14+15 (127 checks, 10 folders); the Lead
  re-ran all 10 folders: every count matches. Two REAL code fixes came out
  of the smokes (the smoke is the arbiter): approve's storage domain dropped
  the invalid `compatibleVersions: [1]` (the real dsh-storage-domain rejects
  it), and reflect's Replace now deletes the span on empty text as its
  header promises. Smoke coverage: 8 of 36 packages green; S2-S8 in flight.
- 2026-10-22 10:08: S7 GREEN - journal 20+20+11, audit 19+13, semantics
  17+18, route 12+18 (148 checks, 9 folders); the Lead re-ran all 9 folders:
  every count matches. FIVE REAL BUGS FOUND BY THE SMOKES and fixed (code,
  not assertions): the invalid `compatibleVersions: [1]` in journal/audit/
  semantics storage (every open failed), audit's duplicate Sequence increment
  (skipped every other line), semantics' double refusal line, route's raw
  volatile-cell validation (failed at load), route's missing Source/Test
  tsconfig exclude + Test config twins. PROCESS LAPSE DISCLOSED: one
  `perl -pi` in early journal test files (content verified after; recorded,
  not hidden). Smoke coverage: 12 of 36 packages green; S2-S6 + S8 in flight.
- 2026-10-22 10:12: S3 GREEN - graph-suggester 15+19, replay 18+13,
  test 15+12, ingester 10+11 (113 checks, 8 folders); the Lead re-ran all 8:
  every count matches. THREE code fixes: (1) the four prepublishOnly.sh
  scripts had a trailing `pnpm exec tsc -p tsconfig.json` that re-emitted
  Target and clobbered the esbuild output (the aliases were never rewritten -
  a REPO-WIDE STRIKE to watch in build pass 3); (2) the graph/test suggester
  packs were mathematically dead (thresholds above the max evidence sum, so
  no suggest/abstain path could fire) - thresholds lowered to the documented
  tuning range with SCHEME.md updated; (3) replay needed no pack change.
  Smoke coverage: 16 of 36 packages green; S2, S4, S5, S6, S8 in flight.
- 2026-10-22 10:16: S8 GREEN - queue 14+20, gitguard 15+9, batchstate 13+14,
  panel-family-host 8+10 (103 checks, 8 folders); the Lead re-ran all 8:
  every count matches. FOUR real fixes: queue's volatile-cell capacity crash
  on its own defaults, gitguard's strict-mode ordering (strict now denies
  before the allow-list), the host's raw volatile-cell reads (dead disabled
  gate), and batchstate's missing Test-ESBuild.js twin. Residuals: batchstate
  docs claim the state file is persisted on every write but only Recover
  reads it - a doc mismatch for the finalize pass; the emit-failure warn
  path is uncovered. Smoke coverage: 20 of 36 packages green; S2, S4, S5, S6
  in flight.
- 2026-10-22 10:19: S4 GREEN - pass-on 8+17, context 13+14, evidence
  11+13+14, authority 8+20+14 (132 checks, 10 folders); the Lead re-ran all
  10: every count matches. FIVE real fixes: context's `new Map()` TDZ crash
  on EVERY packet call (renamed MapLines), context calling getNode/find/
  expand on the snapshot instead of the graph handle, evidence's invalid
  `compatibleVersions: [1]`, evidence's glob exclude defaults applied via the
  segment matcher (never matched), and the interface default-export form in
  context/evidence/authority. Smoke coverage: 24 of 36 packages green; S2,
  S5, S6 in flight.
- 2026-10-22 10:24: S2 GREEN - doc 12+16, edit 12+16, search 13+15+7,
  convention 14+16 (121 checks, 9 folders); the Lead re-ran all 9: every
  count matches. THREE findings: (1) REPO-WIDE STRIKE - all four packages
  shipped path-alias imports (@Function/@Interface/@Variable) that the
  noemit build chain never rewrites, so their Target was unrunnable;
  converted to relative imports (the ccr pattern) - build pass 3 + the
  aggregate run must check every package for the same defect; (2) the
  CALIBRATION DEFECT - emit was mathematically unreachable in all four packs
  (single-signal evidence below every gate), fixed by pack WEIGHTS only with
  the plan's gradient preserved (doc/edit 0.5->2.5, convention 0.4/0.3/0.5->
  2.0/1.5/2.5, search 0.5/0.4/0.3->1.25/1.0/0.75; convention SCHEME.md
  updated); (3) the search system-prompt/assemble listener was dropping
  contexts/tools - now returns the full assembly. Smoke coverage: 28 of 36
  packages green; S5 and S6 in flight.
- 2026-10-22 10:40: S5 + S6 GREEN - monitor 22+15, merge 15+11, govern
  21+10, operate 23+11 (118) and workspace 17+19, pattern 13+10,
  batch-decision 22+19, batch-edit 25+13+8 (146); the Lead re-ran all 17
  folders: every count matches. THE SMOKE PASS IS COMPLETE: 36 of 36 new
  packages carry green suites - 82 folders, 1,132 checks (observe 45, graph
  36, S1 127, S2 121, S3 113, S4 132, S5 118, S6 146, S7 148, S8 103, S9
  43). Real bugs the smokes forced fixed in this pair: the monitor Classify
  glob translator (NO check-set ever matched), the monitor Watch version
  counter (never passed 1), the batch-edit ApplyOp string-replace (never
  inserted the replacement), the batch-decision dead expired-sweep loop, the
  pattern snapshot `~/.dsh` path resolution, and the two raw-volatile-cell
  Validate bugs. Build pass 3 (full tree) started.
- 2026-10-22 10:48: E4 THE ETS MIRROR RAN - Maintain/generate-ets-planned.mjs
  generated 1,047 files across 30 twins (the MANIFEST's ets-* planned +
  candidate entries). The generator needed two fixes: the Walk path
  double-prefix, and the BARE token substitutions (lib-dsh-core ->
  ets-base-dsh, plugin-dsh-factory -> ets-plugin-dsh-factory) for the
  relative-path imports in the Test harnesses (the quoted forms alone missed
  them). After a root `pnpm install` linked the new ETS packages, the first
  twin (ets-hook-dsh-workspace-observe) BUILDS GREEN - the mirror compiles
  against the ETS factory's State and the Harness selfcheck passes. The ETS
  build pass over all 46 ETS packages started (log /tmp/build-ets-1.log).
- 2026-10-22 10:52: E2 BUILD PASS 3: **ALL 51 CLASSIC PACKAGES PASS** -
  zero failures, zero skips. The full chain (ESBuild plugin build + tsc +
  tsc-alias + test build + Harness selfcheck + Test noemit tsc) is green for
  the whole Classic tree: the 15 pre-existing packages, the 36 new PoCs,
  including the batch edit tool, the workspace family, the orchestration
  plugins, the suggesters, and the client family. Next: the aggregate smoke
  run (Maintain/Run-Smokes.mjs) once the ETS build pass finishes, then the
  ETS port fixes + the final wiring/ledger pass.
- 2026-10-22 11:00: E4 THE ETS BUILD PASS: **ALL 46 ETS PACKAGES PASS** -
  zero failures. The 30 generated twins build green (the mirror compiles
  against the ETS factory's State; the Harness selfchecks and Test tsc pass),
  alongside the 16 pre-existing ETS packages. THE TWO TREES ARE BOTH FULLY
  GREEN. The aggregate smoke run (Maintain/Run-Smokes.mjs) started - the
  final verification gate across every folder in both trees.
- 2026-10-22 11:05: E5 THE AGGREGATE RUN (attempt 1) - the Classic tree ran
  CLEAN (thousands of PASS lines, every folder count matched); the run
  stopped fail-fast at the FIRST ETS failure: `ets-plugin-dsh-batch-edit /
  Observers-And-Waterfalls` (2 failed checks: the O4 deadline overflow /
  no-jobs-hub halt - the ETS twin's jobs path differs from the Classic
  factory's). A fix lane is on it; the aggregate re-runs after. All other
  ETS folders before the failure passed.
- 2026-10-22 10:50: the ETS smoke sweep (every Target/Test folder in the
  EffectTS tree, excluding the batch-edit twin under repair): **172 PASS / 0
  FAIL**. The only outstanding verification item is the batch-edit twin's
  Observers-And-Waterfalls folder (the ETS jobs-path fix lane). The aggregate
  re-runs once that folder is green.
- 2026-10-22 11:03: THE ETS BATCH-EDIT TWIN FIXED - the O4 failure was the ETS
  factory's traced seams sampling the global Date.now (2 reads per call),
  consuming the test's mocked deadline budget; the fix is a clock shield
  around the machinery seams (Shield.ts/ShieldSync.ts) with the plugin's own
  deadline reads unshielded. The three folders re-run green (8/13/25, counts
  matching).
- 2026-10-22 11:12: **THE AGGREGATE PASSES** - `node Maintain/Run-Smokes.mjs`
  exit 0: "All 359 smoke suites passed" - 359 folders, 5,337 checks across
  both trees (Classic + EffectTS). THE END-PHASE VERIFICATION IS COMPLETE:
  Classic build 51/51, ETS build 46/46, Classic smokes 82 new folders /
  1,132 checks, ETS smokes 172 folders, the aggregate 359/359.
- 2026-10-22 11:20: the format pass. `pnpm run format` reformatted the new
  packages' sources (prettier warnings 0 after); the only remaining
  `format:check` violations are 41 PRE-EXISTING `Diagram/*.svg`
  trailing-whitespace lines (not caused by this delivery - the user's
  generated diagrams; out of scope). A FINAL verification (rebuild both trees
  + the aggregate) started on the formatted sources.
- 2026-10-22 11:24: **THE FINAL VERIFICATION PASSES** - on the formatted
  sources: 97/97 package builds PASS (51 Classic + 46 ETS, zero failures) and
  the aggregate `All 359 smoke suites passed` (exit 0, 5,337 checks). THE
  OBJECTIVE IS COMPLETE: every planned plugin has a PoC in both trees, both
  trees build, and the whole smoke suite is green. Residuals recorded: the
  pre-existing Diagram SVG format drift; the PoC-posture plain-fs stores
  (pattern, batchstate) and the duplicated suggester algebra; the client SDK
  augmentation fallback; the ETS twins are mirrors (not hand-ported Effect
  idioms); the packages ship disabled (no profile wiring applied - the user's
  ACTIVATE decision).
- 2026-10-22 08:47: G12 (plugin-dsh-feedback, plugin-dsh-pass-on,
  plugin-dsh-ingester) reported written - the LAST lane. The Classic PoC set
  is COMPLETE: 36/36 packages on disk, every package directory carries a
  Source/Library.ts entry (51 package dirs = 15 pre-existing + 36 new). The
  G12 lane's own `tsc --noEmit` passes 0 errors for its three packages (a
  bonus, not the arbiter). task-12 completed. THE END-PHASE OPENS: E1 the
  twin fix, E2 the serialized build pass, E3 the smokes, E4 the ETS twins,
  E5 the wiring + finalize.

## 5. The live install (2026-10-22 13:20, corrected 13:36)

The user's ACTIVATE: the 35 bundles are installed and enabled in the **desktop
profile** (`~/.dsh/profiles/desktop`) - the profile the running app boots (the
desktop app serves the web UI; verified from the app process args). The first
attempt targeted the `web` profile (a clean profile, not the live one) and was
fully reverted.

- DESKTOP INSTALL: `dsh plugin --profile desktop add` with 36 `link:` specs
  (all 36 new Classic packages; `lib-dsh-workspace-live` as a plain
  dependency - it declares no `dsh.bundle`). The tool wrote the dependencies
  and auto-added the 35 bundle names to `dsh.profile.bundles` (19 -> 54).
  Verified: 51 `node_modules/@playform` symlinks (15 prior + 36 new).
- DESKTOP ENABLE: 35 override rows appended to the desktop profile's
  `cordis.patch.yml` (prefix byte-identical to the backup; the 14 existing
  family rows untouched). Verified: 49 `@playform` mentions, 38
  `enabled: true` rows in the patch.
- DESKTOP VALIDATION: `dsh --profile desktop --dump-config` is REFUSED by the
  CLI (a hardcoded name-based gate: "managed exclusively by the Electron
  application"). Validated via a temp mirror profile: dump exit 0, 96
  `@playform/` refs (48 bundles x 2), 39 `enabled: true` rows. One stderr
  warning (`entry "ccr" not found`) is PRE-EXISTING in the untouched
  baseline.
- WEB REVERT: the three files restored byte-identical from
  `/tmp/dsh-profile-web-backup-2026-10-22/`; the 36 orphan symlinks removed
  manually (pnpm would not prune them); `dsh --profile web --dump-config`
  exit 0 with 0 `@playform/` refs.
- BACKUP (the desktop revert path): `/tmp/dsh-profile-desktop-backup-2026-10-22/`
  (package.json, cordis.patch.yml, cordis.yml). Revert = restore the three
  files + restart.
- LIVE EVIDENCE (the desktop changes hot-applied via HMR, before any
  restart): the Inspect Config provider lists `@playform/plugin-dsh-batch-edit`
  and `@playform/hook-dsh-doc-suggester` as live entries with `packageDir`
  under `profiles/desktop/node_modules`; the doc-suggester already emitted a
  companion note in this session. The restart gives the clean full load.
- NOTES: three packages (feedback, ingester, pass-on) shipped `enabled: true`
  in their own rows already; `replay-suggester` uses the short row id (the
  suggesters mix short and full ids - the overrides use the exact ids).

## 5b. The crash and the host-only re-enable (2026-10-22 13:50)

- THE CRASH: after the desktop enable, the web boot failed with "2 entries
  did not activate": `@playform/client-dsh-panel-family` and
  `@playform/client-dsh-workspace-live`. The diagnostic
  (`crash-2026-10-22T10-40-58-297Z-web-boot.log`): the client halves were
  served as CLASSIC scripts and threw `Cannot use import statement outside a
  module`; the loader also reported `loaded without registering ... via
  __ModuleLoader__.load`. ROOT CAUSE: the two client packages were built as
  unbundled ESM (`Target/Client.js`) by the PoC ESBuild config; the harness's
  client bundles are closure-factory artifacts built by the shared tsdown
  client preset (`packages/client/tsdown.client.ts` in the harness repo) -
  the bundle calls `window.__ModuleLoader__.load({id, factory})` and resolves
  externals through the injected require. The 33 HOST plugins activated
  fine; the boot reached the client stage.
- THE FIX (host-only): the desktop profile now carries the original 19
  bundles + the 33 host bundles (52 total; the 2 client halves excluded),
  the 33 enable overrides appended, and the 2 client packages removed from
  the profile (deps + the orphaned `node_modules` symlinks - `pnpm remove`
  left them, the same prune gap as the web revert).
- VALIDATION: the mirror composition dump exit 0, 92 `@playform/` refs, 36
  `enabled: true` rows, 33 new entries; the only stderr line is the
  PRE-EXISTING `entry "ccr" not found` warning (the baseline produces it too).
- LIVE: the profile edits hot-applied again - the doc-suggester emitted a
  companion note in this session (the host plugins are live before the
  restart).
- THE CLIENT-HALF FOLLOW-UP: the two client packages need a real client
  bundle (the tsdown closure-factory preset, or a minimal hand-written
  `__ModuleLoader__.load` wrapper with the externals via `require`) before
  they can be re-enabled. They stay out of the profile until then.
- THE BACKUPS: `/tmp/dsh-profile-desktop-backup-2026-10-22/` (pre-install)
  and `/tmp/dsh-profile-desktop-rescue-2026-10-22/` (the rescue state).

## 5c. The client-bundle fix and the full-defaults pass (2026-10-22 14:10)

- THE CLIENT-BUNDLE FIX: `Maintain/Build-Client-Bundle.mjs` bundles each
  client entry to CJS with esbuild (the tsconfig paths + the locale JSON
  inlined; react external) and wraps it in the harness closure-factory
  envelope (`window.__ModuleLoader__.load({ id, factory(require) })`). Both
  client packages now emit `Target/Client.bundle.js`; `exports["./client"]`
  points at it; `prepublishOnly.sh` and `Run.sh` rebuild it. The ESM
  `Target/Client.js` stays the dev/test surface. Both packages build green;
  the factory sandbox returns `{ inject: ["slots","locale"], apply, default }`
  for both.
- THE CLIENT REVIEW (a separate read-only lane): 5/5 checks PASS, zero
  defects (the contract vs the harness template + tsdown.client.ts, the
  bundles, the wiring, the factory execution, the smoke suites).
- THE FULL-DEFAULTS PASS: four config-surface lanes enumerate every schema
  option of the 35 bundles, add any documented-but-missing option to the
  plugin (schema + README/SCHEME + rebuild + smokes), and write the full
  default config block to `/tmp/profile-defaults/<pkg>.yml` for the Lead to
  assemble into the desktop profile's patch.
- THE PROFILE STATE: the 2 client packages reinstalled (deps 51, bundles 54);
  the 35 override rows will be replaced by the full-default blocks.
- THE CONFIG-SURFACE RESULT (all four lanes): 35 fragments, ZERO missing
  schema options (the schemas already covered every documented option - the
  audit compared each Config.ts against its README/SCHEME and the cited plan
  docs). ONE real code fix: `plugin-dsh-pattern`'s `enabled` default was
  `true` while its README/patch-row/posture say ships-disabled - flipped to
  `false`, rebuilt green, its two smoke folders re-run green. Doc-table
  corrections: batchstate/gitguard SCHEME `log` default true; operate
  SCHEME + batch-edit/pattern READMEs gained the `log` row; queue README
  `log` true. Note: plugin-dsh-pattern and hook-dsh-batch-decision are
  Classic-only candidates (the MANIFEST declares no ETS twins for them), so
  no twin sync is needed; do NOT re-run the ETS generator - it would
  overwrite the hand-ported ETS batch-edit Shield fix.
- THE ASSEMBLY: the 35 fragments replaced the appended override block in
  `/Users/nikola/.dsh/profiles/desktop/cordis.patch.yml` (each row carries
  `enabled: true` + the full schema field set). Verified: 64 rows, 64 unique
  ids, 49 @playform rows (36 enabled), YAML parses; the mirror composition
  dump exit 0 with 96 @playform refs and only the pre-existing
  `entry "ccr" not found` stderr line.
- THE REVIEW PASS (separate read-only lanes): the client-bundle reviewer
  5/5 PASS, zero defects; the config-surface reviewer 4 PASS + 1 non-issue
  (the "ETS twin of pattern" does not exist - pattern/batch-decision are
  Classic-only candidates; the batch-edit fragment's enabled:true is the
  intended activation); the assembled-profile reviewer 6/6 checks with the
  KEY FINDING that the 14 EXISTING family rows are still partial (13 missing
  `enabled: true`, pinner missing `updateCooldownMs`, the 7 normalize rows
  missing `scopes` + `toolResultsExempt`, tool-coach missing ~20 fields,
  live-containers missing its ~70-field schema).
- THE ORIGINAL-ROW PASS: two config-surface lanes are extending the
  full-default treatment to the 14 existing family rows, preserving the
  user's custom values (normalizeToolArguments, ncuBin, ccr multipliers,
  tool-coach notes.persistent, the logFile paths) and writing fragments to
  `/tmp/profile-defaults-original/`; the Lead then assembles them into the
  patch (block-surgery preserving the column-0 comments).
- THE logFile `~` REWRITES: the 11 `/Users/nikola/.dsh/*` -> `~/.dsh/*`
  changes in the patch were made by the APP's config editor at 14:17 (the
  file mtime + the user's own font-size 12 edit in the same save), not by
  the assembly (which preserves the prefix byte-for-byte).
