# DeepSeek Harness Plugin Family for PlayForm

> [!NOTE]
>
> Tame the model's output and govern the project's files.
>
> Twelve TypeScript packages - the factory, the core, the governance trio and the seven-member
> normalize family - in three implementations (the Boilerplate baseline, [the Classic release](https://github.com/PlayForm/DeepSeek/tree/Current/Classic), [the Effect-TS release](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS)), one ledger-string
> contract, 733 + 746 smoke assertions.
>
> _One monorepo._
>
> _Every ledger byte-checked._

[![smokes](https://img.shields.io/static/v1?label=smokes&message=classic%20733%20%2F%20effect-ts%20746&color=blue)](Classic/smokes/README.md)
[![packages](https://img.shields.io/static/v1?label=packages&message=12%20%C3%97%203&color=white)](Classic/packages/)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](LICENSE)

---

## Install

The family is published from source: each bundle is a self-contained TypeScript package built
deterministically and wired into a DeepSeek Harness profile by hand - no registry install, no setup
binary.

### Build from source

**`Terminal`** (the workspace root, then the bundles)

```sh
pnpm install --ignore-scripts
pnpm run build:classic   # the twelve Classic bundles, one workspace pass
pnpm run build:effect-ts # the twelve EffectTS bundles
pnpm run test            # all 24 smokes - the arbiter
```

Per bundle the build is the same three steps (`Source/` -> `Target/` via ESBuild + `tsc` +
`tsc-alias`, minified with `.d.ts` twins):

```sh
cd Classic/packages/<bundle>
pnpm install --ignore-scripts
pnpm run prepublishOnly
```

The two base bundles first (`hook-dsh-core`, [plugin-dsh-factory][ours-plugin-dsh-factory]), then the ten consumers; the
consumers import their siblings through directory links under their own `node_modules/`.

### Into a DeepSeek Harness profile

Four steps - every step below is the actual wiring the loader reads; no separate configuration UI
exists.

1. **Add the bundles to the profile** (`~/.dsh/profiles/<name>/package.json`) - the bundles listed
   as `link:` dependencies and in the `dsh.profile.bundles` list; the list is what activates them:

    ```json
    {
    	"name": "my-dsh-profile",
    	"dependencies": {
    		"@playform/plugin-dsh-factory": "link:../bundles/plugin-dsh-factory",
    		"@playform/hook-dsh-governor-package": "link:../bundles/hook-dsh-governor-package",
    		"@playform/hook-dsh-pinner-package": "link:../bundles/hook-dsh-pinner-package",
    		"@playform/hook-dsh-normalize-dash": "link:../bundles/hook-dsh-normalize-dash"
    	},
    	"dsh": {
    		"profile": {
    			"bundles": [
    				"@playform/plugin-dsh-factory",
    				"@playform/hook-dsh-governor-package",
    				"@playform/hook-dsh-pinner-package",
    				"@playform/hook-dsh-normalize-dash"
    			]
    		}
    	}
    }
    ```

    The linked checkout carries its own `node_modules` and its own `pnpm-workspace.yaml`
    (`packages: [.]`) - an install inside a bundle under the profile's workspace acts on the
    workspace root and does nothing to the bundle. Remote routes into the same list:
    `pnpm add  @playform/<pkg>` in the profile directory, or
    `dsh plugin --profile <name> add <tarball>`.

2. **Add the patch entries** (the profile's [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml)) - one insert row per bundle, the
   config fields straight from the bundle's schema:

    ```yaml
    - insert:
          - id: plugin-dsh-factory
            name: "@playform/plugin-dsh-factory"
            config: {}
    - insert:
          - id: hook-dsh-governor-package
            name: "@playform/hook-dsh-governor-package"
            config:
                log: true
                logFile: ~/.dsh/hook-dsh-governor-package.log
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
                logFile: ~/.dsh/hook-dsh-normalize-dash.log
                replacement: "-"
                normalizeReasoning: true
                normalizeToolArguments: true
    ```

3. **Restart the host** - the loader activates the entry from `Target/Library.js` and inserts the
   patch rows at startup.

4. **Verify the ledgers** - each plugin writes its activation line to its own
   `~/.dsh/<identity>.log` at boot; the line is the "did it activate" answer, readable from the
   ledger alone:

    ```text
    hook-dsh-governor-package: activated (anywhere mode, logFile=~/.dsh/hook-dsh-governor-package.log, updateMode=programmatic, ncuBin=/usr/local/bin/ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))
    hook-dsh-pinner-package: activated (pinner, logFile=~/.dsh/hook-dsh-pinner-package.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])
    hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=~/.dsh/hook-dsh-normalize-dash.log)
    ```

---

## The Problem

Two quiet kinds of rot in every agent session:

- **The model's typography.** Every streamed transcript accumulates the unicode the model reaches
  for: em and en dashes, curly quotes, the horizontal ellipsis, exotic spaces, zero-width
  characters, fullwidth forms. The characters survive into files, diffs, searches and terminals,
  where they break byte-exact comparisons and look wrong everywhere else.
- **The project's manifests.** `package.json` chain pins point at resolutions that drifted out from
  under them, ranged dependencies resolve differently on every machine, `Cargo.toml` entries
  accumulate versions no one canonicalized.

The DeepSeek Harness exposes the seams to fix both -
[`fs/observed`][dsh-fs]
for file events, the
[`llm/stream`][dsh-llm]
waterfall for model output - and ships no plugins that use them for this.

The family is those plugins.

---

## How It Works

Three seams, three behaviors, one service underneath:

```text
    MODEL STREAM ───► the stream gate (the llm/stream waterfall) ───► the transcript, normalized
                          │  one flavor, one table: em dash → -   " → "   ... → ...
    FILE EVENT ─────► the seam (fs/observed) ───► the gate set ───► the ledger + the chain
                          │  target → actor → kind → idempotence → basename → exclusion
    RAW-WRITE ──────► the direct-govern registry (factory.Govern) ─► the same chain, per call
```

- **[The stream gate](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source/Stream)** - each normalize flavor hooks the
  [`llm/stream`][dsh-llm]
  waterfall (the interceptable wrapper around every streaming model call) and rewrites its character
  family live in the transcript: the dash family to `-`, the eight curly quote code points to their
  straight counterparts, the ellipsis to `...`, the unicode space family to the plain space, the
  zero-width/invisible family removed, the fullwidth forms to their ASCII half-width counterparts.
  The dispatch machinery (`Chunk`/`Block`, the assembled reasoning block, the tool-arguments gate)
  is shared from the core; each flavor contributes one table and one replacement.
- **The observed-file seam** - the governance trio hooks
  [`fs/observed`][dsh-fs]:
  a governed write by a mutation tool passes the gate set, then the pass runs as a detached,
  contained continuation (the chain pass for the governor, the pin pass for the pinner, the TOML
  surgery for the cargo governor), and the update stage dispatches on a cooldown with a circuit
  breaker. Every plugin writes its own ledger (`~/.dsh/<identity>.log`) and journals to the shared
  `package_governance`
  [storage domain](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/storage/storage-domain).
- **[The direct-govern registry][ours-govern]** - the `raw-write` tool's per-call `govern` selection drives the
  same chain directly through [factory.Govern][ours-govern] ([the sequential fold][ours-govern]: one step's chain completes
  before the next step reads the file), instead of waiting for an event.

---

## Architecture

### The three implementations

One contract, three trees - the ledger strings are byte-identical across all of them:

| Tree           | What it is                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Boilerplate/` | The internal baseline - the original family copies, the live `~/.dsh` source, personal paths kept by design. Never released.           |
| `Classic/`     | The plain-TypeScript release - classes, Maps and plain functions, zero runtime framework dependencies. 733 smoke assertions.           |
| `EffectTS/`    | The Effect v4 port - the same twelve contracts re-expressed on Effect-TS services and layers (the `effect` 4.0.2 pin). 746 assertions. |

### The twelve packages

Every name reads as an @-sentence: `<kind> @ <platform> @ <role> @ <domain>`.

- **[plugin-dsh-factory][ours-plugin-dsh-factory]** (Plugin @ DSH @ Factory) - the family's first service: loading it
  registers one class plugin (`static inject = ["fs"]`) that exposes `ctx.pluginFactory`, nineteen
  callable methods covering everything the hooks used to duplicate - the ledger (`Append`), the
  exclusion match (`Match`), the registry discovery (`Discover`/`Parse`), the union keep-list
  (`ResolvePolicy`), the gate set (`Gate`), [the shared write executor](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Write.ts) (`Write`/`GuardedWrite` - the
  version-guarded fenced writes), the
  [fs/observed][dsh-fs]
  re-emit (`Refresh`), the detached contained continuation (`Continue`), the State builder, the
  fiber-owned wiring (`Wire`), the effect registrations (`Attach` - jobs, inflight, storage), the P5
  journal (`Journal`), the schema factory (`Schema`), the probe-once seam (`Seam`), the Inflight key
  (`UpdateKey`) and [the direct-govern registry][ours-govern] and entry (`RegisterGovern`/`Govern` - the sequential
  fold).
- **`hook-dsh-core`** (Hook @ DSH @ Core) - the pure machinery layer, zero runtime dependencies, not
  a plugin: the dependency-section lists, the exclusion segments, the suppression-line composer, the
  update-policy loader, [the refusal guard](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source/Function/Refusal.ts), the update envelope, the activation-line composer, and
  the normalize/stream machinery (the six tables, `Replace`/`ReplaceMap`, `Chunk`/`Block`).
- **[hook-dsh-governor-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/Source)** (Hook @ DSH @ Governor @ Package) - the silent `package.json`
  governor: hooks
  [`fs/observed`][dsh-fs],
  rewrites chain-governed pins (`^x`, `~x`, `workspace:*`) to the effective registry's resolved
  versions, runs the update stage (`ncu`, programmatic library or external binary through
  [the subprocess seam][dsh-subprocess])
  on a cooldown with a circuit breaker; `strict` strips unknown dependencies - explicit only, never
  a default-delete.
- **[hook-dsh-pinner-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-pinner-package/Source)** (Hook @ DSH @ Pinner @ Package) - the silent version pinner:
  deterministically rewrites every ranged dependency version to its static version (`^0.3.4` ->
  `0.3.4`), protected by the [pin-policy.json](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-pinner-package/Source/Function/Transform.ts) keep-list; the keep-list wins over pinning, never
  over the chain.
- **[hook-dsh-governor-cargo](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-cargo/Source)** (Hook @ DSH @ Governor @ Cargo) - the Rust-sided flavor of the
  governor: surgical chain-pin rewrites on the raw TOML lines (comments survive), full-version
  normalization (`1.0` -> `1.0.0`), and `cargo upgrade` (cargo-edit) through
  [the subprocess seam][dsh-subprocess] -
  the only update path, because Rust does not co-opt into the TypeScript ecosystem; `strict` removes
  the whole `name = "..."` entry, never inherited or path/git entries.
- **[hook-dsh-normalize-dash](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-dash/Source)** (Hook @ DSH @ Normalize @ Dash) - the dash flavor: em and en dashes
  and their exotic relatives to ASCII hyphen-minus, at the injection point the reference tooling
  lacks.
- **[hook-dsh-normalize-quotes](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-quotes/Source)** (Hook @ DSH @ Normalize @ Quotes) - the quotes flavor: the eight
  curly quote code points to their ASCII straight counterparts.
- **[hook-dsh-normalize-ellipsis](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-ellipsis/Source)** (Hook @ DSH @ Normalize @ Ellipsis) - the ellipsis flavor: the
  horizontal ellipsis (U+2026) to the plain three-dot sequence.
- **[hook-dsh-normalize-spaces](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-spaces/Source)** (Hook @ DSH @ Normalize @ Spaces) - the spaces flavor: the unicode
  space family (Zs minus the ASCII space) to the plain space.
- **[hook-dsh-normalize-invisible](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-invisible/Source)** (Hook @ DSH @ Normalize @ Invisible) - the invisible flavor:
  the zero-width/invisible character family (soft hyphen, zero-width spaces and joiners, bidi
  controls, BOM) removed.
- **[hook-dsh-normalize-fullwidth](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-fullwidth/Source)** (Hook @ DSH @ Normalize @ Fullwidth) - the fullwidth flavor:
  the entire FULLWIDTH FORMS range (U+FF01-FF5E) to its ASCII half-width counterparts.
- **[hook-dsh-normalize-file](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-normalize-file/Source)** (Hook @ DSH @ Normalize @ File) - the file-content normalizer: the
  read, count, write pipeline applying all six transforms to a file already on disk - writing only
  when something changed.

### The layout

```text
    Boilerplate/     the internal baseline (the original copies, personal paths; not a release)
    Classic/         the plain-TypeScript release: 12 packages + 12 smokes
    EffectTS/        the Effect v4 port: the same 12 packages + 12 smokes
    Site/            the static site: 21 pages (the plugins, the flavors, the setup, the case study)
    Test/            the fixture archive: the governance batteries, the markdown proofs, the probes
    Documentation/   the framework, the guides, the skills, the handoff
    Maintain/        the formatting entry point
```

### The ledger-string contract

Every activation line, refusal line, chain-pass line and journal record is asserted byte-identically
by the smokes.

The strings are the contract: they must not change, and they are the same strings in all three
implementations.

One ledger per plugin, `~/.dsh/<identity>.log`; the smokes load the real built `Target/Library.js`
of each bundle and assert the full behavioral contract on top of the strings - the loader contract,
the identity assertions, the effect wiring.

### The smokes (the arbiter)

One suite per bundle per tree, run with `node <name>-smoke.mjs` from `Classic/smokes/` and
`EffectTS/smokes/`:

| Suite          | Classic | EffectTS |
| -------------- | ------: | -------: |
| core           |      14 |       17 |
| factory        |      34 |       41 |
| governor       |      78 |       81 |
| pinner         |      32 |       32 |
| cargo          |      62 |       62 |
| normalize-dash |     132 |      132 |
| quotes         |      62 |       62 |
| ellipsis       |      62 |       62 |
| spaces         |      62 |       62 |
| invisible      |      62 |       62 |
| fullwidth      |      62 |       62 |
| normalize-file |      71 |       71 |
| **Total**      | **733** |  **746** |

The EffectTS suites add coverage (core +3, factory +7, governor +3) on the same behavioral contract.

The counts are the release contract: they must not change.

---

## Tools

Two tools ship with the family:

| Tool             | What it does                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `raw-write`      | The write wrapper registered by the stream flavors: an explicit `normalize` parameter (default **false = verbatim**) - absent/false writes byte-for-byte, `true` applies all six transforms, an array applies the named flavors only. Exempt from stream normalization by name, like `edit`. The per-call `govern` selection (`true`, a name array, or `false` = the escape hatch) drives [the direct-govern fold][ours-govern]. |
| `normalize-file` | The whole-file pass: reads the file, applies the transforms (all six by default, or the flavor selection), reports the count, writes only when something changed.                                                                                                                                                                                                                                                 |

---

## Configuration

Every plugin's config schema is built through the factory's `Schema` factory: one shared volatile
block (`log`, `logFile`, `updateCooldownMs`, `mutationTools`) plus the module's own fields.

The surface, grouped by plugin kind:

| Kind                | Field                                    | Effect                                                                                                                                                                                                          |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The governance trio | `log` / `logFile`                        | the durable ledger file (each plugin keeps its own, separate by default)                                                                                                                                        |
|                     | `mutationTools`                          | which actor tools count as triggers - the deployed layers set `[write, edit, str_replace_editor, raw-write]`                                                                                                    |
|                     | `exclude`                                | the exclusion segments - the plugin's own fence (`node_modules`, `.git`, `.dsh`, ...)                                                                                                                           |
|                     | `updateCooldownMs` / `maxUpdateFailures` | the update stage's pacing and its circuit breaker (3 failures pause a directory)                                                                                                                                |
|                     | `updateMode` + `ncuBin` / `cargoBin`     | programmatic (library) vs bin (external binary via [the subprocess seam][dsh-subprocess]); absolute paths - host PATH != shell PATH |
|                     | `strict`                                 | strip unknown dependencies - explicit only, never a default-delete                                                                                                                                              |
|                     | `policyFile` / `keepFile` / `sections`   | the update-policy and keep-list sidecars, and which dependency sections the pinner touches                                                                                                                      |
| The stream flavors  | `replacement`                            | the transform's only knob on class flavors (`-`, `"`, `...`, plain space, empty) - hot-editable, no remount                                                                                                     |
|                     | `normalizeReasoning`                     | default ON - normalize reasoning deltas and the assembled reasoning block too                                                                                                                                   |
|                     | `normalizeToolArguments`                 | default OFF - tool-call arguments are execution-critical raw JSON; opt-in                                                                                                                                       |
| The file tool       | `normalize` (per call)                   | absent/false = verbatim, `true` = all six transforms, or the flavor-name array                                                                                                                                  |

The defaults-off posture: `strict` off, `normalizeToolArguments` off, `raw-write` `normalize` off -
the family changes nothing until it is told to.

The escape hatches: the `exclude` fence, the keep-list sidecars, the raw-marker opt-out, the
`govern: false` selection.

---

## Performance

The suites are the speed and coverage story:

- **733 Classic / 746 EffectTS assertions, all green.** The whole Classic battery runs in ~3 s, the
  EffectTS battery in ~7 s (Node startup dominates); the heaviest single suite (cargo, 62 checks
  including the real TOML surgery and the subprocess-seam stubs) runs in ~0.6 s.
- **Zero runtime framework dependencies in Classic** - the release tree runs on plain TypeScript;
  EffectTS adds the single `effect` 4.0.2 dependency.
- **Deterministic builds** - ESBuild + `tsc` + `tsc-alias`, minified `Target/` with `.d.ts` twins,
  byte-identical ledger strings on every rebuild.

The smokes are the arbiter after every change: they must stay green at the same counts.

---

## Relationship to deepseek-ai/deepseek-harness

The family extends the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) -
the desktop agent platform published as the `@deepseek-ai` packages.

Everything the family builds on is the harness's own public plugin API:

| Harness package                                                                                                             | What the family uses it for                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@deepseek-ai/cordis`](https://github.com/deepseek-ai/deepseek-harness/tree/master/vendor/cordis)                          | the loader contract: the service/class plugins, the patch inserts, the fiber-owned hooks                                                                                                 |
| [`@deepseek-ai/schemastery`](https://github.com/deepseek-ai/deepseek-harness/tree/master/vendor/schemastery)                | the config schemas (the factory's `Schema` factory emits real schemastery instances)                                                                                                     |
| [`@deepseek-ai/dsh-fs`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs)                         | `ctx.fs` - the governed reads, the version-guarded writes, the [`fs/observed`][dsh-fs] event vocabulary |
| [`@deepseek-ai/dsh-subprocess`][dsh-subprocess] | [the subprocess seam][dsh-subprocess] - the `ncu` and `cargo upgrade` dispatches                             |
| [`@deepseek-ai/dsh-sandbox`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/sandbox/sandbox)          | the sandbox policy - the fenced write postures                                                                                                                                           |

The harness ships the seams and no plugins that use them this way; the family adds the normalization
and the governance on top.

---

## Contributing

| Want to...            | Start here                                                                      |
| --------------------- | ------------------------------------------------------------------------------- |
| Fix a plugin          | the bundle's `README.md` + `SCHEME.md` under `Classic/packages/<bundle>/`       |
| Add a flavor          | `hook-dsh-core` (one table) + a new `hook-dsh-normalize-<name>` bundle          |
| Change behavior       | the smokes first - the counts (733/746) and the ledger strings are the contract |
| Understand the design | `Documentation/FRAMEWORK.md` and the skills under `Documentation/Skill/`        |

The regime: the smokes (and the site build) are the arbiter after every change; the ledger strings
stay byte-identical; the tree is committed by the maintainer, never by tooling.

---

## License

Released under [CC0-1.0](LICENSE) - public domain.

[ours-plugin-dsh-factory]: https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source
[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
[dsh-llm]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/llm/llm/src/index.ts
[ours-govern]: https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts
[dsh-subprocess]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess
