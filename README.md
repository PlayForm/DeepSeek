# DeepSeek Harness Plugin Family for PlayForm

[![release](https://img.shields.io/static/v1?label=release&message=v0.1.0&color=blue)](CHANGELOG.md)
[![smokes](https://img.shields.io/static/v1?label=smokes&message=511%20suites%20%2F%206%2C612%20checks&color=blue)](Classic/smokes/README.md)
[![packages](https://img.shields.io/static/v1?label=packages&message=54%20%2B%2048&color=white)](Classic/packages/)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](LICENSE)

Tame the model's output and govern the project's files with one hundred and two TypeScript packages -
54 Classic and 48 EffectTS.

The set holds the original 14 plugins (the factory, the core, the governance trio, the seven-member
normalize family, the two guardians and the live block) plus the 36 plugins of the 2026-10-22 delivery
(the workspace family, the suggesters, the orchestration set, the client panels) and their ETS twins,
plus the completion-program libraries (lib-dsh-trace, lib-dsh-pack) and the comment filter.

All of it arrives in two implementations ([the Classic release][classic], [the Effect-TS
release][ets]) under one ledger-string contract, with 511 smoke suites / 6,612 checks.

> [!NOTE]
>
> _One monorepo. Every ledger byte-checked._

## Table of contents

1. [Quick start](#quick-start)
2. [The suite at a glance](#the-suite-at-a-glance)
3. [Architecture](#architecture)
4. [Tools and configuration](#tools-and-configuration)
5. [Verification](#verification)
6. [The docs map](#the-docs-map)
7. [Development](#development)
8. [Troubleshooting](#troubleshooting)
9. [Relationship to deepseek-ai/deepseek-harness](#relationship-to-deepseek-aideepseek-harness)
10. [Contributing](#contributing)
11. [License](#license)

## Quick start

The family is published from source: each bundle is a self-contained TypeScript package built
deterministically and wired into a DeepSeek Harness profile by hand, with no registry install and no
setup binary.

### Build from source

**`Terminal`** (the workspace root, then the bundles)

```sh
pnpm install --ignore-scripts
pnpm run build:classic   # the 54 Classic packages, one workspace pass
pnpm run build:effect-ts # the 48 EffectTS packages
pnpm run test            # all 511 smoke folders - the arbiter
```

Per bundle the build keeps the same three steps (`Source/` -> `Target/` via ESBuild + `tsc` +
`tsc-alias`, minified with `.d.ts` twins):

```sh
cd Classic/packages/<bundle>
pnpm install --ignore-scripts
pnpm run prepublishOnly
```

The base library and the factory come first (`lib-dsh-core`,
[plugin-dsh-factory][ours-plugin-dsh-factory]), then the consumers, and the consumers import their
siblings through directory links under their own `node_modules/`.

### Into a DeepSeek Harness profile

Four steps follow, and every step below is the actual wiring that the loader reads, because no
separate configuration UI exists.

1. **Add the bundles to the profile** (`~/.dsh/profiles/<name>/package.json`) - the bundles listed
   as `link:` dependencies and in the `dsh.profile.bundles` list; the list is what activates them:

    ```json
    {
    	"name": "my-dsh-profile",
    	"dependencies": {
    		"@playform/plugin-dsh-factory": "link:../bundles/plugin-dsh-factory",
    		"@playform/hook-dsh-package-governor": "link:../bundles/hook-dsh-package-governor",
    		"@playform/hook-dsh-package-pinner": "link:../bundles/hook-dsh-package-pinner",
    		"@playform/hook-dsh-normalize-dash": "link:../bundles/hook-dsh-normalize-dash"
    	},
    	"dsh": {
    		"profile": {
    			"bundles": [
    				"@playform/plugin-dsh-factory",
    				"@playform/hook-dsh-package-governor",
    				"@playform/hook-dsh-package-pinner",
    				"@playform/hook-dsh-normalize-dash"
    			]
    		}
    	}
    }
    ```

    The linked checkout carries its own `node_modules` and its own `pnpm-workspace.yaml`
    (`packages: [.]`), so an install inside a bundle under the workspace of the profile acts on the
    workspace root and does nothing to the bundle.

    Remote routes enter the same list through `dsh plugin --profile <name> add <tarball>` for a built
    bundle today, or through `pnpm add @playform/<pkg>` in the profile directory once the family
    publishes to npm (the publishing is a later item).

2. **Add the patch entries** (the profile's
   [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml)) -
   one insert row per bundle, the config fields straight from the bundle's schema:

    ```yaml
    - insert:
          - id: plugin-dsh-factory
            name: "@playform/plugin-dsh-factory"
            config: {}
    - insert:
          - id: hook-dsh-package-governor
            name: "@playform/hook-dsh-package-governor"
            config:
                log: true
                logFile: ~/.dsh/playform/hook-dsh-package-governor.log
                updateCooldownMs: 3000
                strict: false
                mutationTools: [write, edit, str_replace_editor, raw-write]
                maxUpdateFailures: 3
                ncuBin: /usr/local/bin/ncu
                updateMode: programmatic
                policyFile: ""
                exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
    - insert:
          - id: hook-dsh-normalize-dash
            name: "@playform/hook-dsh-normalize-dash"
            config:
                log: true
                logFile: ~/.dsh/playform/hook-dsh-normalize-dash.log
                replacement: "-"
                normalizeReasoning: true
    ```

3. **Restart the host** - the loader activates the entry from `Target/Library.js` and inserts the
   patch rows at startup.

4. **Verify the ledgers** - each plugin writes its activation line to its own
   `~/.dsh/<identity>.log` at boot, and that line is the "did it activate" answer, readable from the
   ledger alone:

    ```text
    hook-dsh-package-governor: activated (anywhere mode, logFile=~/.dsh/playform/hook-dsh-package-governor.log, updateMode=programmatic, ncuBin=/usr/local/bin/ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))
    hook-dsh-package-pinner: activated (pinner, logFile=~/.dsh/playform/hook-dsh-package-pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])
    hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/playform/hook-dsh-normalize-dash.log)
    ```

## The suite at a glance

Two published groups share one contract: the CLASSIC packages (`@playform/dsh-*`, plain TypeScript)
and the EFFECT-TS packages (`@playform/ets-*`, effect-backed).

Install the group you run and never mix the groups in one graph, because the effect-ts `Update`
returns Effect envelopes and not the classic dispatch envelope:

- **CLASSIC:**
  `pnpm add @playform/lib-dsh-core @playform/plugin-dsh-factory @playform/hook-dsh-package-governor` -
  plain TypeScript, zero framework dependencies;
  `import { Govern } from "@playform/plugin-dsh-factory"`.
- **EFFECT-TS:**
  `pnpm add @playform/ets-lib-dsh-core @playform/ets-plugin-dsh-factory @playform/ets-hook-dsh-package-governor` -
  the same contracts on Effect-TS services and layers, with `effect` v4.0.2 as the shared runtime
  dependency and the base `@playform/ets-base-dsh` package carrying the plumbing every ets-* package
  builds on.

The one-line roster lives in
[Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md](Documentation/Plugins/PLUGIN-SUITE-SUMMARY.md), and the
per-plugin live test plans live in [Documentation/Testing/](Documentation/Testing/README.md).

By area:

| Area                     | Count          | What                                                                                                                                                                                                                                 |
| ------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The original plugins     | 14             | the factory, the governance trio, the six stream flavors + the file normalizer, ccr, tool-coach, live-containers                                                                                                                     |
| The workspace family     | 15 + 1 library | the ten-step invisible flow: observe → semantics → operate → govern → authority → approve → merge → journal → audit → context/monitor/evidence/graph/reflect, plus `lib-dsh-workspace-live`                                          |
| The client family        | 3              | `client-dsh-panel-family`, `client-dsh-panel-family-host`, `client-dsh-workspace-live`                                                                                                                                               |
| The suggesters           | 7              | `hook-dsh-{search,edit,doc,convention,graph,replay,test}-suggester`                                                                                                                                                                  |
| The orchestration set    | 10             | `plugin-dsh-batch-edit`, `plugin-dsh-batchstate`, `plugin-dsh-gitguard`, `plugin-dsh-route`, `plugin-dsh-queue`, `plugin-dsh-feedback`, `plugin-dsh-pass-on`, `plugin-dsh-ingester`, `plugin-dsh-pattern`, `hook-dsh-batch-decision` |
| The completion libraries | 2              | `lib-dsh-trace` (the trace bus's library half), `lib-dsh-pack` (the pack layer)                                                                                                                                                      |

30 of the 36 new packages have ETS twins, with only the two client panels and `plugin-dsh-pass-on`,
`plugin-dsh-ingester`, `plugin-dsh-pattern`, and `hook-dsh-batch-decision` without one.

## Architecture

### The problem

Two quiet kinds of rot appear in every agent session:

- **The model's typography.** Every streamed transcript accumulates the unicode that the model reaches
  for: em and en dashes, curly quotes, the horizontal ellipsis, exotic spaces, zero-width characters,
  fullwidth forms. Those characters survive into files, diffs, searches and terminals, where they break
  byte-exact comparisons and look wrong everywhere else.
- **The project's manifests.** `package.json` chain pins point at resolutions that drifted out from
  under them, ranged dependencies resolve differently on every machine, and `Cargo.toml` entries
  accumulate versions that no one canonicalized.

The DeepSeek Harness exposes the seams to fix both ([`fs/observed`][dsh-fs] for file events and the
[`llm/stream`][dsh-llm] waterfall for model output) and ships no plugins that use them for this work.

The family is those plugins.

### How it works

Three seams, three behaviors, and one service underneath:

```text
    MODEL STREAM ───► the stream gate (the llm/stream waterfall) ───► the transcript, normalized
                          │  one flavor, one table: em dash → -   " → "   ... → ...
    FILE EVENT ─────► the seam (fs/observed) ───► the gate set ───► the ledger + the chain
                          │  target → actor → kind → idempotence → basename → exclusion
    RAW-WRITE ──────► the direct-govern registry (factory.Govern) ─► the same chain, per call
```

- **[The stream gate](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/lib-dsh-core/Source/Stream)** -
  each normalize flavor hooks the [`llm/stream`][dsh-llm] waterfall (the interceptable wrapper around
  every streaming model call) and rewrites its character family live in the transcript: the dash family
  to `-`, the eight curly quote code points to their straight counterparts, the ellipsis to `...`, the
  unicode space family to the plain space, the zero-width/invisible family removed, and the fullwidth
  forms to their ASCII half-width counterparts. The dispatch machinery (`Chunk`/`Block`, the assembled
  reasoning block, the tool-arguments gate) is shared from the core, and each flavor contributes one
  table and one replacement.
- **The observed-file seam** - the governance trio hooks [`fs/observed`][dsh-fs]: a governed write by a
  mutation tool passes the gate set, then the pass runs as a detached, contained continuation (the
  chain pass for the governor, the pin pass for the pinner, the TOML surgery for the cargo governor),
  and the update stage dispatches on a cooldown with a circuit breaker. Every plugin writes its own
  ledger (`~/.dsh/<identity>.log`) and journals to the shared `package_governance`
  [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain).
- **[The direct-govern registry][ours-govern]** - the per-call `govern` selection of the `raw-write`
  tool drives the same chain directly through [factory.Govern][ours-govern] ([the sequential
  fold][ours-govern]: one step's chain completes before the next step reads the file), instead of
  waiting for an event.

### The original 14 plugins (plus the core library)

The original 14 plugins (plus `lib-dsh-core`) each read as an @-sentence:
`<kind> @ <platform> @ <role> @ <domain>`.

- **[plugin-dsh-factory][ours-plugin-dsh-factory]** (Plugin @ DSH @ Factory) - the first service of
  the family: loading it registers one class plugin (`static inject = ["fs"]`) that exposes
  `ctx.pluginFactory` with nineteen callable methods covering everything the hooks used to duplicate -
  the ledger (`Append`), the exclusion match (`Match`), the registry discovery (`Discover`/`Parse`),
  the union keep-list (`ResolvePolicy`), the gate set (`Gate`),
  [the shared write executor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Write.ts)
  (`Write`/`GuardedWrite`, the version-guarded fenced writes), the [fs/observed][dsh-fs] re-emit
  (`Refresh`), the detached contained continuation (`Continue`), the State builder, the fiber-owned
  wiring (`Wire`), the effect registrations (`Attach` - jobs, inflight, storage), the P5 journal
  (`Journal`), the schema factory (`Schema`), the probe-once seam (`Seam`), the Inflight key
  (`UpdateKey`), and [the direct-govern registry][ours-govern] and entry
  (`RegisterGovern`/`Govern`, the sequential fold).
- **`lib-dsh-core`** (Lib @ DSH @ Core) - the pure library layer with zero runtime dependencies, not a
  plugin: the dependency-section lists, the exclusion segments, the suppression-line composer, the
  update-policy loader,
  [the refusal guard](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/lib-dsh-core/Source/Function/Refusal.ts),
  the update envelope, the activation-line composer, and the normalize/stream machinery (the six
  tables, `Replace`/`ReplaceMap`, `Chunk`/`Block`).
- **[hook-dsh-package-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-governor/Source)**
  (Hook @ DSH @ Governor @ Package) - the silent `package.json` governor: it hooks
  [`fs/observed`][dsh-fs], rewrites chain-governed pins (`^x`, `~x`, `workspace:*`) to the resolved
  versions of the effective registry, and runs the update stage (`ncu`, programmatic library or
  external binary through [the subprocess seam][dsh-subprocess]) on a cooldown with a circuit breaker;
  `strict` strips unknown dependencies, explicitly only and never as a default delete.
- **[hook-dsh-package-pinner](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source)**
  (Hook @ DSH @ Pinner @ Package) - the silent version pinner: it deterministically rewrites every
  ranged dependency version to its static version (`^0.3.4` -> `0.3.4`), protected by the
  [pin-policy.json](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source/Function/Transform.ts)
  keep-list, where the keep-list wins over pinning and never over the chain.
- **[hook-dsh-cargo-governor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-cargo-governor/Source)**
  (Hook @ DSH @ Governor @ Cargo) - the Rust-sided flavor of the governor: surgical chain-pin rewrites
  on the raw TOML lines (comments survive), full-version normalization (`1.0` -> `1.0.0`), and
  `cargo upgrade` (cargo-edit) through [the subprocess seam][dsh-subprocess] as the only update path,
  because Rust does not co-opt into the TypeScript ecosystem; `strict` removes the whole
  `name = "..."` entry and never an inherited or path/git entry.
- **[hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source)**
  (Hook @ DSH @ Normalize @ Dash) - the dash flavor: em and en dashes and their exotic relatives to
  ASCII hyphen-minus, at the injection point that the reference tooling lacks.
- **[hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source)**
  (Hook @ DSH @ Normalize @ Quotes) - the quotes flavor: the eight curly quote code points to their
  ASCII straight counterparts.
- **[hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-ellipsis/Source)**
  (Hook @ DSH @ Normalize @ Ellipsis) - the ellipsis flavor: the horizontal ellipsis (U+2026) to the
  plain three-dot sequence.
- **[hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source)**
  (Hook @ DSH @ Normalize @ Spaces) - the spaces flavor: the unicode space family (Zs minus the ASCII
  space) to the plain space.
- **[hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/Source)**
  (Hook @ DSH @ Normalize @ Invisible) - the invisible flavor: the zero-width/invisible character
  family (soft hyphen, zero-width spaces and joiners, bidi controls, BOM) removed.
- **[hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source)**
  (Hook @ DSH @ Normalize @ Fullwidth) - the fullwidth flavor: the entire FULLWIDTH FORMS range
  (U+FF01-FF5E) to its ASCII half-width counterparts.
- **[plugin-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-normalize-file/Source)**
  (Plugin @ DSH @ Normalize @ File) - the file-content normalizer plugin: the read, count, write
  pipeline that applies all six transforms to a file already on disk and writes only when something
  changed.
- **[hook-dsh-ccr](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-ccr/Source)**
  (Hook @ DSH @ CCR) - the compress-cache-retrieve guardian: oversized allow-listed tool results become
  a one-line type-aware preview plus a retrieval marker, with the original bytes restored on demand by
  the `ccr_retrieve` tool.
- **[hook-dsh-tool-coach](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-tool-coach/Source)**
  (Hook @ DSH @ Tool @ Coach) - the terminal-content coaching guardian: the four-tier ladder (ledger,
  notice, persistent section, opt-in deny) over terminal calls, naming the correct dedicated tool with
  its live registry description.
- **[hook-dsh-live-containers](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-live-containers/Source)**
  (Hook @ DSH @ Live @ Containers) - the dynamic system-prompt blocks: one `live-containers` section
  whose labeled stanzas are recomputed at request time, shipped disabled and enabled only by an
  explicit activate.

### The 36 packages of the 2026-10-22 delivery

- **The workspace family (15 + the library)** - `plugin-dsh-workspace` (the operational view and the
  map/find/expand/context tools), `hook-dsh-workspace-observe` (the version stamps),
  `plugin-dsh-workspace-semantics` (symbol resolution and rename planning),
  `hook-dsh-workspace-operate` (typed proposals), `hook-dsh-workspace-govern` (the means-check
  gates), `plugin-dsh-workspace-authority` (capability/lease/residency),
  `hook-dsh-workspace-approve` (the approval binder), `hook-dsh-workspace-merge` (the atomic batch
  merge), `hook-dsh-workspace-journal` (pre-images, revert, crash recovery),
  `hook-dsh-workspace-audit` (the accountability records), `plugin-dsh-workspace-context` (the
  orientation packet), `hook-dsh-workspace-monitor` (check-set watchers),
  `plugin-dsh-workspace-evidence` (the truth records), `plugin-dsh-workspace-graph` (the
  file/symbol/block index), `plugin-dsh-workspace-reflect` (one-call reflective ops), plus
  `lib-dsh-workspace-live` (the shared client library).
- **The client family (3)** - `client-dsh-panel-family`, `client-dsh-panel-family-host`,
  `client-dsh-workspace-live`.
- **The suggesters (7)** - `hook-dsh-{search,edit,doc,convention,graph,replay,test}-suggester`.
- **The orchestration set (10)** - `plugin-dsh-batch-edit` (the batch edit engine),
  `plugin-dsh-batchstate` (the live board), `plugin-dsh-gitguard`, `plugin-dsh-route`,
  `plugin-dsh-queue`, `plugin-dsh-feedback`, `plugin-dsh-pass-on`, `plugin-dsh-ingester`,
  `plugin-dsh-pattern`, and `hook-dsh-batch-decision`.

30 of the 36 have ETS twins, with only the two client panels and `plugin-dsh-pass-on`,
`plugin-dsh-ingester`, `plugin-dsh-pattern`, and `hook-dsh-batch-decision` without one.

### The two trees and the layout

| Tree        | What it is                                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Classic/`  | The plain-TypeScript release - classes, Maps and plain functions, zero runtime framework dependencies. 54 packages; 269 smoke suites.    |
| `EffectTS/` | The Effect v4 port - the same contracts re-expressed on Effect-TS services and layers (the `effect` 4.0.5 pin). 48 packages; 242 suites. |

Every package carries an `ets-*` twin unless its manifest declares none, and the two client panels
plus four orchestration candidates have no twin, which gives 30 twins for the 36 new packages.

```text
    Classic/         the plain-TypeScript release: 54 packages + smokes
    EffectTS/        the Effect v4 port: 48 packages + smokes
    Site/            the static site (its own repository)
    Test/            the fixture archive: the governance batteries, the markdown proofs, the probes
    Documentation/   the framework, the guides, the skills, the plans, the reports, the test plans
    Maintain/        the formatting entry point and the aggregate runner
```

### The factory and the ledger-string contract

Every activation line, refusal line, chain-pass line and journal record is asserted byte-identically by
the smokes.

The strings are the contract: they must not change, and they are the same strings in both trees.

One ledger per plugin lives at `~/.dsh/<identity>.log`, and the smokes load the real built
`Target/Library.js` of each bundle and assert the full behavioral contract on top of the strings (the
loader contract, the identity assertions, the effect wiring).

## Tools and configuration

### Tools

Two tools ship with the family:

| Tool             | What it does                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `raw-write`      | The write wrapper registered by the stream flavors: an explicit `normalize` parameter (default **false = verbatim**) - absent/false writes byte-for-byte, `true` applies all six transforms, an array applies the named flavors only. Exempt from stream normalization by name, like `edit`. The per-call `govern` selection (`true`, a name array, or `false` = the escape hatch) drives [the direct-govern fold][ours-govern]. |
| `normalize-file` | The whole-file pass: reads the file, applies the transforms (all six by default, or the flavor selection), reports the count, writes only when something changed.                                                                                                                                                                                                                                                                |

### Configuration

Every plugin's config schema is built through the `Schema` factory of the factory: one shared volatile
block (`log`, `logFile`, `updateCooldownMs`, `mutationTools`) plus the own fields of the module.

The surface, grouped by plugin kind:

| Kind                | Field                                    | Effect                                                                                                                                                                                                                                                                                                          |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The governance trio | `log` / `logFile`                        | the durable ledger file (each plugin keeps its own, separate by default)                                                                                                                                                                                                                                        |
|                     | `mutationTools`                          | which actor tools count as triggers - the deployed layers set `[write, edit, str_replace_editor, raw-write]`                                                                                                                                                                                                    |
|                     | `exclude`                                | the exclusion segments - the plugin's own fence (`node_modules`, `.git`, `.dsh`, ...)                                                                                                                                                                                                                           |
|                     | `updateCooldownMs` / `maxUpdateFailures` | the update stage's pacing and its circuit breaker (3 failures pause a directory)                                                                                                                                                                                                                                |
|                     | `updateMode` + `ncuBin` / `cargoBin`     | programmatic (library) vs bin (external binary via [the subprocess seam][dsh-subprocess]); absolute paths - host PATH != shell PATH                                                                                                                                                                             |
|                     | `strict`                                 | strip unknown dependencies - explicit only, never a default-delete                                                                                                                                                                                                                                              |
|                     | `policyFile` / `keepFile` / `sections`   | the update-policy and keep-list sidecars, and which dependency sections the pinner touches                                                                                                                                                                                                                      |
| The stream flavors  | `replacement`                            | the transform's only knob on class flavors (`-`, `"`, `...`, plain space, empty) - hot-editable, no remount                                                                                                                                                                                                     |
|                     | `normalizeReasoning`                     | default ON - normalize reasoning deltas and the assembled reasoning block too                                                                                                                                                                                                                                   |
|                     | `normalizeToolArguments`                 | default OFF - tool-call arguments are execution-critical raw JSON; opt-in (deprecated in favor of `scopes.toolInput`, kept and OR-ed in)                                                                                                                                                                        |
|                     | `scopes`                                 | the granular scope gates - all volatile, per hook: `conversation` (text/block-end, ON), `reasoning` (sub-gate, ON), `toolInput` (OR-ed with `normalizeToolArguments`, OFF), `toolResults` (the `tools/post-execute` arm, OFF), `files` (the `normalize-file` tool, ON), `batch` (the `agent/pre-step` arm, OFF) |
|                     | `toolResultsExempt`                      | volatile list of exec names that pass the tool-results arm by identity (`read`, `edit`, `raw-write`, `normalize-file`, `ccr_retrieve`, `subagent`, `ask_user_question`)                                                                                                                                         |
| The file tool       | `normalize` (per call)                   | absent/false = verbatim, `true` = all six transforms, or the flavor-name array                                                                                                                                                                                                                                  |

The defaults-off posture keeps `strict` off, `normalizeToolArguments` off, `raw-write` `normalize` off,
and `scopes.toolInput` / `scopes.toolResults` / `scopes.batch` off, so the family changes nothing until
it is told to.

The escape hatches are the `exclude` fence, the keep-list sidecars, the raw-marker opt-out, and the
`govern: false` selection.

### The granular scopes and the overpass arms

Because the `scopes` schema shape is identical in every family hook, one grouped override in the
profile patch (`cordis.patch.yml`) turns the whole family off in one edit, live and silent, with no
remount and no new activation line:

```yaml
- id: hook-dsh-normalize-dash
  config:
      scopes:
          conversation: false
          reasoning: false
          toolInput: false
          toolResults: false
          files: false
          batch: false
```

Repeat the block for the other flavors (or just the ones you want dark), because every scope is
volatile and flipping it applies to the next dispatch.

The overpass arms (both opt-in and off by default) normalize content at its natural boundaries without
ever rewriting the durable transcript:

- `tools/post-execute` - the tool result is normalized before it re-enters the model and is appended to
  the transcript going forward (text blocks only; the `read`/`edit`/`raw-write`/`normalize-file`/
  `ccr_retrieve`/`subagent`/`ask_user_question` exec names pass by identity via `toolResultsExempt`,
  and the `<<<CCR:` marker bytes make the arm order-safe against the ccr hook).
- `agent/pre-step` - the incoming user-role batch is normalized before the model sees it, never the
  assistant/tool history, which is append-only.

Each hook also registers a human command, `normalize-overpass`:

```text
normalize-overpass batch          # arm a one-shot step-batch overpass (one use)
normalize-overpass results on     # flip scopes.toolResults via the settings service
normalize-overpass results off
normalize-overpass scopes         # read-only report of the current effective values
normalize-overpass files <path...>  # the file sweep - implemented by the normalize-file hook only
```

The command writes one ledger line per action:
`overpass: normalized N char(s) in tool result <toolName> <callId>`,
`overpass: normalized N char(s) in step batch (turn T step S)`, and
`overpass: swept K file(s), normalized M char(s)`.

## Verification

The suites are the speed and coverage story:

- **269 Classic / 242 EffectTS suites, 6,612 checks, all green.** The aggregate runner is
  `node Maintain/Run/Smokes/Index.mjs`, and the heaviest single original suite (cargo, 62 checks
  including the real TOML surgery and the subprocess-seam stubs) runs in ~0.6 s.
- **Zero runtime framework dependencies in Classic** - the release tree runs on plain TypeScript, and
  EffectTS adds the single `effect` 4.0.2 dependency.
- **Deterministic builds** - ESBuild + `tsc` + `tsc-alias`, minified `Target/` with `.d.ts` twins, and
  byte-identical ledger strings on every rebuild.

One suite per test folder per tree runs with the aggregate `node Maintain/Run/Smokes/Index.mjs`, which
also guards each folder's printed PASS count against its folder README (the vacuously-green guard):

| Measure                   | Value                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------- |
| Test folders (Classic)    | 269                                                                                    |
| Test folders (EffectTS)   | 242                                                                                    |
| Total suites              | **511**                                                                                |
| Total checks (both trees) | **6,612**                                                                              |
| The wiring battery        | `<tree>/smokes/Test/`, run by `Maintain/Run/Wiring/Index.mjs` under `DSH_TEST_SCRATCH` |

The per-suite before/after totals live in the totals ledger of
`Documentation/Plans/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md`, where the original 14 mechanics suites
total 1314 Classic / 1324 EffectTS checks and the rest is the suites of the 2026-10-22 delivery.

The counts are the release contract: they must not change.

## The docs map

Everything is documented under [Documentation/](Documentation/INDEX.md), and the index lists every
document with its status:

| Section               | Contents                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Documentation/` root | [INDEX.md](Documentation/INDEX.md), [ARCHIVE-STYLE.md](Documentation/ARCHIVE-STYLE.md) (the frontmatter template), [FRAMEWORK.md](Documentation/FRAMEWORK.md) |
| `Brand/`              | [BRANDING.md](Documentation/Brand/BRANDING.md)                                                                                                                |
| `Plans/`              | the living + queued plans (30) and the granular families (`Batch-Edit-Tool/`, `Representation-First/`, `UI-Family/`, `Workspace-Family/`, `Completion-Spec/`) |
| `Researches/`         | the research outputs (8)                                                                                                                                      |
| `Guides/`             | the operating manuals (7)                                                                                                                                     |
| `Reports/`            | the audits and diagnoses (6)                                                                                                                                  |
| `Plugins/`            | the registry documents (3): PLUGIN-FAMILY.md, ORCHESTRATION-PLUGINS.md, PLUGIN-SUITE-SUMMARY.md                                                               |
| `Testing/`            | the per-plugin live test plans: [README.md](Documentation/Testing/README.md) + 35 per-plugin files                                                            |
| `Archive/`            | the one-shot records (45, in 8 topics)                                                                                                                        |
| `Handoff/`, `Skill/`  | untouched trees (the delivery record; the loadable skills)                                                                                                    |

## Development

The workflow, root-first - every step is a root `package.json` script:

| Script                                       | What it does                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                               | the workspace install (`--ignore-scripts`); the per-bundle standalone workspaces take their own install         |
| `pnpm run build:classic` / `build:effect-ts` | the packages of one tree, one workspace pass (`prepublishOnly` per package)                                     |
| `pnpm run build`                             | both trees in order (`build:classic` then `build:effect-ts`) - the whole-build trigger                          |
| `pnpm test`                                  | all 511 smoke suites via `Maintain/Run/Smokes/Index.mjs` - the behavioral arbiter, exit non-zero on any failure |
| `pnpm run test:types`                        | `Maintain/Run/Types/Index.mjs` - the type check across the trees                                                |
| `pnpm run test:wiring`                       | `Maintain/Run/Wiring/Index.mjs` - the live wiring battery under `DSH_TEST_SCRATCH`                              |
| `pnpm site`                                  | the static site build (`Site/`)                                                                                 |
| `pnpm lychee`                                | `Maintain/Check/Lychee/Index.sh` - the three-pass link check composing `lychee-report.md`                       |
| `pnpm format` / `format:check`               | `Maintain/Format/Index.sh` - line endings + Prettier (never the markdown - byte-integrity-protected)            |

The regime: the smokes (and the site build) are the arbiter after every change, the ledger strings stay
byte-identical at the same counts, the byte-scan stays clean (no NUL bytes in the tracked tree), and
the tree is committed by the maintainer, never by tooling.

The hazards, documented:

- ~~The duplicate-name relink.~~ Resolved by the namespace split (SPLICE-ETS.md): the two trees now
  carry unique names (`@playform/dsh-*` vs `@playform/ets-*`), so no install can re-relink a consumer's
  `@playform/*` links to the other tree. Re-run the smokes after every install anyway.
- **The verifyCommand trap.** An update-policy `verifyCommand` fails on a vendored-fork workspace (no
  registry to install from), and the ledger records it, which is the expected outcome.
- **The smoke/live fidelity gap.** The smokes prove the mechanics, the live battery proves the wiring,
  and the ledgers answer "did it activate".

## Troubleshooting

The known gaps stay stated as they are, with the corrected claims kept and no marketing gloss.

- **Load order is not list order.** The pinner can activate before the governor at boot, because the
  registration order is not controlled. Never rely on the bundle-list order for step ordering: the
  sequential fold and the fresh-version writes make the order irrelevant, and each plugin's ledger
  answers for its own activation.
- **The verifyCommand trap.** An update-policy `verifyCommand` can fail with a non-zero status: on a
  vendored-fork workspace (the live battery of the family), `pnpm install` has no registry to install
  from, and the ledger records the failure as the documented cordis registry trap, the expected
  outcome and not a bug. Exit 127 (the runner unavailable) is non-fatal, while any other failure fails
  the stage and counts toward the circuit breaker (`maxUpdateFailures`):

    ```text
    update: running verifyCommand: pnpm install
    update: verifyCommand failed (status 1)
    update: verifyCommand runner unavailable (exit 127) - skipped, non-fatal
    update stage FAILED (1) for <dir>; consecutive=2
    ```

- **The smoke/live fidelity gap.** The smokes prove the mechanics and the live battery proves the
  wiring. Every real bug (the patch layers, the v2 journal open, the version guard) was found live and
  not by the smokes, so both green does not prove the profile wiring; the ledgers do.
- **The fixture paths.** The `Test/` fixtures carry the neutralized display forms (`<repo-root>/`,
  `$DSH_HOME/`), and the personal absolute paths exist only in the internal Boilerplate copies. Never
  copy a live battery into the release archive as-is.
- **The byte-integrity law.** The NUL-byte incident class: a write that emits bytes the format of the
  file forbids (NUL bytes) corrupts the file, which is the URL-registry corruption lesson. Verbatim is
  the default, the normalize family restores the integrity, and the byte-scan is the arbiter.
- **The timestamp confusion.** The ledger lines are ISO UTC, the storage records are epoch
  milliseconds, and the local display adds +03, so the "missing records" scares were filter mistakes
  and not lost data.
- **The raw-write marker semantics.** An absent `govern` means no chain (the escape hatch), and the raw
  marker (`__normalize: false`) passes a call through unnormalized. Markers are stripped before the
  tool validates, because the harness tools reject unknown argument keys.

## Relationship to deepseek-ai/deepseek-harness

The family extends the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH), the
desktop agent platform published as the `@deepseek-ai` packages.

Everything the family builds on is the public plugin API of the harness:

| Harness package                                                                                                    | What the family uses it for                                                                             |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| [`@deepseek-ai/cordis`](https://github.com/deepseek-ai/deepseek-harness/tree/master/vendor/cordis)                 | the loader contract: the service/class plugins, the patch inserts, the fiber-owned hooks                |
| [`@deepseek-ai/schemastery`](https://github.com/deepseek-ai/deepseek-harness/tree/master/vendor/schemastery)       | the config schemas (the factory's `Schema` factory emits real schemastery instances)                    |
| [`@deepseek-ai/dsh-fs`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs)                | `ctx.fs` - the governed reads, the version-guarded writes, the [`fs/observed`][dsh-fs] event vocabulary |
| [`@deepseek-ai/dsh-subprocess`][dsh-subprocess]                                                                    | [the subprocess seam][dsh-subprocess] - the `ncu` and `cargo upgrade` dispatches                        |
| [`@deepseek-ai/dsh-sandbox`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/sandbox/sandbox) | the sandbox policy - the fenced write postures                                                          |

The harness ships the seams and no plugins that use them this way, so the family adds the normalization
and the governance on top.

## Contributing

| Want to...            | Start here                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Fix a plugin          | the bundle's `README.md` + `SCHEME.md` under `Classic/packages/<bundle>/`                         |
| Add a flavor          | `lib-dsh-core` (one table) + a new `hook-dsh-normalize-<name>` bundle                             |
| Change behavior       | the smokes first - the counts (511 suites / 6,612 checks) and the ledger strings are the contract |
| Understand the design | `Documentation/FRAMEWORK.md` and the skills under `Documentation/Skill/`                          |

The regime: the smokes (and the site build) are the arbiter after every change, the ledger strings stay
byte-identical, and the tree is committed by the maintainer, never by tooling.

## License

Released under [CC0-1.0](LICENSE) - public domain.

[classic]: https://github.com/PlayForm/DeepSeek/tree/Current/Classic
[ets]: https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS
[ours-plugin-dsh-factory]:
	https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source
[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
[dsh-llm]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts
[ours-govern]:
	https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts
[dsh-subprocess]:
	https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess
