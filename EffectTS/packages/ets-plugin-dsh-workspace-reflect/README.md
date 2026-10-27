# @playform/plugin-dsh-workspace-reflect

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/REFLECT](../../../Documentation/Plans/Workspace-Family/REFLECT.md)

## The role

The workspace-reflect service serves the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin family (the Classic
release).

It fills the **later stage** service-provider role: the code-block reflective ops, the AST-aware
rename/connect/replace from a **single call** each, over the managed representations.

## The one-call semantics

Each operation bundles the whole transformation, so one call replaces a tool choreography.

The spans are 1-based and inclusive (the span grammar of the graph).

| Op        | Request                                               | Behavior                                                                                                                                                                                                       |
| --------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rename`  | path, startLine, endLine, oldName, newName, scope?    | The semantics service's scope-resolved plan first (its edits filtered to the operation's scope); the whole-word textual engine as the fallback. Zero occurrences is rejected.                                  |
| `connect` | fromPath, toPath, symbol?                             | Inserts an import of `symbol` from the relative specifier of `toPath` into `fromPath`; without a symbol, a reference comment. Already-connected is rejected.                                                   |
| `replace` | path, startLine?, endLine?, text, node?, fingerprint? | A graph NODE target (the AST source) with its content fingerprint verified before the write; or a plain span (the textual form). The span guard rejects a span outside the file or wider than `maxBlockLines`. |

## The AST-aware targeting

A `replace` may name the frozen node id of the workspace graph (`node: "Block:<path>:<line>:body"`)
and the content-derived fingerprint of the node.

The graph (`ctx.workspaceGraph`, probed and never injected) supplies the span, and the plugin
verifies the fingerprint against the current text with the formula of the graph and rewrites only
that span.

A mismatch refuses with `rejected <path> (fingerprint mismatch)` and writes nothing.

With the graph absent the explicit span of the caller is the fallback, and the plugin still verifies
the fingerprint.

A `rename` asks the workspace-semantics service (`ctx.workspaceSemantics`, probed and never
injected) for the scope-resolved plan, which the service may deepen through the harness LSP seam,
and it applies the edits of the plan inside the scope of the operation.

The textual whole-word engine is the fallback when the service is absent, refuses, or has no edit in
scope.

## The reply is part of the type

Every operation returns the CommitReply union (Interface/Reply.ts) and never a boolean or a thrown
error:

```ts
status: "applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown";
```

- **`applied`.**

    The operation is written, and the new version travels with the reply.

- **`conflict`.**

    The version fence failed, so the file moved under the operation and nothing was overwritten.

- **`denied`.**

    The plugin is disabled, so the cold mount answers denied.

- **`rejected`.**

    The plugin refused before any write: a malformed request, an oversized file or span, no matches,
    an already connected path, a stale fingerprint, or an absent graph.

- **`outcome-unknown`.**

    The write failed in a way that is neither a version conflict nor a confirmed failure.

## The publish path and the carry

Writes go only through the guarded write of the factory (the `replaceIfVersion` fence, the P4
sandbox policy, the stash pre-registration), never through a raw fs write.

After an applied operation the plugin probes the optional `workspaceGraph` sibling service (never
injected) and asks it to re-index the changed file (the reflective carry), and an absent graph is an
honest skip.

## Service surface (`ctx.workspaceReflect`)

The surface is `rename(op)`, `connect(op)`, `replace(op)`, and `act(op)` (the dispatch by kind), all
async and all returning the reply union.

## The configuration

Every knob is volatile and hot-editable without remounting: `logFile`
(`~/.dsh/playform/ets-plugin-dsh-workspace-reflect.log`), `log`, `enabled` (false - the IDLE-forever
posture), `propagate` (`block` | `file`, default `block`), `maxFileBytes` (1000000), and
`maxBlockLines` (5000).

The plugin ships disabled and enables only by an explicit ACTIVATE.

The plugin adds no new knob, because the graph and the semantics service are optional siblings.

### The policy block (D6) - the write gate

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The reflective WRITES are the gated actions, so `replace` and `rename` consult the `write` verdict
before the plugin reads or writes the file.

An `approve` verdict (the shipped default) refuses the operation with the byte-exact
`replace held <path> (policy write=approve)` or `rename held <path> (policy write=approve)` line,
the reply is `rejected` with `the policy holds the replace|rename (write=approve)`, and **zero
writes** reach the filesystem.

The fingerprint targeting is unchanged: the policy is the OUTER check, and the fingerprint
verification is the inner one.

Flip `policy.write` to `auto` (or let a resolved pack override it) to let the next operation reach
the write path.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).

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
