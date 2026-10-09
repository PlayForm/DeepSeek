# PLUGIN-FAMILY - the authoritative registry of the 25 published packages

> This document is the "plugins saved as documents" registry: the full family at
> version **0.0.1**, every name byte-accurate, every repo link absolute. It is a
> DOCUMENT, not an implementation - the packages it describes are already
> published; nothing here scaffolds new code. The planned (not yet implemented)
> orchestration plugins live separately in
> [ORCHESTRATION-PLUGINS.md](ORCHESTRATION-PLUGINS.md).
> Source of truth: the packages' own READMEs/SCHEMs/Sources under
> `Classic/packages/` and `EffectTS/packages/`, plus the root README.

## 0. The family at a glance

- **Version: 0.0.1 for all 25 packages.** Names byte-accurate as below; the
  legacy `ets-dsh-hook-*` naming is gone (the namespace split, SPLICE-ETS.md).
- **Two published trees, one contract:** the CLASSIC split
  (`@playform/hook-dsh-*`, `@playform/plugin-dsh-*` - plain TypeScript, zero
  runtime framework dependencies, 733 smoke assertions) and the EFFECT-TS split
  (`@playform/ets-*` - the same contracts on Effect v4.0.2 services and layers,
  746 assertions, with `@playform/ets-base-dsh` as the plumbing base).
  Never mix the two splits in one dependency graph - the EffectTS `Update`
  returns Effect envelopes, not the classic dispatch envelope.
- **One ledger-string contract:** every activation line, refusal line,
  chain-pass line and journal record is asserted byte-identically by the smokes,
  in all implementations. One ledger per plugin: `~/.dsh/<identity>.log`.
- **Every name reads as an @-sentence:** `<kind> @ <platform> @ <role> @
  <domain>` (e.g. Hook @ DSH @ Normalize @ Dash).
- **The event surfaces used by the family:** `llm/stream` (the streaming
  waterfall - the normalize flavors' rewrite point), `fs/observed` (the
  observed-file event - the governance trio's trigger), the tool execution
  surface (the mutation tools - write/edit/str_replace_editor/raw-write - via
  the factory's pre/post-execute gating and the direct-govern registry), plus
  the loader surface (cordis patch inserts at profile startup).

## 1. The 25 names (the registry list)

**EffectTS base (1):**

| # | Package | Archetype | Event surface |
|---|---------|-----------|---------------|
| 1 | `@playform/ets-base-dsh` | Base | (library - the plumbing every ets-* package builds on) |

**Classic (12):**

| # | Package | Archetype | Event surface |
|---|---------|-----------|---------------|
| 2 | `@playform/hook-dsh-core` | Hook (library) | none (pure machinery layer - consumed by the other hooks) |
| 3 | `@playform/plugin-dsh-factory` | Plugin (service) | tool pre/post-execute gating; `fs/observed` re-emit; direct-govern registry |
| 4 | `@playform/hook-dsh-cargo-governor` | Hook | `fs/observed` + tool post-execute |
| 5 | `@playform/hook-dsh-package-governor` | Hook | `fs/observed` + tool post-execute |
| 6 | `@playform/hook-dsh-package-pinner` | Hook | `fs/observed` + tool post-execute |
| 7 | `@playform/hook-dsh-normalize-dash` | Hook | `llm/stream` |
| 8 | `@playform/hook-dsh-normalize-quotes` | Hook | `llm/stream` |
| 9 | `@playform/hook-dsh-normalize-ellipsis` | Hook | `llm/stream` |
| 10 | `@playform/hook-dsh-normalize-spaces` | Hook | `llm/stream` |
| 11 | `@playform/hook-dsh-normalize-invisible` | Hook | `llm/stream` |
| 12 | `@playform/hook-dsh-normalize-fullwidth` | Hook | `llm/stream` |
| 13 | `@playform/hook-dsh-normalize-file` | Hook (tool) | tool surface (`normalize-file` tool) |

**EffectTS (12):**

| # | Package | Archetype | Event surface |
|---|---------|-----------|---------------|
| 14 | `@playform/ets-hook-dsh-core` | Hook (library) | none (pure machinery on Effect layers) |
| 15 | `@playform/ets-plugin-dsh-factory` | Plugin (service) | same surface as the Classic factory, Effect envelopes |
| 16 | `@playform/ets-hook-dsh-cargo-governor` | Hook | `fs/observed` + tool post-execute |
| 17 | `@playform/ets-hook-dsh-package-governor` | Hook | `fs/observed` + tool post-execute |
| 18 | `@playform/ets-hook-dsh-package-pinner` | Hook | `fs/observed` + tool post-execute |
| 19 | `@playform/ets-hook-dsh-normalize-dash` | Hook | `llm/stream` |
| 20 | `@playform/ets-hook-dsh-normalize-quotes` | Hook | `llm/stream` |
| 21 | `@playform/ets-hook-dsh-normalize-ellipsis` | Hook | `llm/stream` |
| 22 | `@playform/ets-hook-dsh-normalize-spaces` | Hook | `llm/stream` |
| 23 | `@playform/ets-hook-dsh-normalize-invisible` | Hook | `llm/stream` |
| 24 | `@playform/ets-hook-dsh-normalize-fullwidth` | Hook | `llm/stream` |
| 25 | `@playform/ets-hook-dsh-normalize-file` | Hook (tool) | tool surface (`normalize-file` tool) |

Absolute-link rule for any repo target in docs/prompts/skills:
`https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/<pkg>` or
`https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/<pkg>`.

## 2. The packages, one paragraph each (Classic truth; each has its ets- twin)

### The base and the machinery

- **`@playform/ets-base-dsh`** (Base) - the EffectTS plumbing package: the
  shared Effect types, service tags, layer helpers and runtime conveniences
  every `ets-*` package builds on, so the EffectTS tree's twelve contracts share
  one base instead of duplicating the plumbing per package. Effect v4.0.2 is the
  single shared runtime dependency.
- **`@playform/hook-dsh-core`** (Hook @ DSH @ Core) - the pure machinery layer,
  zero runtime dependencies, not itself a plugin: the dependency-section lists,
  the exclusion segments, the suppression-line composer, the update-policy
  loader, the refusal guard, the update envelope, the activation-line composer,
  and the normalize/stream machinery - the six character tables plus
  `Replace`/`ReplaceMap` and the `Chunk`/`Block` dispatch (per-chunk
  application, the assembled reasoning block, the tool-arguments gate). Each
  normalize flavor contributes one table and one replacement on top of this.

### The service

- **`@playform/plugin-dsh-factory`** (Plugin @ DSH @ Factory) - the family's
  first service: loading it registers one class plugin (`static inject = ["fs"]`)
  exposing `ctx.pluginFactory`, nineteen callable methods covering everything
  the hooks used to duplicate - the ledger (`Append`), the exclusion match
  (`Match`), registry discovery (`Discover`/`Parse`), the union keep-list
  (`ResolvePolicy`), the gate set (`Gate`), the shared write executor
  (`Write`/`GuardedWrite`, version-guarded fenced writes), the `fs/observed`
  re-emit (`Refresh`), the detached contained continuation (`Continue`), the
  State builder, fiber-owned wiring (`Wire`), effect registrations (`Attach`),
  the P5 journal (`Journal`), the schema factory (`Schema`), the probe-once seam
  (`Seam`), the inflight key (`UpdateKey`), and the direct-govern registry and
  entry (`RegisterGovern`/`Govern` - the sequential fold: one step's chain
  completes before the next step reads the file). The loader contract is
  `name`/`apply`/`Config`/`inject` on the default export.

### The governance trio

- **`@playform/hook-dsh-package-governor`** (Hook @ DSH @ Governor @ Package) -
  the silent package.json governor: hooks `fs/observed`; a governed write by a
  mutation tool passes the gate set, then the pass runs as a detached, contained
  continuation - chain-governed pins (`^x`, `~x`, `workspace:*`) rewritten to
  the effective registry's resolved versions, then the update stage (`ncu`,
  programmatic library or external binary through the subprocess seam) on a
  cooldown with a circuit breaker (`maxUpdateFailures` - 3 consecutive failures
  pause a directory). `strict` strips unknown dependencies - explicit only,
  never a default-delete.
- **`@playform/hook-dsh-package-pinner`** (Hook @ DSH @ Pinner @ Package) - the
  silent version pinner: deterministically rewrites every ranged dependency
  version to its static version (`^0.3.4` -> `0.3.4`), protected by the
  pin-policy.json keep-list (discovery order: configured `policyFile` -> repo
  walk-up -> built-in default; the union of keep-lists). The keep-list wins over
  pinning, never over the chain. Sections covered: dependencies,
  devDependencies, peerDependencies, optionalDependencies.
- **`@playform/hook-dsh-cargo-governor`** (Hook @ DSH @ Governor @ Cargo) - the
  Rust-sided flavor: surgical chain-pin rewrites on the raw TOML lines
  (comments survive), full-version normalization (`1.0` -> `1.0.0`), and
  `cargo upgrade` (cargo-edit) through the subprocess seam - the only update
  path, because Rust does not co-opt into the TypeScript ecosystem. `strict`
  removes the whole `name = "..."` entry, never inherited or path/git entries.

### The seven normalize flavors

All flavors hook `llm/stream` (the interceptable wrapper around every streaming
model call) and rewrite their character family live in the transcript - both the
live UI and the durable transcript; the normalization is deliberately visible.
Per-chunk, single-character replacement (chunk-boundary-safe by construction):
no lookahead/lookbehind, no multi-character sequences. Two register tools:
`raw-write` (per-call `normalize` selection, default false = verbatim) and
`normalize-file` (the whole-file pass, write only when something changed).

- **`@playform/hook-dsh-normalize-dash`** - the dash flavor: em and en dashes
  and their exotic relatives (U+058A, U+05BE, U+1400, U+1806, U+2010-2015,
  U+2E17, U+2E1A, U+2E3A-2E3B, U+2E40, U+2E5D, U+301C, U+3030, U+30A0,
  U+FE31-FE32, U+FE58, U+FE63, U+FF0D) to ASCII hyphen-minus via the config
  `replacement` (default `-`).
- **`@playform/hook-dsh-normalize-quotes`** - the eight curly quote code points
  to their ASCII straight counterparts.
- **`@playform/hook-dsh-normalize-ellipsis`** - the horizontal ellipsis
  (U+2026) to the plain three-dot sequence.
- **`@playform/hook-dsh-normalize-spaces`** - the unicode space family
  (Zs minus the ASCII space) to the plain space.
- **`@playform/hook-dsh-normalize-invisible`** - the zero-width/invisible
  character family (soft hyphen, zero-width spaces and joiners, bidi controls,
  BOM) removed.
- **`@playform/hook-dsh-normalize-fullwidth`** - the entire FULLWIDTH FORMS
  range (U+FF01-FF5E) to its ASCII half-width counterparts.
- **`@playform/hook-dsh-normalize-file`** - the file-content normalizer: the
  read, count, write pipeline applying all six transforms to a file already on
  disk - writing only when something changed (the `normalize-file` tool).

## 3. The config keys (from the packages' SCHEMs/READMEs)

Every plugin's config schema is built through the factory's `Schema` factory:
one shared volatile block plus the module's own fields. Invalid configuration
fails at load; every default is validated and filled.

| Key | Owner | Effect | Default |
|-----|-------|--------|---------|
| `log` | all | enable the durable ledger | true |
| `logFile` | all | the ledger path (`~/.dsh/<identity>.log` convention) | per plugin |
| `updateCooldownMs` | governors/pinner | the update stage's pacing | 3000 |
| `mutationTools` | governors/pinner | which actor tools count as triggers (`[write, edit, str_replace_editor, raw-write]` in the deployed layers) | factory shared block |
| `maxUpdateFailures` | governors | the circuit breaker (3 consecutive failures pause a directory) | 3 |
| `updateMode` | governors | `programmatic` (library) vs external binary via the subprocess seam | programmatic |
| `ncuBin` / `cargoBin` | governors | absolute binary paths (host PATH != shell PATH) | empty |
| `strict` | governors | strip unknown dependencies - explicit only, never a default-delete | false |
| `policyFile` | governors | the update-policy sidecar; empty = discovery | "" |
| `exclude` | governors/pinner | the exclusion fence (`node_modules`, `.git`, `.dsh`, `.pnpm`, `.store`, `DeepSeek Harness.app`) | the factory default list |
| `keepFile` / `sections` | pinner | the keep-list sidecar and which dependency sections the pin pass touches | discovery / all four |
| `replacement` | class stream flavors | the transform's single knob (`-`, `"`, `...`, plain space, empty) - hot-editable, no remount | per flavor |
| `normalizeReasoning` | stream flavors | normalize reasoning deltas and the assembled reasoning block too | true (on) |
| `normalizeToolArguments` | stream flavors | tool-call arguments are execution-critical raw JSON - opt-in | false (off) |
| `normalize` (per call) | `raw-write` | absent/false = verbatim, true = all six transforms, or the flavor-name array | false |
| `govern` (per call) | `raw-write` | the direct-govern selection: true / "all" / a step-name array / false = the escape hatch | absent |

The defaults-off posture: `strict` off, `normalizeToolArguments` off,
`raw-write` `normalize` off - the family changes nothing until it is told to.
The escape hatches: the `exclude` fence, the keep-list sidecars, the raw marker
(`__normalize: false`), the `govern: false` selection.

## 4. The ledger / logFile conventions

- One ledger per plugin, `~/.dsh/<identity>.log` (the plugin's Module name is
  the logger/ledger prefix; the identity strings are byte-identical across all
  three trees - Boilerplate, Classic, EffectTS - and asserted by the smokes).
- The activation line at boot is the "did it activate" answer, readable from the
  ledger alone, e.g.:
  `hook-dsh-package-governor: activated (anywhere mode, logFile=..., updateMode=programmatic, ...)`.
- Refusal lines, chain-pass lines and update-stage lines are also ledger
  strings - part of the contract, must not change.
- The journals flow to the shared `package_governance` storage domain (the P5
  journal, pre-open queue capped 256); ISO UTC timestamps in the ledger lines,
  epoch milliseconds in the storage records.
- The smokes load the real built `Target/Library.js` of each bundle and assert
  the full behavioral contract on top of the strings; 733 Classic / 746
  EffectTS assertions are the release contract.

## 5. The wiring (the four steps)

1. Add the bundles to the profile (`~/.dsh/profiles/<name>/package.json`) as
   `link:` dependencies and in `dsh.profile.bundles` (the list is what
   activates them).
2. Add the patch entries (the profile's `cordis.patch.yml`) - one insert row per
   bundle (`- insert: [- id: <pkg>, name: "@playform/<pkg>", config: {...}]`),
   the config fields straight from the bundle's schema.
3. Restart the host - the loader activates the entry from `Target/Library.js`
   and inserts the patch rows at startup.
4. Verify the ledgers - each plugin's activation line in its own
   `~/.dsh/<identity>.log`.

Note: load order is not list order (the pinner can activate before the governor)
- never rely on the bundle-list order for step ordering; each plugin's ledger
  answers for its own activation.
