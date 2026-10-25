# @playform/plugin-dsh-workspace-reflect

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/REFLECT](../../../Documentation/Plans/Workspace-Family/REFLECT.md)

## The role

The workspace-reflect service for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release). The **later stage** service-provider role: the code-block reflective ops - the AST-aware
rename/connect/replace from a **single call** each, over the managed representations.

## The one-call semantics

Each operation bundles the whole transformation - one call instead of a tool choreography. The spans
are 1-based and inclusive (the graph's span grammar).

| Op        | Request                                               | Behavior                                                                                                                                                                                                       |
| --------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rename`  | path, startLine, endLine, oldName, newName, scope?    | The semantics service's scope-resolved plan first (its edits filtered to the operation's scope); the whole-word textual engine as the fallback. Zero occurrences is rejected.                                  |
| `connect` | fromPath, toPath, symbol?                             | Inserts an import of `symbol` from the relative specifier of `toPath` into `fromPath`; without a symbol, a reference comment. Already-connected is rejected.                                                   |
| `replace` | path, startLine?, endLine?, text, node?, fingerprint? | A graph NODE target (the AST source) with its content fingerprint verified before the write; or a plain span (the textual form). The span guard rejects a span outside the file or wider than `maxBlockLines`. |

## The AST-aware targeting

A `replace` may name the workspace graph's frozen node id (`node: "Block:<path>:<line>:body"`) and
the node's content-derived fingerprint. The graph (`ctx.workspaceGraph`, probed never injected)
supplies the span, the fingerprint is verified against the current text with the graph's own
formula, and only that span is rewritten - a mismatch refuses with
`rejected <path> (fingerprint mismatch)` and writes nothing. With the graph absent the caller's
explicit span is the fallback and the fingerprint is still verified.

A `rename` asks the workspace-semantics service (`ctx.workspaceSemantics`, probed never injected)
for the scope-resolved plan - the service may deepen it through the harness LSP seam - and applies
the plan's edits inside the operation's scope; the textual whole-word engine is the fallback when
the service is absent, refuses, or has no edit in scope.

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
  already connected, a stale fingerprint, an absent graph).
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

## The configuration

Every knob is volatile (hot-editable without remounting): `logFile`
(`~/.dsh/playform/ets-plugin-dsh-workspace-reflect.log`), `log`, `enabled` (false - the IDLE-forever
posture), `propagate` (`block` | `file`, default `block`), `maxFileBytes` (1000000), `maxBlockLines`
(5000). The plugin ships disabled and enables only by an explicit ACTIVATE. No new knob: the graph
and the semantics service are optional siblings.

### The policy block (D6) - the write gate

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The reflective WRITES are the gated actions: `replace` and `rename` consult the `write` verdict
before the file is read or written. An `approve` verdict (the shipped default) refuses the operation
with the byte-exact `replace held <path> (policy write=approve)` or
`rename held <path> (policy write=approve)` line, the reply is `rejected` with
`the policy holds the replace|rename (write=approve)`, and **zero writes** reach the filesystem. The
fingerprint targeting is unchanged: the policy is the OUTER check, the fingerprint verification the
inner one. Flip `policy.write` to `auto` (or let a resolved pack override it) to let the next
operation reach the write path. The block is one volatile object, so a policy flip is hot-editable
without a remount; a resolved pack's `policy` section overrides the defaults per action (the wiring
is the next refinement).

## The ledger

Ledger lines (module-owned, prefixed `reflect:`): `activated`, `disabled`, `rename`, `connect`,
`replace`, `deepened`, `denied`, `rejected`, `conflict`, `carried`, `failed`, and the two policy
holds `replace held <path> (policy write=approve)` / `rename held <path> (policy write=approve)`.
The new `rejected` reasons (`fingerprint required for a node target`,
`fingerprint without a node target`, `fingerprint mismatch`, `node path mismatch`,
`node not targetable`, `node not found`, `graph absent`) are documented in SCHEME.md section 5.

## The plan

- [Workspace-Family/REFLECT](../../../Documentation/Plans/Workspace-Family/REFLECT.md) - the
  reflective ops.

## License

CC0-1.0.
