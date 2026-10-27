[Skip to the interior](https://deepseek.playform.cloud/plugins/#interior-cab-01)
## THE MACHINERY
2 MODULES
MAC-01 [lib-dsh-core](https://deepseek.playform.cloud/plugins/lib-dsh-core/ "lib-dsh-core") ACTIVE
Lib @ DSH @ Core
15 CHECKS INSPECT +
The pure commonalities of the family (dependency-free in CLASSIC; effect-backed in EFFECT-TS): the section lists, the exclusion segments, the suppression composer, the policy loader, the refusal guard and the normalize/Stream machinery.
`$ dsh plugin --profile <name> add ./bundles/lib-dsh-core` COPY
[Open the MAC-01 module page](https://deepseek.playform.cloud/plugins/lib-dsh-core/)
MAC-02 [plugin-dsh-factory](https://deepseek.playform.cloud/plugins/plugin-dsh-factory/ "plugin-dsh-factory") ACTIVE
Plugin @ DSH @ Factory
55 CHECKS INSPECT +
The family's first service: the ledger, the exclusion match, the discovery, the keep-list union, the gate set, the version-guarded fenced write, the refresh, the detached contained continuation, the `State` builder, the wiring, the effects, the schema factory and the probe-once seam.
`$ dsh plugin --profile <name> add ./bundles/plugin-dsh-factory` COPY
[Open the MAC-02 module page](https://deepseek.playform.cloud/plugins/plugin-dsh-factory/)
## THE GOVERNORS
3 MODULES
GOV-01 [hook-dsh-package-governor](https://deepseek.playform.cloud/plugins/hook-dsh-package-governor/ "hook-dsh-package-governor") ACTIVE
Hook @ DSH @ Governor @ Package
80 CHECKS INSPECT +
The silent package.json governor. Hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts). Rewrites chain-governed pins to the effective registry's resolved versions. Runs the update stage as a detached, contained continuation.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-package-governor` COPY
[Open the GOV-01 module page](https://deepseek.playform.cloud/plugins/hook-dsh-package-governor/)
GOV-02 [hook-dsh-package-pinner](https://deepseek.playform.cloud/plugins/hook-dsh-package-pinner/ "hook-dsh-package-pinner") ACTIVE
Hook @ DSH @ Pinner @ Package
32 CHECKS INSPECT +
The silent package.json version pinner. Hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) and deterministically rewrites EVERY ranged dependency version to its static version. Protected by a [pin-policy keep-list](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source/Function/Transform.ts).
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-package-pinner` COPY
[Open the GOV-02 module page](https://deepseek.playform.cloud/plugins/hook-dsh-package-pinner/)
GOV-03 [hook-dsh-cargo-governor](https://deepseek.playform.cloud/plugins/hook-dsh-cargo-governor/ "hook-dsh-cargo-governor") ACTIVE
Hook @ DSH @ Governor @ Cargo
62 CHECKS INSPECT +
The Cargo.toml governor: the Rust-sided flavor of the package governor - surgical chain-pin rewrites on the raw TOML lines and `cargo` upgrade driven through the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess).
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-cargo-governor` COPY
[Open the GOV-03 module page](https://deepseek.playform.cloud/plugins/hook-dsh-cargo-governor/)
## THE FLOW
7 MODULES
NRM-01 [hook-dsh-normalize-dash](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-dash/ "hook-dsh-normalize-dash") ACTIVE
Hook @ DSH @ Normalize @ Dash
184 CHECKS INSPECT +
The dash flavor: normalizes the unicode dash family to ASCII hyphen-minus in model output streams, mirroring the core's dash class at the injection point a file hook lacks.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-dash` COPY
[Open the NRM-01 module page](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-dash/)
NRM-02 [hook-dsh-normalize-quotes](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-quotes/ "hook-dsh-normalize-quotes") ACTIVE
Hook @ DSH @ Normalize @ Quotes
104 CHECKS INSPECT +
The quotes flavor: maps the eight curly quote code points to their ASCII straight counterparts in model output streams.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-quotes` COPY
[Open the NRM-02 module page](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-quotes/)
NRM-03 [hook-dsh-normalize-ellipsis](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-ellipsis/ "hook-dsh-normalize-ellipsis") ACTIVE
Hook @ DSH @ Normalize @ Ellipsis
104 CHECKS INSPECT +
The ellipsis flavor: replaces the horizontal ellipsis (`U+2026`) with the plain ASCII three-dot sequence in model output streams.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-ellipsis` COPY
[Open the NRM-03 module page](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-ellipsis/)
NRM-04 [hook-dsh-normalize-spaces](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-spaces/ "hook-dsh-normalize-spaces") ACTIVE
Hook @ DSH @ Normalize @ Spaces
104 CHECKS INSPECT +
The spaces flavor: normalizes the unicode space family (Zs minus the ASCII space) to the plain space in model output streams.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-spaces` COPY
[Open the NRM-04 module page](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-spaces/)
NRM-05 [hook-dsh-normalize-invisible](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-invisible/ "hook-dsh-normalize-invisible") ACTIVE
Hook @ DSH @ Normalize @ Invisible
104 CHECKS INSPECT +
The invisible flavor: removes the zero-width/invisible character family (soft hyphen, zero-width spaces and joiners, bidi controls, BOM) from model output streams.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-invisible` COPY
[Open the NRM-05 module page](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-invisible/)
NRM-06 [hook-dsh-normalize-fullwidth](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-fullwidth/ "hook-dsh-normalize-fullwidth") ACTIVE
Hook @ DSH @ Normalize @ Fullwidth
104 CHECKS INSPECT +
The fullwidth flavor: maps the entire FULLWIDTH FORMS range (`U+FF01`-`U+FF5E`) to its ASCII half-width counterparts in model output streams.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-fullwidth` COPY
[Open the NRM-06 module page](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-fullwidth/)
NRM-07 [plugin-dsh-normalize-file](https://deepseek.playform.cloud/plugins/plugin-dsh-normalize-file/ "plugin-dsh-normalize-file") ACTIVE
Plugin @ DSH @ Normalize @ File
112 CHECKS INSPECT +
The file-content normalizer: the normalize-file tool - the read, count, write pipeline applying all six transforms to a file already on disk, writing ONLY when something changed.
`$ dsh plugin --profile <name> add ./bundles/plugin-dsh-normalize-file` COPY
[Open the NRM-07 module page](https://deepseek.playform.cloud/plugins/plugin-dsh-normalize-file/)
## THE SERVICES
2 MODULES
SVC-01 [hook-dsh-ccr](https://deepseek.playform.cloud/plugins/hook-dsh-ccr/ "hook-dsh-ccr") ACTIVE
hook-dsh-ccr
147 CHECKS INSPECT +
The tool-output compressor. Hooks the [tools/post-execute](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md) waterfall. Replaces oversized results of the allow-listed target tools with a one-line type-aware preview plus a `<<<CCR:hash|type|size>>>` retrieval marker. Gated on thresholdBytes x the per-type multipliers, with auto-expand returning small results FULL. The original stays retrievable through the registered ccr_retrieve tool over the sha256-24 LRU store.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-ccr` COPY
[Open the SVC-01 module page](https://deepseek.playform.cloud/plugins/hook-dsh-ccr/)
SVC-02 [hook-dsh-tool-coach](https://deepseek.playform.cloud/plugins/hook-dsh-tool-coach/ "hook-dsh-tool-coach") ACTIVE
Hook @ DSH @ Tool @ Coach
129 CHECKS INSPECT +
The terminal coach. Judges EVERY bash/pwsh call through a four-tier ladder - tier-0 ledger lines for every offense, tier-1 live-fetched coaching notes at the strike threshold, tier-2 a persistent system-prompt discipline section, tier-3 (opt-in) tools/pre-execute denies. Teaches the model to stop using the terminal for file content.
`$ dsh plugin --profile <name> add ./bundles/hook-dsh-tool-coach` COPY
[Open the SVC-02 module page](https://deepseek.playform.cloud/plugins/hook-dsh-tool-coach/)
14 MODULES
ALLMACHINERYGOVERNNORMALIZESERVICE
SCREEN 01 / 03
ECOSYSTEM: @PLAYFORM 0 PLUGINS
## Plugins
The 0 TypeScript packages of the DeepSeek Harness Plugin Family - 54 Classic plus 48 Effect-TS, 47 of them twins - each one a verified, smoke-arbitrated bundle.
The release identity follows the reversed hierarchical naming - the "@-sentence" identity. The scope stays @playform, and the family/type marker leads, so a package name reads as a sentence about what it is.
ALL 0 packages are UNPUBLISHED: no card promises a registry install. Every install row is the build-from-source route (dsh plugin --profile <name> add ./bundles/<pkg>); the /setup/ flow wires the bundle into a profile.
Filter registry: 102 RESULTS
ALL CORE & FACTORY GOVERNOR PINNER CCR COACH LIVE NORMALIZE WORKSPACE SUGGESTERS ORCHESTRATION CLIENT LIBRARIES Reset filters
102 PACKAGES DSH-REGISTRY
No packages match the active filters Broaden the search query or reset the filter chips above.
## Core & Factory
2 PLUGINS
[lib-dsh-core](https://deepseek.playform.cloud/plugins/lib-dsh-core/ "lib-dsh-core") @playform/lib-dsh-core - crescent-ringROLE: CORE
Lib @ DSH @ Core
The pure commonalities of the family (dependency-free in CLASSIC; effect-backed in EFFECT-TS): the section lists, the exclusion segments, the suppression composer, the policy loader, the refusal guard and the normalize/Stream machinery.
$ dsh plugin --profile <name> add ./bundles/lib-dsh-core COPY
[plugin-dsh-factory](https://deepseek.playform.cloud/plugins/plugin-dsh-factory/ "plugin-dsh-factory") @playform/plugin-dsh-factory - interlace-tileROLE: FACTORY
Plugin @ DSH @ Factory
The family's first service: the ledger, the exclusion match, the discovery, the keep-list union, the gate set, the version-guarded fenced write, the refresh, the detached contained continuation, the `State` builder, the wiring, the effects, the schema factory and the probe-once seam.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-factory COPY
## Governance
3 PLUGINS
[hook-dsh-package-governor](https://deepseek.playform.cloud/plugins/hook-dsh-package-governor/ "hook-dsh-package-governor") @playform/hook-dsh-package-governor - spike-starROLE: GOVERNOR
Hook @ DSH @ Governor @ Package
The silent package.json governor. Hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts). Rewrites chain-governed pins to the effective registry's resolved versions. Runs the update stage as a detached, contained continuation.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-package-governor COPY
[hook-dsh-package-pinner](https://deepseek.playform.cloud/plugins/hook-dsh-package-pinner/ "hook-dsh-package-pinner") @playform/hook-dsh-package-pinner - spike-starROLE: PINNER
Hook @ DSH @ Pinner @ Package
The silent package.json version pinner. Hooks [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) and deterministically rewrites EVERY ranged dependency version to its static version. Protected by a [pin-policy keep-list](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source/Function/Transform.ts).
$ dsh plugin --profile <name> add ./bundles/hook-dsh-package-pinner COPY
[hook-dsh-cargo-governor](https://deepseek.playform.cloud/plugins/hook-dsh-cargo-governor/ "hook-dsh-cargo-governor") @playform/hook-dsh-cargo-governor - spike-starROLE: GOVERNOR
Hook @ DSH @ Governor @ Cargo
The Cargo.toml governor: the Rust-sided flavor of the package governor - surgical chain-pin rewrites on the raw TOML lines and `cargo` upgrade driven through the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess).
$ dsh plugin --profile <name> add ./bundles/hook-dsh-cargo-governor COPY
## Guardians
2 PLUGINS
[hook-dsh-ccr](https://deepseek.playform.cloud/plugins/hook-dsh-ccr/ "hook-dsh-ccr") @playform/hook-dsh-ccr - spike-starROLE: COMPRESSOR
hook-dsh-ccr
The tool-output compressor. Hooks the [tools/post-execute](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md) waterfall. Replaces oversized results of the allow-listed target tools with a one-line type-aware preview plus a `<<<CCR:hash|type|size>>>` retrieval marker. Gated on thresholdBytes x the per-type multipliers, with auto-expand returning small results FULL. The original stays retrievable through the registered ccr_retrieve tool over the sha256-24 LRU store.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-ccr COPY
[hook-dsh-tool-coach](https://deepseek.playform.cloud/plugins/hook-dsh-tool-coach/ "hook-dsh-tool-coach") @playform/hook-dsh-tool-coach - spike-starROLE: COACH
Hook @ DSH @ Tool @ Coach
The terminal coach. Judges EVERY bash/pwsh call through a four-tier ladder - tier-0 ledger lines for every offense, tier-1 live-fetched coaching notes at the strike threshold, tier-2 a persistent system-prompt discipline section, tier-3 (opt-in) tools/pre-execute denies. Teaches the model to stop using the terminal for file content.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-tool-coach COPY
## Live prompt
1 PLUGIN - SHIPS DISABLED
[hook-dsh-live-containers](https://deepseek.playform.cloud/plugins/hook-dsh-live-containers/ "hook-dsh-live-containers") @playform/hook-dsh-live-containers - spike-starROLE: LIVE PROMPT
Hook @ DSH @ Live @ Containers
The live-containers hook. Keeps dynamic, modifiable conversation blocks in the system prompt. Each enabled block a labeled stanza recomputed at EVERY request (the canonical example: a time block always holding the current time at ask-time). Appended as ONE [system-prompt/assemble](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/event-producer-consumer.md) section with interpolate: false. Each block inside a fixed LIVE CONTAINER frame so the model cannot mistake it for harness state. Ships DISABLED - the IDLE-forever posture.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-live-containers COPY
## Normalize
7 PLUGINS - SIX STREAM FLAVORS + THE FILE TOOL
[hook-dsh-normalize-dash](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-dash/ "hook-dsh-normalize-dash") @playform/hook-dsh-normalize-dash - spike-starFLAVOR: DASH v0.2.0
Hook @ DSH @ Normalize @ Dash
The dash flavor: normalizes the unicode dash family to ASCII hyphen-minus in model output streams, mirroring the core's dash class at the injection point a file hook lacks.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-dash COPY
[hook-dsh-normalize-quotes](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-quotes/ "hook-dsh-normalize-quotes") @playform/hook-dsh-normalize-quotes - spike-starFLAVOR: QUOTES v0.2.0
Hook @ DSH @ Normalize @ Quotes
The quotes flavor: maps the eight curly quote code points to their ASCII straight counterparts in model output streams.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-quotes COPY
[hook-dsh-normalize-ellipsis](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-ellipsis/ "hook-dsh-normalize-ellipsis") @playform/hook-dsh-normalize-ellipsis - spike-starFLAVOR: ELLIPSIS v0.2.0
Hook @ DSH @ Normalize @ Ellipsis
The ellipsis flavor: replaces the horizontal ellipsis (`U+2026`) with the plain ASCII three-dot sequence in model output streams.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-ellipsis COPY
[hook-dsh-normalize-spaces](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-spaces/ "hook-dsh-normalize-spaces") @playform/hook-dsh-normalize-spaces - spike-starFLAVOR: SPACES v0.2.0
Hook @ DSH @ Normalize @ Spaces
The spaces flavor: normalizes the unicode space family (Zs minus the ASCII space) to the plain space in model output streams.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-spaces COPY
[hook-dsh-normalize-invisible](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-invisible/ "hook-dsh-normalize-invisible") @playform/hook-dsh-normalize-invisible - spike-starFLAVOR: INVISIBLE v0.2.0
Hook @ DSH @ Normalize @ Invisible
The invisible flavor: removes the zero-width/invisible character family (soft hyphen, zero-width spaces and joiners, bidi controls, BOM) from model output streams.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-invisible COPY
[hook-dsh-normalize-fullwidth](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-fullwidth/ "hook-dsh-normalize-fullwidth") @playform/hook-dsh-normalize-fullwidth - spike-starFLAVOR: FULLWIDTH v0.2.0
Hook @ DSH @ Normalize @ Fullwidth
The fullwidth flavor: maps the entire FULLWIDTH FORMS range (`U+FF01`-`U+FF5E`) to its ASCII half-width counterparts in model output streams.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-normalize-fullwidth COPY
[plugin-dsh-normalize-file](https://deepseek.playform.cloud/plugins/plugin-dsh-normalize-file/ "plugin-dsh-normalize-file") @playform/plugin-dsh-normalize-file - interlace-tileFLAVOR: FILE v0.2.0
Plugin @ DSH @ Normalize @ File
The file-content normalizer: the normalize-file tool - the read, count, write pipeline applying all six transforms to a file already on disk, writing ONLY when something changed.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-normalize-file COPY
## Workspace
16 PACKAGES16 TWINS0 CLASSIC ONLY
[plugin-dsh-workspace](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace/ "plugin-dsh-workspace") @playform/plugin-dsh-workspace - interlace-tileROLE: WORKSPACE AGENT ETS TWIN
The workspace agent: the operational view plus the four navigation tools (map/find/expand/context).
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-workspace COPY
[hook-dsh-workspace-observe](https://deepseek.playform.cloud/plugins/hook-dsh-workspace-observe/ "hook-dsh-workspace-observe") @playform/hook-dsh-workspace-observe - spike-starROLE: OBSERVE ETS TWIN
The first flow step: stamps every `fs/observed` version into the observation store.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-workspace-observe COPY
[plugin-dsh-workspace-semantics](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace-semantics/ "plugin-dsh-workspace-semantics") @playform/plugin-dsh-workspace-semantics - interlace-tileROLE: SEMANTICS ETS TWIN
The semantic model: resolves symbols and references, plans renames (the lexical TS adapter; the harness LSP service when present).
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-workspace-semantics COPY
[hook-dsh-workspace-operate](https://deepseek.playform.cloud/plugins/hook-dsh-workspace-operate/ "hook-dsh-workspace-operate") @playform/hook-dsh-workspace-operate - spike-starROLE: OPERATE ETS TWIN
The operation engine: typed proposals (rename/connect/replace) plus the refusal-to-guess.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-workspace-operate COPY
[hook-dsh-workspace-govern](https://deepseek.playform.cloud/plugins/hook-dsh-workspace-govern/ "hook-dsh-workspace-govern") @playform/hook-dsh-workspace-govern - spike-starROLE: GOVERN ETS TWIN
The gate: four means-checks on every tool call plus the recovery table.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-workspace-govern COPY
[plugin-dsh-workspace-authority](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace-authority/ "plugin-dsh-workspace-authority") @playform/plugin-dsh-workspace-authority - interlace-tileROLE: AUTHORITY ETS TWIN
The authority service: capability/lease/residency plus the eviction dispositions.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-workspace-authority COPY
[hook-dsh-workspace-approve](https://deepseek.playform.cloud/plugins/hook-dsh-workspace-approve/ "hook-dsh-workspace-approve") @playform/hook-dsh-workspace-approve - spike-starROLE: APPROVE ETS TWIN
The approval binder: exact-candidate bindings plus version invalidation.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-workspace-approve COPY
[hook-dsh-workspace-merge](https://deepseek.playform.cloud/plugins/hook-dsh-workspace-merge/ "hook-dsh-workspace-merge") @playform/hook-dsh-workspace-merge - spike-starROLE: MERGE ETS TWIN
The batch merge: atomic gates, per-file Factory.`Write` commits, the CommitReply union.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-workspace-merge COPY
[hook-dsh-workspace-journal](https://deepseek.playform.cloud/plugins/hook-dsh-workspace-journal/ "hook-dsh-workspace-journal") @playform/hook-dsh-workspace-journal - spike-starROLE: JOURNAL ETS TWIN
The journal: per-batch pre-images, revert, crash recovery.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-workspace-journal COPY
[hook-dsh-workspace-audit](https://deepseek.playform.cloud/plugins/hook-dsh-workspace-audit/ "hook-dsh-workspace-audit") @playform/hook-dsh-workspace-audit - spike-starROLE: AUDIT ETS TWIN
The audit lines: the accountability records.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-workspace-audit COPY
[plugin-dsh-workspace-context](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace-context/ "plugin-dsh-workspace-context") @playform/plugin-dsh-workspace-context - interlace-tileROLE: CONTEXT ETS TWIN
The orientation packet: WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS plus the token budget.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-workspace-context COPY
[hook-dsh-workspace-monitor](https://deepseek.playform.cloud/plugins/hook-dsh-workspace-monitor/ "hook-dsh-workspace-monitor") @playform/hook-dsh-workspace-monitor - spike-starROLE: MONITOR ETS TWIN
The monitor: watch/sweep check sets, clock-based.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-workspace-monitor COPY
[plugin-dsh-workspace-evidence](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace-evidence/ "plugin-dsh-workspace-evidence") @playform/plugin-dsh-workspace-evidence - interlace-tileROLE: EVIDENCE ETS TWIN
The evidence records: the four truth kinds plus invalidation.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-workspace-evidence COPY
[plugin-dsh-workspace-graph](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace-graph/ "plugin-dsh-workspace-graph") @playform/plugin-dsh-workspace-graph - interlace-tileROLE: GRAPH ETS TWIN
The graph: the file/symbol/block index, the KV store and the query (the v0 scanner).
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-workspace-graph COPY
[plugin-dsh-workspace-reflect](https://deepseek.playform.cloud/plugins/plugin-dsh-workspace-reflect/ "plugin-dsh-workspace-reflect") @playform/plugin-dsh-workspace-reflect - interlace-tileROLE: REFLECT ETS TWIN
The reflective ops: one-call rename/connect/replace through GuardedWrite (the harness AST/LSP service when present).
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-workspace-reflect COPY
[lib-dsh-workspace-live](https://deepseek.playform.cloud/plugins/lib-dsh-workspace-live/ "lib-dsh-workspace-live") @playform/lib-dsh-workspace-live - crescent-ringROLE: LIBRARY ETS TWIN
The shared client library: the section types and the render helpers. No plugin.
$ dsh plugin --profile <name> add ./bundles/lib-dsh-workspace-live COPY
## Suggesters
7 PACKAGES7 TWINS0 CLASSIC ONLY
[hook-dsh-search-suggester](https://deepseek.playform.cloud/plugins/hook-dsh-search-suggester/ "hook-dsh-search-suggester") @playform/hook-dsh-search-suggester - spike-starROLE: SUGGESTER ETS TWIN
Suggests companion searches from the post-execute signals (the graph projection).
$ dsh plugin --profile <name> add ./bundles/hook-dsh-search-suggester COPY
[hook-dsh-edit-suggester](https://deepseek.playform.cloud/plugins/hook-dsh-edit-suggester/ "hook-dsh-edit-suggester") @playform/hook-dsh-edit-suggester - spike-starROLE: SUGGESTER ETS TWIN
Suggests the convention companions after an edit.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-edit-suggester COPY
[hook-dsh-doc-suggester](https://deepseek.playform.cloud/plugins/hook-dsh-doc-suggester/ "hook-dsh-doc-suggester") @playform/hook-dsh-doc-suggester - spike-starROLE: SUGGESTER ETS TWIN
Suggests the doc-graph companions after a read or an edit.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-doc-suggester COPY
[hook-dsh-convention-suggester](https://deepseek.playform.cloud/plugins/hook-dsh-convention-suggester/ "hook-dsh-convention-suggester") @playform/hook-dsh-convention-suggester - spike-starROLE: SUGGESTER + LEARNER ETS TWIN
Suggests the naming/layout/ledger conventions - and carries the pack learner (D4).
$ dsh plugin --profile <name> add ./bundles/hook-dsh-convention-suggester COPY
[hook-dsh-graph-suggester](https://deepseek.playform.cloud/plugins/hook-dsh-graph-suggester/ "hook-dsh-graph-suggester") @playform/hook-dsh-graph-suggester - spike-starROLE: SUGGESTER ETS TWIN
Suggests the graph-neighborhood companions.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-graph-suggester COPY
[hook-dsh-replay-suggester](https://deepseek.playform.cloud/plugins/hook-dsh-replay-suggester/ "hook-dsh-replay-suggester") @playform/hook-dsh-replay-suggester - spike-starROLE: SUGGESTER ETS TWIN
Suggests replays from the recalled history record, fed by the trace bus.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-replay-suggester COPY
[hook-dsh-test-suggester](https://deepseek.playform.cloud/plugins/hook-dsh-test-suggester/ "hook-dsh-test-suggester") @playform/hook-dsh-test-suggester - spike-starROLE: SUGGESTER ETS TWIN
Suggests the test suites and coverage companions, reconciled against the graph's Test nodes.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-test-suggester COPY
## Orchestration
10 PACKAGES6 TWINS4 CLASSIC ONLY
[plugin-dsh-batch-edit](https://deepseek.playform.cloud/plugins/plugin-dsh-batch-edit/ "plugin-dsh-batch-edit") @playform/plugin-dsh-batch-edit - interlace-tileROLE: BATCH EDIT ETS TWIN
The batch edit engine: files as processes, one commit, governed writes, the atomic gate.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-batch-edit COPY
[plugin-dsh-batchstate](https://deepseek.playform.cloud/plugins/plugin-dsh-batchstate/ "plugin-dsh-batchstate") @playform/plugin-dsh-batchstate - interlace-tileROLE: BATCH STATE ETS TWIN
The live batch state board: members/tasks/queue plus the compiled context.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-batchstate COPY
[plugin-dsh-gitguard](https://deepseek.playform.cloud/plugins/plugin-dsh-gitguard/ "plugin-dsh-gitguard") @playform/plugin-dsh-gitguard - interlace-tileROLE: GIT GUARD ETS TWIN
The git guard: classifies and denies dangerous git commands.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-gitguard COPY
[plugin-dsh-route](https://deepseek.playform.cloud/plugins/plugin-dsh-route/ "plugin-dsh-route") @playform/plugin-dsh-route - interlace-tileROLE: ROUTING ETS TWIN
The routing enforcer: resolves and corrects the subagent model routes.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-route COPY
[plugin-dsh-queue](https://deepseek.playform.cloud/plugins/plugin-dsh-queue/ "plugin-dsh-queue") @playform/plugin-dsh-queue - interlace-tileROLE: QUEUE ETS TWIN
The subagent queue: seat/release, capacity, dispatch through the harness agent-team service.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-queue COPY
[plugin-dsh-feedback](https://deepseek.playform.cloud/plugins/plugin-dsh-feedback/ "plugin-dsh-feedback") @playform/plugin-dsh-feedback - interlace-tileROLE: FEEDBACK ETS TWIN
The honest feedback: intake/classify/summary plus the journal.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-feedback COPY
[plugin-dsh-pass-on](https://deepseek.playform.cloud/plugins/plugin-dsh-pass-on/ "plugin-dsh-pass-on") @playform/plugin-dsh-pass-on - interlace-tileROLE: PASS-ON CLASSIC ONLY
The pass-on: prepares and resolves proposals for the batch flow.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-pass-on COPY
[plugin-dsh-ingester](https://deepseek.playform.cloud/plugins/plugin-dsh-ingester/ "plugin-dsh-ingester") @playform/plugin-dsh-ingester - interlace-tileROLE: INGESTER CLASSIC ONLY
The ingester: validates and applies the approved proposals.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-ingester COPY
[plugin-dsh-pattern](https://deepseek.playform.cloud/plugins/plugin-dsh-pattern/ "plugin-dsh-pattern") @playform/plugin-dsh-pattern - interlace-tileROLE: PATTERN GRAPH CLASSIC ONLY
The pattern graph service: matches, records and decays the learned patterns.
$ dsh plugin --profile <name> add ./bundles/plugin-dsh-pattern COPY
[hook-dsh-batch-decision](https://deepseek.playform.cloud/plugins/hook-dsh-batch-decision/ "hook-dsh-batch-decision") @playform/hook-dsh-batch-decision - spike-starROLE: BATCH DECISION CLASSIC ONLY
The batch decision: the conservative auto-approve policy plus the decision tool.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-batch-decision COPY
## Client
3 PACKAGES1 TWIN2 CLASSIC ONLY
[client-dsh-panel-family](https://deepseek.playform.cloud/plugins/client-dsh-panel-family/ "client-dsh-panel-family") @playform/client-dsh-panel-family - quatrefoilROLE: PANEL CLASSIC ONLY
The panel contract: the playformFamilyPanel registry and the family tab.
$ dsh plugin --profile <name> add ./bundles/client-dsh-panel-family COPY
[client-dsh-panel-family-host](https://deepseek.playform.cloud/plugins/client-dsh-panel-family-host/ "client-dsh-panel-family-host") @playform/client-dsh-panel-family-host - quatrefoilROLE: PANEL HOST CLASSIC ONLY
The panel host half: the tail and stats endpoints.
$ dsh plugin --profile <name> add ./bundles/client-dsh-panel-family-host COPY
[client-dsh-workspace-live](https://deepseek.playform.cloud/plugins/client-dsh-workspace-live/ "client-dsh-workspace-live") @playform/client-dsh-workspace-live - quatrefoilROLE: LIVE VIEW ETS TWIN
The workspace live tab: stable-until-event presentation, ingesting the trace bus.
$ dsh plugin --profile <name> add ./bundles/client-dsh-workspace-live COPY
## Libraries
2 PACKAGES2 TWINS0 CLASSIC ONLY
[lib-dsh-trace](https://deepseek.playform.cloud/plugins/lib-dsh-trace/ "lib-dsh-trace") @playform/lib-dsh-trace - crescent-ringROLE: TRACE LIBRARY ETS TWIN
The trace bus's library half: the envelope, the event names, the guards, the detached loop. No plugin.
$ dsh plugin --profile <name> add ./bundles/lib-dsh-trace COPY
[lib-dsh-pack](https://deepseek.playform.cloud/plugins/lib-dsh-pack/ "lib-dsh-pack") @playform/lib-dsh-pack - crescent-ringROLE: PACK LIBRARY ETS TWIN
The pack layer's library: the pack schema, the YAML-subset parser, the layered resolution, the workspace gate. No plugin.
$ dsh plugin --profile <name> add ./bundles/lib-dsh-pack COPY
## Overpass
1 PACKAGES0 TWINS1 CLASSIC ONLY
[hook-dsh-comment-filter](https://deepseek.playform.cloud/plugins/hook-dsh-comment-filter/ "hook-dsh-comment-filter") @playform/hook-dsh-comment-filter - spike-starROLE: OVERPASS CLASSIC ONLY
The comment filter: strips code comments from read and ccr_retrieve results at tools/post-execute, gated per task intent.
$ dsh plugin --profile <name> add ./bundles/hook-dsh-comment-filter COPY
The groups carry the 39 packages the 2026-10-22 delivery, the completion program and the comment-filter addition brought - 32 with an ets- twin, 7 Classic-only. The family-wide twin census is 47 of 0 packages.
## The Effect-TS tree
48 PACKAGES47 TWINS + THE BASE
[ets-base-dsh](https://deepseek.playform.cloud/plugins/ets-base-dsh/ "ets-base-dsh") @playform/ets-base-dsh - crescent-ringEFFECT-TS THE BASE
@playform/ets-base-dsh - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-base-dsh COPY
[ets-client-dsh-workspace-live](https://deepseek.playform.cloud/plugins/ets-client-dsh-workspace-live/ "ets-client-dsh-workspace-live") @playform/ets-client-dsh-workspace-live - quatrefoilEFFECT-TS CLASSIC TWIN
@playform/ets-client-dsh-workspace-live - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-client-dsh-workspace-live COPY
[ets-hook-dsh-cargo-governor](https://deepseek.playform.cloud/plugins/ets-hook-dsh-cargo-governor/ "ets-hook-dsh-cargo-governor") @playform/ets-hook-dsh-cargo-governor - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-`cargo`-governor - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-cargo-governor COPY
[ets-hook-dsh-ccr](https://deepseek.playform.cloud/plugins/ets-hook-dsh-ccr/ "ets-hook-dsh-ccr") @playform/ets-hook-dsh-ccr - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-ccr - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-ccr COPY
[ets-hook-dsh-convention-suggester](https://deepseek.playform.cloud/plugins/ets-hook-dsh-convention-suggester/ "ets-hook-dsh-convention-suggester") @playform/ets-hook-dsh-convention-suggester - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-convention-suggester - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-convention-suggester COPY
[ets-hook-dsh-doc-suggester](https://deepseek.playform.cloud/plugins/ets-hook-dsh-doc-suggester/ "ets-hook-dsh-doc-suggester") @playform/ets-hook-dsh-doc-suggester - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-doc-suggester - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-doc-suggester COPY
[ets-hook-dsh-edit-suggester](https://deepseek.playform.cloud/plugins/ets-hook-dsh-edit-suggester/ "ets-hook-dsh-edit-suggester") @playform/ets-hook-dsh-edit-suggester - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-edit-suggester - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-edit-suggester COPY
[ets-hook-dsh-graph-suggester](https://deepseek.playform.cloud/plugins/ets-hook-dsh-graph-suggester/ "ets-hook-dsh-graph-suggester") @playform/ets-hook-dsh-graph-suggester - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-graph-suggester - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-graph-suggester COPY
[ets-hook-dsh-live-containers](https://deepseek.playform.cloud/plugins/ets-hook-dsh-live-containers/ "ets-hook-dsh-live-containers") @playform/ets-hook-dsh-live-containers - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-live-containers - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-live-containers COPY
[ets-hook-dsh-normalize-dash](https://deepseek.playform.cloud/plugins/ets-hook-dsh-normalize-dash/ "ets-hook-dsh-normalize-dash") @playform/ets-hook-dsh-normalize-dash - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-normalize-dash - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-normalize-dash COPY
[ets-hook-dsh-normalize-ellipsis](https://deepseek.playform.cloud/plugins/ets-hook-dsh-normalize-ellipsis/ "ets-hook-dsh-normalize-ellipsis") @playform/ets-hook-dsh-normalize-ellipsis - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-normalize-ellipsis - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-normalize-ellipsis COPY
[ets-hook-dsh-normalize-fullwidth](https://deepseek.playform.cloud/plugins/ets-hook-dsh-normalize-fullwidth/ "ets-hook-dsh-normalize-fullwidth") @playform/ets-hook-dsh-normalize-fullwidth - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-normalize-fullwidth - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-normalize-fullwidth COPY
[ets-hook-dsh-normalize-invisible](https://deepseek.playform.cloud/plugins/ets-hook-dsh-normalize-invisible/ "ets-hook-dsh-normalize-invisible") @playform/ets-hook-dsh-normalize-invisible - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-normalize-invisible - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-normalize-invisible COPY
[ets-hook-dsh-normalize-quotes](https://deepseek.playform.cloud/plugins/ets-hook-dsh-normalize-quotes/ "ets-hook-dsh-normalize-quotes") @playform/ets-hook-dsh-normalize-quotes - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-normalize-quotes - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-normalize-quotes COPY
[ets-hook-dsh-normalize-spaces](https://deepseek.playform.cloud/plugins/ets-hook-dsh-normalize-spaces/ "ets-hook-dsh-normalize-spaces") @playform/ets-hook-dsh-normalize-spaces - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-normalize-spaces - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-normalize-spaces COPY
[ets-hook-dsh-package-governor](https://deepseek.playform.cloud/plugins/ets-hook-dsh-package-governor/ "ets-hook-dsh-package-governor") @playform/ets-hook-dsh-package-governor - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-package-governor - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-package-governor COPY
[ets-hook-dsh-package-pinner](https://deepseek.playform.cloud/plugins/ets-hook-dsh-package-pinner/ "ets-hook-dsh-package-pinner") @playform/ets-hook-dsh-package-pinner - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-package-pinner - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-package-pinner COPY
[ets-hook-dsh-replay-suggester](https://deepseek.playform.cloud/plugins/ets-hook-dsh-replay-suggester/ "ets-hook-dsh-replay-suggester") @playform/ets-hook-dsh-replay-suggester - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-replay-suggester - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-replay-suggester COPY
[ets-hook-dsh-search-suggester](https://deepseek.playform.cloud/plugins/ets-hook-dsh-search-suggester/ "ets-hook-dsh-search-suggester") @playform/ets-hook-dsh-search-suggester - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-search-suggester - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-search-suggester COPY
[ets-hook-dsh-test-suggester](https://deepseek.playform.cloud/plugins/ets-hook-dsh-test-suggester/ "ets-hook-dsh-test-suggester") @playform/ets-hook-dsh-test-suggester - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-test-suggester - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-test-suggester COPY
[ets-hook-dsh-tool-coach](https://deepseek.playform.cloud/plugins/ets-hook-dsh-tool-coach/ "ets-hook-dsh-tool-coach") @playform/ets-hook-dsh-tool-coach - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-tool-coach - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-tool-coach COPY
[ets-hook-dsh-workspace-approve](https://deepseek.playform.cloud/plugins/ets-hook-dsh-workspace-approve/ "ets-hook-dsh-workspace-approve") @playform/ets-hook-dsh-workspace-approve - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-workspace-approve - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-workspace-approve COPY
[ets-hook-dsh-workspace-audit](https://deepseek.playform.cloud/plugins/ets-hook-dsh-workspace-audit/ "ets-hook-dsh-workspace-audit") @playform/ets-hook-dsh-workspace-audit - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-workspace-audit - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-workspace-audit COPY
[ets-hook-dsh-workspace-govern](https://deepseek.playform.cloud/plugins/ets-hook-dsh-workspace-govern/ "ets-hook-dsh-workspace-govern") @playform/ets-hook-dsh-workspace-govern - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-workspace-govern - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-workspace-govern COPY
[ets-hook-dsh-workspace-journal](https://deepseek.playform.cloud/plugins/ets-hook-dsh-workspace-journal/ "ets-hook-dsh-workspace-journal") @playform/ets-hook-dsh-workspace-journal - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-workspace-journal - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-workspace-journal COPY
[ets-hook-dsh-workspace-merge](https://deepseek.playform.cloud/plugins/ets-hook-dsh-workspace-merge/ "ets-hook-dsh-workspace-merge") @playform/ets-hook-dsh-workspace-merge - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-workspace-merge - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-workspace-merge COPY
[ets-hook-dsh-workspace-monitor](https://deepseek.playform.cloud/plugins/ets-hook-dsh-workspace-monitor/ "ets-hook-dsh-workspace-monitor") @playform/ets-hook-dsh-workspace-monitor - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-workspace-monitor - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-workspace-monitor COPY
[ets-hook-dsh-workspace-observe](https://deepseek.playform.cloud/plugins/ets-hook-dsh-workspace-observe/ "ets-hook-dsh-workspace-observe") @playform/ets-hook-dsh-workspace-observe - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-workspace-observe - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-workspace-observe COPY
[ets-hook-dsh-workspace-operate](https://deepseek.playform.cloud/plugins/ets-hook-dsh-workspace-operate/ "ets-hook-dsh-workspace-operate") @playform/ets-hook-dsh-workspace-operate - spike-starEFFECT-TS CLASSIC TWIN
@playform/ets-hook-dsh-workspace-operate - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-hook-dsh-workspace-operate COPY
[ets-lib-dsh-core](https://deepseek.playform.cloud/plugins/ets-lib-dsh-core/ "ets-lib-dsh-core") @playform/ets-lib-dsh-core - crescent-ringEFFECT-TS CLASSIC TWIN
@playform/ets-lib-dsh-core - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-lib-dsh-core COPY
[ets-lib-dsh-pack](https://deepseek.playform.cloud/plugins/ets-lib-dsh-pack/ "ets-lib-dsh-pack") @playform/ets-lib-dsh-pack - crescent-ringEFFECT-TS CLASSIC TWIN
@playform/ets-lib-dsh-pack - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-lib-dsh-pack COPY
[ets-lib-dsh-trace](https://deepseek.playform.cloud/plugins/ets-lib-dsh-trace/ "ets-lib-dsh-trace") @playform/ets-lib-dsh-trace - crescent-ringEFFECT-TS CLASSIC TWIN
@playform/ets-lib-dsh-trace - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-lib-dsh-trace COPY
[ets-lib-dsh-workspace-live](https://deepseek.playform.cloud/plugins/ets-lib-dsh-workspace-live/ "ets-lib-dsh-workspace-live") @playform/ets-lib-dsh-workspace-live - crescent-ringEFFECT-TS CLASSIC TWIN
@playform/ets-lib-dsh-workspace-live - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-lib-dsh-workspace-live COPY
[ets-plugin-dsh-batch-edit](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-batch-edit/ "ets-plugin-dsh-batch-edit") @playform/ets-plugin-dsh-batch-edit - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-batch-edit - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-batch-edit COPY
[ets-plugin-dsh-batchstate](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-batchstate/ "ets-plugin-dsh-batchstate") @playform/ets-plugin-dsh-batchstate - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-batchstate - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-batchstate COPY
[ets-plugin-dsh-factory](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-factory/ "ets-plugin-dsh-factory") @playform/ets-plugin-dsh-factory - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-factory - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-factory COPY
[ets-plugin-dsh-feedback](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-feedback/ "ets-plugin-dsh-feedback") @playform/ets-plugin-dsh-feedback - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-feedback - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-feedback COPY
[ets-plugin-dsh-gitguard](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-gitguard/ "ets-plugin-dsh-gitguard") @playform/ets-plugin-dsh-gitguard - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-gitguard - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-gitguard COPY
[ets-plugin-dsh-normalize-file](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-normalize-file/ "ets-plugin-dsh-normalize-file") @playform/ets-plugin-dsh-normalize-file - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-normalize-file - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-normalize-file COPY
[ets-plugin-dsh-queue](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-queue/ "ets-plugin-dsh-queue") @playform/ets-plugin-dsh-queue - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-queue - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-queue COPY
[ets-plugin-dsh-route](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-route/ "ets-plugin-dsh-route") @playform/ets-plugin-dsh-route - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-route - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-route COPY
[ets-plugin-dsh-workspace](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-workspace/ "ets-plugin-dsh-workspace") @playform/ets-plugin-dsh-workspace - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-workspace - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-workspace COPY
[ets-plugin-dsh-workspace-authority](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-workspace-authority/ "ets-plugin-dsh-workspace-authority") @playform/ets-plugin-dsh-workspace-authority - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-workspace-authority - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-workspace-authority COPY
[ets-plugin-dsh-workspace-context](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-workspace-context/ "ets-plugin-dsh-workspace-context") @playform/ets-plugin-dsh-workspace-context - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-workspace-context - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-workspace-context COPY
[ets-plugin-dsh-workspace-evidence](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-workspace-evidence/ "ets-plugin-dsh-workspace-evidence") @playform/ets-plugin-dsh-workspace-evidence - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-workspace-evidence - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-workspace-evidence COPY
[ets-plugin-dsh-workspace-graph](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-workspace-graph/ "ets-plugin-dsh-workspace-graph") @playform/ets-plugin-dsh-workspace-graph - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-workspace-graph - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-workspace-graph COPY
[ets-plugin-dsh-workspace-reflect](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-workspace-reflect/ "ets-plugin-dsh-workspace-reflect") @playform/ets-plugin-dsh-workspace-reflect - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-workspace-reflect - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-workspace-reflect COPY
[ets-plugin-dsh-workspace-semantics](https://deepseek.playform.cloud/plugins/ets-plugin-dsh-workspace-semantics/ "ets-plugin-dsh-workspace-semantics") @playform/ets-plugin-dsh-workspace-semantics - interlace-tileEFFECT-TS CLASSIC TWIN
@playform/ets-plugin-dsh-workspace-semantics - the Effect-TS build of the family.
$ dsh plugin --profile <name> add ./bundles/ets-plugin-dsh-workspace-semantics COPY
## Registered pipeline manifest plugins
THE 15 LEGACY MODULES
The 15 legacy modules, in the order they operate over the active PlayForm runtime. The registry above carries all 0 packages.  
| Seq  | Plugin Coordinate  | Ontology @-Sentence  | Target Rules  | Action  |  
| --- | --- | --- | --- | --- |  
| **@playform/lib-dsh-core**  | Lib @ DSH @ Core  | Sections • exclusions • suppression • policy  | ACTIVE  |  
| **@playform/plugin-dsh-factory**  | Plugin @ DSH @ Factory  | Sections • exclusions • suppression • policy  | ACTIVE  |  
| **@playform/hook-dsh-package-governor**  | Hook @ DSH @ Governor @ Package  | Manifest • chain pins • update stages  | ACTIVE  |  
| **@playform/hook-dsh-package-pinner**  | Hook @ DSH @ Pinner @ Package  | Manifest • chain pins • update stages  | ACTIVE  |  
| **@playform/hook-dsh-cargo-governor**  | Hook @ DSH @ Governor @ Cargo  | Manifest • chain pins • update stages  | ACTIVE  |  
| **@playform/hook-dsh-normalize-dash**  | Hook @ DSH @ Normalize @ Dash  | Stream gate • single-pass transform  | ACTIVE  |  
| **@playform/hook-dsh-normalize-quotes**  | Hook @ DSH @ Normalize @ Quotes  | Stream gate • single-pass transform  | ACTIVE  |  
| **@playform/hook-dsh-normalize-ellipsis**  | Hook @ DSH @ Normalize @ Ellipsis  | Stream gate • single-pass transform  | ACTIVE  |  
| **@playform/hook-dsh-normalize-spaces**  | Hook @ DSH @ Normalize @ Spaces  | Stream gate • single-pass transform  | ACTIVE  |  
| **@playform/hook-dsh-normalize-invisible**  | Hook @ DSH @ Normalize @ Invisible  | Stream gate • single-pass transform  | ACTIVE  |  
| **@playform/hook-dsh-normalize-fullwidth**  | Hook @ DSH @ Normalize @ Fullwidth  | Stream gate • single-pass transform  | ACTIVE  |  
| **@playform/plugin-dsh-normalize-file**  | Plugin @ DSH @ Normalize @ File  | Stream gate • single-pass transform  | ACTIVE  |  
| **@playform/hook-dsh-ccr**  | hook-dsh-ccr  | Tool results - compress - cache - retrieve  | ACTIVE  |  
| **@playform/hook-dsh-tool-coach**  | Hook @ DSH @ Tool @ Coach  | Terminal judge - coach ladder - deny  | ACTIVE  |  
| **@playform/hook-dsh-live-containers**  | Hook @ DSH @ Live @ Containers  | System prompt - live blocks - volatile knobs  | ACTIVE  |  
## Where the family operates
THE HARNESS SEAMS
The 105 pluginsThe model stream waterfallThe filesystem eventsThe tool layerThe tools/post-executewaterfallThe agent/pre-step stepboundaryThe commands serviceThe subprocess seamThe jobs envelopeThe storage domainThe session ledger
The 0 packages attaching to the DeepSeek Harness through the fixed seam set - the [model stream waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts), the [filesystem events](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts), the tool layer, the [tools/post-execute waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/docs/subsystems/tools.md), the agent/pre-step step boundary, the commands service, the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess), the [jobs envelope](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/jobs), the [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain), the trace bus, the named storage domains, the client slot registry and the session ledger - with the DeepSeek internals each seam works through.
###  The thirteen seams the family lives on
EVERY plugin operates inside the DeepSeek Harness through a fixed set of seams - the [model stream waterfall](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) , the [filesystem events](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) , the tool layer, the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) , the [jobs envelope](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/jobs), the [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain), the trace bus, the named storage domains, the client slot registry and the session ledger.
This is where the 0 packages live, and the DeepSeek internals they work through:  
| Seam  | DeepSeek internal  | Who operates it  |  
| --- | --- | --- |  
|  [**llm/stream**](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) (the model stream waterfall)  |  [@deepseek-ai/dsh-llm](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm) (type-only stream vocabulary)  | The six stream flavors  |  
| [**fs/observed + fs/write-intent**](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts)  | ctx.fs - [dsh-fs](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs) (local, sandbox, observation-policy)  | The three governance hooks; the write executor behind EVERY tool write  |  
|  **The tool layer** (write / edit / str_replace_editor + the registered tools)  |  [dsh-tool-fs](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/tool-fs) ; ctx.tools.register; ctx.tools.schemas()  | raw-write (normalize + govern flags); normalize-file; the tool-coach's dynamic instruction fetch through `ctx.tools.schemas()`  |  
|  (the tool-result waterfall)  | The interceptable wrapper around every NORMALIZED dispatch result, before it becomes model content  | ccr compression; the normalize flavors' tool-results overpass arm; tool-coach tier-1 notes  |  
|  (the step-boundary waterfall)  | The per-step payload (agent, messages, turn, step) + the next() decision  | The normalize flavors' step-batch overpass arm; the tool-coach's user-message reset; ccr's phase-4 context-engine observer  |  
|  **commands** (the command service)  | Probe-once registration - a missing service simply skips it  | The normalize family's `normalize-overpass` command; ccr's probe-once registration  |  
| **ctx.subprocess**  |  [dsh-subprocess](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) (fully-specified argv, no shell PATH drift)  | The `cargo` governor's `cargo upgrade`; the `ncu` bin mode  |  
| **ctx.jobs**  | The jobs envelope (kind governor-update) + the detached fallback  | The two governors' update stages  |  
| ctx.get("storageDomain") - the package_governance v2 records  | Factory Journal; the normalize-file normalized events  |  
| **The trace bus**  |  `lib-dsh-trace` - 3 event names, the 5-field envelope, the 256-entry ring; the `ctx.trace` service  | The 3 plugins carrying a `Source/Trace/` adapter (observe, graph, context)  |  
| **The named storage domains**  | 14 named KV domains, one owner per domain - `pattern`, `batch_state`, `replay_history`, `package_governance`, `live_containers_monitors`  | The pattern graph, the batch state, the replay suggester, the factory journal and the live-containers monitors  |  
| **The client slot registry**  | The panel's child slots - the 3 client packages and the panel's 13 per-bundle adapter manifests  | The panel contract, the panel host and the workspace live view  |  
| **Sessions / the ledgers**  | The durable ledger files ([<ISO>] <message>)  | The hook and tool packages, through the factory's Append  |  
## The smoke baseline
0 SUITES3500 CHECKS CLASSIC3173 EFFECT-TS
Every suiteLoads the REAL built Targetof its bundleAsserting the ledger stringsbyte-identicallyThe Effect-TS treeheld to the same barIts swap-in gated on its ownparity
Every suite loading the REAL built Target of its bundle and asserting the ledger strings byte-identically - the Effect-TS tree held to the same bar, its swap-in gated on its own parity.
###  The smokes are the arbiter
EVERY suite loads the REAL built Target of its bundle and asserts the ledger strings byte-identically.
The Effect-TS tree is held to the same bar. Its swap-in happens ONLY after its own smokes prove parity with these numbers.  
| Suite  | Checks  | Suite  | Checks  |  
| --- | --- | --- | --- |  
|   | 147  |   | 129  |  
| **lib-dsh-core**  | 15  | **[hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source)**  | 184  |  
|   | 55  | **[hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source)**  | 104  |  
| **[hook-dsh-package-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-governor/Source)**  | 80  | **[hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-ellipsis/Source)**  | 104  |  
| **[hook-dsh-package-pinner](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source)**  | 32  | **[hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source)**  | 104  |  
| **[hook-dsh-cargo-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-cargo-governor/Source)**  | 62  | **[hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/Source)**  | 104  |  
| **[plugin-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-normalize-file/Source)**  | 112  | **[hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source)**  | 104  |  
The CLASSIC totals per suite -3640The EFFECT-TS totals on thesame contractscore 14 - factory 44 -governor 83Summing to 3172 vs Classic's3640
The CLASSIC totals per suite against the EFFECT-TS totals on the same contracts - core 14, factory 44, governor 83 - summing to 1327 against Classic's 1336 across the 14 mechanics suites, with the family total at 6673 checks over 0 smoke folders. The ccr and tool-coach suites sit at 147 and 129 checks in BOTH trees (the new suites shipped with parity from day one).
###  The checks are the CLASSIC counts
The EFFECT-TS suites add coverage on the same contracts (core 14, factory 44, governor 83 - 1327 across the 14 mechanics suites against Classic's 1336). The family total is 6673 checks across 0 smoke folders.
The two new suites shipped with parity: the ccr suite runs 147 checks in BOTH trees and the tool-coach suite 129 in BOTH. The ccr suite covers the gate order, the marker bytes, the round-trip retrieval and the context-engine math. The tool-coach suite covers the four tiers, the live fetch and the tracing-hygiene mode.
The smokes - proving themechanicsThe live battery - proving thewiringThe defects that were foundlivenot by the smokes
The two proofs side by side - the smokes proving the mechanics, the live battery proving the wiring - with the defects that were found live, not by the smokes.
###  Why both exist
The smokes prove the mechanics. The live battery proves the wiring. The defects below were found live, not by the smokes - which is exactly why both exist.
## The failure cases that shaped it
FOUND LIVEFIXEDVERIFIED
[The bundle's cordis.patch.ymlpatch config](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml)Replaces the entry configwholesaleThe schema defaults -mutationToolsshadowed in deploymentThe raw-write's fs/observednever triggering the chainThe fix - adding raw-write tothe three patch layersThe LIVE effective configverifiedfrom the bundle layers
The bundle's [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml) patch config replacing the entry config wholesale - the schema defaults (mutationTools) shadowed in deployment, the `raw-write`'s `fs/observed` never triggering the chain - and the fix adding `raw-write` to the three patch layers with the LIVE effective config verified from the bundle layers.
###  The patch-layer config shadowing
LIVE-FOUNDFIXED
The bundle [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml) patch config REPLACES the entry config wholesale. The schema defaults (mutationTools) were shadowed in deployment. So the raw-write's fs/observed NEVER triggered the chain.
Solved: add raw-write to the three patch layers, and verify the LIVE effective config from the bundle layers. The Config inspect provider projects the schema, not the resolved config.
The multi-step direct-governfoldEvery step writing the SAMEobserved versionOnly the first write succeedingThe later steps failing thestale-versioncheck silentlyThe fix - the sequential foldawaitingeach step's chainThe chain pass statting thetargetbefore its write
The multi-step direct-govern fold with every step writing the SAME observed version - only the first write succeeding, the later steps failing the stale-version check silently - and the fix: the sequential fold awaiting each step's chain with the chain pass statting the target before its write.
###  The same-observed-version guard race
LIVE-FOUNDFIXED
In the multi-step direct-govern fold every step wrote with the SAME observed version. ONLY the first write could succeed. The later steps failed the stale-version check silently.
Solved: [the sequential fold](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts) awaits each step's chain, and the chain pass stats the target before its write (the fresh-version pattern). The fold converges in ANY step order.
The package_governance v2domain openfailing SILENTLY against the v1fileThe exact-equality versioncheckThe fix - per-record layoutcompatibleVersions [1]Backup-and-skip for invalidrecordsAnd a loud failure line
The package_governance v2 domain open failing SILENTLY against the v1 file on the exact-equality version check - and the fix: per-record layout, compatibleVersions [1], backup-and-skip for invalid records, and a loud failure line.
###  The P5 v2 storage open failure
LIVE-FOUNDFIXED
The package_governance [v2 domain](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Journal.ts) open failed SILENTLY against the v1 file (the exact-equality version check). The silence made it undiagnosable.
Solved: per-record layout + compatibleVersions [1] (76 v1 records auto-migrated) + backup-and-skip for invalid records + a loud failure line. Live-confirmed on the next boot.
A governed write re-firesfs/observedThe interlock re-entersthe listeners - by designThe Stash idempotence gateThe P3/U2 refresh re-emittingwith the same actorThe live battery provingbounded -self-canonicalizing re-passes
A governed write re-firing [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) with the interlock re-entering the listeners by design - and the three bounds keeping the re-pass safe: the Stash idempotence gate, the P3/U2 refresh re-emitting with the same actor, and the live battery proving bounded, self-canonicalizing re-passes.
###  The cross-module re-processing bound
BOUNDED BY DESIGNVERIFIED LIVE
A governed write re-fires fs/observed - the interlock re-enters the listeners by design.
Three bounds keep the re-pass safe. The Stash idempotence gate turns self re-entries into no-ops. The P3/U2 refresh re-emits with the same actor. The live battery proves the re-pass is bounded and self-canonicalizing (governed + pinned converge).
## The architecture in action
HOOKSDELEGATIONSINVERSIONS
The three attachment pointsThe llm/stream waterfall wrapnext() first - optionsuntouched - per-chunkThe fs/observed listenerssync - after content is on diskfired by the tool layer onlyThe tool registrations intothe agent's toolsetraw-write - normalize-file
The three attachment points: the [`llm/stream` waterfall wrap](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) (next() first, options untouched, per-chunk), the [`fs/observed` listeners](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) (sync, after content is on disk, fired by the tool layer only), and the tool registrations into the agent's toolset ([`raw-write`](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source), [normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-normalize-file/Source)).
###  Hooks - where the family attaches
The [`llm/stream`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts) waterfall wrap - next() first, options untouched, per-chunk.
The [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) listeners - sync, after content is on disk, fired by the tool layer ONLY.
And the tool registrations into the agent's toolset: `raw-write`, `normalize-file`.
The work splitting across thefamilyThe factory's direct-governstepsper basename - the raw-writegovern selectionThe core's Dispatch/Settleenvelope buildera new update stage reducinga child runner plus stringsThe subprocess seamfor the external toolsThe Effect-TS servicesmirroring the same seams
The work splitting across the family: the [factory's Direct-govern steps](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source) (per basename, the `raw-write` govern selection), the [core's Dispatch/Settle envelope builder](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/lib-dsh-core/Source) (a new update stage reducing to a child runner plus strings), the [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) for the external tools, and the Effect-TS services mirroring the same seams.
###  Delegations - who does the work
The factory's Direct-govern steps (per basename, the raw-write govern selection). The core's Dispatch/Settle envelope builder - a new update stage reduces to a child runner plus strings.
The [`subprocess` seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess) carries the external tools. The Effect-TS services mirror the same seams.
The ownership boundariesThe Dependencies injectionbuildersevery collection - child stageand string injectedThe module-owned ledgerstringsthe byte-identical contractThe consumers bringing theirown metalwhile the factory pours themoldThe smokes as the arbiterafter every change
The ownership boundaries: the Dependencies injection builders (every collection, child stage and string injected), the module-owned ledger strings (the byte-identical contract), the consumers bringing their own metal while the factory pours the mold, and the smokes as the arbiter after every change.
###  Inversions - who owns what
The Dependencies injection builders - EVERY collection, child stage and string injected - and the module-owned ledger strings, the byte-identical contract.
The consumers bring their own metal while the factory pours the mold. The smokes are the arbiter after EVERY change.
Outermost prepend runs firstThe compression sees theNORMALIZED bytesThe compressed result carriesthe CCR markerThe marker passes throughthe wholenormalize family untouchedA tool result entering thetools/post-execute waterfallThe normalize flavors'overpass arm -{ prepend: true }, theOUTERMOST prependThe NORMALIZED bytesThe ccr hook's compressionThe CCR marker wrappingthe compressed resultThe CCR marker guard -making any load order safeA compressed result is neverre-normalized into a differentmarker
The tools/post-execute waterfall shared by the new features: the normalize flavors' tool-results overpass arm registered { prepend: true } - the OUTERMOST prepend, so the ccr compression sees the NORMALIZED bytes - and the `<<<CCR:` marker guard making any load order safe.
###  The shared waterfall: the overpass arm and the CCR marker guard
The [ccr hook](https://deepseek.playform.cloud/plugins/hook-dsh-ccr/) and the [normalize flavors'](https://deepseek.playform.cloud/plugins/hook-dsh-normalize-dash/) tool-results overpass arm share the `tools/post-execute` waterfall. The overpass is the OUTERMOST prepend (`{ prepend: true }`), so the ccr compression sees the NORMALIZED bytes.
The `<<<CCR:` marker guard makes ANY load order safe. The marker passes through the whole normalize family untouched. A compressed result is NEVER re-normalized into a different marker.
