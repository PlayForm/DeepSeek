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

- **Outcome.**

    `{ status: "proposed" | "refused", proposal?, refusal? }`, with exactly one of proposal/refusal.

- **Proposal.**

    `{ id: "<kind>-<seq>", kind, status: "proposed" | "withdrawn", path, version (the fence), sequence, kind-specific fields }`
    (rename: `name`, `to`; connect: `from`, `target`, `edge`; replace: `span`, `content`).

- **Refusal.**

    `{ kind, reason, detail }`, with the frozen reason vocabulary in `Source/Interface/Refusal.ts`.

## The resolution rules (in evaluation order)

1. **The bad request.**

    `bad-request` is the request shape per kind.

2. **The missing graph.**

    `graph-unavailable` means rename/connect need the `workspaceGraph` service.

3. **The graph resolution.**

    `unknown-symbol` / `name-collision` / `duplicate-edge` / `incompatible-edge` is the graph
    resolution.

4. **The missing version.**

    `missing-version` is the fence: the version of the caller, else the own observed version of the
    hook for the path, and a version is never invented.

5. **The stale version.**

    `stale-version` is the fence against the observed version of the hook and the stat of the file.

6. **The span beyond the file.**

    `span-beyond-file` is the replace span against the real line count of the file.

7. **The full table.**

    `full` is the live table at `maxProposals`.

## Config

| Field          | Type      | Default                                              |
| -------------- | --------- | ---------------------------------------------------- |
| `enabled`      | boolean   | `false`                                              |
| `log`          | boolean   | `true`                                               |
| `domain`       | string    | `workspace_operate`                                  |
| `maxProposals` | number    | `500`                                                |
| `limitDefault` | number    | `50`                                                 |
| `limitMaximum` | number    | `500`                                                |
| `logFile`      | string    | `~/.dsh/playform/ets-hook-dsh-workspace-operate.log` |
| `policy`       | Allowlist | the D6 defaults (see below)                          |

All fields are volatile, and an invalid config fails loud at load.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the block of
the factory), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The action class of the hook is SUGGEST, which is **automatic**: it records a typed proposal and
never applies it.

The package has **NO gated action** (no file write, no batch commit, no spawn), so the block
documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and the
`policy` section of a resolved pack overrides the defaults per action (the wiring is the next
refinement).

No new ledger line exists, because the package has no gated action.

## Storage layout (domain `workspace_operate`, version 1, per-record)

- `proposals` holds one record per proposal, keyed by `id`.
- `meta` holds one record `__meta`: `{ sequence, refused }`.
