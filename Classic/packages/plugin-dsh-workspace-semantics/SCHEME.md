# SCHEME - @playform/plugin-dsh-workspace-semantics

The config surface (all volatile; the schema defaults are the truth).

| Field        | Type     | Default                                             | Meaning                                         |
| ------------ | -------- | --------------------------------------------------- | ----------------------------------------------- |
| `log`        | boolean  | `true`                                              | Ledger enabled - write the durable log file.    |
| `logFile`    | string   | `~/.dsh/semantics.log`                              | The module's own ledger.                        |
| `enabled`    | boolean  | `false`                                             | The master switch - the IDLE-forever posture.   |
| `domain`     | string   | `workspace_semantics`                               | The KV domain name.                             |
| `maxEntries` | number   | `256`                                               | The index bound (the oldest models drop first). |
| `exclude`    | string[] | `["node_modules/**", "**/Target/**", "**/.git/**"]` | Paths no model is built for.                    |

The service surface (`ctx.workspaceSemantics`):

| Method       | Signature                                                                    | Notes                                                                       |
| ------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `resolve`    | `(path: string) => Promise<Model \| undefined>`                              | Lazy build through the adapter; `undefined` is the refusal-to-guess answer. |
| `symbol`     | `(path: string, qualifiedName: string) => SymbolNode \| undefined`           | Exact name match in the built model.                                        |
| `references` | `(path: string) => ReferenceNode[]`                                          | The model's reference list.                                                 |
| `rename`     | `(path: string, span: Span, to: string) => Promise<RenamePlan \| undefined>` | The per-adapter plan; never a write.                                        |
| `adapt`      | `(adapter: Adapter) => void`                                                 | The any-file adapter seam (per extension).                                  |
| `statistics` | `() => { paths, revision, adapters }`                                        | The index counters.                                                         |
