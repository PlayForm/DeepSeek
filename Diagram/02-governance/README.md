---
title: 02-governance - hands-off dependency hygiene
category: Diagram
kind: reference
date: 2026-10-21
status: active
---

# 02-governance

> **The capability.** Every `package.json` and every `Cargo.toml` an agent writes is canonicalized, pinned, and optionally updated - silently. The author's tool result shows exactly the bytes the author sent; the governed state is discoverable only by reading the file back or by reading that module's own ledger. Chain-governed dependencies track the resolved registry version, the pinner strips one range prefix per dependency unless a keep-list protects it, and the Cargo flavor rewrites TOML surgically so comments survive. Each module has its own basename gate and its own ledger, so activating one never implies another.

## The harness surfaces

| Surface | Direction | What the group does there |
| --- | --- | --- |
| `fs/observed` | listens (via `Factory.Wire`) | The only listener the trio registers. Every tool-layer write dispatches it with `(target, { kind: "present", version }, actor)`; the gate decides whether this module owns the basename. |
| tool execution surface (`tools/pre-execute`, `tools/post-execute`) | called by | The trio attaches no listener here. The `raw-write` tool's post-write `Govern` call reaches the same steps through the factory's direct-govern registry. |
| `fs/write-intent` | consumes | The governed write goes through `GuardedWrite`, which carries `replaceIfVersion` so a racing author write fails safely instead of being clobbered. |
| loader / service surface | registers + injects | Each bundle is one `insert:` row; each hook declares `inject: ["fs", "pluginFactory"]` and registers its direct-govern steps at apply. |

## The packages

| Package | Tree | Role | Trigger | Ledger file | Diagram |
| --- | --- | --- | --- | --- | --- |
| `@playform/hook-dsh-package-governor` | Classic | hook | `fs/observed`, basename `package.json` | `~/.dsh/hook-dsh-package-governor.log` | [package-governor.mmd](Classic/package-governor.mmd) ([SVG](Classic/package-governor.svg)) |
| `@playform/hook-dsh-package-pinner` | Classic | hook | `fs/observed`, basename `package.json` | `~/.dsh/hook-dsh-package-pinner.log` | [package-pinner.mmd](Classic/package-pinner.mmd) ([SVG](Classic/package-pinner.svg)) |
| `@playform/hook-dsh-cargo-governor` | Classic | hook | `fs/observed`, basename `Cargo.toml` | `~/.dsh/hook-dsh-cargo-governor.log` | [cargo-governor.mmd](Classic/cargo-governor.mmd) ([SVG](Classic/cargo-governor.svg)) |
| `@playform/ets-hook-dsh-package-governor` | EffectTS | hook | same surface, same basename | `~/.dsh/ets-hook-dsh-package-governor.log` | [package-governor.mmd](EffectTS/package-governor.mmd) ([SVG](EffectTS/package-governor.svg)) |
| `@playform/ets-hook-dsh-package-pinner` | EffectTS | hook | same surface, same basename | `~/.dsh/ets-hook-dsh-package-pinner.log` | [package-pinner.mmd](EffectTS/package-pinner.mmd) ([SVG](EffectTS/package-pinner.svg)) |
| `@playform/ets-hook-dsh-cargo-governor` | EffectTS | hook | same surface, same basename | `~/.dsh/ets-hook-dsh-cargo-governor.log` | [cargo-governor.mmd](EffectTS/cargo-governor.mmd) ([SVG](EffectTS/cargo-governor.svg)) |

## How each plugin works

### @playform/hook-dsh-package-governor

**Classic.** What it does. The package governor is the npm-sided chain pass plus update stage. When a mutation tool writes a `package.json` anywhere - main agent, subagent, workflow child - the governor canonicalizes every dependency that the nearest `registry.json` lists in `effectiveLatest` to `^<resolved>`, optionally strips unknown dependencies under `strict`, then hands the manifest to npm-check-updates on a cooldown, with a circuit breaker that pauses a directory after three consecutive failures. It never changes the author's tool result.

**The chain.**
1. `fs/observed` fires with the target, `{ kind: "present", version }` and the actor; `Factory.Gate` checks display path, actor membership in `mutationTools`, `kind`, Stash idempotence, basename `package.json`, and the exclusion fence.
2. `Factory.Discover` + `Factory.Parse` walk up for the nearest `registry.json`; no registry means the chain pass is skipped and every dependency stays public.
3. `Factory.Continue` runs the pure chain pass detached and contained: read, keep-list, transform, `GuardedWrite` with `replaceIfVersion`, message, then `Refresh` (P3) re-emits the fresh version with the same actor so the author's next guarded write never sees `FS_STALE_VERSION`.
4. Chained off the settled continuation (`Function/Follow`), the update stage picks the first-wins policy, then dispatches through the breaker, the in-flight set and the cooldown into the jobs envelope or the detached fallback.
5. `updateMode: "programmatic"` calls the `ncu` library in process; `updateMode: "bin"` runs the `ncuBin` binary through `ctx.subprocess`.
6. `Verify` runs `verifyCommand` when configured (exit 127 is non-fatal), `Settle` records the outcome, and `Refresh` (U2) re-stats and re-emits.

**The config that matters.** `logFile` (`~/.dsh/hook-dsh-package-governor.log`), `updateMode` (`programmatic`; the alternative is `bin`), `updateCooldownMs` (`3000`), `maxUpdateFailures` (`3`), `strict` (`false`), `ncuBin` (the schema default is the bare `ncu`; the shipped row uses `/usr/local/bin/ncu`), `policyFile` (`""` = discovery). Full schema in [SCHEME.md](../../Classic/packages/hook-dsh-package-governor/SCHEME.md).

**The safety.** A listener throw is contained logger-only through the core's `Suppress`; the ledger append is best-effort. The rewrite carries the observed version, so a racing write is not clobbered. `strict` is explicit only and never a default delete. ncu's reject list is always `policy.reject ∪` the chain-governed dependency names, so the update stage can never bump a chain pin to public latest.

**The ledger.** `~/.dsh/hook-dsh-package-governor.log`, one `[<ISO>] <message>` line per event. The families that matter: activation (`activated (anywhere mode, logFile=..., updateMode=..., ncuBin=..., exclude=[...], policyFile=(discovery))`), refusal (`REFUSED rewrite of <path>: non-dependency section "<name>" would change`), pass (`skipped (excluded) <path>`, `no registry.json found for <path>`, `observed non-JSON package.json <path> — skipped`), and the write/update journal (`governed <path> → <version>`, `update stage dispatched for <dir> (...)`, `update: DONE — pins bumped per policy`).

**The diagram.** [package-governor.mmd](Classic/package-governor.mmd) and ([SVG](Classic/package-governor.svg)).

### @playform/hook-dsh-package-pinner

**Classic.** What it does. The pinner is pure P: it deterministically rewrites every ranged dependency version in the declared sections to its static version, stripping exactly one leading `^`, `~` or `=`. `"@playform/build": "^0.3.4"` becomes `"0.3.4"`. It has no update stage, no jobs, no subprocess and no cooldown; a `pin-policy.json` keep-list protects packages whose ranges must stay exactly as authored.

**The chain.**
1. `Factory.Gate` runs the same gate set with basename `package.json`; a gated-out write logs `skipped (excluded)` and stops.
2. `Factory.Discover` finds the nearest `registry.json` only as a location for a co-located `pin-policy.json`; `Factory.ResolvePolicy` computes the union keep-list (global `policyFile` → the file's own directory → registry-adjacent → built-in default).
3. `Decode` parses the manifest; a non-JSON file logs `observed non-JSON package.json ... - skipped` and the pass ends.
4. The range law walks each dependency in the declared `sections`: a non-string, a non-range first character, or a value containing whitespace is untouched; otherwise one leading prefix is stripped.
5. The core's `Refusal` guard compares the author's manifest with the proposal; any change outside the declared sections composes `REFUSED rewrite ...` and the write does not happen.
6. `GuardedWrite` writes with `replaceIfVersion`, `Refresh` (P3) re-emits the fresh version with the same actor, and the module logs `pinned <path> (N versions)` or `no changes to pin for <path>`.

**The config that matters.** `logFile` (`~/.dsh/hook-dsh-package-pinner.log`), `sections` (all four dependency sections), `policyFile` (`""` = discovery), `mutationTools` (`[write, edit, str_replace_editor, raw-write]`), `exclude` (the six-segment fence). `updateCooldownMs` is carried by the shared block and never read, because there is no update stage.

**The safety.** Idempotent by construction: a pinned version has no leading prefix, so rule 2 passes it through and the second pass logs a no-op. The keep-list wins over pinning, never over the chain. Non-dependency sections are never touched - the refusal guard refuses rather than rewrites. The version guard makes a racing author write fail safely.

**The ledger.** `~/.dsh/hook-dsh-package-pinner.log`. Activation (`activated (pinner, logFile=..., sections=[...], exclude=[...])`), refusal (`REFUSED rewrite of <path>: non-dependency section "<name>" would change`), pass (`skipped (excluded) <path>`, `observed non-JSON package.json <path> — skipped`), and the pin result (`pinned <path> (N versions)`, `no changes to pin for <path>`).

**The diagram.** [package-pinner.mmd](Classic/package-pinner.mmd) and ([SVG](Classic/package-pinner.svg)).

### @playform/hook-dsh-cargo-governor

**Classic.** What it does. The Cargo governor is the Rust-sided flavor of the same architecture. It parses `Cargo.toml` with `smol-toml` for identification only, plans a per-dependency rewrite with the precedence chain → strip → normalize, then applies the plan as surgical line-level string surgery on the raw text so comments, inline comments and spacing survive byte-for-byte. Its update stage is `cargo upgrade` through the subprocess seam, because Rust does not co-opt into the TypeScript ecosystem.

**The chain.**
1. `fs/observed` fires; `Factory.Gate` checks the same gate set with basename `Cargo.toml`.
2. `Factory.Discover` + `Parse` find the user's own `registry.json`; no registry means chain canonicalization is skipped and the plan falls through to normalize.
3. `Satisfy` builds the plan: chain (a dependency in `effectiveLatest` becomes the bare resolved version, or `=resolved` under `pinStyle: "exact"`), strip (strict-mode unknown dependencies lose the whole `name = "..."` entry, only when a registry exists), normalize (every other simple version is expanded to its most specific form; the keep-list wins).
4. `Pin` rewrites the raw TOML lines; `GuardedWrite` writes with `replaceIfVersion`; `Refresh` (P3) re-emits the fresh version with the same actor.
5. The update stage runs `cargo upgrade --manifest-path <Cargo.toml> --exclude <crate> ...` - one `--exclude` flag per crate, because the comma form is silently ignored - with `exclude = policy.reject ∪ chain deps`.
6. `Verify` runs `verifyCommand` through `/bin/sh -c` (exit 127 non-fatal), `Settle` records the result, `Refresh` (U2) re-stats and re-emits.

**The config that matters.** `logFile` (`~/.dsh/hook-dsh-cargo-governor.log`), `cargoBin` (schema default and shipped row both `cargo`; set an absolute path when the host PATH is not the shell PATH), `updateMode` (`cargo`, the only mode), `strict` (`false`), `keepFile` (`""` = discovery of the same `pin-policy.json` the pinner uses), `maxUpdateFailures` (`3`), `updateCooldownMs` (`3000`).

**The safety.** The refusal guard covers three shapes: a change outside an identified dependency table, an unsupported value shape, and a dependency named in the plan but not found in the text - each composes a `REFUSED` line and aborts the rewrite. `path`, `git` and inherited `workspace = true` entries are never rewritten. A missing cargo-edit fails gracefully (`update: cargo-edit unavailable: ...`) and the breaker counts it.

**The ledger.** `~/.dsh/hook-dsh-cargo-governor.log`. Activation (`activated (cargo flavor, logFile=..., updateMode=cargo, cargoBin=..., exclude=[...], policyFile=(discovery), keepFile=(discovery))`), pass (`skipped (excluded) <path>`, `governed <path> → <version>`), refusal (the three `REFUSED rewrite of <path>: ...` forms), and the update journal (`update: cargo upgrade <argv> → {"exitCode":0}`, `update: DONE — pins bumped per policy`).

**The diagram.** [cargo-governor.mmd](Classic/cargo-governor.mmd) and ([SVG](Classic/cargo-governor.svg)).

### @playform/ets-hook-dsh-package-governor

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-package-governor`, built on `@playform/ets-base-dsh`, `@playform/ets-lib-dsh-core` and the `@playform/ets-plugin-dsh-factory` service. The Effect delta is in the update stage: `Dispatch` is `Effect<void, never, Scope.Scope>` and forks the detached continuation into the caller's scope with `Effect.forkIn`, so plugin disposal interrupts the fiber and aborts its child; `Settle` is `Effect<number>`; the promise seam runs `Effect.runPromise` with the state's long-lived scope provided and a `dsh.update.dispatch` span. The ledger strings are byte-identical to the Classic module's, written to `~/.dsh/ets-hook-dsh-package-governor.log`. The diagram is [package-governor.mmd](EffectTS/package-governor.mmd) and ([SVG](EffectTS/package-governor.svg)).

### @playform/ets-hook-dsh-package-pinner

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-package-pinner`, built on the same three ETS packages. The pin pass itself is the Classic shape: the factory's `WriteService` performs the guarded write and the `Effect.ensuring` finalizer owns the P2 cleanup, and - unlike the governor - the module adds no span and no `Scope.provide` call site, so the scope created in `apply` (`Effect.runSync(Scope.make())`) is unused at runtime. The ledger strings are byte-identical, written to `~/.dsh/ets-hook-dsh-package-pinner.log`. The diagram is [package-pinner.mmd](EffectTS/package-pinner.mmd) and ([SVG](EffectTS/package-pinner.svg)).

### @playform/ets-hook-dsh-cargo-governor

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-cargo-governor`, built on the same three ETS packages. The plan and the surgical TOML rewrite are unchanged; the delta is the update stage, which uses the same `Effect<void, never, Scope.Scope>` dispatch and `Scope.provide` seam as the ETS npm governor, so the `cargo upgrade` subprocess stage is forked into the plugin scope and interrupted on disposal. The ledger strings are byte-identical, written to `~/.dsh/ets-hook-dsh-cargo-governor.log`. The diagram is [cargo-governor.mmd](EffectTS/cargo-governor.mmd) and ([SVG](EffectTS/cargo-governor.svg)).

## How the group composes

The basename gates are disjoint. `package-governor` and `package-pinner` both gate on `package.json`; `cargo-governor` gates on `Cargo.toml`. The three can be active at once on the same `fs/observed` seam because each decides ownership by basename before it reads anything, and the Cargo module never sees an npm manifest.

The npm pair composes as **pin → bump-exact**. The pinner rewrites `^0.3.4` to `0.3.4`; a fully pinned manifest leaves the governor's update stage nothing to do, while the governor's chain pass may still re-canonicalize a chain pin to `^<resolved>`. Order between the two listeners is defined only by registration, so neither module relies on the other having run first: each is idempotent on its own output, and the version guard plus re-emit makes a second pass a no-op.

The Cargo precedence is **chain > strip > normalize**, with the keep-list winning over normalization and never over the chain. That ordering is visible in the diagram as three labelled stages between the plan and the rewrite.

The keep-list wins over pinning. A `pin-policy.json` entry protects a package's range exactly as authored; the same sidecar drives the Cargo module's normalize stage through `keepFile`. The union is computed from the global `policyFile`, the file's own directory, the registry-adjacent sidecar and the built-in default, in that order.

The ledgers are separate. Six modules, six files, one activation line each. Activating one never implies another, and the Cargo module's log is never the npm ledgers' log.

## How it plugs into the harness

Each bundle is one `insert:` row in the profile's `cordis.patch.yml`, with the module's own config keys. The service injection is `inject: ["fs", "pluginFactory"]`; the loader holds each hook PENDING until both services exist, so the bundle-list order never decides whether a listener registers. At apply the module builds its state through `Factory.State`, attaches the jobs/inflight/storage effects through `Factory.Attach`, writes its activation line through `Factory.Append`, registers its direct-govern steps with `Factory.RegisterGovern`, and wires the one `fs/observed` listener through `Factory.Wire`.

Boot order is: profile bundles → factory service → the three hooks resolve → each writes its activation line and registers its steps. The model observes nothing: the write tool's result is built from the author's own content, never from a disk re-read. The user observes the governed state only when they read the file back, and observes the history in the six ledgers.

A `file:` dependency alone is not activation. The package must be listed in `dsh.profile.bundles` and the host restarted; the bundle layers compose at boot.

## What the user experiences

- A `package.json` written by an agent ends up with chain pins tracking the registry and every other range pinned, without a single extra tool call.
- A `Cargo.toml` keeps its comments and its formatting while shorthand versions become full versions.
- The next guarded write after a governed write succeeds instead of failing `FS_STALE_VERSION`.
- Writing inside `node_modules`, `.git` or `.dsh` changes nothing and adds one `skipped (excluded)` line.
- A refusal is visible in the ledger and the file is untouched - the guard never writes a non-dependency change.

## Sources

- [package-governor README](../../Classic/packages/hook-dsh-package-governor/README.md), [SCHEME.md](../../Classic/packages/hook-dsh-package-governor/SCHEME.md), [cordis.patch.yml](../../Classic/packages/hook-dsh-package-governor/cordis.patch.yml)
- [package-pinner README](../../Classic/packages/hook-dsh-package-pinner/README.md), [SCHEME.md](../../Classic/packages/hook-dsh-package-pinner/SCHEME.md), [cordis.patch.yml](../../Classic/packages/hook-dsh-package-pinner/cordis.patch.yml)
- [cargo-governor README](../../Classic/packages/hook-dsh-cargo-governor/README.md), [SCHEME.md](../../Classic/packages/hook-dsh-cargo-governor/SCHEME.md), [cordis.patch.yml](../../Classic/packages/hook-dsh-cargo-governor/cordis.patch.yml)
- [ets package-governor README](../../EffectTS/packages/ets-hook-dsh-package-governor/README.md), [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-package-governor/SCHEME.md), [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-package-governor/cordis.patch.yml)
- [ets package-pinner README](../../EffectTS/packages/ets-hook-dsh-package-pinner/README.md), [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-package-pinner/SCHEME.md), [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-package-pinner/cordis.patch.yml)
- [ets cargo-governor README](../../EffectTS/packages/ets-hook-dsh-cargo-governor/README.md), [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-cargo-governor/SCHEME.md), [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-cargo-governor/cordis.patch.yml)
