# @playform/ets-hook-dsh-package-governor - The silent package.json governor

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates). Plan:
> [SCHEME.md](./SCHEME.md).

## The role

The **silent package.json governor** of the DeepSeek Harness - a plugin on the `fs/observed` event
(the cordis event every harness file write dispatches; the tool layer is the only dispatcher) that
governs every `package.json` written by any agent, anywhere. A pure chain pass canonicalizes
chain-governed dependency pins to the effective registry's `^resolved`, then an update stage lets
npm-check-updates bump the public ones (programmatic by default or the ncu bin in bin mode,
policy-driven, chain deps rejected) as a detached, contained continuation - and the author never
learns. Fully API-aware: the governed manifest is read/rewritten through `ctx.fs` with a
version-guarded `replaceIfVersion` write (the service owns version tokens), configuration is a
validated Schemastery Config schema with defaults, and the authoring agent is never notified: the
tool result is built from the author's own content, and the observation-policy's version record is
refreshed by re-emitting `fs/observed` with the service-issued fresh version. A factory flavor: the
family's furnace does the plumbing; this package is the model logic. The lowest plumbing layer - the
ledger `Append`, the shared journal and the activation-line composer - lives in the family's base
package `ets-base-dsh`, reached through the factory.

## The surfaces

| Kind     | Name                                             | What                                                                                |
| -------- | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| listener | `fs/observed`                                    | The `Wire`-registered observation listener; basename gate `package.json`.           |
| listener | `fs/observed` (refresh)                          | The observation-policy refresh re-emits the service-issued fresh version.           |
| service  | `RegisterGovern("package.json", "canonicalize")` | The direct-govern chain-pass entry.                                                 |
| service  | `RegisterGovern("package.json", "update")`       | The direct-govern update-stage entry.                                               |
| service  | update stage (Dispatch/Execute)                  | The detached, contained continuation (npm-check-updates programmatic or `ncu` bin). |
| config   | `update-policy.json`                             | The update-stage policy file (`policyFileName`, shared discovery via the factory).  |
| config   | Schemastery Config schema                        | The exported `Config` (shared block + the module's own fields).                     |
| tool     | ledger `ets-hook-dsh-package-governor.log`       | The module's own log file (one global log).                                         |

## The configuration

| Field               | Type     | Default                                                                       | Meaning                                                                             |
| ------------------- | -------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `log`               | boolean  | `true`                                                                        | Ledger enabled - write the durable log file (volatile).                             |
| `logFile`           | string   | `~/.dsh/playform/ets-hook-dsh-package-governor.log`                           | The ledger file - one global log, volatile.                                         |
| `updateCooldownMs`  | number   | `3000`                                                                        | Cooldown between update-stage dispatches, per directory (volatile).                 |
| `mutationTools`     | string[] | `["write", "edit", "str_replace_editor", "raw-write"]`                        | Actor tool names whose `fs/observed` events trigger governing (volatile).           |
| `policyFile`        | string   | `""`                                                                          | Global policy file; empty means discovery (`Function/Resolve`).                     |
| `exclude`           | string[] | `["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"]` | Excluded path segments (anywhere mode, exclusion-first) - the module's fence.       |
| `strict`            | boolean  | `false`                                                                       | Strict chain pass: strip unknown deps in a governed workspace.                      |
| `maxUpdateFailures` | number   | `3`                                                                           | Circuit breaker: consecutive update-stage failures per directory before pause.      |
| `updateMode`        | string   | `"programmatic"`                                                              | Update stage mode: `"programmatic"` (ncu library in-process) or `"bin"`.            |
| `ncuBin`            | string   | `"ncu"`                                                                       | ncu binary for bin mode (binary name or absolute path, resolved via the host PATH). |

## The ledger

```text
activated (anywhere mode, logFile=..., updateMode=..., ncuBin=..., exclude=[...], policyFile=(discovery))
skipped (excluded) <path>
no registry.json found for <path> - chain pass skipped
unreadable registry.json at <found> - chain pass skipped for <path>
observed non-JSON package.json <path> - skipped
governed <path> → <version>
REFUSED rewrite of <path>: non-dependency section "<name>" would change
update stage dispatched for <dir> (mode=..., ncu via ..., policy ...)
update stage paused for <dir> (N consecutive failures ≥ limit)
update stage skipped for <dir> (in-flight)
update stage skipped for <dir> (cooldown)
update stage FAILED (<code>) for <dir>; consecutive=N
update: mode=programmatic (npm-check-updates library)
update: mode=bin (ncu binary <bin>)
update: ncu (<label>) → <results>
update: ncu failed (<label>): <cause>
update: ncu failed (<label>) status N
update: npm-check-updates library unavailable: <cause>
update: npm-check-updates run() not found in library exports
update: running verifyCommand: <command>
update: verifyCommand ok
update: verifyCommand failed (status N)
update: verifyCommand runner unavailable (exit 127) - skipped, non-fatal
update: DONE - pins bumped per policy
update: FAILED - see lines above
```

Each line is `[<ISO>] <message>` in the file (the logger prefix is the factory's `Append`; the
module identity is `hook-dsh-governor-package`). The activation line is written by `apply()` - "did
it activate" must be answerable from the ledger alone.

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir EffectTS/packages/ets-hook-dsh-package-governor run prepublishOnly`
- Smokes: `node EffectTS/packages/ets-hook-dsh-package-governor/Target/Test/<Folder>/Test.js`
    - Chain-Pass - 14 checks
    - Direct-Govern-And-Lifecycle - 15 checks
    - Entry-And-Config - 4 checks
    - Gate-Matrix - 9 checks
    - Refusals-And-Transform - 9 checks
    - State-And-Activation - 10 checks
    - Update-Stage - 21 checks

## The plan

[SCHEME.md](./SCHEME.md).
