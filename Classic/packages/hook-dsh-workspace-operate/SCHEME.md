# SCHEME - @playform/hook-dsh-workspace-operate

## Service surface (`ctx.workspaceOperate`)

| Method                  | Returns                 | Notes                                                                       |
| ----------------------- | ----------------------- | --------------------------------------------------------------------------- |
| `proposeRename(input)`  | `Promise<Outcome>`      | `input: { path, name, to, version? }`                                       |
| `proposeConnect(input)` | `Promise<Outcome>`      | `input: { from: {path, symbol?}, target: {path, symbol?}, edge, version? }` |
| `proposeReplace(input)` | `Promise<Outcome>`      | `input: { path, span: {startLine, endLine}, content, version? }`            |
| `list(filter?)`         | `Proposal[]`            | `filter: { kind?, path?, status?, limit? }`                                 |
| `get(id)`               | `Proposal \| undefined` | -                                                                           |
| `withdraw(id)`          | `boolean`               | only a `proposed` proposal withdraws                                        |
| `statistics()`          | `Statistics`            | `{ proposals, refused, sequence, byKind }`                                  |

## The types

- `Outcome` - `{ status: "proposed" \| "refused", proposal?, refusal? }`; exactly one of
  proposal/refusal.
- `Proposal` -
  `{ id: "<kind>-<seq>", kind, status: "proposed" \| "withdrawn", path, version (the fence), sequence, kind-specific fields }`
  (rename: `name`, `to`; connect: `from`, `target`, `edge`; replace: `span`, `content`).
- `Refusal` - `{ kind, reason, detail }` with the frozen reason vocabulary in
  `Source/Interface/Refusal.ts`.

## The resolution rules (in evaluation order)

1. `bad-request` - the request shape per kind.
2. `graph-unavailable` - rename/connect need the `workspaceGraph` service.
3. `unknown-symbol` / `name-collision` / `duplicate-edge` / `incompatible-edge` - the graph
   resolution.
4. `missing-version` - the fence: the caller's version, else the hook's own observed version for the
   path; a version is never invented.
5. `stale-version` - the fence vs the hook's observed version and the file's stat.
6. `span-beyond-file` - the replace span vs the file's real line count.
7. `full` - the live table at `maxProposals`.

## Config

| Field          | Type    | Default              |
| -------------- | ------- | -------------------- |
| `enabled`      | boolean | `false`              |
| `log`          | boolean | `true`               |
| `domain`       | string  | `workspace_operate`  |
| `maxProposals` | number  | `500`                |
| `limitDefault` | number  | `50`                 |
| `limitMaximum` | number  | `500`                |
| `logFile`      | string  | `~/.dsh/operate.log` |

All volatile. Invalid config fails loud at load.

## Storage layout (domain `workspace_operate`, version 1, per-record)

- `proposals` - one record per proposal, keyed by `id`.
- `meta` - one record `__meta`: `{ sequence, refused }`.
