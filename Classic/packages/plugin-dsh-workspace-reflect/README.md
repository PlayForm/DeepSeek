# @playform/plugin-dsh-workspace-reflect

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/REFLECT](../../../Documentation/Plans/Workspace-Family/REFLECT.md)

## The role

The workspace-reflect service for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release).

The **later stage** service-provider role provides the code-block reflective operations: an
AST-aware rename, connect, or replace from a **single call** each, over the managed representations.

## The one-call semantics

Each operation carries the whole transformation in one call, instead of a choreography of tools.

The spans use 1-based inclusive numbering, which is the graph's span grammar.

| Op        | Request                                               | Behavior                                                                                                                                                                                                       |
| --------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rename`  | path, startLine, endLine, oldName, newName, scope?    | The semantics service's scope-resolved plan first (its edits filtered to the operation's scope); the whole-word textual engine as the fallback. Zero occurrences is rejected.                                  |
| `connect` | fromPath, toPath, symbol?                             | Inserts an import of `symbol` from the relative specifier of `toPath` into `fromPath`; without a symbol, a reference comment. Already-connected is rejected.                                                   |
| `replace` | path, startLine?, endLine?, text, node?, fingerprint? | A graph NODE target (the AST source) with its content fingerprint verified before the write; or a plain span (the textual form). The span guard rejects a span outside the file or wider than `maxBlockLines`. |

## The AST-aware targeting

A `replace` can name the frozen node id of the workspace graph (`node: "Block:<path>:<line>:body"`)
together with the content-derived fingerprint of the node.

The graph (`ctx.workspaceGraph`, probed and never injected) supplies the span, the check compares
the fingerprint with the current text through the formula of the graph, and only that span is
rewritten, so a mismatch refuses with `rejected <path> (fingerprint mismatch)` and writes nothing.

When the graph is absent, the explicit span from the caller is the fallback, and the check still
compares the fingerprint.

A `rename` asks the workspace-semantics service (`ctx.workspaceSemantics`, probed and never
injected) for the scope-resolved plan, which the service may deepen through the harness LSP seam,
and applies the edits of the plan inside the scope of the operation.

The textual whole-word engine is the fallback when the service is absent, refuses, or has no edit in
scope.

## The reply is part of the type

Every operation returns the CommitReply union (Interface/Reply.ts), never a boolean or a thrown
error:

```ts
status: "applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown";
```

- `applied` - written, and the new version travels with the reply.
- `conflict` - the version fence failed, the file moved under the operation, and nothing was
  overwritten.
- `denied` - the plugin is disabled, and the cold mount answers denied.
- `rejected` - refused before any write (malformed request, oversized file or span, no matches,
  already connected, a stale fingerprint, an absent graph).
- `outcome-unknown` - the write failed in a way that is neither a version conflict nor a confirmed
  failure.

## The publish path and the carry

Writes go only through the guarded write of the factory (the `replaceIfVersion` fence, the P4
sandbox policy, the stash pre-registration) and never through a raw fs write.

After an applied operation the plugin probes the optional `workspaceGraph` sibling service (never
injected) and asks it to re-index the changed file, which is the reflective carry, and an absent
graph is an honest skip.

## The surfaces

`rename(op)`, `connect(op)`, `replace(op)`, and `act(op)` (the dispatch by kind), all async and all
returning the reply union.

## The configuration

Every knob is volatile and hot-editable without a remount: `logFile`
(`~/.dsh/playform/plugin-dsh-workspace-reflect.log`), `log`, `enabled` (false, the IDLE-forever
posture), `propagate` (`block` | `file`, default `block`), `maxFileBytes` (1000000), and
`maxBlockLines` (5000).

The plugin ships disabled and enables only through an explicit ACTIVATE.

The package adds no new knob, because the graph and the semantics service are optional siblings.

### The policy block (D6) - the write gate

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the block of
the factory) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The reflective WRITES are the gated actions, so `replace` and `rename` consult the `write` verdict
before the file is read or written.

An `approve` verdict (the shipped default) refuses the operation with the byte-exact
`replace held <path> (policy write=approve)` or `rename held <path> (policy write=approve)` line,
the reply is `rejected` with `the policy holds the replace|rename (write=approve)`, and **zero
writes** reach the filesystem.

The fingerprint targeting is unchanged, with the policy as the OUTER check and the fingerprint
verification as the inner one.

Set `policy.write` to `auto`, or let a resolved pack override it, so the next operation reaches the
write path.

The block is one volatile object, so a policy flip is hot-editable without a remount.

A `policy` section of a resolved pack overrides the defaults per action, and that wiring is the next
refinement.

## The ledger

The module owns the ledger and prefixes it with `reflect:`: `activated`, `disabled`, `rename`,
`connect`, `replace`, `deepened`, `denied`, `rejected`, `conflict`, `carried`, `failed`, and the two
policy holds `replace held <path> (policy write=approve)` /
`rename held <path> (policy write=approve)`.

The new `rejected` reasons (`fingerprint required for a node target`,
`fingerprint without a node target`, `fingerprint mismatch`, `node path mismatch`,
`node not targetable`, `node not found`, `graph absent`) are documented in SCHEME.md section 5.

## The build and the tests

The build runs `pnpm prepublishOnly` (Source/prepublishOnly.sh), which does the plugin build (ESM
`Target/`, with the Test tree excluded), the Test build, the harness selfcheck, and the Test
type-check.

## The plan

- [Workspace-Family/REFLECT](../../../Documentation/Plans/Workspace-Family/REFLECT.md) - the
  reflective ops.

## License

CC0-1.0.
