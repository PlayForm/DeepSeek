---
title: 02-governance - hands-off dependency hygiene
category: Diagram
kind: reference
date: 2026-10-21
status: active
---

# 02-governance

> **The capability.** Every `package.json` and every `Cargo.toml` that an agent writes is
> canonicalized, pinned, and optionally updated, without a word to the author. The tool result of
> the author shows exactly the bytes that the author sent, and the governed state is discoverable
> only by reading the file back or by reading the ledger of that module. Chain-governed dependencies
> track the resolved registry version, the pinner strips one range prefix per dependency unless a
> keep-list protects it, and the Cargo flavor rewrites TOML surgically so the comments survive. Each
> module has its own basename gate and its own ledger, so the activation of one never implies
> another.

## The harness surfaces

| Surface                                                            | Direction                    | What the group does there                                                                                                                                                                |
| ------------------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/observed`                                                      | listens (via `Factory.Wire`) | The only listener the trio registers. Every tool-layer write dispatches it with `(target, { kind: "present", version }, actor)`; the gate decides whether this module owns the basename. |
| tool execution surface (`tools/pre-execute`, `tools/post-execute`) | called by                    | The trio attaches no listener here. The `raw-write` tool's post-write `Govern` call reaches the same steps through the factory's direct-govern registry.                                 |
| `fs/write-intent`                                                  | consumes                     | The governed write goes through `GuardedWrite`, which carries `replaceIfVersion` so a racing author write fails safely instead of being clobbered.                                       |
| loader / service surface                                           | registers + injects          | Each bundle is one `insert:` row; each hook declares `inject: ["fs", "pluginFactory"]` and registers its direct-govern steps at apply.                                                   |

## The packages

| Package                                   | Tree     | Role | Trigger                                | Ledger file                                | Diagram                                                                                      |
| ----------------------------------------- | -------- | ---- | -------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `@playform/hook-dsh-package-governor`     | Classic  | hook | `fs/observed`, basename `package.json` | `~/.dsh/hook-dsh-package-governor.log`     | [package-governor.mmd](Classic/package-governor.mmd) ([SVG](Classic/package-governor.svg))   |
| `@playform/hook-dsh-package-pinner`       | Classic  | hook | `fs/observed`, basename `package.json` | `~/.dsh/hook-dsh-package-pinner.log`       | [package-pinner.mmd](Classic/package-pinner.mmd) ([SVG](Classic/package-pinner.svg))         |
| `@playform/hook-dsh-cargo-governor`       | Classic  | hook | `fs/observed`, basename `Cargo.toml`   | `~/.dsh/hook-dsh-cargo-governor.log`       | [cargo-governor.mmd](Classic/cargo-governor.mmd) ([SVG](Classic/cargo-governor.svg))         |
| `@playform/ets-hook-dsh-package-governor` | EffectTS | hook | same surface, same basename            | `~/.dsh/ets-hook-dsh-package-governor.log` | [package-governor.mmd](EffectTS/package-governor.mmd) ([SVG](EffectTS/package-governor.svg)) |
| `@playform/ets-hook-dsh-package-pinner`   | EffectTS | hook | same surface, same basename            | `~/.dsh/ets-hook-dsh-package-pinner.log`   | [package-pinner.mmd](EffectTS/package-pinner.mmd) ([SVG](EffectTS/package-pinner.svg))       |
| `@playform/ets-hook-dsh-cargo-governor`   | EffectTS | hook | same surface, same basename            | `~/.dsh/ets-hook-dsh-cargo-governor.log`   | [cargo-governor.mmd](EffectTS/cargo-governor.mmd) ([SVG](EffectTS/cargo-governor.svg))       |

## How each plugin works

### @playform/hook-dsh-package-governor

**Classic.** What it does. The package governor is the chain pass and update stage on the npm side.
When a mutation tool writes a `package.json` anywhere (main agent, subagent, workflow child), the
governor canonicalizes every dependency that the nearest `registry.json` lists in `effectiveLatest`
to `^<resolved>` and optionally strips unknown dependencies under `strict`. It then hands the
manifest to npm-check-updates on a cooldown, with a circuit breaker that pauses a directory after
three consecutive failures. It never changes the tool result of the author.

**The chain.**

1. **Gate.**

    `fs/observed` fires with the target, `{ kind: "present", version }`, and the actor, and
    `Factory.Gate` checks the display path, the actor membership in `mutationTools`, `kind`, Stash
    idempotence, the basename `package.json`, and the exclusion fence.

2. **Discovery.**

    `Factory.Discover` + `Factory.Parse` walk up for the nearest `registry.json`, and no registry
    means the chain pass is skipped and every dependency stays public.

3. **Chain pass.**

    `Factory.Continue` runs the pure chain pass detached and contained: read, keep-list, transform,
    `GuardedWrite` with `replaceIfVersion`, message, then `Refresh` (P3), which re-emits the fresh
    version with the same actor so the next guarded write of the author never sees
    `FS_STALE_VERSION`.

4. **Update stage.**

    Chained off the settled continuation (`Function/Follow`), the update stage takes the first-wins
    policy and then dispatches through the breaker, the in-flight set, and the cooldown into the
    jobs envelope or the detached fallback.

5. **Update mode.**

    `updateMode: "programmatic"` calls the `ncu` library in process, and `updateMode: "bin"` runs
    the `ncuBin` binary through `ctx.subprocess`.

6. **Settle.**

    `Verify` runs `verifyCommand` when it is configured (exit 127 is non-fatal), `Settle` records
    the outcome, and `Refresh` (U2) re-stats and re-emits.

**The config that matters.** The keys are `logFile` (`~/.dsh/hook-dsh-package-governor.log`),
`updateMode` (`programmatic`; the alternative is `bin`), `updateCooldownMs` (`3000`),
`maxUpdateFailures` (`3`), `strict` (`false`), `ncuBin` (the schema default is the bare `ncu`, and
the shipped row uses `/usr/local/bin/ncu`), and `policyFile` (`""` = discovery). The full schema is
in [SCHEME.md](../../Classic/packages/hook-dsh-package-governor/SCHEME.md).

**The safety.** A listener throw stays contained and logger-only through `Suppress` of the core, and
the ledger append is best-effort. The rewrite carries the observed version, so a racing write is not
overwritten. `strict` is explicit only and never a default delete. The reject list of ncu is always
`policy.reject ∪` the chain-governed dependency names, so the update stage can never bump a chain
pin to the public latest.

**The ledger.** The file `~/.dsh/hook-dsh-package-governor.log` holds one `[<ISO>] <message>` line
per event. The families that matter are the activation line
(`activated (anywhere mode, logFile=..., updateMode=..., ncuBin=..., exclude=[...], policyFile=(discovery))`),
the refusal line (`REFUSED rewrite of <path>: non-dependency section "<name>" would change`), the
pass lines (`skipped (excluded) <path>`, `no registry.json found for <path>`,
`observed non-JSON package.json <path> - skipped`), and the write/update journal
(`governed <path> → <version>`, `update stage dispatched for <dir> (...)`,
`update: DONE - pins bumped per policy`).

**The diagram.** [package-governor.mmd](Classic/package-governor.mmd) and
([SVG](Classic/package-governor.svg)).

### @playform/hook-dsh-package-pinner

**Classic.** What it does. The pinner is pure P: it deterministically rewrites every ranged
dependency version in the declared sections to its static version and strips exactly one leading
`^`, `~` or `=`, so `"@playform/build": "^0.3.4"` becomes `"0.3.4"`. It has no update stage, no
jobs, no subprocess, and no cooldown, and a `pin-policy.json` keep-list protects packages whose
ranges must stay exactly as authored.

**The chain.**

1. **Gate.**

    `Factory.Gate` runs the same gate set with the basename `package.json`, and a gated-out write
    logs `skipped (excluded)` and stops.

2. **Policy.**

    `Factory.Discover` finds the nearest `registry.json` only as a location for a co-located
    `pin-policy.json`, and `Factory.ResolvePolicy` computes the union keep-list (global `policyFile`
    → the own directory of the file → registry-adjacent → built-in default).

3. **Decode.**

    `Decode` parses the manifest, and a non-JSON file logs
    `observed non-JSON package.json ... - skipped` and the pass ends.

4. **Range law.**

    The range law walks each dependency in the declared `sections`: a non-string, a non-range first
    character, or a value with whitespace stays untouched, and otherwise one leading prefix is
    stripped.

5. **Refusal.**

    The `Refusal` guard of the core compares the manifest of the author with the proposal, and any
    change outside the declared sections composes `REFUSED rewrite ...` and the write does not
    happen.

6. **Write.**

    `GuardedWrite` writes with `replaceIfVersion`, `Refresh` (P3) re-emits the fresh version with
    the same actor, and the module logs `pinned <path> (N versions)` or
    `no changes to pin for <path>`.

**The config that matters.** The keys are `logFile` (`~/.dsh/hook-dsh-package-pinner.log`),
`sections` (all four dependency sections), `policyFile` (`""` = discovery), `mutationTools`
(`[write, edit, str_replace_editor, raw-write]`), and `exclude` (the six-segment fence). The shared
block carries `updateCooldownMs` and never reads it, because there is no update stage.

**The safety.** The module is idempotent by construction: a pinned version has no leading prefix, so
rule 2 passes it through and the second pass logs a no-op. The keep-list wins over pinning and never
over the chain. Non-dependency sections are never touched, because the refusal guard refuses instead
of rewriting. The version guard makes a racing author write fail safely.

**The ledger.** The file `~/.dsh/hook-dsh-package-pinner.log` holds the activation line
(`activated (pinner, logFile=..., sections=[...], exclude=[...])`), the refusal line
(`REFUSED rewrite of <path>: non-dependency section "<name>" would change`), the pass lines
(`skipped (excluded) <path>`, `observed non-JSON package.json <path> - skipped`), and the pin result
(`pinned <path> (N versions)`, `no changes to pin for <path>`).

**The diagram.** [package-pinner.mmd](Classic/package-pinner.mmd) and
([SVG](Classic/package-pinner.svg)).

### @playform/hook-dsh-cargo-governor

**Classic.** What it does. The Cargo governor is the Rust-side flavor of the same architecture. It
parses `Cargo.toml` with `smol-toml` for identification only, plans a per-dependency rewrite with
the precedence chain → strip → normalize, and then applies the plan as surgical line-level string
work on the raw text so the comments, the inline comments, and the spacing survive byte-for-byte.
Its update stage is `cargo upgrade` through the subprocess seam, because Rust does not join the
TypeScript ecosystem.

**The chain.**

1. **Gate.**

    `fs/observed` fires, and `Factory.Gate` checks the same gate set with the basename `Cargo.toml`.

2. **Discovery.**

    `Factory.Discover` + `Parse` find the own `registry.json` of the user, and no registry means
    chain canonicalization is skipped and the plan falls through to normalize.

3. **Plan.**

    `Satisfy` builds the plan: the chain (a dependency in `effectiveLatest` becomes the bare
    resolved version, or `=resolved` under `pinStyle: "exact"`), the strip (strict-mode unknown
    dependencies lose the whole `name = "..."` entry, only when a registry exists), and the
    normalize (every other simple version is expanded to its most specific form, and the keep-list
    wins).

4. **Rewrite.**

    `Pin` rewrites the raw TOML lines, `GuardedWrite` writes with `replaceIfVersion`, and `Refresh`
    (P3) re-emits the fresh version with the same actor.

5. **Update stage.**

    The update stage runs `cargo upgrade --manifest-path <Cargo.toml> --exclude <crate> ...` with
    one `--exclude` flag per crate, because the comma form is silently ignored, and with
    `exclude = policy.reject ∪ chain deps`.

6. **Settle.**

    `Verify` runs `verifyCommand` through `/bin/sh -c` (exit 127 non-fatal), `Settle` records the
    result, and `Refresh` (U2) re-stats and re-emits.

**The config that matters.** The keys are `logFile` (`~/.dsh/hook-dsh-cargo-governor.log`),
`cargoBin` (schema default and shipped row both `cargo`; set an absolute path when the host PATH is
not the shell PATH), `updateMode` (`cargo`, the only mode), `strict` (`false`), `keepFile` (`""` =
discovery of the same `pin-policy.json` that the pinner uses), `maxUpdateFailures` (`3`), and
`updateCooldownMs` (`3000`).

**The safety.** The refusal guard covers three shapes: a change outside an identified dependency
table, an unsupported value shape, and a dependency named in the plan but not found in the text.
Each of them composes a `REFUSED` line and aborts the rewrite. Entries with `path`, `git`, or an
inherited `workspace = true` are never rewritten. A missing cargo-edit fails gracefully
(`update: cargo-edit unavailable: ...`) and the breaker counts it.

**The ledger.** The file `~/.dsh/hook-dsh-cargo-governor.log` holds the activation line
(`activated (cargo flavor, logFile=..., updateMode=cargo, cargoBin=..., exclude=[...], policyFile=(discovery), keepFile=(discovery))`),
the pass lines (`skipped (excluded) <path>`, `governed <path> → <version>`), the refusal lines (the
three `REFUSED rewrite of <path>: ...` forms), and the update journal
(`update: cargo upgrade <argv> → {"exitCode":0}`, `update: DONE - pins bumped per policy`).

**The diagram.** [cargo-governor.mmd](Classic/cargo-governor.mmd) and
([SVG](Classic/cargo-governor.svg)).

### @playform/ets-hook-dsh-package-governor

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-package-governor`, built on
`@playform/ets-base-dsh`, `@playform/ets-lib-dsh-core`, and the `@playform/ets-plugin-dsh-factory`
service.

The Effect delta is in the update stage: `Dispatch` is `Effect<void, never, Scope.Scope>` and forks
the detached continuation into the scope of the caller with `Effect.forkIn`, so the disposal of the
plugin interrupts the fiber and aborts its child. `Settle` is `Effect<number>`, and the promise seam
runs `Effect.runPromise` with the long-lived scope of the state provided and a `dsh.update.dispatch`
span.

The ledger strings stay byte-identical to the ones of the Classic module, written to
`~/.dsh/ets-hook-dsh-package-governor.log`. The diagram is
[package-governor.mmd](EffectTS/package-governor.mmd) and ([SVG](EffectTS/package-governor.svg)).

### @playform/ets-hook-dsh-package-pinner

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-package-pinner`, built on the same
three ETS packages.

The pin pass itself keeps the Classic shape: `WriteService` of the factory performs the guarded
write and the `Effect.ensuring` finalizer owns the P2 cleanup, and unlike the governor the module
adds no span and no `Scope.provide` call site, so the scope that `apply` creates
(`Effect.runSync(Scope.make())`) stays unused at runtime.

The ledger strings stay byte-identical, written to `~/.dsh/ets-hook-dsh-package-pinner.log`. The
diagram is [package-pinner.mmd](EffectTS/package-pinner.mmd) and
([SVG](EffectTS/package-pinner.svg)).

### @playform/ets-hook-dsh-cargo-governor

**EffectTS twin.** The exact package is `@playform/ets-hook-dsh-cargo-governor`, built on the same
three ETS packages.

The plan and the surgical TOML rewrite stay unchanged, and the delta is the update stage, which uses
the same `Effect<void, never, Scope.Scope>` dispatch and `Scope.provide` seam as the ETS npm
governor, so the `cargo upgrade` subprocess stage forks into the plugin scope and is interrupted on
disposal.

The ledger strings stay byte-identical, written to `~/.dsh/ets-hook-dsh-cargo-governor.log`. The
diagram is [cargo-governor.mmd](EffectTS/cargo-governor.mmd) and
([SVG](EffectTS/cargo-governor.svg)).

## How the group composes

The basename gates are disjoint: `package-governor` and `package-pinner` both gate on
`package.json`, and `cargo-governor` gates on `Cargo.toml`. The three can be active at once on the
same `fs/observed` seam, because each decides ownership by basename before it reads anything, and
the Cargo module never sees an npm manifest.

The npm pair composes as **pin → bump-exact**. The pinner rewrites `^0.3.4` to `0.3.4`, and a fully
pinned manifest leaves the update stage of the governor nothing to do, while the chain pass of the
governor may still re-canonicalize a chain pin to `^<resolved>`.

Order between the two listeners is defined only by registration, so neither module relies on the
other having run first: each is idempotent on its own output, and the version guard plus the re-emit
make a second pass a no-op.

The Cargo precedence is **chain > strip > normalize**, with the keep-list winning over normalization
and never over the chain. The diagram shows that ordering as three labelled stages between the plan
and the rewrite.

The keep-list wins over pinning. An entry in `pin-policy.json` protects the range of a package
exactly as authored, and the same sidecar drives the normalize stage of the Cargo module through
`keepFile`. The union is computed from the global `policyFile`, the own directory of the file, the
registry-adjacent sidecar, and the built-in default, in that order.

The ledgers are separate: six modules, six files, one activation line each. The activation of one
never implies another, and the log of the Cargo module is never the log of the npm ledgers.

## How it plugs into the harness

Each bundle is one `insert:` row in `cordis.patch.yml` of the profile, with the own config keys of
the module. The service injection is `inject: ["fs", "pluginFactory"]`, and the loader holds each
hook PENDING until both services exist, so the order of the bundle list never decides whether a
listener registers.

At apply the module builds its state through `Factory.State`, attaches the jobs/inflight/storage
effects through `Factory.Attach`, writes its activation line through `Factory.Append`, registers its
direct-govern steps with `Factory.RegisterGovern`, and wires the one `fs/observed` listener through
`Factory.Wire`.

The boot order is: profile bundles → factory service → the three hooks resolve → each writes its
activation line and registers its steps.

The model observes nothing, because the result of the write tool is built from the own content of
the author and never from a disk re-read. The user observes the governed state only when they read
the file back, and observes the history in the six ledgers.

A `file:` dependency alone is not activation. The package must go in `dsh.profile.bundles` and the
host must restart, because the bundle layers compose at boot.

## What the user experiences

- A `package.json` written by an agent ends up with chain pins that track the registry and every
  other range pinned, without one extra tool call.
- A `Cargo.toml` keeps its comments and its formatting while shorthand versions become full
  versions.
- The next guarded write after a governed write succeeds instead of failing with `FS_STALE_VERSION`.
- A write inside `node_modules`, `.git`, or `.dsh` changes nothing and adds one `skipped (excluded)`
  line.
- A refusal shows in the ledger and the file stays untouched, because the guard never writes a
  non-dependency change.

## Sources

- [package-governor README](../../Classic/packages/hook-dsh-package-governor/README.md),
  [SCHEME.md](../../Classic/packages/hook-dsh-package-governor/SCHEME.md),
  [cordis.patch.yml](../../Classic/packages/hook-dsh-package-governor/cordis.patch.yml)
- [package-pinner README](../../Classic/packages/hook-dsh-package-pinner/README.md),
  [SCHEME.md](../../Classic/packages/hook-dsh-package-pinner/SCHEME.md),
  [cordis.patch.yml](../../Classic/packages/hook-dsh-package-pinner/cordis.patch.yml)
- [cargo-governor README](../../Classic/packages/hook-dsh-cargo-governor/README.md),
  [SCHEME.md](../../Classic/packages/hook-dsh-cargo-governor/SCHEME.md),
  [cordis.patch.yml](../../Classic/packages/hook-dsh-cargo-governor/cordis.patch.yml)
- [ets package-governor README](../../EffectTS/packages/ets-hook-dsh-package-governor/README.md),
  [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-package-governor/SCHEME.md),
  [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-package-governor/cordis.patch.yml)
- [ets package-pinner README](../../EffectTS/packages/ets-hook-dsh-package-pinner/README.md),
  [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-package-pinner/SCHEME.md),
  [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-package-pinner/cordis.patch.yml)
- [ets cargo-governor README](../../EffectTS/packages/ets-hook-dsh-cargo-governor/README.md),
  [SCHEME.md](../../EffectTS/packages/ets-hook-dsh-cargo-governor/SCHEME.md),
  [cordis.patch.yml](../../EffectTS/packages/ets-hook-dsh-cargo-governor/cordis.patch.yml)
