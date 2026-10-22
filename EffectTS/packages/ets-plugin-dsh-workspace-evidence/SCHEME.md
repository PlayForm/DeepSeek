# SCHEME - @playform/plugin-dsh-workspace-evidence

The config surface (all volatile; the schema defaults are the truth).

| Field            | Type     | Default                                             | Meaning                                                |
| ---------------- | -------- | --------------------------------------------------- | ------------------------------------------------------ |
| `log`            | boolean  | `true`                                              | Ledger enabled - write the durable log file.           |
| `logFile`        | string   | `~/.dsh/evidence.log`                               | The module's own ledger.                               |
| `enabled`        | boolean  | `false`                                             | The master switch - the IDLE-forever posture.          |
| `domain`         | string   | `workspace_evidence`                                | The KV domain name.                                    |
| `maxValidations` | number   | `512`                                               | The store bound (superseded evict first, then oldest). |
| `exclude`        | string[] | `["node_modules/**", "**/Target/**", "**/.git/**"]` | Paths whose events trigger no invalidation.            |

The service surface (`ctx.workspaceEvidence`):

| Method       | Signature                                                                                                                    | Notes                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `validate`   | `(id: string, kind: TruthKind, subject: string, dependencies: string[], verdict?: "verified" \| "unverified") => Validation` | Records one validation object; throws on an invalid kind/id/subject (fail loud). A revalidation supersedes. |
| `check`      | `(id: string) => "fresh" \| "stale" \| "superseded" \| undefined`                                                            | The object's current status.                                                                                |
| `invalidate` | `(key: string) => number`                                                                                                    | The Acar seam; returns the number of objects gone stale.                                                    |
| `list`       | `(status?) => Validation[]`                                                                                                  | The objects, oldest sequence first.                                                                         |
| `statistics` | `() => { validations, fresh, stale, superseded, sequence }`                                                                  | The store counters.                                                                                         |

The four truth kinds (`TruthKind`): `reality`, `observation`, `representation`, `intent`.
