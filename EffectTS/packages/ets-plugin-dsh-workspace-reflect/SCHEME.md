# SCHEME.md - @playform/plugin-dsh-workspace-reflect (v0.1.0, TypeScript, function plugin)

Status: **PoC** (the Classic tree, package + Source only; the smoke suite, the
build verification and the ETS twin are the end-phase per the PoC brief).

## 0. What this service is

The later-stage code-block reflective API: the AST-aware rename/connect/
replace bundled as ONE call each, over the managed representations. Source of
truth: `Documentation/Plans/Workspace-Family/REFLECT.md`, typed by
`Documentation/Plans/Workspace-Family/INVERSE-REPRESENTATION.md` (the
situated interaction protocols: the reply is part of the type).

## 1. The operations (one call each)

```ts
type Operation =
  | { kind: "rename"; path; startLine; endLine; oldName; newName; scope? }
  | { kind: "connect"; fromPath; toPath; symbol? }
  | { kind: "replace"; path; startLine; endLine; text };

interface Reply {
  status: "applied" | "conflict" | "denied" | "rejected"
        | "recovery-required" | "outcome-unknown";
  detail: string;
  version: string | undefined;
}
```

## 2. The transformation semantics (v0, honest)

- The operations are TEXTUAL but scope-honest: whole-word matches only
  (word-boundary regex, never substring replace), applied to the block's
  span or, with `scope: "file"`, the whole file.
- `connect` inserts an import (with `symbol`) or a reference comment
  (without) of the to-file's relative specifier; a file that already
  references the specifier is rejected (`already connected`), never a
  duplicate import.
- The v0 transformation is not a full AST rewrite: the "AST-aware" claim is
  honored as the span grammar (1-based, inclusive, the graph's node spans)
  plus the word-boundary discipline; a real AST engine is a later slice.

## 3. The publish path

resolve (ctx.fs) -> stat (size guard) -> readText -> transform ->
Factory.GuardedWrite (the `replaceIfVersion` fence, the P4 sandbox policy,
the stash pre-registration) -> the reply. A stale version is a `conflict`
reply, never a silent overwrite. The reflective carry (the optional
`workspaceGraph.indexFile` after an applied write) is probed at use time,
never injected, and contained.

## 4. The identity (four agreeing places)

- package name: `@playform/plugin-dsh-workspace-reflect`;
- `name` export: `plugin-dsh-workspace-reflect`;
- the State build's `module:` option: `reflect` (the ledger prefix);
- the ledger logFile default: `~/.dsh/reflect.log`.

## 5. The ledger strings (module-owned, byte-stable)

```text
reflect: activated (propagate=<propagate>)
reflect: disabled (enabled=false)
reflect: denied (enabled=false)
reflect: rename <path> <old> -> <new> (<status>)
reflect: connect <from> -> <to> (<status>)
reflect: replace <path> lines <a>-<b> (<status>)
reflect: rejected <path> (<reason>)
reflect: conflict <path> (expected <version>)
reflect: carried <path> (graph reindexed)
reflect: failed <path> (<reason>)
```

## 6. The Config (all volatile)

| Field | Type | Default |
| --- | --- | --- |
| logFile | string | `~/.dsh/reflect.log` |
| log | boolean | true (the factory's shared block) |
| enabled | boolean | false |
| propagate | `"block" \| "file"` | block |
| maxFileBytes | number | 1000000 |
| maxBlockLines | number | 5000 |

## 7. What this PoC does NOT do (honest)

- No smoke suite (the end-phase adds it per the PoC brief).
- No persisted op journal: the durable record is the ledger file (one log per
  module).
- No real AST engine (see section 2); no multi-file rename fan-out beyond the
  single file's scope (the cross-file fan-out is the graph-coupled later
  slice).
- The `workspaceGraph` shape is self-declared in Interface/Graph (the PoC is
  self-contained); the end-phase wires the real import.
