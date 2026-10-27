---
title: The authoritative registry of the 101 packages (53 Classic + 48 EffectTS)
category: Plugins
kind: living-record
date: 2026-10-22
status: active
registry: Documentation/Plugins/PLUGIN-FAMILY.md
index: Documentation/INDEX.md
statuses:
    - name:
          the 101 packages (53 Classic + 48 EffectTS, one of them the ets-base-dsh plumbing base;
          client-dsh-panel-family at 0.2.0, the other 100 at 0.1.0, all UNPUBLISHED)
      state: implemented
      evidence:
          the packages exist and are built from source; the package directories under both trees
    - name: the registry document content (the names, the links, the rules)
      state: implemented
      evidence: this document; byte-accurate names
    - name:
          the 36 packages of the 2026-10-22 delivery (the workspace family, the suggesters, the
          orchestration set, the client panels)
      state: implemented (PoC)
      evidence:
          the packages under Classic/packages/; the family now has 47 ets-* twins (the 48 EffectTS
          packages minus the ets-base-dsh base); Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the former "planned orchestration plugins"
      state: implemented (PoC)
      evidence:
          the ten orchestration packages; Documentation/Plugins/ORCHESTRATION-PLUGINS.md and
          Documentation/Reports/POC-GAP-ANALYSIS.md
---

# PLUGIN-FAMILY - the authoritative registry of the 101 packages

> This document is the "plugins saved as documents" registry, and it covers the full family, where
> all packages are built from source and UNPUBLISHED (the npm bootstrap tiers: 2-planned or
> 3-candidates).
>
> Every package is version **0.1.0** except `client-dsh-panel-family` at **0.2.0**.
>
> EVERY name is byte-accurate, EVERY repo link is absolute, and the document is a DOCUMENT, NOT an
> implementation.
>
> The one-line suite summary lives in [PLUGIN-SUITE-SUMMARY.md](PLUGIN-SUITE-SUMMARY.md), the
> per-plugin live test plans live in [../Testing/](../Testing/README.md), and the PoC-vs-plan grades
> live in [../Reports/POC-GAP-ANALYSIS.md](../Reports/POC-GAP-ANALYSIS.md).
>
> The source of truth is the packages' own READMEs, SCHEMs, and Sources under `Classic/packages/`
> and `EffectTS/packages/`, plus the root README.

## 0. The family at a glance

- **Version: 0.1.0 for ALL 101 packages except `client-dsh-panel-family` (0.2.0), all UNPUBLISHED.**
  The names are byte-accurate as below, and the legacy `ets-dsh-hook-*` naming is gone (the
  namespace split, SPLICE-ETS.md).
- **Two trees, 53 + 48 packages, ONE contract:** the CLASSIC split (`@playform/hook-dsh-*`,
  `@playform/plugin-dsh-*`, `@playform/client-dsh-*`, `@playform/lib-dsh-*` - plain TypeScript with
  zero runtime framework dependencies) and the EFFECT-TS split (`@playform/ets-*` - the same
  contracts on Effect v4.0.5 services and layers, with `@playform/ets-base-dsh` as the plumbing
  base), where you NEVER mix the two splits in ONE dependency graph, the EffectTS `Update` returns
  Effect envelopes (NOT the classic dispatch envelope), 30 of the 36 packages added 2026-10-22 have
  ETS twins (all but the two client panels and `plugin-dsh-pass-on`, `plugin-dsh-ingester`,
  `plugin-dsh-pattern`, `hook-dsh-batch-decision`), and the two libraries of the completion program
  (`lib-dsh-trace` and `lib-dsh-pack`) now have ETS twins too (`ets-lib-dsh-trace`,
  `ets-lib-dsh-pack`, added with the ETS parity wave).
- **The family count is 47 ETS twins:** the EffectTS tree holds 48 packages, and one of them is the
  `ets-base-dsh` plumbing base, not a twin.
- **Verification: the aggregate `node Maintain/Run/Smokes/Index.mjs` = 511 smoke suites / 6,612
  checks across both trees, all green, and the live desktop profile has 54 bundles enabled.**
- **ONE ledger-string contract:** EVERY activation line, refusal line, chain-pass line, and journal
  record is asserted byte-identically by the smokes in ALL implementations, with ONE ledger per
  plugin at `~/.dsh/<identity>.log`.
- **EVERY name reads as an @-sentence:** `<kind> @ <platform> @ <role> @ <domain>` (e.g. Hook @ DSH
  @ Normalize @ Dash).
- **The event surfaces used by the family:** `llm/stream` (the streaming waterfall, which is the
  rewrite point of the normalize flavors), `fs/observed` (the observed-file event, which is the
  trigger of the governance trio), the tool execution surface (the mutation tools -
  write/edit/str_replace_editor/raw-write) through the pre/post-execute gating of the factory and
  the direct-govern registry, and the loader surface (cordis patch inserts at profile startup).

## 1. The names (the registry list)

**EffectTS base (1):**

| #   | Package                  | Archetype | Event surface                                          |
| --- | ------------------------ | --------- | ------------------------------------------------------ |
| 1   | `@playform/ets-base-dsh` | Base      | (library - the plumbing every ets-* package builds on) |

**Classic (15):**

| #   | Package                                  | Archetype         | Event surface                                                                 |
| --- | ---------------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| 2   | `@playform/lib-dsh-core`                 | Hook (library)    | none (pure machinery layer - consumed by the other hooks)                     |
| 3   | `@playform/plugin-dsh-factory`           | Plugin (service)  | tool pre/post-execute gating; `fs/observed` re-emit; direct-govern registry   |
| 4   | `@playform/hook-dsh-cargo-governor`      | Hook              | `fs/observed` + tool post-execute                                             |
| 5   | `@playform/hook-dsh-package-governor`    | Hook              | `fs/observed` + tool post-execute                                             |
| 6   | `@playform/hook-dsh-package-pinner`      | Hook              | `fs/observed` + tool post-execute                                             |
| 7   | `@playform/hook-dsh-normalize-dash`      | Hook              | `llm/stream`                                                                  |
| 8   | `@playform/hook-dsh-normalize-quotes`    | Hook              | `llm/stream`                                                                  |
| 9   | `@playform/hook-dsh-normalize-ellipsis`  | Hook              | `llm/stream`                                                                  |
| 10  | `@playform/hook-dsh-normalize-spaces`    | Hook              | `llm/stream`                                                                  |
| 11  | `@playform/hook-dsh-normalize-invisible` | Hook              | `llm/stream`                                                                  |
| 12  | `@playform/hook-dsh-normalize-fullwidth` | Hook              | `llm/stream`                                                                  |
| 13  | `@playform/plugin-dsh-normalize-file`    | Hook (tool)       | tool surface (`normalize-file` tool)                                          |
| 14  | `@playform/hook-dsh-ccr`                 | Hook (guardian)   | `tools/post-execute` + the `ccr_retrieve` tool                                |
| 15  | `@playform/hook-dsh-tool-coach`          | Hook (guardian)   | `tools/post-`/`tools/pre-execute`, `agent/pre-step`, `system-prompt/assemble` |
| 16  | `@playform/hook-dsh-live-containers`     | Hook (live block) | `system-prompt/assemble`, `agent/pre-step`, `tools/post-execute`              |

**EffectTS (15):**

| #   | Package                                      | Archetype         | Event surface                                                                 |
| --- | -------------------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| 17  | `@playform/ets-lib-dsh-core`                 | Hook (library)    | none (pure machinery on Effect layers)                                        |
| 18  | `@playform/ets-plugin-dsh-factory`           | Plugin (service)  | same surface as the Classic factory, Effect envelopes                         |
| 19  | `@playform/ets-hook-dsh-cargo-governor`      | Hook              | `fs/observed` + tool post-execute                                             |
| 20  | `@playform/ets-hook-dsh-package-governor`    | Hook              | `fs/observed` + tool post-execute                                             |
| 21  | `@playform/ets-hook-dsh-package-pinner`      | Hook              | `fs/observed` + tool post-execute                                             |
| 22  | `@playform/ets-hook-dsh-normalize-dash`      | Hook              | `llm/stream`                                                                  |
| 23  | `@playform/ets-hook-dsh-normalize-quotes`    | Hook              | `llm/stream`                                                                  |
| 24  | `@playform/ets-hook-dsh-normalize-ellipsis`  | Hook              | `llm/stream`                                                                  |
| 25  | `@playform/ets-hook-dsh-normalize-spaces`    | Hook              | `llm/stream`                                                                  |
| 26  | `@playform/ets-hook-dsh-normalize-invisible` | Hook              | `llm/stream`                                                                  |
| 27  | `@playform/ets-hook-dsh-normalize-fullwidth` | Hook              | `llm/stream`                                                                  |
| 28  | `@playform/ets-plugin-dsh-normalize-file`    | Hook (tool)       | tool surface (`normalize-file` tool)                                          |
| 29  | `@playform/ets-hook-dsh-ccr`                 | Hook (guardian)   | `tools/post-execute` + the `ccr_retrieve` tool                                |
| 30  | `@playform/ets-hook-dsh-tool-coach`          | Hook (guardian)   | `tools/post-`/`tools/pre-execute`, `agent/pre-step`, `system-prompt/assemble` |
| 31  | `@playform/ets-hook-dsh-live-containers`     | Hook (live block) | `system-prompt/assemble`, `agent/pre-step`, `tools/post-execute`              |

**The 2026-10-22 delivery - Classic (36), roles only (full detail in
[PLUGIN-SUITE-SUMMARY.md](PLUGIN-SUITE-SUMMARY.md)):**

| #   | Package                                    | Role                                                      | ETS twin |
| --- | ------------------------------------------ | --------------------------------------------------------- | -------- |
| 32  | `@playform/plugin-dsh-workspace`           | the workspace agent + map/find/expand/context tools       | yes      |
| 33  | `@playform/hook-dsh-workspace-observe`     | the fs/observed version stamps into the observation store | yes      |
| 34  | `@playform/plugin-dsh-workspace-semantics` | symbol/reference resolution, rename planning              | yes      |
| 35  | `@playform/hook-dsh-workspace-operate`     | typed proposals (rename/connect/replace)                  | yes      |
| 36  | `@playform/hook-dsh-workspace-govern`      | the four means-checks on every tool call                  | yes      |
| 37  | `@playform/plugin-dsh-workspace-authority` | capability/lease/residency service                        | yes      |
| 38  | `@playform/hook-dsh-workspace-approve`     | exact-candidate approval bindings                         | yes      |
| 39  | `@playform/hook-dsh-workspace-merge`       | the atomic batch merge                                    | yes      |
| 40  | `@playform/hook-dsh-workspace-journal`     | per-batch pre-images, revert, crash recovery              | yes      |
| 41  | `@playform/hook-dsh-workspace-audit`       | the accountability records                                | yes      |
| 42  | `@playform/plugin-dsh-workspace-context`   | the orientation packet                                    | yes      |
| 43  | `@playform/hook-dsh-workspace-monitor`     | watch/sweep check sets                                    | yes      |
| 44  | `@playform/plugin-dsh-workspace-evidence`  | the four truth kinds + invalidation                       | yes      |
| 45  | `@playform/plugin-dsh-workspace-graph`     | the file/symbol/block index + query                       | yes      |
| 46  | `@playform/plugin-dsh-workspace-reflect`   | one-call rename/connect/replace                           | yes      |
| 47  | `@playform/lib-dsh-workspace-live`         | the shared client library (no plugin)                     | yes      |
| 48  | `@playform/client-dsh-panel-family`        | the panel contract + the family tab                       | no       |
| 49  | `@playform/client-dsh-panel-family-host`   | the panel host half: the tail/stats endpoints             | no       |
| 50  | `@playform/client-dsh-workspace-live`      | the workspace live tab                                    | yes      |
| 51  | `@playform/hook-dsh-search-suggester`      | companion searches from post-execute signals              | yes      |
| 52  | `@playform/hook-dsh-edit-suggester`        | convention companions after an edit                       | yes      |
| 53  | `@playform/hook-dsh-doc-suggester`         | doc-graph companions after a read/edit                    | yes      |
| 54  | `@playform/hook-dsh-convention-suggester`  | naming/layout/ledger conventions                          | yes      |
| 55  | `@playform/hook-dsh-graph-suggester`       | graph-neighborhood companions                             | yes      |
| 56  | `@playform/hook-dsh-replay-suggester`      | replays from the recalled history record                  | yes      |
| 57  | `@playform/hook-dsh-test-suggester`        | test suites/coverage companions                           | yes      |
| 58  | `@playform/plugin-dsh-batch-edit`          | the batch edit engine (files as processes, one commit)    | yes      |
| 59  | `@playform/plugin-dsh-batchstate`          | the live batch state board                                | yes      |
| 60  | `@playform/plugin-dsh-gitguard`            | classify and deny dangerous git commands                  | yes      |
| 61  | `@playform/plugin-dsh-route`               | resolve/correct the subagent model routes                 | yes      |
| 62  | `@playform/plugin-dsh-queue`               | the subagent queue: seat/release, capacity, dispatch      | yes      |
| 63  | `@playform/plugin-dsh-feedback`            | the honest feedback: intake/classify/summary              | yes      |
| 64  | `@playform/plugin-dsh-pass-on`             | prepare/resolve proposals for the batch flow              | no       |
| 65  | `@playform/plugin-dsh-ingester`            | validate/apply the approved proposals                     | no       |
| 66  | `@playform/plugin-dsh-pattern`             | match/record/decay the learned patterns                   | no       |
| 67  | `@playform/hook-dsh-batch-decision`        | the conservative auto-approve policy + the decision tool  | no       |

**EffectTS twins for the delivery (30):** the `@playform/ets-*` counterparts of the 30 packages
above that are marked "yes", under `EffectTS/packages/`.

The current full count of ETS twins is **47** (the 48 EffectTS packages minus the `ets-base-dsh`
base), which includes the twins of the two libraries (`ets-lib-dsh-trace`, `ets-lib-dsh-pack`)
listed below and the twins of the 15 pre-existing packages listed above.

**The libraries of the completion program - Classic (2) + their ETS twins (2, `ets-lib-dsh-trace` /
`ets-lib-dsh-pack`):**

| #   | Package                   | Archetype | Event surface                                                                                        | ETS twin            |
| --- | ------------------------- | --------- | ---------------------------------------------------------------------------------------------------- | ------------------- |
| 68  | `@playform/lib-dsh-trace` | Library   | none (library - the trace vocabulary and the detached loop behind the factory's `ctx.trace` service) | `ets-lib-dsh-trace` |
| 69  | `@playform/lib-dsh-pack`  | Library   | none (library - the workspace-pack schema and resolution behind the pack-driven suggesters)          | `ets-lib-dsh-pack`  |

The absolute-link rule for any repo target in docs, prompts, and skills is
`https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/<pkg>` or
`https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/<pkg>`.

## 2. The packages, one paragraph each (Classic truth; each has its ets- twin)

### The base and the machinery

- **`@playform/ets-base-dsh`** (Base) - the EffectTS plumbing package, which provides the shared
  Effect types, service tags, layer helpers, and runtime conveniences that EVERY `ets-*` package
  builds on, so the twelve contracts of the EffectTS tree share ONE base instead of duplicating the
  plumbing per package, with Effect v4.0.5 as the single shared runtime dependency.
- **`@playform/lib-dsh-core`** (Lib @ DSH @ Core) - the pure machinery layer with zero runtime
  dependencies, which is NOT itself a plugin, and it provides the dependency-section lists, the
  exclusion segments, the suppression-line composer, the update-policy loader, the refusal guard,
  the update envelope, the activation-line composer, and the normalize/stream machinery, where the
  normalize/stream machinery is the six character tables plus `Replace`/`ReplaceMap` and the
  `Chunk`/`Block` dispatch (per-chunk application, the assembled reasoning block, and the
  tool-arguments gate) and EACH normalize flavor contributes ONE table and ONE replacement on top of
  this.

### The service

- **`@playform/plugin-dsh-factory`** (Plugin @ DSH @ Factory) - the family's FIRST service, where
  loading it registers ONE class plugin (`static inject = ["fs"]`) that exposes `ctx.pluginFactory`
  with nineteen callable methods covering everything that the hooks used to duplicate, namely the
  ledger (`Append`), the exclusion match (`Match`), registry discovery (`Discover`/`Parse`), the
  union keep-list (`ResolvePolicy`), the gate set (`Gate`), the shared write executor
  (`Write`/`GuardedWrite`, version-guarded fenced writes), the `fs/observed` re-emit (`Refresh`),
  the detached contained continuation (`Continue`), the State builder, fiber-owned wiring (`Wire`),
  effect registrations (`Attach`), the P5 journal (`Journal`), the schema factory (`Schema`), the
  probe-once seam (`Seam`), the inflight key (`UpdateKey`), and the direct-govern registry and entry
  (`RegisterGovern`/`Govern`); `RegisterGovern`/`Govern` is the sequential fold where ONE step's
  chain completes before the next step reads the file, and the loader contract is
  `name`/`apply`/`Config`/`inject` on the default export.

### The governance trio

- **`@playform/hook-dsh-package-governor`** (Hook @ DSH @ Governor @ Package) - the silent
  package.json governor, which hooks `fs/observed`, so a governed write by a mutation tool passes
  the gate set and then the pass runs as a detached, contained continuation that chain-governs pins
  (`^x`, `~x`, `workspace:*`) rewritten to the resolved versions of the effective registry and then
  runs the update stage (`ncu`, programmatic library or external binary through the subprocess seam)
  on a cooldown with a circuit breaker (`maxUpdateFailures` - 3 consecutive failures pause a
  directory), where `strict` strips unknown dependencies as explicit ONLY and NEVER as a
  default-delete.
- **`@playform/hook-dsh-package-pinner`** (Hook @ DSH @ Pinner @ Package) - the silent version
  pinner, which deterministically rewrites EVERY ranged dependency version to its static version
  (`^0.3.4` -> `0.3.4`), protected by the keep-list of pin-policy.json, with the discovery order of
  configured `policyFile` -> repo walk-up -> built-in default and the union of keep-lists, where the
  keep-list wins over pinning and NEVER over the chain and the sections covered are dependencies,
  devDependencies, peerDependencies, and optionalDependencies.
- **`@playform/hook-dsh-cargo-governor`** (Hook @ DSH @ Governor @ Cargo) - the Rust-sided flavor,
  which does surgical chain-pin rewrites on the raw TOML lines (comments survive), full-version
  normalization (`1.0` -> `1.0.0`), and `cargo upgrade` (cargo-edit) through the subprocess seam,
  where `cargo upgrade` is the ONLY update path because Rust does NOT co-opt into the TypeScript
  ecosystem and `strict` removes the whole `name = "..."` entry, NEVER inherited or path/git
  entries.

### The seven normalize flavors

ALL flavors hook `llm/stream` (the interceptable wrapper around EVERY streaming model call).

They rewrite their character family LIVE in the transcript, which covers BOTH the live UI and the
durable transcript.

The normalization is deliberately visible.

The replacement is per-chunk and single-character (chunk-boundary-safe by construction): NO
lookahead/lookbehind and NO multi-character sequences.

Two tools register: `raw-write` (per-call `normalize` selection, default false = verbatim) and
`normalize-file` (the whole-file pass, which writes ONLY when something changed).

- **`@playform/hook-dsh-normalize-dash`** - the dash flavor, which maps em and en dashes and their
  exotic relatives (U+058A, U+05BE, U+1400, U+1806, U+2010-2015, U+2E17, U+2E1A, U+2E3A-2E3B,
  U+2E40, U+2E5D, U+301C, U+3030, U+30A0, U+FE31-FE32, U+FE58, U+FE63, U+FF0D) to ASCII hyphen-minus
  through the config `replacement` (default `-`).
- **`@playform/hook-dsh-normalize-quotes`** - the eight curly quote code points to their ASCII
  straight counterparts.
- **`@playform/hook-dsh-normalize-ellipsis`** - the horizontal ellipsis (U+2026) to the plain
  three-dot sequence.
- **`@playform/hook-dsh-normalize-spaces`** - the unicode space family (Zs minus the ASCII space) to
  the plain space.
- **`@playform/hook-dsh-normalize-invisible`** - the zero-width/invisible character family (soft
  hyphen, zero-width spaces and joiners, bidi controls, BOM) removed.
- **`@playform/hook-dsh-normalize-fullwidth`** - the entire FULLWIDTH FORMS range (U+FF01-FF5E) to
  its ASCII half-width counterparts.
- **`@playform/plugin-dsh-normalize-file`** - the file-content normalizer, which is the read, count,
  and write pipeline that applies ALL six transforms to a file already on disk and writes ONLY when
  something changed (the `normalize-file` tool).

### The guardians and the live block

- **`@playform/hook-dsh-ccr`** - the compress-cache-retrieve guardian, which hooks
  `tools/post-execute`, replaces oversized allow-listed results with a one-line type-aware preview
  plus a `<<<CCR:<24hex>|<type>|<size>>>` marker, stores the original under a sha256-24 hash in the
  LRU, and registers `ccr_retrieve` for the byte-exact restore.
- **`@playform/hook-dsh-tool-coach`** - the terminal-content coaching guardian, which runs the
  four-tier ladder (ledger, notice, persistent system-prompt section, opt-in deny) over terminal
  calls and names the correct dedicated tool with its live registry description.
- **`@playform/hook-dsh-live-containers`** - the dynamic system-prompt blocks, which append one
  `live-containers` section whose labeled stanzas are recomputed at request time, ships DISABLED,
  and enables only by an explicit activate.

### The completion program's libraries

- **`@playform/lib-dsh-trace`** (the trace bus's library half) - the pure, harness-free half of the
  D5 trace bus, which holds the event envelope (`trace`/`kind`/`at`/`actor`/`payload`), the event
  names (`observe/stamp`, `graph/indexed`, `graph/invalidated`), the type guards, the coalescing
  key, and the detached microtask loop (`Loop` - one in-flight task per key, coalesced schedules
  dropped, no timers, fail-open), is NOT a plugin (no patch, no loader contract), and leaves the
  `ctx.trace` service to the factory, where the 256-entry ring is the fixed bound of the service,
  not a config knob.
- **`@playform/lib-dsh-pack`** (the pack layer's library) - the workspace-pack library of the
  suggester family, which holds the pack schema (the `families` keyed `<domain>/<id>`, plus the
  optional `indexer`/`policy`/`learning` sections), the strict YAML-subset parser, the layered
  resolution (repo layer `.dsh/pack.yml` → user layer → the built-in pack for this monorepo, with
  `extends` chains and merge rules), and the workspace gate (`Locate` - the signature check behind
  the `abstained foreign-workspace` silence of the suggesters), is NOT a plugin (no config schema,
  no ledger strings), and leaves the lines to the consumers.

## 3. The config keys (from the packages' SCHEMs/READMEs)

EVERY plugin builds its config schema through the `Schema` factory of the factory.

The schema is ONE shared volatile block plus the fields of the module.

An invalid configuration fails at load.

EVERY default is validated and filled.

| Key                      | Owner                | Effect                                                                                                      | Default                  |
| ------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------ |
| `log`                    | all                  | enable the durable ledger                                                                                   | true                     |
| `logFile`                | all                  | the ledger path (`~/.dsh/<identity>.log` convention)                                                        | per plugin               |
| `updateCooldownMs`       | governors/pinner     | the update stage's pacing                                                                                   | 3000                     |
| `mutationTools`          | governors/pinner     | which actor tools count as triggers (`[write, edit, str_replace_editor, raw-write]` in the deployed layers) | factory shared block     |
| `maxUpdateFailures`      | governors            | the circuit breaker (3 consecutive failures pause a directory)                                              | 3                        |
| `updateMode`             | governors            | `programmatic` (library) vs external binary via the subprocess seam                                         | programmatic             |
| `ncuBin` / `cargoBin`    | governors            | absolute binary paths (host PATH != shell PATH)                                                             | empty                    |
| `strict`                 | governors            | strip unknown dependencies - explicit only, never a default-delete                                          | false                    |
| `policyFile`             | governors            | the update-policy sidecar; empty = discovery                                                                | ""                       |
| `exclude`                | governors/pinner     | the exclusion fence (`node_modules`, `.git`, `.dsh`, `.pnpm`, `.store`, `DeepSeek Harness.app`)             | the factory default list |
| `keepFile` / `sections`  | pinner               | the keep-list sidecar and which dependency sections the pin pass touches                                    | discovery / all four     |
| `replacement`            | class stream flavors | the transform's single knob (`-`, `"`, `...`, plain space, empty) - hot-editable, no remount                | per flavor               |
| `normalizeReasoning`     | stream flavors       | normalize reasoning deltas and the assembled reasoning block too                                            | true (on)                |
| `normalizeToolArguments` | stream flavors       | tool-call arguments are execution-critical raw JSON - opt-in                                                | false (off)              |
| `normalize` (per call)   | `raw-write`          | absent/false = verbatim, true = all six transforms, or the flavor-name array                                | false                    |
| `govern` (per call)      | `raw-write`          | the direct-govern selection: true / "all" / a step-name array / false = the escape hatch                    | absent                   |

The defaults-off posture: `strict` off, `normalizeToolArguments` off, `raw-write` `normalize` off.

The family changes nothing until it is told to.

The escape hatches are the `exclude` fence, the keep-list sidecars, the raw marker
(`__normalize: false`), and the `govern: false` selection.

## 4. The ledger / logFile conventions

- ONE ledger per plugin lives at `~/.dsh/<identity>.log`, where the Module name of the plugin is the
  logger and ledger prefix and the identity strings are byte-identical across BOTH release trees
  (Classic and EffectTS) and asserted by the smokes.
- The activation line at boot is the "did it activate" answer, which is readable from the ledger
  ALONE, e.g.
  `hook-dsh-package-governor: activated (anywhere mode, logFile=..., updateMode=programmatic, ...)`.
- Refusal lines, chain-pass lines, and update-stage lines are also ledger strings, which are part of
  the contract and must NOT change.
- The journals flow to the shared `package_governance` storage domain (the P5 journal, pre-open
  queue capped 256), where timestamps are ISO UTC in the ledger lines and epoch milliseconds in the
  storage records.
- The smokes load the real built `Target/Library.js` of EACH bundle and assert the full behavioral
  contract on top of the strings, and 511 smoke suites / 6,612 checks across both trees are the
  release contract (the original 14 mechanics suites: 1333 Classic / 1324 EffectTS; the rest is the
  suites of the 2026-10-22 delivery).

## 5. The wiring (the four steps)

1. **The bundles.**

    Add the bundles to the profile (`~/.dsh/profiles/<name>/package.json`) as `link:` dependencies
    and in `dsh.profile.bundles`, because the list is what activates them.

2. **The patch entries.**

    Add the patch entries (the profile's `cordis.patch.yml`) as ONE insert row per bundle
    (`- insert: [- id: <pkg>, name: "@playform/<pkg>", config: {...}]`), where the config fields
    come straight from the schema of the bundle.

3. **The restart.**

    Restart the host, so the loader activates the entry from `Target/Library.js` and inserts the
    patch rows at startup.

4. **The ledgers.**

    Verify the ledgers by looking for the activation line of EACH plugin in its own
    `~/.dsh/<identity>.log`.

Note: load order is NOT list order (the pinner can activate before the governor).

NEVER rely on the bundle-list order for step ordering.

EACH plugin's ledger answers for its own activation.
