# @playform/ets-hook-dsh-cargo-governor - The silent Cargo.toml governor

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates).
>
> Plan: [SCHEME.md](./SCHEME.md).

## The role

The **Cargo.toml flavor of the silent package.json governor** - the same architecture, the same
API-awareness discipline, the same silence toward the author, but for RUST manifests.

Hooks `fs/observed` - the cordis event every tool-layer file write dispatches - for basename
`Cargo.toml`, parses with smol-toml ONLY to identify dependency entries (`[dependencies]`,
`[dev-dependencies]`, `[build-dependencies]`, `[target.'cfg(...)'.dependencies]`,
`[workspace.dependencies]`) and rewrites chain-governed pins SURGICALLY on the raw text lines
(comments and formatting survive; an internal calculation, not a TOML stringify), then runs the
update stage as a detached, contained continuation that drives the RUST-SIDE CLI - `cargo upgrade`
(cargo-edit) - through the `ctx.subprocess` seam with the exclusion list enforced AT THE CLI LEVEL
(`--exclude`, one flag per crate; chain deps merged in so `cargo upgrade` can never bump a
chain-governed pin).

The Rust/TS boundary is exclusionary: Rust does not co-opt into the TypeScript ecosystem, and there
is no npm-library equivalent for cargo manifest updates - the cargo CLI is the only update path.

Fully API-aware: the governed manifest is read/rewritten through `ctx.fs` with a version-guarded
`replaceIfVersion` write, configuration is a validated Schemastery Config schema with defaults, and
the authoring agent is never notified (the observation-policy's version record is refreshed by
re-emitting `fs/observed` with the service-issued fresh version).

A factory flavor: the family's furnace does the plumbing; this package is the model logic.

The lowest plumbing layer - the ledger `Append`, the shared journal and the activation-line
composer - lives in the family's base package `ets-base-dsh`, reached through the factory.

## The surfaces

| Kind     | Name                                     | What                                                                         |
| -------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| listener | `fs/observed`                            | The `Wire`-registered observation listener; basename gate `Cargo.toml`.      |
| listener | `fs/observed` (refresh)                  | The observation-policy refresh re-emits the service-issued fresh version.    |
| service  | `RegisterGovern("Cargo.toml", "cargo")`  | The direct-govern chain-pass entry.                                          |
| service  | `RegisterGovern("Cargo.toml", "update")` | The direct-govern update-stage entry.                                        |
| service  | update stage (Dispatch/Run)              | The detached, contained continuation (`cargo upgrade` via `ctx.subprocess`). |
| config   | `pin-policy.json`                        | The keep-list sidecar (`policyFileName`, shared discovery via the factory).  |
| config   | Schemastery Config schema                | The exported `Config` (shared block + the module's own fields).              |
| tool     | ledger `ets-hook-dsh-cargo-governor.log` | The module's own log file - separate from the npm ledgers.                   |

## The configuration

| Field               | Type     | Default                                                                       | Meaning                                                                                                                        |
| ------------------- | -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `log`               | boolean  | `true`                                                                        | Ledger enabled - write the durable log file (volatile).                                                                        |
| `logFile`           | string   | `~/.dsh/playform/ets-hook-dsh-cargo-governor.log`                             | The CARGO MODULE's OWN ledger - separate from the package governor's (volatile).                                               |
| `updateCooldownMs`  | number   | `3000`                                                                        | Cooldown between update-stage dispatches, per directory (volatile).                                                            |
| `mutationTools`     | string[] | `["write", "edit", "str_replace_editor", "raw-write"]`                        | Actor tool names whose `fs/observed` events trigger the module (volatile).                                                     |
| `policyFile`        | string   | `""`                                                                          | Global policy file; empty means discovery (`Function/Resolve`).                                                                |
| `exclude`           | string[] | `["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"]` | Excluded path segments (anywhere mode, exclusion-first).                                                                       |
| `strict`            | boolean  | `false`                                                                       | Strict chain pass: strip unknown deps (the whole `name = "..."` entry) in a governed workspace.                                |
| `maxUpdateFailures` | number   | `3`                                                                           | Circuit breaker: consecutive update-stage failures per directory before pause.                                                 |
| `cargoBin`          | string   | `"cargo"`                                                                     | Cargo binary for the update stage (bare name resolved through the subprocess seam's `resolveExecutable`, or an absolute path). |
| `keepFile`          | string   | `""`                                                                          | Global `pin-policy.json` (the keep-list of the full-version normalization directive); empty means discovery.                   |
| `updateMode`        | string   | `"cargo"`                                                                     | Update stage mode: `"cargo"` (the Rust-side CLI through `ctx.subprocess`) is the only implemented mode.                        |

## The ledger

```text
activated (cargo flavor, logFile=..., updateMode=cargo, cargoBin=..., exclude=[...], policyFile=(discovery), keepFile=(discovery))
skipped (excluded) <path>
no registry.json found for <path> - chain pass skipped
unreadable registry.json at <found> - chain pass skipped for <path>
observed non-JSON/TOML Cargo.toml <path> - skipped
governed <path> → <version>
REFUSED rewrite of <path>: non-dependency section "<name>" would change
REFUSED rewrite of <path>: dependency "<key>" in section "<section>" has an unsupported value shape - rewrite aborted
REFUSED rewrite of <path>: dependency "<name>" in section "<section>" not found in text - rewrite aborted
unreadable pin-policy.json at <keepFile> - using built-in default
update stage dispatched for <dir> (cargo via ..., policy ...)
update stage paused for <dir> (N consecutive failures ≥ limit)
update stage skipped for <dir> (in-flight)
update stage skipped for <dir> (cooldown)
update stage FAILED (<code>) for <dir>; consecutive=N
update: cargo upgrade <argv> → {"exitCode":0}
update: cargo upgrade failed (<label>) status N
update: cargo-edit unavailable: <cause>
update: running verifyCommand: <command>
update: verifyCommand ok
update: verifyCommand failed (status N)
update: verifyCommand runner unavailable (exit 127) - skipped, non-fatal
update: DONE - pins bumped per policy
update: FAILED - see lines above
```

Each line is `[<ISO>] <message>` in the file (the logger prefix is the factory's `Append`; the
module identity is `hook-dsh-governor-cargo`).

The activation line is written by `apply()` - "did it activate" must be answerable from the ledger
alone.

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir EffectTS/packages/ets-hook-dsh-cargo-governor run prepublishOnly`
- Smokes: `node EffectTS/packages/ets-hook-dsh-cargo-governor/Target/Test/<Folder>/Test.js`
    - Chain-And-Rewrite - 13 checks
    - Direct-Govern - 4 checks
    - Factory-Wiring - 8 checks
    - Gates-And-Registry-Discovery - 6 checks
    - Keep-Refusal-And-Guarded-Write - 8 checks
    - Loader-And-Config - 6 checks
    - State-And-Activation - 4 checks
    - Update-Stage - 13 checks

## The plan

[SCHEME.md](./SCHEME.md).
