# SCHEME.md - @playform/plugin-dsh-workspace-reflect (v0.1.0, TypeScript, function plugin)

Status: **PoC** (the Classic tree, package + Source only; the ETS twin is the end-phase per the PoC
brief).

## 0. What this service is

The later-stage code-block reflective API: the AST-aware rename/connect/ replace bundled as ONE call
each, over the managed representations. Source of truth:
`Documentation/Plans/Workspace-Family/REFLECT.md`, typed by
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

- When `ctx.workspaceSemantics` is present (PROBED through `ctx.get`, never injected - the
  registered name, with the plan's short alias `semantics` accepted too), the rename asks it for the
  per-adapter plan (`rename(path, span, to)`, a character-offset edit list) and applies the plan's
  edits that fall inside the operation's line scope. The service may itself deepen the answer
  through the harness LSP seam (`findReferences`), so a scope-resolved reference set is what lands.
  The applied edit count is ledgered: `deepened <path> (<n> edits via semantics)`.
- The TEXTUAL fallback runs when the service is absent, refuses, throws, or its plan has no edit
  inside the scope: whole-word matches only (word-boundary regex, never a substring replace),
  applied to the block's span (default) or, with `scope: "file"`, the whole file. Zero occurrences
  is rejected - never an applied write of an unchanged file.
- The rename means different things per file type, and that meaning lives in the semantics service's
  adapter (the .ts identifier, the .md link target, the .json key).

### 2.2 The replace: the graph's node as the AST source, the fingerprint as the fence

- A `replace` may target a GRAPH NODE (`node` + `fingerprint`) instead of a line span. The node id
  is the graph's frozen one (`Symbol:<path>:<name>` or `Block:<path>:<line>:<kind>`); the graph
  (`ctx.workspaceGraph`, probed through `ctx.get`) resolves the node's 1-based inclusive span.
- The content-derived FINGERPRINT is verified against the CURRENT span text before anything is
  written - the graph's formula, `sha256(normalized text + "\n" + kind + "\n" + name)`. A mismatch
  refuses with `rejected <path> (fingerprint mismatch)` and writes nothing.
- Only the resolved span is rewritten (a Block's span includes its closing brace; a replacement text
  that drops it drops the brace). The span guards still apply (inside the file, no wider than
  `maxBlockLines`).
- With the graph ABSENT (or the node unknown) the caller's explicit `startLine`/`endLine` is the
  fallback span, and the fingerprint is still verified. A node target with neither a graph nor a
  span refuses with `graph absent`.
- A `replace` with only a span (no node, no fingerprint) is the pre-AST textual form, unchanged.
- `connect` inserts an import (with `symbol`) or a reference comment (without) of the to-file's
  relative specifier; a file that already references the specifier is rejected
  (`already connected`), never a duplicate import.

### 2.3 The honesty limit

The "AST" is the workspace graph's node model (the v0 line/regex scanner's Symbol and Block nodes
with brace-counted spans), not a compiler AST: the targeting is exact, the parse behind the spans is
the graph's v0 one. The semantics service's own LSP deepening is what makes the RENAME
scope-resolved.

## 3. The publish path

resolve (ctx.fs) -> stat (size guard) -> readText -> resolve the target span (the graph node, or the
explicit span) -> verify the fingerprint -> transform -> Factory.GuardedWrite (the
`replaceIfVersion` fence, the P4 sandbox policy, the stash pre-registration) -> the reply. A stale
version is a `conflict` reply, never a silent overwrite. The reflective carry (the optional
`workspaceGraph.indexFile` after an applied write) is probed at use time, never injected, and
contained.

THE POLICY GATE (D6) runs BEFORE the first step: `replace` and `rename` consult
`Decide(State.Allow, "write")` after their argument checks and before the file is read, so an
`approve` verdict refuses the operation with the documented line and zero writes (no resolve, no
stat, no read, no write). The fingerprint targeting is unchanged - the policy is the OUTER check.

## 4. The identity (four agreeing places)

- package name: `@playform/plugin-dsh-workspace-reflect`;
- `name` export: `plugin-dsh-workspace-reflect`;
- the State build's `module:` option: `reflect` (the ledger prefix);
- the ledger logFile default: `~/.dsh/playform/ets-plugin-dsh-workspace-reflect.log`.

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

`deepened` is the ONE new line of the earlier reflective wave; the two `held` lines are the D6
policy refusals (section 6). The new `rejected` reasons (same line form, new strings):

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

The config carries the shared per-action allowlist (`policy: Policy()`), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The reflective WRITES are the gated actions: `replace` and `rename` consult the `write` verdict
after their argument checks and before the file is read. An `approve` verdict (the shipped default)
logs `replace held <path> (policy write=approve)` / `rename held <path> (policy write=approve)`,
returns `{ status: "rejected", detail: "the policy holds the replace|rename (write=approve)" }`, and
performs zero writes; the fingerprint targeting is unchanged. `auto` proceeds. The block is one
volatile object, so a policy flip is hot-editable without a remount; a resolved pack's `policy`
section overrides the defaults per action (the wiring is the next refinement).

No new config field: the graph and the semantics service are optional siblings, probed at use time.

## 7. What this PoC does NOT do (honest)

- No persisted op journal: the durable record is the ledger file (one log per module).
- No compiler AST (see 2.3); the cross-file rename fan-out beyond the operation's file is the
  semantics service's reach (its plan is per file), and the reflect applies it per file.
- The `workspaceGraph`/`workspaceSemantics` shapes are self-declared in Interface/Graph and
  Interface/Semantics (the PoC is self-contained); the end-phase wires the real imports.
