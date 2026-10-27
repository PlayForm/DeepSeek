# SCHEME.md - @playform/plugin-dsh-workspace-reflect (v0.1.0, TypeScript, function plugin)

Status: **PoC** (the Classic tree, package + Source only; the ETS twin is the end-phase per the PoC
brief).

## 0. What this service is

The later-stage code-block reflective API: the AST-aware rename/connect/ replace bundled as ONE call
each, over the managed representations.

The source of truth is `Documentation/Plans/Workspace-Family/REFLECT.md`, typed by
`Documentation/Plans/Workspace-Family/INVERSE-REPRESENTATION.md` (the situated interaction
protocols: the reply is part of the type).

## 1. The operations (one call each)

```ts
type Operation =
	| { kind: "rename"; path; startLine; endLine; oldName; newName; scope? }
	| { kind: "connect"; fromPath; toPath; symbol? }
	| { kind: "replace"; path; startLine?; endLine?; text; node?; fingerprint? };

interface Reply {
	status:
		"applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown";
	detail: string;
	version: string | undefined;
}
```

## 2. The transformation semantics

### 2.1 The rename: the semantics service first, the textual engine as the fallback

- **The semantics service.**

    When `ctx.workspaceSemantics` is present (PROBED through `ctx.get`, never injected - the
    registered name, with the short alias of the plan `semantics` accepted too), the rename asks it
    for the per-adapter plan (`rename(path, span, to)`, a character-offset edit list) and applies
    the edits of the plan that fall inside the line scope of the operation.

    The service may itself deepen the answer through the harness LSP seam (`findReferences`), so a
    scope-resolved reference set is what lands.

    The plugin ledgers the applied edit count: `deepened <path> (<n> edits via semantics)`.

- **The textual fallback.**

    The TEXTUAL fallback runs when the service is absent, refuses, throws, or its plan has no edit
    inside the scope: whole-word matches only (word-boundary regex, never a substring replace),
    applied to the span of the block (default) or, with `scope: "file"`, to the whole file.

    Zero occurrences is rejected, never an applied write of an unchanged file.

- **The per-type meaning.**

    The rename means different things per file type, and that meaning lives in the adapter of the
    semantics service (the .ts identifier, the .md link target, the .json key).

### 2.2 The replace: the graph's node as the AST source, the fingerprint as the fence

- **The node target.**

    A `replace` may target a GRAPH NODE (`node` + `fingerprint`) instead of a line span.

    The node id is the frozen one of the graph (`Symbol:<path>:<name>` or
    `Block:<path>:<line>:<kind>`), and the graph (`ctx.workspaceGraph`, probed through `ctx.get`)
    resolves the 1-based inclusive span of the node.

- **The fingerprint fence.**

    The plugin verifies the content-derived FINGERPRINT against the CURRENT span text before it
    writes anything, with the formula of the graph:
    `sha256(normalized text + "\n" + kind + "\n" + name)`.

    A mismatch refuses with `rejected <path> (fingerprint mismatch)` and writes nothing.

- **The rewritten span.**

    The plugin rewrites only the resolved span (a Block's span includes its closing brace, so a
    replacement text that drops the brace drops it), and the span guards still apply (inside the
    file, no wider than `maxBlockLines`).

- **The absent graph.**

    With the graph ABSENT (or the node unknown) the explicit `startLine`/`endLine` of the caller is
    the fallback span, and the plugin still verifies the fingerprint.

    A node target with neither a graph nor a span refuses with `graph absent`.

- **The textual form.**

    A `replace` with only a span (no node, no fingerprint) is the pre-AST textual form, unchanged.

- **The connect.**

    `connect` inserts an import (with `symbol`) or a reference comment (without) of the relative
    specifier of the to-file, and a file that already references the specifier is rejected
    (`already connected`) and never gets a duplicate import.

### 2.3 The honesty limit

The "AST" is the node model of the workspace graph (the Symbol and Block nodes of the v0 line/regex
scanner with brace-counted spans) and not a compiler AST: the targeting is exact, and the parse
behind the spans is the v0 parse of the graph.

The LSP deepening of the semantics service is what makes the RENAME scope-resolved.

## 3. The publish path

The path is resolve (ctx.fs) -> stat (size guard) -> readText -> resolve the target span (the graph
node, or the explicit span) -> verify the fingerprint -> transform -> Factory.GuardedWrite (the
`replaceIfVersion` fence, the P4 sandbox policy, the stash pre-registration) -> the reply.

A stale version is a `conflict` reply and never a silent overwrite.

The reflective carry (the optional `workspaceGraph.indexFile` after an applied write) is probed at
use time, never injected, and contained.

THE POLICY GATE (D6) runs BEFORE the first step: `replace` and `rename` consult
`Decide(State.Allow, "write")` after their argument checks and before the plugin reads the file, so
an `approve` verdict refuses the operation with the documented line and zero writes (no resolve, no
stat, no read, no write).

The fingerprint targeting is unchanged, because the policy is the OUTER check.

## 4. The identity (four agreeing places)

- **The package name.**

    The package name is `@playform/plugin-dsh-workspace-reflect`.

- **The `name` export.**

    The export is `plugin-dsh-workspace-reflect`.

- **The `module:` option.**

    The `module:` option of the State build is `reflect` (the ledger prefix).

- **The logFile default.**

    The default of the ledger logFile is `~/.dsh/playform/ets-plugin-dsh-workspace-reflect.log`.

## 5. The ledger strings (module-owned, byte-stable)

```text
reflect: activated (propagate=<propagate>)
reflect: disabled (enabled=false)
reflect: denied (enabled=false)
reflect: rename <path> <old> -> <new> (<status>)
reflect: connect <from> -> <to> (<status>)
reflect: replace <path> lines <a>-<b> (<status>)
reflect: deepened <path> (<n> edits via semantics)
reflect: rejected <path> (<reason>)
reflect: conflict <path> (expected <version>)
reflect: carried <path> (graph reindexed)
reflect: failed <path> (<reason>)
reflect: replace held <path> (policy write=approve)
reflect: rename held <path> (policy write=approve)
```

`deepened` is the ONE new line of the earlier reflective wave, and the two `held` lines are the D6
policy refusals (section 6).

The new `rejected` reasons use the same line form with new strings:

```text
reflect: rejected <path> (fingerprint required for a node target)
reflect: rejected <path> (fingerprint without a node target)
reflect: rejected <path> (fingerprint mismatch)
reflect: rejected <path> (node path mismatch)
reflect: rejected <path> (node not targetable)
reflect: rejected <path> (node not found)
reflect: rejected <path> (graph absent)
```

## 6. The Config (all volatile)

| Field         | Type                | Default                                                |
| ------------- | ------------------- | ------------------------------------------------------ |
| logFile       | string              | `~/.dsh/playform/ets-plugin-dsh-workspace-reflect.log` |
| log           | boolean             | true (the factory's shared block)                      |
| enabled       | boolean             | false                                                  |
| propagate     | `"block" \| "file"` | block                                                  |
| maxFileBytes  | number              | 1000000                                                |
| maxBlockLines | number              | 5000                                                   |
| policy        | `Allowlist`         | the D6 defaults (below)                                |

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`) and maps it to
`State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The reflective WRITES are the gated actions, so `replace` and `rename` consult the `write` verdict
after their argument checks and before the plugin reads the file.

An `approve` verdict (the shipped default) logs `replace held <path> (policy write=approve)` /
`rename held <path> (policy write=approve)`, returns
`{ status: "rejected", detail: "the policy holds the replace|rename (write=approve)" }`, and
performs zero writes, while the fingerprint targeting is unchanged.

`auto` proceeds.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).

The plugin adds no new config field, because the graph and the semantics service are optional
siblings probed at use time.

## 7. What this PoC does NOT do (honest)

- **The journal.**

    The PoC keeps no persisted op journal, because the durable record is the ledger file (one log
    per module).

- **The compiler AST.**

    The PoC uses no compiler AST (see 2.3), and the cross-file rename fan-out beyond the file of the
    operation is the reach of the semantics service (its plan is per file), which the reflect
    applies per file.

- **The shapes.**

    The shapes of `workspaceGraph`/`workspaceSemantics` are self-declared in Interface/Graph and
    Interface/Semantics, because the PoC is self-contained, and the end-phase wires the real
    imports.
