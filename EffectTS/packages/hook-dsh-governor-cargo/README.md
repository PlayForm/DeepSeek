# @playform/hook-dsh-governor-cargo

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-governor-cargo&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-governor-cargo)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-governor-cargo)
[![variant](https://img.shields.io/static/v1?label=variant&message=EFFECT-TS&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=CLASSIC&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **Cargo.toml flavor of the silent package.json governor** - the same architecture, the same
> API-awareness discipline, the same silence toward the author, but for RUST manifests, with the
> update stage driven by the RUST-SIDE CLI (`cargo upgrade`, from cargo-edit): Rust does not co-opt
> into the TypeScript ecosystem, so there is no npm-library equivalent - the update stage operates
> at the exclusionary level through the cargo CLI.
>
> _A factory flavor: chain canonicalization + full-version normalization + surgical TOML rewriting +
> `cargo upgrade --exclude` - comments survive._
>
> _The @-sentence identity: **Hook @ DSH @ Governor @
> Cargo**._
>
> Every claim below is live-verified (2026-10-03, live).

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Governor @ Cargo**): a hook child of the
[`plugin-dsh-factory`](../plugin-dsh-factory) service and the [`hook-dsh-core`](../hook-dsh-core)
helpers; the Rust-sided sibling of the two npm governance hooks on the same
[`fs/observed`][dsh-fs] seam.

One of three governance hooks sharing the
[`fs/observed`][dsh-fs] seam, each gating on its own basename and
writing its own ledger:

| plugin                                                      | basename gate  | ledger                          | pass                                                 |
| ----------------------------------------------------------- | -------------- | ------------------------------- | ---------------------------------------------------- |
| [`hook-dsh-governor-package`](../hook-dsh-governor-package) | `package.json` | `hook-dsh-governor-package.log` | chain pass (→ `^resolved`) + update stage (ncu)      |
| [`hook-dsh-pinner-package`](../hook-dsh-pinner-package)     | `package.json` | `hook-dsh-pinner-package.log`   | pin pass (`^0.3.4` → `0.3.4`; keep-list wins)        |
| [hook-dsh-governor-cargo][ours-hook-dsh-governor-cargo] (this bundle)                     | `Cargo.toml`   | `hook-dsh-governor-cargo.log`   | chain pass (bare caret / `=exact`) + `cargo upgrade` |

The basenames are disjoint: the cargo module never sees a `package.json` event and the npm plugins
never see a `Cargo.toml` event.

Composition semantics: **chain > strip > normalize** (this module's
precedence), **keep-list wins** over normalization - never over the chain.

The ledgers are separate;
activating one never implies another.

Machinery-wise it is a **factory flavor**: `inject: ["fs", "pluginFactory"]`

- gates, discovery, the guarded write, the refresh, the continuation, the effects, the schema and
  the namespaced `UpdateKey` come from [`plugin-dsh-factory`](../plugin-dsh-factory); the policy
  loader and the suppression composer come from [`hook-dsh-core`](../hook-dsh-core). This bundle
  keeps the Cargo-specific residue: the TOML identification, the surgical pin, the full-version
  directive, and the `cargo upgrade` bridge. Besides the
[`fs/observed`][dsh-fs] event path, its two steps are
  registered with the factory's direct-govern registry at apply
  (`Factory.RegisterGovern("Cargo.toml", "cargo" | "update", …)` — factory SCHEME.md §2.16), so the
  `raw-write` tool's per-call `govern` selection can drive the same chain + normalization pass and
  update stage directly through [Factory.Govern](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/plugin-dsh-factory/Source/Function/Govern.ts) (Function/Direct — same machinery, same ledger
  strings).

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

### Install

1. **Remote / dependency install (auto-activation):** `pnpm add @playform/hook-dsh-governor-cargo`
   in the profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`).
2. **Local git clone:** clone → `pnpm install --ignore-workspace` (the bundle carries its own
   node_modules - smol-toml) → `npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` →
   `dsh plugin --profile <name> add <this directory>`.
3. **Native dsh install:**
   `dsh plugin --profile <name> add ./local-hook-dsh-governor-cargo-<v>.tgz`.

All three end the same way: the loader activates the entry from `Target/`, [cordis.patch.yml][ours-cordis-patch]
inserts the [hook-dsh-governor-cargo][ours-hook-dsh-governor-cargo] row, and the ledger logs `activated (cargo flavor, ...)` at
the next host start.

### Usage

The bundle is configured through its [cordis.patch.yml][ours-cordis-patch] row (or the profile's `dsh.bundle`
manifest) - the full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-governor-cargo
        name: "@playform/hook-dsh-governor-cargo"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-governor-cargo.log
            updateMode: cargo
```

---

## The Problem

Rust manifests drift the same way npm manifests do - but `Cargo.toml` is a TOML document people
decorate with comments, and there is no in-process library path: the only update tool is the cargo
CLI.

A governor for `Cargo.toml` must therefore rewrite surgically (never a TOML stringify) and
delegate its update stage across the Rust/TS boundary - while still hooking the same
[`fs/observed`][dsh-fs]
event the npm hooks use, so one trigger law covers the whole machine.

---

## How It Works

**`The pipeline G = U ∘ P`**

```text
  fs/observed (target, {kind:"present", version}, actor)
  ── fired by the TOOL LAYER ONLY, for every harness write/edit, any thread ──►
       │
       ▼
  G1  Factory.Gate ── displayPath → actor ∈ mutationTools → kind "present" →
  │                    Stash idempotence → basename "Cargo.toml" → excluded?
  │     excluded ──► ledger `skipped (excluded) <path>`   (every other gate
  ▼                  outcome is silent)                      outcome proceeds)
  G2  Factory.Discover + Factory.Parse ── nearest registry.json walk-up
  │     (THE USER'S OWN registry - the same discovery as the npm governor;
  │      none / unreadable ──► ledger line, chain canonicalization skipped)
  ▼
  Stash seed (targetKey, version) ── our own re-emits re-enter as no-ops
       │
       ▼  detached, contained  (Factory.Continue - the listener never awaits)
  G3  CHAIN PASS (the pure transform) ── ParseToml (smol-toml, IDENTIFICATION
  │     ONLY) → Satisfy (the plan): 1. CHAIN - dep ∈ registry.effectiveLatest
  │     → the bare resolved version (Cargo's implicit caret) or `=resolved`
  │     with pinStyle "exact", always the FULL form (shorthand padded);
  │     2. STRIP - strict-mode unknown deps (whole `name = "..."` entry gone,
  │     only with a registry); 3. NORMALIZE - every other simple version
  │     (full-version directive below; the keep-list wins → byte-identical)
  │     → Pin (SURGICAL LINE REWRITE on the raw text - comments, inline
  │     comments, blank lines and spacing survive byte-for-byte) →
  │     GuardedWrite (replaceIfVersion + the P4 fence) → ledger
  │     `governed <path> → <version>` → Refresh (P3 re-emit, same actor)
  ▼  chained off the settled continuation (Function/Follow)
  G4  UPDATE STAGE (the Rust/TS boundary) ── breaker → in-flight → cooldown →
  │     the jobs envelope (kind "governor-update", unowned) or the detached
  │     fallback → Policy loader → Upgrade via ctx.subprocess (fully-specified
  │     argv, collect-mode output piped to the job ring + the ledger):
  │          cargo upgrade --manifest-path <Cargo.toml>
  │                    --exclude <crate> ...   (ONE flag per crate - the comma
  │                                          form is silently IGNORED)
  │                    [-p <crate> ...] [--compatible/--incompatible/--pinned ...]
  │          exclude = policy.reject ∪ chain deps (the cordis-trap guard:
  │          cargo upgrade must never bump a chain-governed pin)
  │     → Verify (verifyCommand via /bin/sh -c, exit 127 non-fatal) →
  │       Settle → Refresh (U2: re-stat + re-emit the fresh version)
  ▼
  SILENCE: the tool result shows exactly what the author wrote.
  The governed state is discoverable only by a subsequent read - or in
  the ledger.
```

The G4 update-stage envelope - the Dispatch/Settle pair of the diagram above (the gates, the jobs
envelope, the breaker update, the U2 refresh) - lives in the core ([@playform/hook-dsh-core](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-core/Source)'s
`Function/Update`); this module is a thin delegate that injects its own collections, the cargo child
runner and its ledger strings, so the flow is not forked per governance module.

### The full-version normalization directive

The user prefers full versions - no shorthand like "1.0" may remain in a governed Cargo.toml; every
dependency version is expanded to its MOST SPECIFIC form:

| Written                             | Governed                                       |
| ----------------------------------- | ---------------------------------------------- |
| `1.0`                               | `1.0.0`                                        |
| `1`                                 | `1.0.0`                                        |
| `0.1`                               | `0.1.0`                                        |
| `=1.0`                              | `=1.0.0` (the exact form keeps its `=` prefix) |
| `1.2-rc.1`                          | `1.2.0-rc.1` (padded BEFORE the prerelease)    |
| `1.2.3-rc.1`                        | unchanged (prerelease preserved as authored)   |
| `1.2.3+build`                       | unchanged (build metadata preserved)           |
| `>=1.2`, `~0.3`, `>1.0`, `1.0, 2.0` | unchanged (complex ranges left as-is)          |

Precedence, in order: **(1) chain** - a dep in `registry.effectiveLatest` is canonicalized to the
FULL resolved form (even a shorthand registry entry yields a full output); **(2) strip** -
strict-mode unknown deps; **(3) normalize** - every other simple version, UNLESS the name is in the
**keep-list** ([pin-policy.json](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-pinner-package/Source/Function/Transform.ts) via `keepFile` - the same sidecar the pinner uses; discovery:
global `keepFile` → the file's own directory → registry-adjacent, the union).

**The keep-list wins
over normalization; the chain is never suppressed.**

Cargo semantics are unchanged: a bare full
version is still Cargo's implicit caret.

### The TOML rewrite (why comments survive)

`smol-toml` (the ONE runtime dependency, carried by the bundle's own `node_modules`) is used for
**PARSING ONLY** - identification of the dep entries in `[dependencies]`, `[dev-dependencies]`,
`[build-dependencies]`, `[target.'cfg(...)'.dependencies]` (and its dev/build variants), and
**`[workspace.dependencies]`** (the shared dep table - handled natively).

The rewrite itself
(Function/Pin) is **surgical line-level string manipulation on the raw text** - so comments, inline
comments, blank lines, and spacing survive byte-for-byte.

Handled entry shapes: `name = "0.3.4"`,
`name = { version = "0.3.4", ... }` (single line or pretty-printed), `[dependencies.name]` table
style.

Never rewritten: `path = "..."`, `git = "..."`, and inherited entries (`workspace = true` -
the version lives in the workspace table, walked separately).

Non-dependency sections are NEVER
touched: [the refusal guard](https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-core/Source/Function/Refusal.ts) refuses any plan entry outside an identified dependency table
(`REFUSED rewrite of ...: non-dependency section "..." would change`), and `Pin` aborts (never a
partial rewrite) if a planned entry cannot be located in the text.

### The Rust side (live-verified)

- `cargo` 1.100.0-nightly + cargo-edit 0.13.13, resolved through `cargoBin` (the schema default is
  the bare `cargo`, found via
  [the subprocess seam](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/subprocess/subprocess)'s `resolveExecutable`; set an absolute path when
  the host PATH is not the shell PATH).
- **`--exclude` is ONE flag per crate** - the comma form is silently IGNORED (`--exclude a,b`
  excludes nothing), the exact inverse of ncu's one-comma-argument reject list, which is why this
  module cannot reuse the parent's argv builder.
- **There is NO `--exact` flag** in cargo-edit 0.13.13 - exact pins are enforced at the manifest
  level by the chain pass (`pinStyle: "exact"` → `=resolved`).
- `cargo upgrade` preserves comments and formatting (it edits via `toml_edit`), rewrites every
  dependency table, and exits 0 on success / 1 on errors.
- If cargo-edit is NOT installed, `cargo upgrade` exits 101 with `no such command: upgrade` - the
  module logs `update: cargo-edit unavailable: ...` and fails gracefully (the breaker counts it; the
  manifest is untouched).

### Update-stage policy mapping

`update-policy.json` (same discovery as the npm governor: global `policyFile` → the file's own
directory → registry-adjacent → built-in default):

| Policy field                             | cargo-edit mapping (0.13.13)                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `reject`                                 | `--exclude <crate>` - ONE flag per crate (comma form ignored)                     |
| `allow`                                  | `-p <crate>` - repeatable                                                         |
| `incompatible` / `pinned` / `compatible` | `--incompatible` / `--pinned` / `--compatible <allow\|ignore>`                    |
| `pinStyle`                               | NO CLI equivalent (no `--exact` exists) - manifest-level via the chain pass       |
| `depGroups` / `targets` / `concurrency`  | NO equivalent                                                                     |
| `verifyCommand`                          | run after the upgrade via `ctx.subprocess` (`/bin/sh -c ...`), exit 127 non-fatal |

The built-in default mirrors `cargo upgrade`'s own semantics: no rejects, `incompatible: "ignore"`,
`pinned: "ignore"`, `pinStyle: "caret"`, no verifyCommand (never install implicitly).

### The Source Layout

TypeScript-first, built with `@playform/build` (ESBuild + tsc type-check):

```text
hook-dsh-governor-cargo/
├── Source/                  ← TypeScript (NOT shipped)
│   ├── Library.ts           ← entry: name / apply / Config / inject
│   │                          + default { name, apply, Config, inject }
│   ├── Function/            ← Apply.ts (thin wire-up), Observe.ts,
│   │   │                      Transform.ts (the TOML pipeline leaf),
│   │   │                      ParseToml.ts, Pin.ts (+ Pin/KeyOf, Name,
│   │   │                      SpliceVersion, SplitPath), Normalize.ts,
│   │   │                      Satisfy.ts, Filter.ts, Resolve.ts, Run.ts,
│   │   │                      Dispatch.ts, Verify.ts, Settle.ts, Decode.ts
│   │   └── Update/          ← Policy.ts, Upgrade.ts (the Rust/TS bridge,
│   │                           + Upgrade/Child, Collect, Seam, Unavailable)
│   ├── Interface/           ← typed contracts (State, Factory, Plan, ...)
│   └── Variable/            ← constants, defaults, the Config schema
├── Configuration/
│   └── ESBuild.ts           ← the @playform/build custom config (+ .js twin)
├── Target/                  ← built output (SHIPPED: .js + .d.ts)
├── cordis.patch.yml         ← the loader row (id: hook-dsh-governor-cargo)
├── package.json             ← main → Target/Library.js
└── README.md / SCHEME.md    ← usage + the design document
```

The published artifact contains **only the built output**; the only npm script is `prepublishOnly`
(`Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts`).

### The Hard Lessons

1. **`inject` and `Config` must sit on the DEFAULT export object** - named- only exports are
   shadowed and service accessors throw.
2. **`apply` must return nothing** - a returned value silently kills event delivery. Test probes use
   `Context.__cargoGovernorState`.
3. **The update stage runs in the jobs envelope when a controller serves the context, with the
   detached contained continuation as the probed fallback** - the earlier "ctx.jobs is agent-scoped"
   premise was refuted live: a root plugin's controller (attached by the factory's `Attach`) serves
   every owner.
4. **`ctx.fs.writeText` from a root plugin needs an explicit sandbox policy**
    - this module passes `{ mode: "danger-full-access" }` because its own exclude list IS its fence.
5. **cargo-edit's `--exclude` is one flag per crate** - the comma form is silently ignored (the
   inverse of ncu's one-comma argument).
6. **cargo-edit has no `--exact`** - exact pins are a manifest-level concern (the chain pass's
   `pinStyle: "exact"`).

---

## The Config

The exported `Config` schema validates and fills every default at load; new patch entries are
declared with `insert:`.

```yaml
- insert:
      - id: hook-dsh-governor-cargo
        name: "@playform/hook-dsh-governor-cargo"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-governor-cargo.log # SEPARATE ledger - never the npm ledgers
            updateCooldownMs: 3000
            strict: false # strip unknown deps - explicit only, never a default
            mutationTools: [write, edit, str_replace_editor]
            maxUpdateFailures: 3 # circuit breaker: pause a dir's update stage
            cargoBin: /usr/local/bin/cargo # absolute - host PATH != shell PATH
            updateMode: cargo # the ONLY mode (the Rust-side CLI)
            policyFile: "" # optional global update-policy.json
            keepFile: "" # optional global pin-policy.json (the keep-list)
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

---

## In Action

One governed write.

The author saves a `Cargo.toml` with comments, a shorthand version, and a
chain-governed dep:

```toml
[dependencies]
# the engine — keep the comment alive
serde = "1.0"              # shorthand: must become 1.0.0
tokio = { version = "0.4.1", features = ["full"] }  # chain-governed
```

With the nearest `registry.json` resolving tokio to 0.4.5, the surgical rewrite produces (same text,
same comments, same inline spacing):

```toml
[dependencies]
# the engine — keep the comment alive
serde = "1.0.0"            # shorthand: must become 1.0.0
tokio = { version = "0.4.5", features = ["full"] }  # chain-governed
```

The transcript shows only what the author wrote; the ledger shows the pass:

```text
[2026-10-03T09:15:22.411Z] activated (cargo flavor, logFile=~/.dsh/hook-dsh-governor-cargo.log, updateMode=cargo, cargoBin=/usr/local/bin/cargo, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery), keepFile=(discovery))
[2026-10-03T09:16:01.880Z] governed ~/Projects/acme/engine/Cargo.toml → 42
[2026-10-03T09:16:34.120Z] update stage dispatched for ~/Projects/acme/engine (cargo via /usr/local/bin/cargo, built-in default policy)
[2026-10-03T09:16:41.502Z] update: cargo upgrade --manifest-path ~/Projects/acme/engine/Cargo.toml --exclude serde tokio → {"exitCode":0}
[2026-10-03T09:16:41.503Z] update: DONE — pins bumped per policy
```

(Here the policy's chain deps plus rejects became one `--exclude` flag per crate; `serde` and
`tokio` are protected from the CLI bump - tokio by the chain, serde by the normalization pass
already writing its full form.)

Read the file back to see the governed state; write it again
immediately and nothing complains - no `FS_STALE_VERSION`.

Write inside `node_modules`/`.git`/`.dsh`
and the ledger gains `skipped (excluded) ...` while the file stays untouched.

Remove cargo-edit and
the pass fails gracefully: `update: cargo-edit unavailable: ...`, the manifest untouched, the
breaker counting the failure.

---

## The Ledger

One global log (`logFile`, default `~/.dsh/hook-dsh-governor-cargo.log` - SEPARATE from the npm
ledgers) records activation, exclusions, chain-pass results, refusals, and every update-stage
dispatch.

The strings this module composes (the hook-dsh-governor-cargo: logger prefix is the
factory's `Append`; each line is `[<ISO>] <message>` in the file):

```text
activated (cargo flavor, logFile=..., updateMode=cargo, cargoBin=..., exclude=[...], policyFile=(discovery), keepFile=(discovery))
skipped (excluded) <path>
no registry.json found for <path>
governed <path> → <version>
update stage dispatched for <dir> (cargo via ..., policy ...)
update: cargo upgrade <argv> → {"exitCode":0}
update: DONE / update: FAILED
update: cargo-edit unavailable: <cause>
```

(The registry-miss line ends with an em dash followed by `chain pass skipped`; the DONE line is
`update: DONE` + em dash + reason - byte-exact forms are in the In Action excerpt above.

Those em
dashes are part of the literal ledger strings, so they live only in the example block.)

The activation line is written by `apply()` - "did it activate" must be answerable from the ledger
alone.

---

## License 📜

CC0-1.0.

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
[ours-hook-dsh-governor-cargo]: https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-governor-cargo/Source
[ours-cordis-patch]: https://github.com/PlayForm/DeepSeek/tree/Current/EffectTS/packages/hook-dsh-governor-cargo/cordis.patch.yml
