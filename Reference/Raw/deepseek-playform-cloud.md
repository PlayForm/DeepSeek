[Skip to the interior](https://deepseek.playform.cloud/#interior-cab-03)
## THE MACHINERY
2 MODULES
MAC-01 [lib-dsh-core ](https://deepseek.playform.cloud/plugins/lib-dsh-core/ "lib-dsh-core") ACTIVE
Lib @ DSH @ Core
15 CHECKS INSPECT +
The pure commonalities of the family (dependency-free in CLASSIC; effect-backed in EFFECT-TS): the section lists, the exclusion segments, the suppression composer, the policy loader, the refusal guard and the normalize/Stream machinery.
`$ dsh plugin --profile <name> add ./bundles/lib-dsh-core` COPY
[Open the MAC-01 module page](https://deepseek.playform.cloud/plugins/lib-dsh-core/)
MAC-02 [plugin-dsh-factory ](https://deepseek.playform.cloud/plugins/plugin-dsh-factory/ "plugin-dsh-factory") ACTIVE
Plugin @ DSH @ Factory
55 CHECKS INSPECT +
The family's first service: the ledger, the exclusion match, the discovery, the keep-list union, the gate set, the version-guarded fenced write, the refresh, the detached contained continuation, the `State` builder, the wiring, the effects, the schema factory and the probe-once seam.
`$ dsh plugin --profile <name> add ./bundles/plugin-dsh-factory` COPY
[Open the MAC-02 module page](https://deepseek.playform.cloud/plugins/plugin-dsh-factory/)
## THE GOVERNORS
3 MODULES
GOV-01 [hook-dsh-package-governor ](https://deepseek.playform.cloud/plugins/hook-dsh-package-governor/ "hook-dsh-package-governor") ACTIVE
Hook @ DSH @ Governor @ Package
80 CHECKS INSPECT +
The silent package.json governor. Hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts). Rewrites chain-governed pins to the effective registry's resolved versions. Runs the update stage as a detached, contained continuation.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-package-governor` COPY
[Open the GOV-01 module page](https://deepseek.playform.cloud/plugins/hook-dsh-package-governor/)
GOV-02 [hook-dsh-package-pinner ](https://deepseek.playform.cloud/plugins/hook-dsh-package-pinner/ "hook-dsh-package-pinner") ACTIVE
Hook @ DSH @ Pinner @ Package
32 CHECKS INSPECT +
The silent package.json version pinner. Hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) and deterministically rewrites EVERY ranged dependency version to its static version. Protected by a [pin-policy keep-list](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source/Function/Transform.ts).
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-package-pinner` COPY
[Open the GOV-02 module page](https://deepseek.playform.cloud/plugins/hook-dsh-package-pinner/)
GOV-03 [hook-dsh-cargo-governor ](https://deepseek.playform.cloud/plugins/hook-dsh-cargo-governor/ "hook-dsh-cargo-governor") ACTIVE
Hook @ DSH @ Governor @ Cargo
62 CHECKS INSPECT +
The Cargo.toml governor: the Rust-sided flavor of the package governor - surgical chain-pin rewrites on the raw TOML lines and `cargo` upgrade driven through the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess).
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-cargo-governor` COPY
[Open the GOV-03 module page](https://deepseek.playform.cloud/plugins/hook-dsh-cargo-governor/)
## THE WORKSPACE FAMILY
4 MODULES
WRK-01 [plugin-dsh-workspace ](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace/ "plugin-dsh-workspace") ACTIVE
Plugin @ DSH @ Workspace
NO SUITE INSPECT +
The workspace agent: the operational view the conversation addresses. It consumes the Wave-1 graph service and presents it through the four navigation primitives - workspace_map, workspace_find, workspace_expand and workspace_context - with cursor pagination and no full file bodies unless a span is asked for. Ships DISABLED.
`$ dsh plugin --profile <name> add ./bundles/plugin-dsh-workspace` COPY
[Open the WRK-01 module page](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace/)
WRK-02 [lib-dsh-workspace-live ](https://deepseek.playform.cloud/plugins/lib-dsh-workspace-live/ "lib-dsh-workspace-live") ACTIVE
Lib @ DSH @ Workspace @ Live
NO SUITE INSPECT +
The workspace-live library: the shared client machinery of the family's live view - the operational-view section types and the render helpers (the section framer, the budget collapse and the orientation-packet renderer). No Config, no apply: the library is not a plugin bundle.
`$ dsh plugin --profile <name> add ./bundles/lib-dsh-workspace-live` COPY
[Open the WRK-02 module page](https://deepseek.playform.cloud/plugins/lib-dsh-workspace-live/)
SUG-01 [hook-dsh-convention-suggester ](https://deepseek.playform.cloud/plugins/hook-dsh-convention-suggester/ "hook-dsh-convention-suggester") ACTIVE
Hook @ DSH @ Suggest @ Convention
NO SUITE INSPECT +
The convention suggester: carries the repo's conventions as a pattern pack and names them BEFORE the model violates them. A deterministic path classifier prepends one labeled additionalContexts notice naming the companion targets the convention requires.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-convention-suggester` COPY
[Open the SUG-01 module page](https://deepseek.playform.cloud/plugins/hook-dsh-convention-suggester/)
SUG-02 [hook-dsh-test-suggester ](https://deepseek.playform.cloud/plugins/hook-dsh-test-suggester/ "hook-dsh-test-suggester") ACTIVE
Hook @ DSH @ Suggest @ Test
NO SUITE INSPECT +
The test suggester: answers the test task intent with a target set - the suite's Test.ts assertion body, the suite README carrying the expected count, the aggregate runner and the README badge. Deterministic classifier, high threshold, a stated reason per candidate and an abstention path.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-test-suggester` COPY
[Open the SUG-02 module page](https://deepseek.playform.cloud/plugins/hook-dsh-test-suggester/)
## THE CLIENT FAMILY
1 MODULE
CLI-01 [client-dsh-panel-family ](https://deepseek.playform.cloud/plugins/client-dsh-panel-family/ "client-dsh-panel-family") ACTIVE
Client @ DSH @ Panel @ Family
NO SUITE INSPECT +
The central panel package of the UI family: the panel contract (the two child slots, the slot-aware registry, the adapter contract and the config-form contract) plus the three reference adapters. The host half of the entry is an empty apply(), so the client module system serves the ./client bundle.
`$ dsh plugin --profile <name> add ./bundles/client-dsh-panel-family` COPY
[Open the CLI-01 module page](https://deepseek.playform.cloud/plugins/client-dsh-panel-family/)
10 MODULES
ALLMACHINERYGOVERNWORKSPACESUGGESTCLIENT
SCREEN 03 / 03
ECOSYSTEM: @PLAYFORM  CLASSIC  EFFECT-TS
# Tame the model's output and govern the project's files.
Every figure on this page is read from the monorepo at build time: 106 TypeScript packages across the Classic and Effect-TS releases, 539 smoke suites and 6828 checks - the repo's own numbers, checkable against the tree.
[Explore Plugins ](https://deepseek.playform.cloud/plugins/)[Open the Workbench](https://deepseek.playform.cloud/reference/#workbench)
106 PACKAGES
539 SMOKE SUITES
6828 SMOKE CHECKS
## The family explorer
91 PACKAGES10 GROUPS
Search, filter and sort all 91 packages below; activate a row for its facts - the panel is inline, no navigation. Escape closes the open detail.
SORT NAME MOST SMOKE CHECKS MOST MODULES
ALL CLASSIC EFFECT-TS CORE AND FACTORYWORKSPACENORMALIZEGOVERNANCEGUARDIANSSUGGESTERSORCHESTRATIONDELIVERYCLIENTCOST AND TELEMETRY Reset
showing 91 of 91 packages
  * client-dsh-panel-family CLIENT CLASSIC V0.3.0 (no role documented) DETAIL
  * client-dsh-panel-family-host CLIENT CLASSIC V0.3.0 (no role documented) DETAIL
  * client-dsh-workspace-live CLIENT CLASSIC V0.3.0 (no role documented) DETAIL
  * ets-base-dsh LIB EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-client-dsh-workspace-live CLIENT EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-cargo-governor HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-ccr HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-convention-suggester HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-doc-suggester HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-edit-suggester HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-graph-suggester HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-live-containers HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-normalize-dash HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-normalize-ellipsis HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-normalize-fullwidth HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-normalize-invisible HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-normalize-quotes HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-normalize-spaces HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-package-governor HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-package-pinner HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-replay-suggester HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-search-suggester HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-test-suggester HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-tool-coach HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-workspace-approve HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-workspace-audit HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-workspace-govern HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-workspace-journal HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-workspace-merge HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-workspace-monitor HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-workspace-observe HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-hook-dsh-workspace-operate HOOK EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-lib-dsh-core LIB EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-lib-dsh-pack LIB EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-lib-dsh-trace LIB EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-lib-dsh-workspace-live LIB EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-batch-edit PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-batchstate PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-factory PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-feedback PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-gitguard PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-normalize-file PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-queue PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-route PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-workspace PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-authority PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-context PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-evidence PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-graph PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-reflect PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-semantics PLUGIN EFFECTTS V0.3.0 (no role documented) DETAIL
  * hook-dsh-batch-decision HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-comment-filter HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-convention-suggester HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-doc-suggester HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-edit-suggester HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-graph-suggester HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-lesson-nudge HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-replay-suggester HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-search-suggester HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-test-suggester HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-workspace-approve HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-workspace-audit HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-workspace-govern HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-workspace-journal HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-workspace-merge HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-workspace-monitor HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-workspace-observe HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * hook-dsh-workspace-operate HOOK CLASSIC V0.3.0 (no role documented) DETAIL
  * lib-dsh-pack LIB CLASSIC V0.3.0 (no role documented) DETAIL
  * lib-dsh-trace LIB CLASSIC V0.3.0 (no role documented) DETAIL
  * lib-dsh-workspace-live LIB CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-batch-edit PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-batchstate PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-cost PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-cost-analysis PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-feedback PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-gitguard PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-ingester PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-lesson-review PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-pass-on PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-pattern PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-queue PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-route PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-workspace PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-workspace-authority PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-workspace-context PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-workspace-evidence PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-workspace-graph PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-workspace-reflect PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL
  * plugin-dsh-workspace-semantics PLUGIN CLASSIC V0.3.0 (no role documented) DETAIL


No packages match the active filters Clear the search or reset the filter chips.
## The group map
91 PACKAGES10 GROUPS
One bar per group, proportional to the group's package count - the counts sum the same data the explorer filters. Activate a bar to apply that group's filter.
[CORE AND FACTORY7](https://deepseek.playform.cloud/#explorer)[WORKSPACE32](https://deepseek.playform.cloud/#explorer)[NORMALIZE7](https://deepseek.playform.cloud/#explorer)[GOVERNANCE3](https://deepseek.playform.cloud/#explorer)[GUARDIANS4](https://deepseek.playform.cloud/#explorer)[SUGGESTERS15](https://deepseek.playform.cloud/#explorer)[ORCHESTRATION15](https://deepseek.playform.cloud/#explorer)[DELIVERY2](https://deepseek.playform.cloud/#explorer)[CLIENT4](https://deepseek.playform.cloud/#explorer)[COST AND TELEMETRY2](https://deepseek.playform.cloud/#explorer)
## The normalize demo
DASHQUOTESELLIPSISSPACESINVISIBLEFULLWIDTH
This demo illustrates the normalize family's behavior in the browser; it is NOT a live plugin run - the real flavors rewrite model output streams (llm/stream) and files (normalize-file) inside the harness. The transforms and the family order are the file tool's own six-fold chain: dash, quotes, ellipsis, spaces, invisible, fullwidth.
INPUT
RESULT PRESS NORMALIZE
DASH QUOTES ELLIPSIS SPACES INVISIBLE FULLWIDTH NORMALIZE Reset
## The ledger demo
FACTORY LEDGER FORMAT
One button appends one line in the factory's ledger format - [<ISO timestamp>] <message> - and one clears the panel. This illustrates the format; it is NOT a live plugin run: the real Append writes through the factory service to the module's durable ledger file.
EMPTY - press APPEND LINE to add the first line.
APPEND LINE CLEAR
## The config demo
PLUGIN-DSH-COST SCHEMA
The four schema fields the cost plugin ships - enabled, annotate.enabled, capture.backfill, databasePath - resolve into the config object live beneath the controls, with the schema's own defaults. This illustrates the schema; it is NOT a live plugin run: the real Schemastery validation happens when the plugin loads.
enabled annotate.enabled capture.backfill databasePath  COPY

```
{
  "enabled": true,
  "databasePath": "~/.dsh/cost/ledger.db",
  "capture": {
    "backfill": false
  },
  "annotate": {
    "enabled": false
  }
}
```

## The family in numbers
THE CENSUS
58 CLASSIC PACKAGES
48 EFFECT-TS PACKAGES
47 ETS TWINS
539 SMOKE SUITES
6828 SMOKE CHECKS
NO RECORD PUBLISHED RELEASE
V0.3.0 UNRELEASED TREE VERSION
The DSH family @ PlayForm: 106 packages, 539 smoke suites and 6828 checks, read from the monorepo at build time.
