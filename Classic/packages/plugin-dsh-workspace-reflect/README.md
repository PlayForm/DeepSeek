# @playform/plugin-dsh-workspace-reflect

The workspace-reflect service for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release). The **later stage** service-provider role: the code-block reflective ops - the AST-aware
rename/connect/replace from a **single call** each, over the managed representations.

## The one-call semantics

Each operation bundles the whole transformation - one call instead of a tool choreography. The spans
are 1-based and inclusive (the graph's span grammar).

| Op        | Request                                            | Behavior                                                                                                                                                     |
| --------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rename`  | path, startLine, endLine, oldName, newName, scope? | Whole-word rename within the block span (default) or the whole file (`scope: "file"`); zero occurrences is rejected.                                         |
| `connect` | fromPath, toPath, symbol?                          | Inserts an import of `symbol` from the relative specifier of `toPath` into `fromPath`; without a symbol, a reference comment. Already-connected is rejected. |
| `replace` | path, startLine, endLine, text                     | Replaces the span's lines with `text` (empty text deletes); the span guard rejects a span outside the file or wider than `maxBlockLines`.                    |

## The reply is part of the type

Every operation returns the CommitReply union (Interface/Reply.ts), never a boolean or a thrown
error:

```ts
status: "applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown";
```

- `applied` - written; the new version travels with the reply.
- `conflict` - the version fence failed; the file moved under the operation, nothing overwritten.
- `denied` - the plugin is disabled (the cold mount answers denied).
- `rejected` - refused before any write (malformed request, oversized file or span, no matches,
  already connected).
- `outcome-unknown` - the write failed in a way that is neither a version conflict nor a confirmed
  failure.

## The publish path and the carry

Writes go only through the factory's guarded write (the `replaceIfVersion` fence, the P4 sandbox
policy, the stash pre-registration) - never a raw fs write. After an applied operation the optional
`workspaceGraph` sibling service is probed (never injected) and asked to re-index the changed file -
the reflective carry; an absent graph is an honest skip.

## Service surface (`ctx.workspaceReflect`)

`rename(op)`, `connect(op)`, `replace(op)`, and `act(op)` (the dispatch by kind) - all async, all
returning the reply union.

## Configuration

Every knob is volatile (hot-editable without remounting): `logFile` (`~/.dsh/reflect.log`), `log`,
`enabled` (false - the IDLE-forever posture), `propagate` (`block` | `file`, default `block`),
`maxFileBytes` (1000000), `maxBlockLines` (5000). The plugin ships disabled and enables only by an
explicit ACTIVATE.

Ledger lines (module-owned, prefixed `reflect:`): `activated`, `disabled`, `rename`, `connect`,
`replace`, `denied`, `rejected`, `conflict`, `carried`, `failed`.

Plan:
[Documentation/Plans/Workspace-Family/REFLECT.md](../../../Documentation/Plans/Workspace-Family/REFLECT.md).
