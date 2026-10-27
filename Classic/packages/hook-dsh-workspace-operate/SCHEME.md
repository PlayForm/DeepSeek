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

1. **The bad request.**

    `bad-request` is the request shape per kind.

2. **The missing graph.**

    `graph-unavailable` means rename/connect need the `workspaceGraph` service.

3. **The graph resolution.**

    `unknown-symbol` / `name-collision` / `duplicate-edge` / `incompatible-edge` is the graph
    resolution.

4. **The missing version.**

    `missing-version` is the fence: the caller's version, else the hook's own observed version for
    the path; a version is never invented.

5. **The stale version.**

    `stale-version` is the fence against the hook's observed version and the file's stat.

6. **The span beyond the file.**

    `span-beyond-file` is the replace span against the file's real line count.

7. **The full table.**

    `full` is the live table at `maxProposals`.

## Config

| Field          | Type      | Default                                          |
| -------------- | --------- | ------------------------------------------------ |
| `enabled`      | boolean   | `false`                                          |
| `log`          | boolean   | `true`                                           |
| `domain`       | string    | `workspace_operate`                              |
| `maxProposals` | number    | `500`                                            |
| `limitDefault` | number    | `50`                                             |
| `limitMaximum` | number    | `500`                                            |
| `logFile`      | string    | `~/.dsh/playform/hook-dsh-workspace-operate.log` |
| `policy`       | Allowlist | the D6 defaults (see below)                      |

All volatile. Invalid config fails loud at load.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The hook's action class is SUGGEST, which is **automatic**: it records a typed proposal and never
applies it. The package has **NO gated action** (no file write, no batch commit, no spawn), so the
block documents the posture and refuses nothing. The block is one volatile object, so a policy flip
is hot-editable without a remount; a resolved pack's `policy` section overrides the defaults per
action (the wiring is the next refinement). No new ledger line: the package has no gated action.

## Storage layout (domain `workspace_operate`, version 1, per-record)

- `proposals` - one record per proposal, keyed by `id`.
- `meta` - one record `__meta`: `{ sequence, refused }`.
