# @playform/hook-dsh-workspace-approve

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/APPROVE](../../../Documentation/Plans/Workspace-Family/APPROVE.md)

## The role

The workspace-approve hook for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release).

It is a DeepSeek Harness plugin that binds the **exact human approval** (the candidate-bound
approval plus the constraints), the approve step of the invisible flow of the workspace family:

```
... -> the authority licenses -> the approve binds -> the merge commits -> ...
```

## The exact-approval semantics

An approval binds to the **exact candidate**: the concrete change set, identified by its path, its
content fingerprint, and the file version observed at the approval, never a fuzzy intent.

The constraints **travel with the approval**: a changed constraint set at approval time is a
rejection, not an amendment.

The decision records the **Commitment** (who accepted responsibility).

The merge/execute side derives its **AuthorizationDecision** from the check of the service.

**An intent must not authorize its own means**: the approval of an intention never authorizes the
implementation the agent later produces.

The check only validates the implementation against the approved candidate, because the independent
authority licensing happened earlier in the flow.

## The service surface (`ctx.workspaceApprove`)

| Method                                              | Behavior                                                                                                                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bind(candidate)`                                   | Register an exact candidate (path + fingerprint + version + constraints) as a pending binding; rejected with its own ledger line when the identity is incomplete or constraints are required and missing. |
| `approve(id, who, constraints?)`                    | A pending binding becomes approved; a changed constraint set rejects.                                                                                                                                     |
| `deny(id, who)`                                     | A pending binding becomes denied.                                                                                                                                                                         |
| `revoke(id, who)`                                   | An approved binding becomes revoked.                                                                                                                                                                      |
| `check(request)`                                    | The exactness check: `approved` only when an approved binding covers the exact fingerprint AND the version is unchanged; otherwise `unbound` / the binding's decision / `stale`.                          |
| `binding(id)` / `bindings(limit?)` / `statistics()` | The read surface.                                                                                                                                                                                         |

## The invalidation listener

On `fs/observed` (heard on the ROOT context through the Wire of the factory), a binding whose file
is observed at a different version than the one bound in the approval is invalidated
(`decision: "invalidated"`, ledger `invalidated <id> (version changed)`).

The listener is a synchronous recorder: no awaits, no throws, no I/O, and own-actor events are
ignored.

## Storage and ledger

State lives in the own KV domain of the hook named `workspace_approve` (config `domain`): one record
per binding plus a bounded ring snapshot (the last `maxBindings`, default 1000).

The sequence is the own monotonic counter of the plugin, never a wall clock.

Ledger lines (module-owned, prefixed `approve:`): `activated`, `disabled`, `bound`, `decided`,
`rejected`, `revoked`, `refused`, `unknown`, `invalidated`, `checked`, `capped`, `failed`,
`storage open failed`.

## The configuration

Every knob is volatile (hot-editable without remounting): `logFile`
(`~/.dsh/playform/ets-hook-dsh-workspace-approve.log`), `log`, `enabled` (false, the IDLE-forever
posture), `domain` (`workspace_approve`), `maxBindings` (1000), and `requireConstraints` (true).

The plugin ships disabled and enables only by an explicit ACTIVATE.

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the block of
the factory), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of this package are record, all AUTOMATIC; it has NO gated action (no file write, no
batch commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and the
`policy` section of a resolved pack overrides the defaults per action (the wiring is the next
refinement).

## The plan

- [Workspace-Family/APPROVE](../../../Documentation/Plans/Workspace-Family/APPROVE.md) - the approve
  step of the invisible flow.

## License

CC0-1.0.
