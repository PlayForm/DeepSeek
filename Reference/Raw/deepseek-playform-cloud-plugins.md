
# Plugins

CAB-01 / THE HOOKS / REGISTRY 01 OF 03 ACTIVE VERIFIED

## THE MACHINERY

2 MODULES MAC-01 [lib-dsh-core](./plugins-lib-dsh-core.md) ACTIVE

Lib @ DSH @ Core

15 CHECKS

The pure commonalities of the family (dependency-free in CLASSIC; effect-backed in EFFECT-TS): the section lists, the exclusion segments, the suppression composer, the policy loader, the refusal guard and the normalize/Stream machinery.

`$ dsh plugin --profile <name> add ./bundles/lib-dsh-core` [Open the MAC-01 module page](./plugins-lib-dsh-core.md) MAC-02 [plugin-dsh-factory](./plugins-plugin-dsh-factory.md) ACTIVE

Plugin @ DSH @ Factory

55 CHECKS

The family's first service: the ledger, the exclusion match, the discovery, the keep-list union, the gate set, the version-guarded fenced write, the refresh, the detached contained continuation, the `State` builder, the wiring, the effects, the schema factory and the probe-once seam.

`$ dsh plugin --profile <name> add ./bundles/plugin-dsh-factory` [Open the MAC-02 module page](./plugins-plugin-dsh-factory.md)

## THE GOVERNORS

3 MODULES GOV-01 [hook-dsh-package-governor](./plugins-hook-dsh-package-governor.md) ACTIVE

Hook @ DSH @ Governor @ Package

80 CHECKS

The silent package.json governor. Hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts). Rewrites chain-governed pins to the effective registry's resolved versions. Runs the update stage as a detached, contained continuation.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-package-governor` [Open the GOV-01 module page](./plugins-hook-dsh-package-governor.md) GOV-02 [hook-dsh-package-pinner](./plugins-hook-dsh-package-pinner.md) ACTIVE

Hook @ DSH @ Pinner @ Package

32 CHECKS

The silent package.json version pinner. Hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) and deterministically rewrites EVERY ranged dependency version to its static version. Protected by a [pin-policy keep-list](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source/Function/Transform.ts).

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-package-pinner` [Open the GOV-02 module page](./plugins-hook-dsh-package-pinner.md) GOV-03 [hook-dsh-cargo-governor](./plugins-hook-dsh-cargo-governor.md) ACTIVE

Hook @ DSH @ Governor @ Cargo

62 CHECKS

The Cargo.toml governor: the Rust-sided flavor of the package governor - surgical chain-pin rewrites on the raw TOML lines and `cargo` upgrade driven through the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess).

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-cargo-governor` [Open the GOV-03 module page](./plugins-hook-dsh-cargo-governor.md)

## THE FLOW

7 MODULES NRM-01 [hook-dsh-normalize-dash](./plugins-hook-dsh-normalize-dash.md) ACTIVE

Hook @ DSH @ Normalize @ Dash

184 CHECKS

The dash flavor: normalizes the unicode dash family to ASCII hyphen-minus in model output streams, mirroring the core's dash class at the injection point a file hook lacks.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-dash` [Open the NRM-01 module page](./plugins-hook-dsh-normalize-dash.md) NRM-02 [hook-dsh-normalize-quotes](./plugins-hook-dsh-normalize-quotes.md) ACTIVE

Hook @ DSH @ Normalize @ Quotes

104 CHECKS

The quotes flavor: maps the eight curly quote code points to their ASCII straight counterparts in model output streams.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-quotes` [Open the NRM-02 module page](./plugins-hook-dsh-normalize-quotes.md) NRM-03 [hook-dsh-normalize-ellipsis](./plugins-hook-dsh-normalize-ellipsis.md) ACTIVE

Hook @ DSH @ Normalize @ Ellipsis

104 CHECKS

The ellipsis flavor: replaces the horizontal ellipsis (`U+2026`) with the plain ASCII three-dot sequence in model output streams.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-ellipsis` [Open the NRM-03 module page](./plugins-hook-dsh-normalize-ellipsis.md) NRM-04 [hook-dsh-normalize-spaces](./plugins-hook-dsh-normalize-spaces.md) ACTIVE

Hook @ DSH @ Normalize @ Spaces

104 CHECKS

The spaces flavor: normalizes the unicode space family (Zs minus the ASCII space) to the plain space in model output streams.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-spaces` [Open the NRM-04 module page](./plugins-hook-dsh-normalize-spaces.md) NRM-05 [hook-dsh-normalize-invisible](./plugins-hook-dsh-normalize-invisible.md) ACTIVE

Hook @ DSH @ Normalize @ Invisible

104 CHECKS

The invisible flavor: removes the zero-width/invisible character family (soft hyphen, zero-width spaces and joiners, bidi controls, BOM) from model output streams.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-invisible` [Open the NRM-05 module page](./plugins-hook-dsh-normalize-invisible.md) NRM-06 [hook-dsh-normalize-fullwidth](./plugins-hook-dsh-normalize-fullwidth.md) ACTIVE

Hook @ DSH @ Normalize @ Fullwidth

104 CHECKS

The fullwidth flavor: maps the entire FULLWIDTH FORMS range (`U+FF01`-`U+FF5E`) to its ASCII half-width counterparts in model output streams.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-fullwidth` [Open the NRM-06 module page](./plugins-hook-dsh-normalize-fullwidth.md) NRM-07 [plugin-dsh-normalize-file](./plugins-plugin-dsh-normalize-file.md) ACTIVE

Plugin @ DSH @ Normalize @ File

112 CHECKS

The file-content normalizer: the normalize-file tool - the read, count, write pipeline applying all six transforms to a file already on disk, writing ONLY when something changed.

`$ dsh plugin --profile <name> add ./bundles/plugin-dsh-normalize-file` [Open the NRM-07 module page](./plugins-plugin-dsh-normalize-file.md)

## THE SERVICES

2 MODULES SVC-01 [hook-dsh-ccr](./plugins-hook-dsh-ccr.md) ACTIVE

hook-dsh-ccr

147 CHECKS

The tool-output compressor. Hooks the [tools/post-execute](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md) waterfall. Replaces oversized results of the allow-listed target tools with a one-line type-aware preview plus a \`\<\<\<CCR:hash\|type\|size\>\>\>\` retrieval marker. Gated on thresholdBytes x the per-type multipliers, with auto-expand returning small results FULL. The original stays retrievable through the registered ccr_retrieve tool over the sha256-24 LRU store.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-ccr` [Open the SVC-01 module page](./plugins-hook-dsh-ccr.md) SVC-02 [hook-dsh-tool-coach](./plugins-hook-dsh-tool-coach.md) ACTIVE

Hook @ DSH @ Tool @ Coach

139 CHECKS

The terminal coach. Judges EVERY bash/pwsh call through a four-tier ladder - tier-0 ledger lines for every offense, tier-1 live-fetched coaching notes at the strike threshold, tier-2 a persistent system-prompt discipline section, tier-3 (opt-in) tools/pre-execute denies. Teaches the model to stop using the terminal for file content.

`$ dsh plugin --profile <name> add ./bundles/hook-dsh-tool-coach` [Open the SVC-02 module page](./plugins-hook-dsh-tool-coach.md) 14 MODULES SCREEN 01 / 03 ECOSYSTEM: @PLAYFORM 106 PLUGINS

## Plugins

The 106 TypeScript packages of the DeepSeek Harness Plugin Family - 58 Classic plus 48 Effect-TS, 47 of them twins - each one a verified, smoke-arbitrated bundle.

The release identity follows the reversed hierarchical naming - the "@-sentence" identity. The scope stays @playform, and the family/type marker leads, so a package name reads as a sentence about what it is.

Every install row is the build-from-source route (dsh plugin --profile \<name\> add ./bundles/\<pkg\>); the /setup/ flow wires the bundle into a profile.

Filter registry: 106 RESULTS 106 PACKAGES DSH-REGISTRY No packages match the active filters Broaden the search query or reset the filter chips above.

## Core and Factory

9 PACKAGES4 TWINS

The factory owns the write executor, the ledger and the gates, and the core, pack and trace libraries carry the machinery every other package builds on.

- [lib-dsh-core](./plugins-lib-dsh-core.md) LIB CLASSIC

  The pure commonalities of the family (dependency-free in CLASSIC; effect-backed in EFFECT-TS): the section lists, the exclusion segments, the suppression composer, the policy loader, the refusal guard and the normalize/Stream machinery.

  ets-lib-dsh-core

- [plugin-dsh-factory](./plugins-plugin-dsh-factory.md) PLUGIN CLASSIC

  The family's first service: the ledger, the exclusion match, the discovery, the keep-list union, the gate set, the version-guarded fenced write, the refresh, the detached contained continuation, the `State` builder, the wiring, the effects, the schema factory and the probe-once seam.

  ets-plugin-dsh-factory

- [lib-dsh-pack](./plugins-lib-dsh-pack.md) LIB CLASSIC ets-lib-dsh-pack

- [lib-dsh-trace](./plugins-lib-dsh-trace.md) LIB CLASSIC ets-lib-dsh-trace

- [ets-base-dsh](./plugins-ets-base-dsh.md) LIB EFFECTTS

- [ets-lib-dsh-core](./plugins-ets-lib-dsh-core.md) LIB EFFECTTS

- [ets-plugin-dsh-factory](./plugins-ets-plugin-dsh-factory.md) PLUGIN EFFECTTS

- [ets-lib-dsh-pack](./plugins-ets-lib-dsh-pack.md) LIB EFFECTTS

- [ets-lib-dsh-trace](./plugins-ets-lib-dsh-trace.md) LIB EFFECTTS

## Workspace

32 PACKAGES16 TWINS

The workspace family indexes the repository into a graph, proposes typed operations, and gates, merges, journals and audits every edit.

- [plugin-dsh-workspace](./plugins-plugin-dsh-workspace.md) PLUGIN CLASSIC ets-plugin-dsh-workspace
- [hook-dsh-workspace-observe](./plugins-hook-dsh-workspace-observe.md) HOOK CLASSIC ets-hook-dsh-workspace-observe
- [plugin-dsh-workspace-semantics](./plugins-plugin-dsh-workspace-semantics.md) PLUGIN CLASSIC ets-plugin-dsh-workspace-semantics
- [hook-dsh-workspace-operate](./plugins-hook-dsh-workspace-operate.md) HOOK CLASSIC ets-hook-dsh-workspace-operate
- [hook-dsh-workspace-govern](./plugins-hook-dsh-workspace-govern.md) HOOK CLASSIC ets-hook-dsh-workspace-govern
- [plugin-dsh-workspace-authority](./plugins-plugin-dsh-workspace-authority.md) PLUGIN CLASSIC ets-plugin-dsh-workspace-authority
- [hook-dsh-workspace-approve](./plugins-hook-dsh-workspace-approve.md) HOOK CLASSIC ets-hook-dsh-workspace-approve
- [hook-dsh-workspace-merge](./plugins-hook-dsh-workspace-merge.md) HOOK CLASSIC ets-hook-dsh-workspace-merge
- [hook-dsh-workspace-journal](./plugins-hook-dsh-workspace-journal.md) HOOK CLASSIC ets-hook-dsh-workspace-journal
- [hook-dsh-workspace-audit](./plugins-hook-dsh-workspace-audit.md) HOOK CLASSIC ets-hook-dsh-workspace-audit
- [plugin-dsh-workspace-context](./plugins-plugin-dsh-workspace-context.md) PLUGIN CLASSIC ets-plugin-dsh-workspace-context
- [hook-dsh-workspace-monitor](./plugins-hook-dsh-workspace-monitor.md) HOOK CLASSIC ets-hook-dsh-workspace-monitor
- [plugin-dsh-workspace-evidence](./plugins-plugin-dsh-workspace-evidence.md) PLUGIN CLASSIC ets-plugin-dsh-workspace-evidence
- [plugin-dsh-workspace-graph](./plugins-plugin-dsh-workspace-graph.md) PLUGIN CLASSIC ets-plugin-dsh-workspace-graph
- [plugin-dsh-workspace-reflect](./plugins-plugin-dsh-workspace-reflect.md) PLUGIN CLASSIC ets-plugin-dsh-workspace-reflect
- [lib-dsh-workspace-live](./plugins-lib-dsh-workspace-live.md) LIB CLASSIC ets-lib-dsh-workspace-live
- [ets-plugin-dsh-workspace](./plugins-ets-plugin-dsh-workspace.md) PLUGIN EFFECTTS
- [ets-hook-dsh-workspace-observe](./plugins-ets-hook-dsh-workspace-observe.md) HOOK EFFECTTS
- [ets-plugin-dsh-workspace-semantics](./plugins-ets-plugin-dsh-workspace-semantics.md) PLUGIN EFFECTTS
- [ets-hook-dsh-workspace-operate](./plugins-ets-hook-dsh-workspace-operate.md) HOOK EFFECTTS
- [ets-hook-dsh-workspace-govern](./plugins-ets-hook-dsh-workspace-govern.md) HOOK EFFECTTS
- [ets-plugin-dsh-workspace-authority](./plugins-ets-plugin-dsh-workspace-authority.md) PLUGIN EFFECTTS
- [ets-hook-dsh-workspace-approve](./plugins-ets-hook-dsh-workspace-approve.md) HOOK EFFECTTS
- [ets-hook-dsh-workspace-merge](./plugins-ets-hook-dsh-workspace-merge.md) HOOK EFFECTTS
- [ets-hook-dsh-workspace-journal](./plugins-ets-hook-dsh-workspace-journal.md) HOOK EFFECTTS
- [ets-hook-dsh-workspace-audit](./plugins-ets-hook-dsh-workspace-audit.md) HOOK EFFECTTS
- [ets-plugin-dsh-workspace-context](./plugins-ets-plugin-dsh-workspace-context.md) PLUGIN EFFECTTS
- [ets-hook-dsh-workspace-monitor](./plugins-ets-hook-dsh-workspace-monitor.md) HOOK EFFECTTS
- [ets-plugin-dsh-workspace-evidence](./plugins-ets-plugin-dsh-workspace-evidence.md) PLUGIN EFFECTTS
- [ets-plugin-dsh-workspace-graph](./plugins-ets-plugin-dsh-workspace-graph.md) PLUGIN EFFECTTS
- [ets-plugin-dsh-workspace-reflect](./plugins-ets-plugin-dsh-workspace-reflect.md) PLUGIN EFFECTTS
- [ets-lib-dsh-workspace-live](./plugins-ets-lib-dsh-workspace-live.md) LIB EFFECTTS

## Normalize

14 PACKAGES7 TWINS

The normalize family maps model output streams to a canonical character set - six stream flavors at the injection point, plus the file tool for content already on disk.

- [hook-dsh-normalize-dash](./plugins-hook-dsh-normalize-dash.md) HOOK CLASSIC

  The dash flavor: normalizes the unicode dash family to ASCII hyphen-minus in model output streams, mirroring the core's dash class at the injection point a file hook lacks.

  ets-hook-dsh-normalize-dash

- [hook-dsh-normalize-quotes](./plugins-hook-dsh-normalize-quotes.md) HOOK CLASSIC

  The quotes flavor: maps the eight curly quote code points to their ASCII straight counterparts in model output streams.

  ets-hook-dsh-normalize-quotes

- [hook-dsh-normalize-ellipsis](./plugins-hook-dsh-normalize-ellipsis.md) HOOK CLASSIC

  The ellipsis flavor: replaces the horizontal ellipsis (`U+2026`) with the plain ASCII three-dot sequence in model output streams.

  ets-hook-dsh-normalize-ellipsis

- [hook-dsh-normalize-spaces](./plugins-hook-dsh-normalize-spaces.md) HOOK CLASSIC

  The spaces flavor: normalizes the unicode space family (Zs minus the ASCII space) to the plain space in model output streams.

  ets-hook-dsh-normalize-spaces

- [hook-dsh-normalize-invisible](./plugins-hook-dsh-normalize-invisible.md) HOOK CLASSIC

  The invisible flavor: removes the zero-width/invisible character family (soft hyphen, zero-width spaces and joiners, bidi controls, BOM) from model output streams.

  ets-hook-dsh-normalize-invisible

- [hook-dsh-normalize-fullwidth](./plugins-hook-dsh-normalize-fullwidth.md) HOOK CLASSIC

  The fullwidth flavor: maps the entire FULLWIDTH FORMS range (`U+FF01`-`U+FF5E`) to its ASCII half-width counterparts in model output streams.

  ets-hook-dsh-normalize-fullwidth

- [plugin-dsh-normalize-file](./plugins-plugin-dsh-normalize-file.md) PLUGIN CLASSIC

  The file-content normalizer: the read, count, write pipeline applying all six transforms to a file already on disk, writing ONLY when something changed.

  ets-plugin-dsh-normalize-file

- [ets-hook-dsh-normalize-dash](./plugins-ets-hook-dsh-normalize-dash.md) HOOK EFFECTTS

- [ets-hook-dsh-normalize-quotes](./plugins-ets-hook-dsh-normalize-quotes.md) HOOK EFFECTTS

- [ets-hook-dsh-normalize-ellipsis](./plugins-ets-hook-dsh-normalize-ellipsis.md) HOOK EFFECTTS

- [ets-hook-dsh-normalize-spaces](./plugins-ets-hook-dsh-normalize-spaces.md) HOOK EFFECTTS

- [ets-hook-dsh-normalize-invisible](./plugins-ets-hook-dsh-normalize-invisible.md) HOOK EFFECTTS

- [ets-hook-dsh-normalize-fullwidth](./plugins-ets-hook-dsh-normalize-fullwidth.md) HOOK EFFECTTS

- [ets-plugin-dsh-normalize-file](./plugins-ets-plugin-dsh-normalize-file.md) PLUGIN EFFECTTS

## Governance

6 PACKAGES3 TWINS

The governance hooks rewrite package.json and Cargo.toml to resolved versions and run the update stages as detached continuations.

- [hook-dsh-package-governor](./plugins-hook-dsh-package-governor.md) HOOK CLASSIC

  The silent package.json governor.

  ets-hook-dsh-package-governor

- [hook-dsh-package-pinner](./plugins-hook-dsh-package-pinner.md) HOOK CLASSIC

  The silent package.json version pinner.

  ets-hook-dsh-package-pinner

- [hook-dsh-cargo-governor](./plugins-hook-dsh-cargo-governor.md) HOOK CLASSIC

  The Cargo.toml governor: the Rust-sided flavor of the package governor - surgical chain-pin rewrites on the raw TOML lines and `cargo` upgrade driven through the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess).

  ets-hook-dsh-cargo-governor

- [ets-hook-dsh-package-governor](./plugins-ets-hook-dsh-package-governor.md) HOOK EFFECTTS

- [ets-hook-dsh-package-pinner](./plugins-ets-hook-dsh-package-pinner.md) HOOK EFFECTTS

- [ets-hook-dsh-cargo-governor](./plugins-ets-hook-dsh-cargo-governor.md) HOOK EFFECTTS

## Guardians

7 PACKAGES3 TWINS

The guardians watch the tool waterfall and the system prompt: they compress oversized results, coach the terminal, filter comments and inject live blocks.

- [hook-dsh-ccr](./plugins-hook-dsh-ccr.md) HOOK CLASSIC

  The tool-output compressor.

  ets-hook-dsh-ccr

- [hook-dsh-tool-coach](./plugins-hook-dsh-tool-coach.md) HOOK CLASSIC

  The terminal coach.

  ets-hook-dsh-tool-coach

- [hook-dsh-live-containers](./plugins-hook-dsh-live-containers.md) HOOK CLASSIC

  The live-containers hook.

  ets-hook-dsh-live-containers

- [hook-dsh-comment-filter](./plugins-hook-dsh-comment-filter.md) HOOK CLASSIC

- [ets-hook-dsh-ccr](./plugins-ets-hook-dsh-ccr.md) HOOK EFFECTTS

- [ets-hook-dsh-tool-coach](./plugins-ets-hook-dsh-tool-coach.md) HOOK EFFECTTS

- [ets-hook-dsh-live-containers](./plugins-ets-hook-dsh-live-containers.md) HOOK EFFECTTS

## Suggesters

15 PACKAGES7 TWINS

The suggesters propose companion searches, docs, edits, tests, replays and conventions from the signals a turn already produced, and the pattern graph records the learned ones.

- [hook-dsh-search-suggester](./plugins-hook-dsh-search-suggester.md) HOOK CLASSIC ets-hook-dsh-search-suggester
- [hook-dsh-edit-suggester](./plugins-hook-dsh-edit-suggester.md) HOOK CLASSIC ets-hook-dsh-edit-suggester
- [hook-dsh-doc-suggester](./plugins-hook-dsh-doc-suggester.md) HOOK CLASSIC ets-hook-dsh-doc-suggester
- [hook-dsh-convention-suggester](./plugins-hook-dsh-convention-suggester.md) HOOK CLASSIC ets-hook-dsh-convention-suggester
- [hook-dsh-graph-suggester](./plugins-hook-dsh-graph-suggester.md) HOOK CLASSIC ets-hook-dsh-graph-suggester
- [hook-dsh-replay-suggester](./plugins-hook-dsh-replay-suggester.md) HOOK CLASSIC ets-hook-dsh-replay-suggester
- [hook-dsh-test-suggester](./plugins-hook-dsh-test-suggester.md) HOOK CLASSIC ets-hook-dsh-test-suggester
- [plugin-dsh-pattern](./plugins-plugin-dsh-pattern.md) PLUGIN CLASSIC
- [ets-hook-dsh-search-suggester](./plugins-ets-hook-dsh-search-suggester.md) HOOK EFFECTTS
- [ets-hook-dsh-edit-suggester](./plugins-ets-hook-dsh-edit-suggester.md) HOOK EFFECTTS
- [ets-hook-dsh-doc-suggester](./plugins-ets-hook-dsh-doc-suggester.md) HOOK EFFECTTS
- [ets-hook-dsh-convention-suggester](./plugins-ets-hook-dsh-convention-suggester.md) HOOK EFFECTTS
- [ets-hook-dsh-graph-suggester](./plugins-ets-hook-dsh-graph-suggester.md) HOOK EFFECTTS
- [ets-hook-dsh-replay-suggester](./plugins-ets-hook-dsh-replay-suggester.md) HOOK EFFECTTS
- [ets-hook-dsh-test-suggester](./plugins-ets-hook-dsh-test-suggester.md) HOOK EFFECTTS

## Orchestration

15 PACKAGES6 TWINS

The orchestration plugins run multi-file batch edits, seat and dispatch subagents, enforce the routing law and carry proposals between agents.

- [plugin-dsh-batch-edit](./plugins-plugin-dsh-batch-edit.md) PLUGIN CLASSIC ets-plugin-dsh-batch-edit
- [plugin-dsh-batchstate](./plugins-plugin-dsh-batchstate.md) PLUGIN CLASSIC ets-plugin-dsh-batchstate
- [plugin-dsh-gitguard](./plugins-plugin-dsh-gitguard.md) PLUGIN CLASSIC ets-plugin-dsh-gitguard
- [plugin-dsh-route](./plugins-plugin-dsh-route.md) PLUGIN CLASSIC ets-plugin-dsh-route
- [plugin-dsh-queue](./plugins-plugin-dsh-queue.md) PLUGIN CLASSIC ets-plugin-dsh-queue
- [plugin-dsh-feedback](./plugins-plugin-dsh-feedback.md) PLUGIN CLASSIC ets-plugin-dsh-feedback
- [plugin-dsh-pass-on](./plugins-plugin-dsh-pass-on.md) PLUGIN CLASSIC
- [plugin-dsh-ingester](./plugins-plugin-dsh-ingester.md) PLUGIN CLASSIC
- [hook-dsh-batch-decision](./plugins-hook-dsh-batch-decision.md) HOOK CLASSIC
- [ets-plugin-dsh-batch-edit](./plugins-ets-plugin-dsh-batch-edit.md) PLUGIN EFFECTTS
- [ets-plugin-dsh-batchstate](./plugins-ets-plugin-dsh-batchstate.md) PLUGIN EFFECTTS
- [ets-plugin-dsh-gitguard](./plugins-ets-plugin-dsh-gitguard.md) PLUGIN EFFECTTS
- [ets-plugin-dsh-route](./plugins-ets-plugin-dsh-route.md) PLUGIN EFFECTTS
- [ets-plugin-dsh-queue](./plugins-ets-plugin-dsh-queue.md) PLUGIN EFFECTTS
- [ets-plugin-dsh-feedback](./plugins-ets-plugin-dsh-feedback.md) PLUGIN EFFECTTS

## Delivery

2 PACKAGES0 TWINS

The delivery family turns idle time into self-improvement: the review service runs the post-turn review and the nudge hook decides when it is due.

- [hook-dsh-lesson-nudge](./plugins-hook-dsh-lesson-nudge.md) HOOK CLASSIC
- [plugin-dsh-lesson-review](./plugins-plugin-dsh-lesson-review.md) PLUGIN CLASSIC

## Client

4 PACKAGES1 TWINS

The client packages render the family's surfaces inside the harness UI - the panel contract, the panel host and the workspace live view.

- [client-dsh-panel-family](./plugins-client-dsh-panel-family.md) CLIENT CLASSIC
- [client-dsh-panel-family-host](./plugins-client-dsh-panel-family-host.md) CLIENT CLASSIC
- [client-dsh-workspace-live](./plugins-client-dsh-workspace-live.md) CLIENT CLASSIC ets-client-dsh-workspace-live
- [ets-client-dsh-workspace-live](./plugins-ets-client-dsh-workspace-live.md) CLIENT EFFECTTS

## Cost and Telemetry

2 PACKAGES0 TWINS

The cost family prices every model call from the session log and splits the price across the files the conversation touched, then reads the same ledger back for contribution and efficiency answers.

- [plugin-dsh-cost](./plugins-plugin-dsh-cost.md) PLUGIN CLASSIC
- [plugin-dsh-cost-analysis](./plugins-plugin-dsh-cost-analysis.md) PLUGIN CLASSIC

The ten groups above carry all 106 packages - 58 Classic, 48 Effect-TS - and 47 of them have a twin in the other tree. Every count on this page sums the group data; nothing is hardcoded.

## Where the family operates

THE HARNESS SEAMS

The 106 packages attaching to the DeepSeek Harness through the fixed seam set - the [model stream waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts), the [filesystem events](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts), the tool layer, the [tools/post-execute waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md), the agent/pre-step step boundary, the commands service, the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess), the [jobs envelope](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/jobs), the [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain), the trace bus, the named storage domains, the client slot registry and the session ledger - with the DeepSeek internals each seam works through.

### The thirteen seams the family lives on

EVERY plugin operates inside the DeepSeek Harness through a fixed set of seams - the [model stream waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) , the [filesystem events](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) , the tool layer, the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) , the [jobs envelope](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/jobs), the [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain) , the trace bus, the named storage domains, the client slot registry and the session ledger.

This is where the 106 packages live, and the DeepSeek internals they work through:

| Seam | DeepSeek internal | Who operates it |
|----|----|----|
| [**llm/stream**](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) (the model stream waterfall) | [@deepseek-ai/dsh-llm](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm) (type-only stream vocabulary) | The six stream flavors |
| [**fs/observed + fs/write-intent**](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) | ctx.fs - [dsh-fs](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs) (local, sandbox, observation-policy) | The three governance hooks; the write executor behind EVERY tool write |
| **The tool layer** (write / edit / str_replace_editor + the registered tools) | [dsh-tool-fs](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/tool-fs) ; ctx.tools.register; ctx.tools.schemas() | raw-write (normalize + govern flags); normalize-file; the tool-coach's dynamic instruction fetch through `ctx.tools.schemas()` |
| **[tools/post-execute](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md)** (the tool-result waterfall) | The interceptable wrapper around every NORMALIZED dispatch result, before it becomes model content | ccr compression; the normalize flavors' tool-results overpass arm; tool-coach tier-1 notes |
| **[agent/pre-step](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/event-producer-consumer.md)** (the step-boundary waterfall) | The per-step payload (agent, messages, turn, step) + the next() decision | The normalize flavors' step-batch overpass arm; the tool-coach's user-message reset; ccr's phase-4 context-engine observer |
| **commands** (the command service) | Probe-once registration - a missing service simply skips it | The normalize family's `normalize-overpass` command; ccr's probe-once registration |
| **ctx.subprocess** | [dsh-subprocess](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) (fully-specified argv, no shell PATH drift) | The `cargo` governor's `cargo upgrade`; the `ncu` bin mode |
| **ctx.jobs** | The jobs envelope (kind governor-update) + the detached fallback | The two governors' update stages |
| [**The storage domain**](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain) | ctx.get("storageDomain") - the package_governance v2 records | Factory Journal; the normalize-file normalized events |
| **The trace bus** | `lib-dsh-trace` - 3 event names, the 5-field envelope, the 256-entry ring; the `ctx.trace` service | The 3 plugins carrying a `Source/Trace/` adapter (observe, graph, context) |
| **The named storage domains** | 15 named KV domains, one owner per domain - `pattern`, `batch_state`, `replay_history`, `package_governance`, `live_containers_monitors` | The pattern graph, the batch state, the replay suggester, the factory journal and the live-containers monitors |
| **The client slot registry** | The panel's child slots - the 3 client packages and the panel's 13 per-bundle adapter manifests | The panel contract, the panel host and the workspace live view |
| **Sessions / the ledgers** | The durable ledger files (\[\<ISO\>\] \<message\>) | The hook and tool packages, through the factory's Append |

## The smoke baseline

539 SUITES3656 CHECKS CLASSIC3172 EFFECT-TS

Every suite loading the REAL built Target of its bundle and asserting the ledger strings byte-identically - the Effect-TS tree held to the same bar, its swap-in gated on its own parity.

### The smokes are the arbiter

EVERY suite loads the REAL built Target of its bundle and asserts the ledger strings byte-identically.

The Effect-TS tree is held to the same bar. Its swap-in happens ONLY after its own smokes prove parity with these numbers.

| Suite | Checks | Suite | Checks |
|----|----|----|----|
| **[hook-dsh-ccr](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-ccr/Source)** | 147 | **[hook-dsh-tool-coach](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-tool-coach/Source)** | 139 |
| **lib-dsh-core** | 15 | **[hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source)** | 184 |
| **[plugin-dsh-factory](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source)** | 55 | **[hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source)** | 104 |
| **[hook-dsh-package-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-governor/Source)** | 80 | **[hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-ellipsis/Source)** | 104 |
| **[hook-dsh-package-pinner](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source)** | 32 | **[hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source)** | 104 |
| **[hook-dsh-cargo-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-cargo-governor/Source)** | 62 | **[hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/Source)** | 104 |
| **[plugin-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-normalize-file/Source)** | 112 | **[hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source)** | 104 |

The CLASSIC totals per suite against the EFFECT-TS totals on the same contracts - core 14, factory 44, governor 83 - summing to 1327 against Classic's 1346 across the 14 mechanics suites, with the family total at 6828 checks over 539 smoke folders. The ccr and tool-coach suites sit at 147 and 129 checks in BOTH trees (the new suites shipped with parity from day one).

### The checks are the CLASSIC counts

The EFFECT-TS suites add coverage on the same contracts (core 14, factory 44, governor 83 - 1327 across the 14 mechanics suites against Classic's 1346). The family total is 6828 checks across 539 smoke folders.

The two new suites shipped with parity: the ccr suite runs 147 checks in BOTH trees and the tool-coach suite 129 in BOTH. The ccr suite covers the gate order, the marker bytes, the round-trip retrieval and the context-engine math. The tool-coach suite covers the four tiers, the live fetch and the tracing-hygiene mode.

The two proofs side by side - the smokes proving the mechanics, the live battery proving the wiring - with the defects that were found live, not by the smokes.

### Why both exist

The smokes prove the mechanics. The live battery proves the wiring. The defects below were found live, not by the smokes - which is exactly why both exist.

## The failure cases that shaped it

FOUND LIVEFIXEDVERIFIED

The bundle's [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml) patch config replacing the entry config wholesale - the schema defaults (mutationTools) shadowed in deployment, the `raw-write`'s `fs/observed` never triggering the chain - and the fix adding `raw-write` to the three patch layers with the LIVE effective config verified from the bundle layers.

### The patch-layer config shadowing

LIVE-FOUNDFIXED

The bundle [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml) patch config REPLACES the entry config wholesale. The schema defaults (mutationTools) were shadowed in deployment. So the raw-write's fs/observed NEVER triggered the chain.

Solved: add raw-write to the three patch layers, and verify the LIVE effective config from the bundle layers. The Config inspect provider projects the schema, not the resolved config.

The multi-step direct-govern fold with every step writing the SAME observed version - only the first write succeeding, the later steps failing the stale-version check silently - and the fix: the sequential fold awaiting each step's chain with the chain pass statting the target before its write.

### The same-observed-version guard race

LIVE-FOUNDFIXED

In the multi-step direct-govern fold every step wrote with the SAME observed version. ONLY the first write could succeed. The later steps failed the stale-version check silently.

Solved: [the sequential fold](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts) awaits each step's chain, and the chain pass stats the target before its write (the fresh-version pattern). The fold converges in ANY step order.

The package_governance v2 domain open failing SILENTLY against the v1 file on the exact-equality version check - and the fix: per-record layout, compatibleVersions \[1\], backup-and-skip for invalid records, and a loud failure line.

### The P5 v2 storage open failure

LIVE-FOUNDFIXED

The package_governance [v2 domain](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Journal.ts) open failed SILENTLY against the v1 file (the exact-equality version check). The silence made it undiagnosable.

Solved: per-record layout + compatibleVersions \[1\] (76 v1 records auto-migrated) + backup-and-skip for invalid records + a loud failure line. Live-confirmed on the next boot.

A governed write re-firing [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) with the interlock re-entering the listeners by design - and the three bounds keeping the re-pass safe: the Stash idempotence gate, the P3/U2 refresh re-emitting with the same actor, and the live battery proving bounded, self-canonicalizing re-passes.

### The cross-module re-processing bound

BOUNDED BY DESIGNVERIFIED LIVE

A governed write re-fires fs/observed - the interlock re-enters the listeners by design.

Three bounds keep the re-pass safe. The Stash idempotence gate turns self re-entries into no-ops. The P3/U2 refresh re-emits with the same actor. The live battery proves the re-pass is bounded and self-canonicalizing (governed + pinned converge).

## The architecture in action

HOOKSDELEGATIONSINVERSIONS

The three attachment points: the [`llm/stream` waterfall wrap](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) (next() first, options untouched, per-chunk), the [`fs/observed` listeners](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) (sync, after content is on disk, fired by the tool layer only), and the tool registrations into the agent's toolset ([`raw-write`](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source), [normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-normalize-file/Source)).

### Hooks - where the family attaches

The [`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) waterfall wrap - next() first, options untouched, per-chunk.

The [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) listeners - sync, after content is on disk, fired by the tool layer ONLY.

And the tool registrations into the agent's toolset: `raw-write`, `normalize-file`.

The work splitting across the family: the [factory's Direct-govern steps](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source) (per basename, the `raw-write` govern selection), the [core's Dispatch/Settle envelope builder](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/lib-dsh-core/Source) (a new update stage reducing to a child runner plus strings), the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) for the external tools, and the Effect-TS services mirroring the same seams.

### Delegations - who does the work

The factory's Direct-govern steps (per basename, the raw-write govern selection). The core's Dispatch/Settle envelope builder - a new update stage reduces to a child runner plus strings.

The [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) carries the external tools. The Effect-TS services mirror the same seams.

The ownership boundaries: the Dependencies injection builders (every collection, child stage and string injected), the module-owned ledger strings (the byte-identical contract), the consumers bringing their own metal while the factory pours the mold, and the smokes as the arbiter after every change.

### Inversions - who owns what

The Dependencies injection builders - EVERY collection, child stage and string injected - and the module-owned ledger strings, the byte-identical contract.

The consumers bring their own metal while the factory pours the mold. The smokes are the arbiter after EVERY change.

The tools/post-execute waterfall shared by the new features: the normalize flavors' tool-results overpass arm registered { prepend: true } - the OUTERMOST prepend, so the ccr compression sees the NORMALIZED bytes - and the \`\<\<\<CCR:\` marker guard making any load order safe.

### The shared waterfall: the overpass arm and the CCR marker guard

The [ccr hook](./plugins-hook-dsh-ccr.md) and the [normalize flavors'](./plugins-hook-dsh-normalize-dash.md) tool-results overpass arm share the `tools/post-execute` waterfall. The overpass is the OUTERMOST prepend (`{ prepend: true }`), so the ccr compression sees the NORMALIZED bytes.

The `<<<CCR:` marker guard makes ANY load order safe. The marker passes through the whole normalize family untouched. A compressed result is NEVER re-normalized into a different marker.

<!--
## Source links

- [lib-dsh-core](./plugins-lib-dsh-core.md) - source: /plugins/lib-dsh-core/
- [plugin-dsh-factory](./plugins-plugin-dsh-factory.md) - source: /plugins/plugin-dsh-factory/
- [hook-dsh-package-governor](./plugins-hook-dsh-package-governor.md) - source: /plugins/hook-dsh-package-governor/
- [fs/observed](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts)
- [hook-dsh-package-pinner](./plugins-hook-dsh-package-pinner.md) - source: /plugins/hook-dsh-package-pinner/
- [pin-policy keep-list](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source/Function/Transform.ts)
- [hook-dsh-cargo-governor](./plugins-hook-dsh-cargo-governor.md) - source: /plugins/hook-dsh-cargo-governor/
- [subprocess seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess)
- [hook-dsh-normalize-dash](./plugins-hook-dsh-normalize-dash.md) - source: /plugins/hook-dsh-normalize-dash/
- [hook-dsh-normalize-quotes](./plugins-hook-dsh-normalize-quotes.md) - source: /plugins/hook-dsh-normalize-quotes/
- [hook-dsh-normalize-ellipsis](./plugins-hook-dsh-normalize-ellipsis.md) - source: /plugins/hook-dsh-normalize-ellipsis/
- [hook-dsh-normalize-spaces](./plugins-hook-dsh-normalize-spaces.md) - source: /plugins/hook-dsh-normalize-spaces/
- [hook-dsh-normalize-invisible](./plugins-hook-dsh-normalize-invisible.md) - source: /plugins/hook-dsh-normalize-invisible/
- [hook-dsh-normalize-fullwidth](./plugins-hook-dsh-normalize-fullwidth.md) - source: /plugins/hook-dsh-normalize-fullwidth/
- [plugin-dsh-normalize-file](./plugins-plugin-dsh-normalize-file.md) - source: /plugins/plugin-dsh-normalize-file/
- [hook-dsh-ccr](./plugins-hook-dsh-ccr.md) - source: /plugins/hook-dsh-ccr/
- [tools/post-execute](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md)
- [hook-dsh-tool-coach](./plugins-hook-dsh-tool-coach.md) - source: /plugins/hook-dsh-tool-coach/
- [lib-dsh-pack](./plugins-lib-dsh-pack.md) - source: /plugins/lib-dsh-pack/
- [lib-dsh-trace](./plugins-lib-dsh-trace.md) - source: /plugins/lib-dsh-trace/
- [ets-base-dsh](./plugins-ets-base-dsh.md) - source: /plugins/ets-base-dsh/
- [ets-lib-dsh-core](./plugins-ets-lib-dsh-core.md) - source: /plugins/ets-lib-dsh-core/
- [ets-plugin-dsh-factory](./plugins-ets-plugin-dsh-factory.md) - source: /plugins/ets-plugin-dsh-factory/
- [ets-lib-dsh-pack](./plugins-ets-lib-dsh-pack.md) - source: /plugins/ets-lib-dsh-pack/
- [ets-lib-dsh-trace](./plugins-ets-lib-dsh-trace.md) - source: /plugins/ets-lib-dsh-trace/
- [plugin-dsh-workspace](./plugins-plugin-dsh-workspace.md) - source: /plugins/plugin-dsh-workspace/
- [hook-dsh-workspace-observe](./plugins-hook-dsh-workspace-observe.md) - source: /plugins/hook-dsh-workspace-observe/
- [plugin-dsh-workspace-semantics](./plugins-plugin-dsh-workspace-semantics.md) - source: /plugins/plugin-dsh-workspace-semantics/
- [hook-dsh-workspace-operate](./plugins-hook-dsh-workspace-operate.md) - source: /plugins/hook-dsh-workspace-operate/
- [hook-dsh-workspace-govern](./plugins-hook-dsh-workspace-govern.md) - source: /plugins/hook-dsh-workspace-govern/
- [plugin-dsh-workspace-authority](./plugins-plugin-dsh-workspace-authority.md) - source: /plugins/plugin-dsh-workspace-authority/
- [hook-dsh-workspace-approve](./plugins-hook-dsh-workspace-approve.md) - source: /plugins/hook-dsh-workspace-approve/
- [hook-dsh-workspace-merge](./plugins-hook-dsh-workspace-merge.md) - source: /plugins/hook-dsh-workspace-merge/
- [hook-dsh-workspace-journal](./plugins-hook-dsh-workspace-journal.md) - source: /plugins/hook-dsh-workspace-journal/
- [hook-dsh-workspace-audit](./plugins-hook-dsh-workspace-audit.md) - source: /plugins/hook-dsh-workspace-audit/
- [plugin-dsh-workspace-context](./plugins-plugin-dsh-workspace-context.md) - source: /plugins/plugin-dsh-workspace-context/
- [hook-dsh-workspace-monitor](./plugins-hook-dsh-workspace-monitor.md) - source: /plugins/hook-dsh-workspace-monitor/
- [plugin-dsh-workspace-evidence](./plugins-plugin-dsh-workspace-evidence.md) - source: /plugins/plugin-dsh-workspace-evidence/
- [plugin-dsh-workspace-graph](./plugins-plugin-dsh-workspace-graph.md) - source: /plugins/plugin-dsh-workspace-graph/
- [plugin-dsh-workspace-reflect](./plugins-plugin-dsh-workspace-reflect.md) - source: /plugins/plugin-dsh-workspace-reflect/
- [lib-dsh-workspace-live](./plugins-lib-dsh-workspace-live.md) - source: /plugins/lib-dsh-workspace-live/
- [ets-plugin-dsh-workspace](./plugins-ets-plugin-dsh-workspace.md) - source: /plugins/ets-plugin-dsh-workspace/
- [ets-hook-dsh-workspace-observe](./plugins-ets-hook-dsh-workspace-observe.md) - source: /plugins/ets-hook-dsh-workspace-observe/
- [ets-plugin-dsh-workspace-semantics](./plugins-ets-plugin-dsh-workspace-semantics.md) - source: /plugins/ets-plugin-dsh-workspace-semantics/
- [ets-hook-dsh-workspace-operate](./plugins-ets-hook-dsh-workspace-operate.md) - source: /plugins/ets-hook-dsh-workspace-operate/
- [ets-hook-dsh-workspace-govern](./plugins-ets-hook-dsh-workspace-govern.md) - source: /plugins/ets-hook-dsh-workspace-govern/
- [ets-plugin-dsh-workspace-authority](./plugins-ets-plugin-dsh-workspace-authority.md) - source: /plugins/ets-plugin-dsh-workspace-authority/
- [ets-hook-dsh-workspace-approve](./plugins-ets-hook-dsh-workspace-approve.md) - source: /plugins/ets-hook-dsh-workspace-approve/
- [ets-hook-dsh-workspace-merge](./plugins-ets-hook-dsh-workspace-merge.md) - source: /plugins/ets-hook-dsh-workspace-merge/
- [ets-hook-dsh-workspace-journal](./plugins-ets-hook-dsh-workspace-journal.md) - source: /plugins/ets-hook-dsh-workspace-journal/
- [ets-hook-dsh-workspace-audit](./plugins-ets-hook-dsh-workspace-audit.md) - source: /plugins/ets-hook-dsh-workspace-audit/
- [ets-plugin-dsh-workspace-context](./plugins-ets-plugin-dsh-workspace-context.md) - source: /plugins/ets-plugin-dsh-workspace-context/
- [ets-hook-dsh-workspace-monitor](./plugins-ets-hook-dsh-workspace-monitor.md) - source: /plugins/ets-hook-dsh-workspace-monitor/
- [ets-plugin-dsh-workspace-evidence](./plugins-ets-plugin-dsh-workspace-evidence.md) - source: /plugins/ets-plugin-dsh-workspace-evidence/
- [ets-plugin-dsh-workspace-graph](./plugins-ets-plugin-dsh-workspace-graph.md) - source: /plugins/ets-plugin-dsh-workspace-graph/
- [ets-plugin-dsh-workspace-reflect](./plugins-ets-plugin-dsh-workspace-reflect.md) - source: /plugins/ets-plugin-dsh-workspace-reflect/
- [ets-lib-dsh-workspace-live](./plugins-ets-lib-dsh-workspace-live.md) - source: /plugins/ets-lib-dsh-workspace-live/
- [ets-hook-dsh-normalize-dash](./plugins-ets-hook-dsh-normalize-dash.md) - source: /plugins/ets-hook-dsh-normalize-dash/
- [ets-hook-dsh-normalize-quotes](./plugins-ets-hook-dsh-normalize-quotes.md) - source: /plugins/ets-hook-dsh-normalize-quotes/
- [ets-hook-dsh-normalize-ellipsis](./plugins-ets-hook-dsh-normalize-ellipsis.md) - source: /plugins/ets-hook-dsh-normalize-ellipsis/
- [ets-hook-dsh-normalize-spaces](./plugins-ets-hook-dsh-normalize-spaces.md) - source: /plugins/ets-hook-dsh-normalize-spaces/
- [ets-hook-dsh-normalize-invisible](./plugins-ets-hook-dsh-normalize-invisible.md) - source: /plugins/ets-hook-dsh-normalize-invisible/
- [ets-hook-dsh-normalize-fullwidth](./plugins-ets-hook-dsh-normalize-fullwidth.md) - source: /plugins/ets-hook-dsh-normalize-fullwidth/
- [ets-plugin-dsh-normalize-file](./plugins-ets-plugin-dsh-normalize-file.md) - source: /plugins/ets-plugin-dsh-normalize-file/
- [ets-hook-dsh-package-governor](./plugins-ets-hook-dsh-package-governor.md) - source: /plugins/ets-hook-dsh-package-governor/
- [ets-hook-dsh-package-pinner](./plugins-ets-hook-dsh-package-pinner.md) - source: /plugins/ets-hook-dsh-package-pinner/
- [ets-hook-dsh-cargo-governor](./plugins-ets-hook-dsh-cargo-governor.md) - source: /plugins/ets-hook-dsh-cargo-governor/
- [hook-dsh-live-containers](./plugins-hook-dsh-live-containers.md) - source: /plugins/hook-dsh-live-containers/
- [hook-dsh-comment-filter](./plugins-hook-dsh-comment-filter.md) - source: /plugins/hook-dsh-comment-filter/
- [ets-hook-dsh-ccr](./plugins-ets-hook-dsh-ccr.md) - source: /plugins/ets-hook-dsh-ccr/
- [ets-hook-dsh-tool-coach](./plugins-ets-hook-dsh-tool-coach.md) - source: /plugins/ets-hook-dsh-tool-coach/
- [ets-hook-dsh-live-containers](./plugins-ets-hook-dsh-live-containers.md) - source: /plugins/ets-hook-dsh-live-containers/
- [hook-dsh-search-suggester](./plugins-hook-dsh-search-suggester.md) - source: /plugins/hook-dsh-search-suggester/
- [hook-dsh-edit-suggester](./plugins-hook-dsh-edit-suggester.md) - source: /plugins/hook-dsh-edit-suggester/
- [hook-dsh-doc-suggester](./plugins-hook-dsh-doc-suggester.md) - source: /plugins/hook-dsh-doc-suggester/
- [hook-dsh-convention-suggester](./plugins-hook-dsh-convention-suggester.md) - source: /plugins/hook-dsh-convention-suggester/
- [hook-dsh-graph-suggester](./plugins-hook-dsh-graph-suggester.md) - source: /plugins/hook-dsh-graph-suggester/
- [hook-dsh-replay-suggester](./plugins-hook-dsh-replay-suggester.md) - source: /plugins/hook-dsh-replay-suggester/
- [hook-dsh-test-suggester](./plugins-hook-dsh-test-suggester.md) - source: /plugins/hook-dsh-test-suggester/
- [plugin-dsh-pattern](./plugins-plugin-dsh-pattern.md) - source: /plugins/plugin-dsh-pattern/
- [ets-hook-dsh-search-suggester](./plugins-ets-hook-dsh-search-suggester.md) - source: /plugins/ets-hook-dsh-search-suggester/
- [ets-hook-dsh-edit-suggester](./plugins-ets-hook-dsh-edit-suggester.md) - source: /plugins/ets-hook-dsh-edit-suggester/
- [ets-hook-dsh-doc-suggester](./plugins-ets-hook-dsh-doc-suggester.md) - source: /plugins/ets-hook-dsh-doc-suggester/
- [ets-hook-dsh-convention-suggester](./plugins-ets-hook-dsh-convention-suggester.md) - source: /plugins/ets-hook-dsh-convention-suggester/
- [ets-hook-dsh-graph-suggester](./plugins-ets-hook-dsh-graph-suggester.md) - source: /plugins/ets-hook-dsh-graph-suggester/
- [ets-hook-dsh-replay-suggester](./plugins-ets-hook-dsh-replay-suggester.md) - source: /plugins/ets-hook-dsh-replay-suggester/
- [ets-hook-dsh-test-suggester](./plugins-ets-hook-dsh-test-suggester.md) - source: /plugins/ets-hook-dsh-test-suggester/
- [plugin-dsh-batch-edit](./plugins-plugin-dsh-batch-edit.md) - source: /plugins/plugin-dsh-batch-edit/
- [plugin-dsh-batchstate](./plugins-plugin-dsh-batchstate.md) - source: /plugins/plugin-dsh-batchstate/
- [plugin-dsh-gitguard](./plugins-plugin-dsh-gitguard.md) - source: /plugins/plugin-dsh-gitguard/
- [plugin-dsh-route](./plugins-plugin-dsh-route.md) - source: /plugins/plugin-dsh-route/
- [plugin-dsh-queue](./plugins-plugin-dsh-queue.md) - source: /plugins/plugin-dsh-queue/
- [plugin-dsh-feedback](./plugins-plugin-dsh-feedback.md) - source: /plugins/plugin-dsh-feedback/
- [plugin-dsh-pass-on](./plugins-plugin-dsh-pass-on.md) - source: /plugins/plugin-dsh-pass-on/
- [plugin-dsh-ingester](./plugins-plugin-dsh-ingester.md) - source: /plugins/plugin-dsh-ingester/
- [hook-dsh-batch-decision](./plugins-hook-dsh-batch-decision.md) - source: /plugins/hook-dsh-batch-decision/
- [ets-plugin-dsh-batch-edit](./plugins-ets-plugin-dsh-batch-edit.md) - source: /plugins/ets-plugin-dsh-batch-edit/
- [ets-plugin-dsh-batchstate](./plugins-ets-plugin-dsh-batchstate.md) - source: /plugins/ets-plugin-dsh-batchstate/
- [ets-plugin-dsh-gitguard](./plugins-ets-plugin-dsh-gitguard.md) - source: /plugins/ets-plugin-dsh-gitguard/
- [ets-plugin-dsh-route](./plugins-ets-plugin-dsh-route.md) - source: /plugins/ets-plugin-dsh-route/
- [ets-plugin-dsh-queue](./plugins-ets-plugin-dsh-queue.md) - source: /plugins/ets-plugin-dsh-queue/
- [ets-plugin-dsh-feedback](./plugins-ets-plugin-dsh-feedback.md) - source: /plugins/ets-plugin-dsh-feedback/
- [hook-dsh-lesson-nudge](./plugins-hook-dsh-lesson-nudge.md) - source: /plugins/hook-dsh-lesson-nudge/
- [plugin-dsh-lesson-review](./plugins-plugin-dsh-lesson-review.md) - source: /plugins/plugin-dsh-lesson-review/
- [client-dsh-panel-family](./plugins-client-dsh-panel-family.md) - source: /plugins/client-dsh-panel-family/
- [client-dsh-panel-family-host](./plugins-client-dsh-panel-family-host.md) - source: /plugins/client-dsh-panel-family-host/
- [client-dsh-workspace-live](./plugins-client-dsh-workspace-live.md) - source: /plugins/client-dsh-workspace-live/
- [ets-client-dsh-workspace-live](./plugins-ets-client-dsh-workspace-live.md) - source: /plugins/ets-client-dsh-workspace-live/
- [plugin-dsh-cost](./plugins-plugin-dsh-cost.md) - source: /plugins/plugin-dsh-cost/
- [plugin-dsh-cost-analysis](./plugins-plugin-dsh-cost-analysis.md) - source: /plugins/plugin-dsh-cost-analysis/
- [model stream waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts)
- [jobs envelope](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/jobs)
- [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain)
- [@deepseek-ai/dsh-llm](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm)
- [dsh-fs](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs)
- [dsh-tool-fs](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/tool-fs)
- [agent/pre-step](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/event-producer-consumer.md)
- [hook-dsh-ccr](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-ccr/Source)
- [hook-dsh-tool-coach](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-tool-coach/Source)
- [hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source)
- [plugin-dsh-factory](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source)
- [hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source)
- [hook-dsh-package-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-governor/Source)
- [hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-ellipsis/Source)
- [hook-dsh-package-pinner](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source)
- [hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source)
- [hook-dsh-cargo-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-cargo-governor/Source)
- [hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/Source)
- [plugin-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-normalize-file/Source)
- [hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source)
- [The bundle's cordis.patch.yml patch config](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml)
- [the sequential fold](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts)
- [v2 domain](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Journal.ts)
- [core's Dispatch/Settle envelope builder](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/lib-dsh-core/Source)
- [Overview](./index.md) - source: /
- [Plugins](./plugins.md) - source: /plugins/
- [Showcase](./showcase.md) - source: /showcase/
- [Observatory](./explore.md) - source: /explore/
- [Timeline](./tl.md) - source: /tl/
- [Setup](./setup.md) - source: /setup/
- [Reference](./reference.md) - source: /reference/
- [Case study](./case-study.md) - source: /case-study/
- [Marketplace](./marketplace.md) - source: /marketplace/
- [Connect](./connect.md) - source: /connect/
-->
