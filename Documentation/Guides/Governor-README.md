---
title: The package governor guide (hook-dsh-package-governor)
category: Guides
kind: guide
date: 2026-10-03
status: active
registry: Documentation/Guides/Governor-README.md
index: Documentation/INDEX.md
statuses:
  - name: the package governor (the silent chain governor)
    state: implemented
    evidence: Classic and EffectTS packages; live-proven - the probe's canonicalization
  - name: the documented README content (the seams, the config, the ledger)
    state: implemented
    evidence: this guide; the live ledgers agree
---

# @playform/hook-dsh-package-governor

> ONE of the four Governor guides migrated to `Documentation/Guides/`.
> The companion docs are `Governor-CASCADES.md`, `Governor-SCHEME.md`, and `Governor-TRIO-GRAPH.md` in this folder.
> The handoff context is `../Handoff/Overview.md` and `../Handoff/Packages/Package-03.md`.

_The DeepSeek Harness Plugin Family for PlayForm._

[![npm](https://img.shields.io/static/v1?label=npm&message=%40playform%2Fhook-dsh-package-governor&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-package-governor)
[![release](https://img.shields.io/static/v1?label=release&message=v0.1.0&color=blue)](https://www.npmjs.com/package/@playform/hook-dsh-package-governor)
[![variant](https://img.shields.io/static/v1?label=variant&message=CLASSIC&color=blue)](../../README.md)
[![sibling](https://img.shields.io/static/v1?label=sibling&message=EFFECT-TS&color=white)](../../README.md)
[![license](https://img.shields.io/static/v1?label=license&message=CC0-1.0&color=lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)

> [!NOTE]
>
> The **silent package.json governor** of the DeepSeek Harness - a plugin on the
> [`fs/observed`][dsh-fs]
> event (the [cordis](https://github.com/deepseek-ai/deepseek-harness/tree/master/vendor/cordis)
> event **EVERY harness file write dispatches**; the tool layer is the ONLY dispatcher).
> It governs EVERY `package.json` written by ANY agent, anywhere.
>
> A pure chain pass canonicalizes chain-governed dependency pins.
> Then an update stage lets npm-check-updates bump the public ones - and the author NEVER learns.
>
> _A factory flavor: the family's furnace does the plumbing; this package is the model logic._
>
> _The @-sentence identity: **Hook @ DSH @ Governor @ Package**._

---

## Where It Fits

**Family position** (the @-sentence **Hook @ DSH @ Governor @ Package**): a hook child of the
[`plugin-dsh-factory`](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source) service and the [`hook-dsh-core`](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source)
helpers.
It has NO hook children of its own.

One of three governance hooks sharing the
[`fs/observed`][dsh-fs]
seam.
EACH gates on its own basename and writes its own ledger:

| plugin                                                  | basename gate  | ledger                          | pass                                                 |
| ------------------------------------------------------- | -------------- | ------------------------------- | ---------------------------------------------------- |
| [hook-dsh-package-governor][ours-hook-dsh-package-governor] (this bundle)               | `package.json` | `hook-dsh-package-governor.log` | chain pass (→ `^resolved`) + update stage (ncu)      |
| [`hook-dsh-package-pinner`](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source) | `package.json` | `hook-dsh-package-pinner.log`   | pin pass (`^0.3.4` → `0.3.4`; keep-list wins)        |
| [`hook-dsh-cargo-governor`](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-cargo-governor/Source) | `Cargo.toml`   | `hook-dsh-cargo-governor.log`   | chain pass (bare caret / `=exact`) + `cargo upgrade` |

Composition semantics when several are activated: **pin → bump-exact** (a fully pinned manifest leaves ncu NOTHING to do; the chain pass may still re-canonicalize chain pins), **chain > strip > normalize** (the cargo module's precedence), **keep-list wins** (the pinner's [pin-policy.json](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-pinner/Source/Function/Transform.ts) keeps ranges as authored).

The ledgers are separate; activating ONE NEVER implies another.

Machinery-wise it is a **factory flavor**: `inject: ["fs", "pluginFactory"]`

- the gates, the discovery, the guarded write, the refresh, the continuation, the effects and the schema come from [`plugin-dsh-factory`](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source).
  The pure helpers (`Suppress`, the policy loader) come from [`hook-dsh-core`](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source).
  This bundle keeps ONLY its own vocabulary: the Config extension, the chain pass (Function/Transform), the update engine (Function/Follow → Dispatch → Execute → Update/* → Settle) and EVERY ledger string.
  Besides the [`fs/observed`][dsh-fs]
  event path, its two steps are registered with the factory's direct-govern registry at apply
  (`Factory.RegisterGovern("package.json", "canonicalize" | "update", …)` — factory SCHEME.md
  §2.16).
  So the `raw-write` tool's per-call `govern` selection can drive the same chain pass and update stage directly through [Factory.Govern](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/Source/Function/Govern.ts) (Function/Direct - same machinery, same ledger strings).

The DSH plugin family is the DeepSeek Harness plugin layer of the PlayForm ecosystem.
It is TypeScript-first `Source/` → `Target/`, the deterministic `@playform` build, `prepublishOnly`-only.
These are the same conventions as EVERY other @playform package.

### Install

1. **Remote / dependency install (auto-activation):** add the package as a plain dependency of a profile.
   The `dsh.bundle` manifest makes it a harness bundle, installed automatically and activated at the next host start.
   Run `pnpm add @playform/hook-dsh-package-governor` in the profile dir (+ the package name in `dsh.profile.bundles`, or `dsh plugin add`).
2. **Local git clone:** clone → `pnpm install --ignore-workspace` (the bundle carries its own node_modules) → `npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` → `dsh plugin --profile <name> add <this directory>`.
3. **Native dsh install:**
   `dsh plugin --profile <name> add ./local-hook-dsh-package-governor-<v>.tgz`.

All three end the same way.

The loader activates the entry from `Target/`.
[cordis.patch.yml][ours-cordis-patch] inserts the [hook-dsh-package-governor][ours-hook-dsh-package-governor] row.
The ledger logs `activated (anywhere mode, ...)` at the next host start.

### Usage

The bundle is configured through its [cordis.patch.yml][ours-cordis-patch] row (or the profile's `dsh.bundle` manifest).
The full config table is in [The Config](#the-config):

```yaml
- insert:
      - id: hook-dsh-package-governor
        name: "@playform/hook-dsh-package-governor"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-package-governor.log
            updateMode: programmatic
```

---

## The Problem

Agents edit `package.json` files constantly - and EVERY edit can leave stale pins, stray version ranges, or deps that should track a governed registry.

The fix must happen where the write happens, on EVERY write path (full writes, single-line edits, `str_replace_editor` patches alike).
WITHOUT it, the author's tool result would change by a single byte.

[`fs/observed`][dsh-fs]
is the ONLY hook that runs _after_ content is on disk.
The [`fs/write-intent`][dsh-fs]
waterfall carries a version guard but NEVER the content.

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

- **Anywhere mode, exclusion-first.** NO roots allowlist: ANY agent (main, subagent, workflow child) writing a `package.json` via the harness fs tools is governed.
  The exception is a path containing an excluded segment (`node_modules`, `.git`, `.dsh`, ...).
- **No recursion.** The governor's rewrites go through the `ctx.fs` service (which dispatches NO `fs/*` events - ONLY the tool layer does) and the update stage is a continuation, NOT an author tool call.
  The P3/U2 refresh re-emit re-enters this listener, and the Stash token gate makes it a no-op.
- **Version coherence.** The rewrite carries `replaceIfVersion` at the observed version.
  A racing author write makes it fail safely (no clobber).
  The service-issued fresh version is re-emitted with the same actor, so the author's next guarded write NEVER fails `FS_STALE_VERSION`.
- **The cordis-trap guard.** ncu's reject list is ALWAYS `policy.reject ∪` the chain-governed dep names.
  ncu must NEVER bump a chain pin to public npm latest (`-x` is ONE comma-delimited argument, ncu 23.x).
- **Silence.** The model-facing write result is built from the author's own content (`after = normalizeLineEndings(content)`, no disk re-read, no checksum).
  A listener throw is contained logger-only (the core's `Suppress` composer).
  The ledger is best-effort.

The G4 update-stage envelope - the Dispatch/Settle pair of the diagram above (the gates, the jobs envelope, the breaker update, the U2 refresh) - lives in the core ([@playform/hook-dsh-core](https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-core/Source)'s `Function/Update`).
This module is a thin delegate that injects its own collections, child stage and ledger strings, so the flow is NOT forked per governance module.

### The Source Layout

TypeScript-first, built with `@playform/build` (ESBuild + tsc type-check):

```text
hook-dsh-package-governor/
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

The published artifact contains **ONLY the built output** - `files` whitelists `Target/`, [cordis.patch.yml][ours-cordis-patch], and the docs.
`Source/` NEVER ships.

There are NO `build`/`watch` npm scripts.
The ONLY npm script is `prepublishOnly` (`Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts`).
Invoke it ad hoc with `npx Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` (or `--Watch` for the dev loop).

### The Hard Lessons

1. **`inject` and `Config` must sit on the DEFAULT export object** - the loader builds the fiber from the default object.
   Named-only exports are shadowed and service accessors throw `cannot get property "fs" without inject`.
2. **`apply` must return nothing** - a returned value silently kills event delivery (the loader treats apply returns specially).
   Test probes use `Context.__governorState`.
3. **`ctx.jobs` at root needs a CONTROLLER** - the accessor throws `no job controller serves this agent` until a controller is attached.
   The factory's `Attach` registers it from the root context (which serves EVERY owner per jobs.md).
   `start({owner: undefined})` creates an unowned job.
   The detached contained continuation is the probed fallback for deployments WITHOUT a jobs service.
4. **`ctx.fs.writeText` from a root plugin needs an explicit sandbox policy** - the deployment default (`workspace-write`) denies paths outside the canonical workspace.
   The governor passes `{ mode: "danger-full-access" }` because its own exclude list IS its fence.

---

## The Config

The exported `Config` schema (the factory's `Schema` helper extended with the module's own fields) validates and fills EVERY default at load.
Invalid configuration fails loudly.

New patch entries are declared with `insert:`.
A bare `id:` row patches an existing entry; the loader rejects unknown ids with `entry "..." not found`.

```yaml
- insert:
      - id: hook-dsh-package-governor
        name: "@playform/hook-dsh-package-governor"
        config:
            log: true
            logFile: ~/.dsh/hook-dsh-package-governor.log # global ledger
            updateCooldownMs: 3000
            strict: false # explicit only; never default-delete unknown deps
            mutationTools: [write, edit, str_replace_editor, raw-write]
            maxUpdateFailures: 3 # circuit breaker: pause a dir's update stage
            ncuBin: /usr/local/bin/ncu # bin-mode binary; the schema default is the bare "ncu" (host
            # PATH) - an absolute path when the host PATH lacks it
            updateMode: programmatic # "programmatic" (default) | "bin"
            policyFile: "" # optional global update-policy.json (else discovery, else built-in)
            exclude: [node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app]
```

---

## In Action

One governed write.

The author writes a `package.json` anywhere with the `write` tool.
ONE dep should track the governed registry, ONE public dep is left on a range:

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

The chain pass finds `@acme/chain-core` in the nearest `registry.json` (effective 0.4.5) and canonicalizes it to `^0.4.5`.
The public dep stays a range until the update stage's ncu run bumps it.

The transcript shows ONLY what the author wrote.
The ledger shows what actually happened:

```text
[2026-10-03T09:15:22.411Z] activated (anywhere mode, logFile=~/.dsh/hook-dsh-package-governor.log, updateMode=programmatic, ncuBin=/usr/local/bin/ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))
[2026-10-03T09:16:01.880Z] governed ~/Projects/acme/tool/package.json → 42
[2026-10-03T09:16:34.120Z] update stage dispatched for ~/Projects/acme/tool (mode=programmatic, ncu via /usr/local/bin/ncu, built-in default policy)
[2026-10-03T09:16:41.502Z] update: DONE — pins bumped per policy
```

Read the file back and `@acme/chain-core` is `^0.4.5` (or already bumped by ncu if the policy allowed it).
Write it again immediately and NOTHING complains - no `FS_STALE_VERSION`.
The re-emit made the second pass a no-op.

Write inside `node_modules`/`.git`/`.dsh` and the ledger gains ONE line, `skipped (excluded) ...`, while the file stays untouched.

---

## The Ledger

One global log (`logFile`, default `~/.dsh/hook-dsh-package-governor.log`) records activation, exclusions, chain-pass results, and EVERY update-stage dispatch.

The strings this module composes (the hook-dsh-package-governor: logger prefix is the factory's `Append`; EACH line is `[<ISO>] <message>` in the file):

```text
activated (anywhere mode, logFile=..., updateMode=..., ncuBin=..., exclude=[...], policyFile=(discovery))
skipped (excluded) <path>
no registry.json found for <path>
governed <path> → <version>
update stage dispatched for <dir> (mode=..., ncu via ..., policy ...)
unreadable registry.json at <found> — chain pass skipped for <path>
observed non-JSON package.json <path> — skipped
REFUSED rewrite of <path>: non-dependency section "<name>" would change
update stage paused for <dir> (N consecutive failures ≥ limit)
update stage skipped for <dir> (in-flight)
update stage skipped for <dir> (cooldown)
update stage FAILED (<code>) for <dir>; consecutive=N
update: mode=programmatic (npm-check-updates library)
update: mode=bin (ncu binary <bin>)
update: ncu (<label>) → <results>
update: ncu failed (<label>): <cause>
update: npm-check-updates library unavailable: <cause>
update: npm-check-updates run() not found in library exports
update: running verifyCommand: <command>
update: verifyCommand ok
update: verifyCommand failed (status N)
update: verifyCommand runner unavailable (exit 127) — skipped, non-fatal
update: DONE / update: FAILED
```

(The registry-miss line, the runner-unavailable line and the DONE/FAILED lines end with em dashes (`update: DONE` + em dash + reason, `update: FAILED` + em dash + reason).
The byte-exact forms are in the In Action excerpt above.

Those em dashes are part of the literal ledger strings, so they live ONLY in the example block.)

The REFUSED line comes from the core's `Refusal` guard.
A difference outside the declared dependency sections is NEVER written - the byte-identical line, then no rewrite.

The activation line is written by `apply()`.
"Did it activate" must be answerable from the ledger alone.

---

## The two release groups (CLASSIC vs EFFECT-TS)

Two published groups, ONE contract: the CLASSIC packages (`@playform/dsh-*` - plain TypeScript) and the EFFECT-TS packages (`@playform/ets-*` - effect-backed).
Install the group you run:

- **The CLASSIC group.** `import ... from "@playform/hook-dsh-package-governor"` - zero framework dependencies.
- **The EFFECT-TS group.** `import ... from "@playform/ets-hook-dsh-package-governor"` - the same contract on Effect-TS services and layers.
  It has `effect` v4.0.2 as the runtime dependency.
  The base `@playform/ets-base-dsh` package carries the plumbing EVERY ets-* package builds on.

NEVER mix the groups in ONE graph (the effect-ts `Update` returns Effect envelopes, NOT the classic dispatch envelope).
From source, EACH tree is its own workspace slice: the Classic tree under `Classic/packages/dsh-*`, the Effect-TS tree under `EffectTS/packages/ets-*`.

## License 📜

CC0-1.0.

[dsh-fs]: https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/fs/fs/src/index.ts
[ours-hook-dsh-package-governor]: https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/hook-dsh-package-governor/Source
[ours-cordis-patch]: https://github.com/PlayForm/DeepSeek/tree/Current/Classic/packages/plugin-dsh-factory/cordis.patch.yml
