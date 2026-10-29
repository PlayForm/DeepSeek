[Skip to the interior](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#interior-cab-03)
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
The PlayForm plugin family
# See where the harness changes.
Follow the transformations, decisions, and guarded follow-up work that PlayForm adds to DeepSeek Harness.
[Follow the change ↓ ](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#outcomes)[Browse packages →](https://deepseek.playform.cloud/plugins/)
[Connecting your own harness is planned. Read the terms at /connect/.](https://deepseek.playform.cloud/connect/)
Govern a manifest
Same proposed edit. Different final manifest. package.json AUTHORED EXAMPLE
Baseline `example`
     `^1.2.3` Model-proposed range
With PlayForm `example`
     `1.2.3` changed Range reduced to a static version
Intervention: Package pinner
Authored example. This illustrates the mechanism; it does not show a captured execution.
[Inspect the change →](https://deepseek.playform.cloud/showcase/govern-manifest/)
Source inventory · 44 Classic · 60 EffectTS Source revision 2fb4555c2f8ea96de77c07ea8c3a29f069d2793a [View the catalogue →](https://deepseek.playform.cloud/plugins/)
## What do you want the harness to do differently?
01 / START WITH AN OUTCOME
Start with a behavior, then inspect the packages and conditions behind it.
  * 01
### Govern file changes
Follow how manifest policies, guarded writes, and follow-up passes affect file changes.
[Walk through manifest governance →](https://deepseek.playform.cloud/showcase/govern-manifest/)
  * 02
### Shape model-facing content
See where output normalization and tool-result mediation change the content moving through the harness.
[Explore content transformations →](https://deepseek.playform.cloud/showcase/normalize-response/)
  * 03
### Navigate the workspace
Understand how observation, indexing, navigation, and context assembly fit together.
[Follow the workspace path →](https://deepseek.playform.cloud/showcase/workspace-navigation/)


## One harness. Specific points of change.
02 / LOCATE THE INTERVENTION
Locate an intervention before exploring its dependencies and configuration.
01 Context02 Model output03 Tool decision04 Execution05 Files06 Follow-up
Stage 5 of 6
### Files
Observe a mutation. Evaluate eligibility. Schedule guarded follow-up work.
Example package [hook-dsh-package-pinner](https://deepseek.playform.cloud/plugins/ets-hook-dsh-package-pinner/)
[Understand this behavior →](https://deepseek.playform.cloud/showcase/govern-manifest/)
Previous Next
[Open the Observatory →](https://deepseek.playform.cloud/explore/)
## See the mechanism, not just the package name.
03 / SELECTED WALKTHROUGHS16 IN THE SHOWCASE
  * `^1.2.3` → `1.2.3`
AUTHORED EXAMPLE
### [Govern a manifest](https://deepseek.playform.cloud/showcase/govern-manifest/)
Follow a proposed range through an illustrated governance path.
[Open the walkthrough →](https://deepseek.playform.cloud/showcase/govern-manifest/)
  * `U+2014` → `-` · `U+201C U+201D` → `"`
AUTHORED EXAMPLE
### [Normalize a response](https://deepseek.playform.cloud/showcase/normalize-response/)
Compare original and normalized text at the output boundary.
[Open the walkthrough →](https://deepseek.playform.cloud/showcase/normalize-response/)
  * Observe → Index → Navigate
DOCUMENTED WALKTHROUGH
### [Workspace navigation](https://deepseek.playform.cloud/showcase/workspace-navigation/)
Follow observation, indexing, and navigation through the documented architecture.
[Open the walkthrough →](https://deepseek.playform.cloud/showcase/workspace-navigation/)

[All 16 walkthroughs →](https://deepseek.playform.cloud/showcase/)
View
TimelineWorld
Arrange
StackedSplitOverlay
Story Fit Inspector Full screen More
Question Attachments Which package registers on which stageDependencies What one package needs from anotherContributions Every surface a package registers
## PlayForm: the governed write
Scenario BaselinePlayFormCompare
Scope SystemConversationWorkspace
Lens EventsEffective contextLogical requestProvider representation
Effective context, Logical request and Provider representation need a captured request window. They stay unavailable until a recording that carries one is loaded.
PlayForm layers
Normalize CCR Pinner Index
  1. 1 Context
  2. 2 Response
  3. 3 Tool policy
  4. 4 Governed write
  5. 5 Follow-up


Visibility controls do not re-run the harness.
Authored walkthrough. Illustrative execution, not a recorded run.
## A source inventory is not a running session.
04 / UNDERSTAND THE EVIDENCE
The site distinguishes what the source declares, what an example illustrates, and what a captured execution records.
  * SOURCE-DERIVED
Package identities, dependencies, and supported registrations derived from a named source revision.
  * AUTHORED EXAMPLE
A deliberately constructed walkthrough explaining a mechanism. It is not evidence that a particular session executed it.
  * RECORDED EVENT / NOT CAPTURED
Events recorded during an execution, with the capture's provenance and limitations stated. No runtime capture is published in this build.

Catalogue revision
    2fb4555c2f8ea96de77c07ea8c3a29f069d2793a Catalogue total
Groups
Stories
Recorded runs
     Unavailable No runtime capture is published yet.
This build includes source-derived records and authored examples. No runtime capture is published in this build.
[Read the reference →](https://deepseek.playform.cloud/reference/)
## Choose the behavior. Review the wiring. Verify the setup.
05 / BUILD A PROFILE
Select an implementation and the capabilities you need. Review the generated configuration and the conditions required for activation.
[Build a profile → ](https://deepseek.playform.cloud/setup/)[Browse the packages →](https://deepseek.playform.cloud/plugins/)
  1. 01 Select capabilities
  2. 02 Review dependencies and configuration
  3. 03 Follow the verification steps


## The family explorer
104 PACKAGES10 GROUPS
Search, filter and sort all 104 packages below; activate a row for its facts - the panel is inline, no navigation. Escape closes the open detail.
SORT NAME MOST SMOKE CHECKS MOST MODULES
ALL CLASSIC EFFECT-TS CORE AND FACTORYWORKSPACENORMALIZEGOVERNANCEGUARDIANSSUGGESTERSORCHESTRATIONDELIVERYCLIENTCOST AND TELEMETRY Reset
showing 104 of 104 packages
  * client-dsh-panel-family CLIENT CLASSIC V0.2.1 (no role documented) DETAIL
  * client-dsh-panel-family-host CLIENT CLASSIC V0.2.1 (no role documented) DETAIL
  * client-dsh-workspace-live CLIENT CLASSIC V0.2.1 (no role documented) DETAIL
  * ets-base-dsh LIB EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-client-dsh-panel-family CLIENT EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-client-dsh-panel-family-host CLIENT EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-client-dsh-workspace-live CLIENT EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-batch-decision HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-cargo-governor HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-ccr HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-comment-filter HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-convention-suggester HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-doc-suggester HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-edit-suggester HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-graph-suggester HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-lesson-nudge HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-live-containers HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-normalize-dash HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-normalize-ellipsis HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-normalize-fullwidth HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-normalize-invisible HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-normalize-quotes HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-normalize-spaces HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-package-governor HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-package-pinner HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-replay-suggester HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-search-suggester HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-test-suggester HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-tool-coach HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-workspace-approve HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-workspace-audit HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-workspace-govern HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-workspace-journal HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-workspace-merge HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-workspace-monitor HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-workspace-observe HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-hook-dsh-workspace-operate HOOK EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-lib-dsh-conversation LIB EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-lib-dsh-core LIB EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-lib-dsh-pack LIB EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-lib-dsh-trace LIB EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-lib-dsh-workspace-live LIB EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-batch-edit PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-batchstate PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-cost PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-cost-analysis PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-factory PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-feedback PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-gitguard PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-ingester PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-lesson-review PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-normalize-file PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-pass-on PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-pattern PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-queue PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-route PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-workspace PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-authority PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-context PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-evidence PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-graph PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-reflect PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * ets-plugin-dsh-workspace-semantics PLUGIN EFFECTTS V0.2.1 (no role documented) DETAIL
  * hook-dsh-batch-decision HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-comment-filter HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-convention-suggester HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-doc-suggester HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-edit-suggester HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-graph-suggester HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-lesson-nudge HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-replay-suggester HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-search-suggester HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-test-suggester HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-workspace-approve HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-workspace-audit HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-workspace-govern HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-workspace-journal HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-workspace-merge HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-workspace-monitor HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-workspace-observe HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * hook-dsh-workspace-operate HOOK CLASSIC V0.2.1 (no role documented) DETAIL
  * lib-dsh-conversation LIB CLASSIC V0.2.1 (no role documented) DETAIL
  * lib-dsh-pack LIB CLASSIC V0.2.1 (no role documented) DETAIL
  * lib-dsh-trace LIB CLASSIC V0.2.1 (no role documented) DETAIL
  * lib-dsh-workspace-live LIB CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-batch-edit PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-batchstate PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-cost PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-cost-analysis PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-feedback PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-gitguard PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-ingester PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-lesson-review PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-pass-on PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-pattern PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-queue PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-route PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-workspace PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-workspace-authority PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-workspace-context PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-workspace-evidence PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-workspace-graph PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-workspace-reflect PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL
  * plugin-dsh-workspace-semantics PLUGIN CLASSIC V0.2.1 (no role documented) DETAIL


No packages match the active filters Clear the search or reset the filter chips.
## The group map
104 PACKAGES10 GROUPS
One bar per group, proportional to the group's package count - the counts sum the same data the explorer filters. Activate a bar to apply that group's filter.
[CORE AND FACTORY9](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[WORKSPACE32](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[NORMALIZE7](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[GOVERNANCE3](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[GUARDIANS5](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[SUGGESTERS16](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[ORCHESTRATION18](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[DELIVERY4](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[CLIENT6](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)[COST AND TELEMETRY4](https://deepseek.playform.cloud/?projection=timeline&tree=Classic&scope=conversation&scenario=playform&arrange=stacked&detail=packages#explorer)
  1. Queued →
  2. Claimed →
  3. Turn open


no model stage
  1. Assembled →
  2. Admitted →
  3. Rewritten


model: Context in
  1. Frozen →
  2. Bound →
  3. Dispatched


model: Context in
  1. Reasoning →
  2. Text →
  3. Tool call →
  4. Settled


model: Reasoning
  1. Proposed →
  2. Pending


model: Tool calls
  1. Checked →
  2. Approved →
  3. Denied


model: Tool calls
  1. Running →
  2. Returned


no model stage
  1. Prepared →
  2. Rewritten →
  3. Recorded


model: Settlement
  1. Write intent →
  2. Written →
  3. Observed


no model stage
  1. Step closed →
  2. Owed →
  3. Next request


model: Next exchange
These packages register no documented seam.
  1. Queued →
  2. Claimed →
  3. Turn open


4 packages
  1. Assembled →
  2. Admitted →
  3. Rewritten


51 packages
  1. Frozen →
  2. Bound →
  3. Dispatched


No package
  1. Reasoning →
  2. Text →
  3. Tool call →
  4. Settled


15 packages
  1. Proposed →
  2. Pending


2 packages
  1. Checked →
  2. Approved →
  3. Denied


14 packages
  1. Running →
  2. Returned


2 packages
  1. Prepared →
  2. Rewritten →
  3. Recorded


38 packages
  1. Write intent →
  2. Written →
  3. Observed


27 packages
  1. Step closed →
  2. Owed →
  3. Next request


19 packages
  * hook-dsh-workspace-audit `library`
  * hook-dsh-workspace-merge `library`
  * hook-dsh-workspace-operate `library`
  * lib-dsh-core `library`
  * lib-dsh-pack `library`
  * lib-dsh-workspace-live `library`
  * plugin-dsh-workspace `library`
  * plugin-dsh-workspace-authority `library`
  * plugin-dsh-workspace-context `library`
  * plugin-dsh-workspace-reflect `library`
  * hook-dsh-workspace-audit `library`
  * hook-dsh-workspace-merge `library`
  * hook-dsh-workspace-operate `library`
  * lib-dsh-core `library`
  * lib-dsh-pack `library`
  * lib-dsh-workspace-live `library`
  * plugin-dsh-cost-analysis `library`
  * plugin-dsh-lesson-review `library`
  * plugin-dsh-pattern `library`
  * plugin-dsh-workspace `library`
  * plugin-dsh-workspace-authority `library`
  * plugin-dsh-workspace-context `library`
  * plugin-dsh-workspace-reflect `library`


