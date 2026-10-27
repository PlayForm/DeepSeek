# SCHEME - @playform/plugin-dsh-workspace-evidence

The config surface is all volatile, and the schema defaults are the truth.

| Field            | Type      | Default                                                 | Meaning                                                |
| ---------------- | --------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `log`            | boolean   | `true`                                                  | Ledger enabled - write the durable log file.           |
| `logFile`        | string    | `~/.dsh/playform/ets-plugin-dsh-workspace-evidence.log` | The module's own ledger.                               |
| `enabled`        | boolean   | `false`                                                 | The master switch - the IDLE-forever posture.          |
| `domain`         | string    | `workspace_evidence`                                    | The KV domain name.                                    |
| `maxValidations` | number    | `512`                                                   | The store bound (superseded evict first, then oldest). |
| `exclude`        | string[]  | `["node_modules/**", "**/Target/**", "**/.git/**"]`     | Paths whose events trigger no invalidation.            |
| `policy`         | Allowlist | the D6 block (see below)                                | The per-action allowlist (the shared factory block).   |

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of this package are read-only and record, all AUTOMATIC.

It has NO gated action (no file write, no batch commit, no spawn), so the block documents the
posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).

The package adds no ledger line, because it has no gated action.

The service surface (`ctx.workspaceEvidence`):

| Method       | Signature                                                                                                                    | Notes                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `validate`   | `(id: string, kind: TruthKind, subject: string, dependencies: string[], verdict?: "verified" \| "unverified") => Validation` | Records one validation object; throws on an invalid kind/id/subject (fail loud). A revalidation supersedes. |
| `check`      | `(id: string) => "fresh" \| "stale" \| "superseded" \| undefined`                                                            | The object's current status.                                                                                |
| `invalidate` | `(key: string) => number`                                                                                                    | The Acar seam; returns the number of objects gone stale.                                                    |
| `list`       | `(status?) => Validation[]`                                                                                                  | The objects, oldest sequence first.                                                                         |
| `statistics` | `() => { validations, fresh, stale, superseded, sequence }`                                                                  | The store counters.                                                                                         |

The four truth kinds (`TruthKind`) are `reality`, `observation`, `representation`, and `intent`.

## The repeat-event guard (Function/Duplicate)

The fs/observed listener coalesces repeat events: a repeat for the same path that carries the same
version within a short window (2 s on the clock of the module; the `State.Now` test seam overrides
it; no real timer anywhere) runs no invalidation pass and records nothing.

The version token identifies the file state, so the invalidation of that state already ran, and any
validation created since is fresh against the same state.

A different version, or the same version after the window, runs the pass normally.

The explicit `invalidate(key)` calls of the service are never coalesced.

A coalesced repeat adds no ledger line and records nothing.
