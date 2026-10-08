# @playform/hook-dsh-governor-package

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-governor-package&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-governor-package)
[![release](https://img.shields.io/static/v1?label=release&message=v0.0.1&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-governor-package)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **silent package.json governor** of the DeepSeek Harness - a plugin on the [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) event
> (the cordis event **every harness file write dispatches**; the tool layer is the only dispatcher)
> that governs every `package.json` written by any agent, anywhere: a pure chain pass canonicalizes
> chain-governed dependency pins, then an update stage lets npm-check-updates bump the public ones -
> and the author never learns.
>
> _A factory flavor: the family's furnace does the plumbing; this package is the model logic. The
> @-sentence identity: **Hook @ DSH @ Governor @ Package**._

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Governor @ Package**): a hook child of the
[`plugin-dsh-factory`](../plugin-dsh-factory) service and the [`hook-dsh-core`](../hook-dsh-core)
helpers; it has no hook children of its own.

One of three governance hooks sharing the [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) seam, each gating on its own basename and
writing its own ledger:

| plugin                                                  | basename gate  | ledger                          | pass                                                 |
| ------------------------------------------------------- | -------------- | ------------------------------- | ---------------------------------------------------- |
| [hook-dsh-governor-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/Source) (this bundle)               | `package.json` | `hook-dsh-governor-package.log` | chain pass (→ `^resolved`) + update stage (ncu)      |
| [`hook-dsh-pinner-package`](../hook-dsh-pinner-package) | `package.json` | `hook-dsh-pinner-package.log`   | pin pass (`^0.3.4` → `0.3.4`; keep-list wins)        |
| [`hook-dsh-governor-cargo`](../hook-dsh-governor-cargo) | `Cargo.toml`   | `hook-dsh-governor-cargo.log`   | chain pass (bare caret / `=exact`) + `cargo upgrade` |

Composition semantics when several are activated: **pin → bump-exact** (a fully pinned manifest
leaves ncu nothing to do; the chain pass may still re-canonicalize chain pins), **chain > strip >
normalize** (the cargo module's precedence), **keep-list wins** (the pinner's [pin-policy.json](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-pinner-package/Source/Function/Transform.ts)
keeps ranges as authored). The ledgers are separate; activating one never implies another.

Machinery-wise it is a **factory flavor**: `inject: ["fs", "pluginFactory"]`

- the gates, the discovery, the guarded write, the refresh, the continuation, the effects and the
  schema come from [`plugin-dsh-factory`](../plugin-dsh-factory); the pure helpers (`Suppress`, the
  policy loader) come from [`hook-dsh-core`](../hook-dsh-core). This bundle keeps only its own
  vocabulary: the Config extension, the chain pass (Function/Transform), the update engine
  (Function/Follow → Dispatch → Execute → Update/* → Settle) and every ledger string. Besides the
  [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) event path, its two steps are registered with the factory's direct-govern registry
  at apply (`Factory.RegisterGovern("package.json", "canonicalize" | "update", …)` — factory
  SCHEME.md §2.16), so the `raw-write` tool's per-call `govern` selection can drive the same chain
  pass and update stage directly through [Factory.Govern](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts) (Function/Direct — same machinery, same
  ledger strings).

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem:
TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only -
the same conventions as every other @playform package.

### Install

1. **Remote / dependency install (auto-activation):** add the package as a plain dependency of a
   profile - the `dsh.bundle` manifest makes it a harness bundle, installed automatically and
   activated at the next host start: `pnpm add @playform/hook-dsh-governor-package` in the profile
   dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`).
2. **Local git clone:** clone → `pnpm install --ignore-workspace` (the bundle carries its own
   node_modules) → `npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` →
   `dsh plugin --profile <name> add <this directory>`.
3. **Native dsh install:**
   `dsh plugin --profile <name> add ./local-hook-dsh-governor-package-<v>.tgz`.

All three end the same way: the loader activates the entry from `Target/`, [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/cordis.patch.yml)
inserts the [hook-dsh-governor-package](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/Source) row, and the ledger logs `activated (anywhere mode, ...)` at
the next host start.

### Usage

The bundle is configured through its [cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/cordis.patch.yml) row (or the profile's `dsh.bundle`
manifest) - the full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-governor-package
        name: "@playform/hook-dsh-governor-package"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-governor-package.log
            updateMode: programmatic
```

---

## The Problem

Agents edit `package.json` files constantly - and every edit can leave stale pins, stray version
ranges, or deps that should track a governed registry. The fix must happen where the write happens,
on every write path (full writes, single-line edits, `str_replace_editor` patches alike), without
the author's tool result changing by a single byte. [`fs/observed`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) is the only hook that runs _after_
content is on disk - the [`fs/write-intent`](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts) waterfall carries a version guard but never the content.

---

## How It Works

**`The pipeline G = U ∘ P`**

```text
  fs/observed (target, {kind:"present", version}, actor)
  ── fired by the TOOL LAYER ONLY, for every harness write/edit, any thread ──►
       │
       ▼
  G1  Factory.Gate ── displayPath → actor ∈ mutationTools → kind "present" →
  │                    Stash idempotence → basename "package.json" → excluded?
  │     excluded ──► ledger `skipped (excluded) <path>`   (every other gate
  ▼                  outcome is silent)                      outcome proceeds)
  G2  Factory.Discover + Factory.Parse ── nearest registry.json walk-up
  │     (none / unreadable ──► ledger line, the chain pass is skipped)
  ▼
  Stash seed (targetKey, version) ── our own re-emits re-enter as no-ops
       │
       ▼  detached, contained  (Factory.Continue - the listener never awaits)
  G3  CHAIN PASS (the pure transform) ── read → chain-governed pins
  │      (dep ∈ registry.effectiveLatest) canonicalized to ^<resolved>
  │      (strict: strip unknown - explicit only, never a default) →
  │      GuardedWrite (replaceIfVersion + the P4 fence) → ledger
  │      `governed <path> → <version>` → Refresh (P3 re-emit, same actor)
  │      (the factory's Continue also computes the union keep-list with the
  │       P3 chain keys - deliberately ignored by this transform)
  ▼  chained off the settled continuation (Function/Follow)
  G4  UPDATE STAGE ── passage gate → Filter (nothing public? skip) →
  │     first-wins update-policy pick (Function/Resolve) → Dispatch:
  │     breaker → in-flight → cooldown → the jobs envelope
  │     (kind "governor-update", unowned) or the detached fallback
  │          ├─ updateMode "programmatic": ncu.run({packageFile, upgrade,
  │          │    silent, dep, concurrency, target, reject ∪ chain deps,
  │          │    allow, filter}) - no external binary
  │          └─ updateMode "bin": the ncu binary (ncuBin) via ctx.subprocess
  │     → Verify (verifyCommand, exit 127 non-fatal) → Settle →
  │       Refresh (U2: re-stat + re-emit the fresh version)
  ▼
  SILENCE: the tool result shows exactly what the author wrote.
  The governed state is discoverable only by a subsequent read - or in
  the ledger.
```

Key properties, all enforced by construction:

- **Anywhere mode, exclusion-first.** No roots allowlist: any agent (main, subagent, workflow child)
  writing a `package.json` via the harness fs tools is governed, unless the path contains an
  excluded segment (`node_modules`, `.git`, `.dsh`, ...).
- **No recursion.** The governor's rewrites go through the `ctx.fs` service (which dispatches no
  `fs/*` events - only the tool layer does) and the update stage is a continuation, not an author
  tool call. The P3/U2 refresh re-emit re-enters this listener, and the Stash token gate makes it a
  no-op.
- **Version coherence.** The rewrite carries `replaceIfVersion` at the observed version; a racing
  author write makes it fail safely (no clobber), and the service-issued fresh version is re-emitted
  with the same actor so the author's next guarded write never fails `FS_STALE_VERSION`.
- **The cordis-trap guard.** ncu's reject list is always `policy.reject ∪` the chain-governed dep
  names - ncu must never bump a chain pin to public npm latest (`-x` is ONE comma-delimited
  argument, ncu 23.x).
- **Silence.** The model-facing write result is built from the author's own content
  (`after = normalizeLineEndings(content)`, no disk re-read, no checksum). A listener throw is
  contained logger-only (the core's `Suppress` composer); the ledger is best-effort.

The G4 update-stage envelope - the Dispatch/Settle pair of the diagram above (the gates, the jobs
envelope, the breaker update, the U2 refresh) - lives in the core ([@playform/hook-dsh-core](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source)'s
`Function/Update`); this module is a thin delegate that injects its own collections, child stage and
ledger strings, so the flow is not forked per governance module.

### The Source Layout

TypeScript-first, built with `@playform/build` (ESBuild + tsc type-check):

```text
hook-dsh-governor-package/
├── Source/                  ← TypeScript (NOT shipped)
│   ├── Library.ts           ← entry: name / apply / Config / inject
│   │                          + default { name, apply, Config, inject }
│   ├── Function/            ← the module residue - Apply.ts (thin wire-up),
│   │   │                      Observe.ts (thin listener), Transform.ts (the
│   │   │                      chain-pass leaf), Follow.ts (the update-stage
│   │   │                      trigger), Dispatch.ts, Execute.ts, Settle.ts,
│   │   │                      Filter / Resolve / Satisfy / Decode
│   │   └── Update/          ← the update-stage engines (Run, Bin, Bin/*,
│   │                           Programmatic, Policy, Verify)
│   ├── Interface/           ← typed contracts (State, Factory, Transform, ...)
│   └── Variable/            ← constants, defaults, the Config schema
├── Configuration/
│   └── ESBuild.ts           ← the @playform/build custom config
├── Target/                  ← built output (SHIPPED: .js + .d.ts)
├── cordis.patch.yml         ← the loader row (name: the package identity)
├── package.json             ← main → Target/Library.js
└── README.md / SCHEME.md    ← usage + the design document
```

The published artifact contains **only the built output** - `files` whitelists `Target/`,
[cordis.patch.yml](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-governor-package/cordis.patch.yml), and the docs; `Source/` never ships. There are no `build`/`watch` npm scripts:
the only npm script is `prepublishOnly`
(`Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts`); invoke it ad hoc with
`npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` (or `--Watch` for the dev loop).

### The Hard Lessons

1. **`inject` and `Config` must sit on the DEFAULT export object** - the loader builds the fiber
   from the default object; named-only exports are shadowed and service accessors throw
   `cannot get property "fs" without inject`.
2. **`apply` must return nothing** - a returned value silently kills event delivery (the loader
   treats apply returns specially). Test probes use `Context.__governorState`.
3. **`ctx.jobs` at root needs a CONTROLLER** - the accessor throws
   `no job controller serves this agent` until a controller is attached: the factory's `Attach`
   registers it from the root context (which serves every owner per jobs.md), and
   `start({owner: undefined})` creates an unowned job. The detached contained continuation is the
   probed fallback for deployments without a jobs service.
4. **`ctx.fs.writeText` from a root plugin needs an explicit sandbox policy**
    - the deployment default (`workspace-write`) denies paths outside the canonical workspace; the
      governor passes `{ mode: "danger-full-access" }` because its own exclude list IS its fence.

---

## The Config

The exported `Config` schema (the factory's `Schema` helper extended with the module's own fields)
validates and fills every default at load - invalid configuration fails loudly. New patch entries
are declared with `insert:` (a bare `id:` row patches an existing entry; the loader rejects unknown
ids with `entry "..." not found`).

```yaml
- insert:
      - id: hook-dsh-governor-package
        name: "@playform/hook-dsh-governor-package"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-governor-package.log # global ledger
            updateCooldownMs: 3000
            strict: false # explicit only; never default-delete unknown deps
            mutationTools: [write, edit, str_replace_editor]
            maxUpdateFailures: 3 # circuit breaker: pause a dir's update stage
            ncuBin: /usr/local/bin/ncu # absolute - host PATH != shell PATH
            updateMode: programmatic # "programmatic" (default) | "bin"
            policyFile: "" # optional global update-policy.json (else discovery, else built-in)
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

---

## In Action

One governed write. The author writes a `package.json` anywhere with the `write` tool - one dep that
should track the governed registry, one public dep left on a range:

```json
{
	"name": "@acme/tool",
	"scripts": { "build": "tsc" },
	"dependencies": {
		"@playform/build": "^0.3.4",
		"@acme/chain-core": "0.4.1"
	}
}
```

The chain pass finds `@acme/chain-core` in the nearest `registry.json` (effective 0.4.5) and
canonicalizes it to `^0.4.5`; the public dep stays a range until the update stage's ncu run bumps
it. The transcript shows only what the author wrote; the ledger shows what actually happened:

```text
[2026-10-03T09:15:22.411Z] activated (anywhere mode, logFile=~/.dsh/hook-dsh-governor-package.log, updateMode=programmatic, ncuBin=/usr/local/bin/ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))
[2026-10-03T09:16:01.880Z] governed ~/Projects/acme/tool/package.json → 42
[2026-10-03T09:16:34.120Z] update stage dispatched for ~/Projects/acme/tool (mode=programmatic, ncu via /usr/local/bin/ncu, built-in default policy)
[2026-10-03T09:16:41.502Z] update: DONE — pins bumped per policy
```

Read the file back and `@acme/chain-core` is `^0.4.5` (or already bumped by ncu if the policy
allowed it); write it again immediately and nothing complains - no `FS_STALE_VERSION`, the re-emit
made the second pass a no-op. Write inside `node_modules`/`.git`/`.dsh` and the ledger gains one
line, `skipped (excluded) ...`, while the file stays untouched.

---

## The Ledger

One global log (`logFile`, default `~/.dsh/hook-dsh-governor-package.log`) records activation,
exclusions, chain-pass results, and every update-stage dispatch. The strings this module composes
(the hook-dsh-governor-package: logger prefix is the factory's `Append`; each line is
`[<ISO>] <message>` in the file):

```text
activated (anywhere mode, logFile=..., updateMode=..., ncuBin=..., exclude=[...], policyFile=(discovery))
skipped (excluded) <path>
no registry.json found for <path>
governed <path> → <version>
update stage dispatched for <dir> (mode=..., ncu via ..., policy ...)
update: DONE / update: FAILED
```

(The registry-miss line ends with an em dash followed by `chain pass skipped`; the DONE/FAILED lines
are `update: DONE` + em dash + reason and `update: FAILED` + em dash + reason - byte-exact forms are
in the In Action excerpt above. Those em dashes are part of the literal ledger strings, so they live
only in the example block.)

The activation line is written by `apply()` - "did it activate" must be answerable from the ledger
alone.

---

## License 📜

CC0-1.0.
