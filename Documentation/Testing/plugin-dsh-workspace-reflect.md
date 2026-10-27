# plugin-dsh-workspace-reflect - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-reflect` (Classic/packages/plugin-dsh-workspace-reflect).
- Profile row id: `plugin-dsh-workspace-reflect` (bundled in the desktop profile).
- Exposes the `workspaceReflect` service (`ctx.workspaceReflect`): the AST-aware reflective
  operations, one call each: `rename(op)`, `connect(op)`, `replace(op)`, `act(op)` (the dispatch by
  kind). All of them are async and all return the reply union
  `{ status: "applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown", detail, version }`.
- The semantics: the `rename` asks `ctx.workspaceSemantics` (probed through `ctx.get`, never
  injected) for the per-adapter plan and applies its edits inside the line scope, while the textual
  fallback runs whole-word matches only (zero occurrences is rejected). The `replace` may target a
  graph node (`node` + `fingerprint`, the graph's formula
  `sha256(normalized text + "\n" + kind + "\n" + name)` verified against the current span before any
  write), and with the graph absent the explicit span of the caller is the fallback. The `connect`
  inserts an import (with `symbol`) or a reference comment, and an already-connected target is
  rejected.
- Config (all volatile): `logFile` `~/.dsh/playform/plugin-dsh-workspace-reflect.log`, `log` true,
  `enabled` false, `propagate` `"block" | "file"` (default `block`), `maxFileBytes` 1000000,
  `maxBlockLines` 5000, and `policy` (the D6 defaults, the write gate).
- Ledger lines (module-owned, byte-stable, prefixed `reflect: `):
  `` `reflect: activated (propagate=<propagate>)` ``, `` `reflect: disabled (enabled=false)` ``,
  `` `reflect: denied (enabled=false)` ``, `` `reflect: rename <path> <old> -> <new> (<status>)` ``,
  `` `reflect: connect <from> -> <to> (<status>)` ``,
  `` `reflect: replace <path> lines <a>-<b> (<status>)` ``,
  `` `reflect: deepened <path> (<n> edits via semantics)` ``,
  `` `reflect: rejected <path> (<reason>)` ``,
  `` `reflect: conflict <path> (expected <version>)` ``,
  `` `reflect: carried <path> (graph reindexed)` ``, `` `reflect: failed <path> (<reason>)` ``,
  `` `reflect: replace held <path> (policy write=approve)` ``,
  `` `reflect: rename held <path> (policy write=approve)` ``.
- The rejected reasons (same line form): fingerprint required for a node target / fingerprint
  without a node target / fingerprint mismatch / node path mismatch / node not targetable / node not
  found / graph absent.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-workspace-reflect"}` for one entry with status schema (defaults:
    `enabled` false, `propagate` block, `maxFileBytes` 1000000, `maxBlockLines` 5000, the D6 policy
    block with `write: approve`).

2. **The service check.**

    `cordis_inspect_query` host/Service/listService `workspaceReflect` resolves with `rename` /
    `connect` / `replace` / `act`.

3. **The ledger line.**

    The line `reflect: disabled (enabled=false)` appears on a cold mount (a disabled plugin answers
    `denied (enabled=false)`), and after activation `reflect: activated (propagate=block)` appears
    in `~/.dsh/playform/plugin-dsh-workspace-reflect.log`.

## Test cases

| #   | Trigger                                                | Expected                          | Pass criteria                                                                                                                                                                                       |
| --- | ------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                | one entry, `status: "schema"`     | the defaults match                                                                                                                                                                                  |
| T2  | `replace` on a graph node with the correct fingerprint | `applied`                         | only the resolved span rewritten; `reflect: replace <path> lines <a>-<b> (applied)`; the optional carry probes `workspaceGraph.indexFile` → `reflect: carried <path> (graph reindexed)`             |
| T2  | `replace` with a stale fingerprint                     | rejected, nothing written         | `reflect: rejected <path> (fingerprint mismatch)`                                                                                                                                                   |
| T2  | `rename` with `workspaceSemantics` present             | the plan's edits applied in scope | `reflect: deepened <path> (<n> edits via semantics)` and `reflect: rename <path> <old> -> <new> (applied)`                                                                                          |
| T2  | `rename` with zero occurrences                         | rejected                          | no applied write of an unchanged file; whole-word matching only                                                                                                                                     |
| T2  | `connect` on an already-connected file                 | rejected                          | `reflect: rejected <path> (already connected)`; no duplicate import                                                                                                                                 |
| T2  | A version conflict on write                            | `conflict` reply                  | `reflect: conflict <path> (expected <version>)`; nothing overwritten                                                                                                                                |
| T2  | The shipped policy (write=approve)                     | the write held                    | `reflect: replace held <path> (policy write=approve)`, reply `{ status: "rejected", detail: "the policy holds the replace (write=approve)" }`; zero writes (no resolve, no stat, no read, no write) |
| T1  | Any operation while disabled                           | `denied` reply                    | `reflect: denied (enabled=false)`                                                                                                                                                                   |

## Known live gaps

- Not dogfooded yet, so watch for the policy-flip hot edit (the block is one volatile object), the
  carry probing the absent graph (an honest skip, never an error), and the plan of the semantics
  service having no edit inside the scope (the textual fallback must run, not fail). The "AST" is
  the v0 line/regex node model of the graph: the targeting is exact, and the parse behind the spans
  is not a compiler AST.

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Source/Function/` (the transformation engine),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-reflect run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-reflect/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-reflect`
- Tests run: T1 config - / T2 replace - / T2 fingerprint - / T2 rename - / T2 connect - / T2
  conflict - / T2 policy hold - / T1 denied -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
