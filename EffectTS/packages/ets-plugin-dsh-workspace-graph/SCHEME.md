# The workspace graph - schema and behavior

The service `ctx.workspaceGraph` (registered under the exact name `workspaceGraph`). Everything
below is what the code does today; nothing else is claimed.

## 1. Identity

- Package `@playform/plugin-dsh-workspace-graph`, service name `workspaceGraph`, ledger tag
  `graph: `.
- Loader contract, class form: `export default class WorkspaceGraph extends Service`,
  `super(Context, "workspaceGraph")`, `static inject = ["fs", "storage"]`, `static Config`
  (Schemastery).
- Declaration merging gives `ctx.workspaceGraph` as a typed accessor.

## 2. Config (Schemastery, all volatile)

| Field           | Type                         | Default                                         |
| --------------- | ---------------------------- | ----------------------------------------------- |
| enabled         | boolean                      | false                                           |
| domain          | string                       | `workspace_graph`                               |
| languages       | array of the three languages | all three                                       |
| include         | array of glob strings        | []                                              |
| exclude         | array of glob strings        | `node_modules/**`, `**/Target/**`, `**/.git/**` |
| maxFileBytes    | number                       | 1000000                                         |
| maxNodesPerFile | number                       | 5000                                            |
| maxFiles        | number                       | 2000                                            |
| limitDefault    | number                       | 50                                              |
| limitMaximum    | number                       | 500                                             |
| policy          | Allowlist                    | the D6 defaults                                 |

`maxFiles` is the one field the INDEXING TRIGGER added to the frozen W1 table: it bounds the
`indexWorkspace` walk (a caller's explicit `maxFiles` option overrides it for that call).

Fail-loud at construction (exact messages, asserted by the smoke):

- `invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/`
- `invalid config: languages must be a non-empty array of "typescript" | "javascript" | "markdown"`
- `invalid config: <field> must be a positive integer` (the five number fields, `maxFiles` included)
- `invalid config: limitDefault must not exceed limitMaximum`
- `invalid config: <field> must be an array of strings` (include, exclude)
- Schemastery's own type errors throw first for wrong-typed fields.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The graph's actions are index, all **AUTOMATIC**; it has **no gated action** (no file write, no
batch commit, no spawn), so the block documents the posture and refuses nothing. The block is one
volatile object, so a policy flip is hot-editable without a remount; a resolved pack's `policy`
section overrides the defaults per action (the wiring is the next refinement).

The plain `Configuration` keeps the frozen W1 table (no hidden knobs); the block rides from the
schema straight onto `State.Allow` in the constructor.

No new ledger line: the package has no gated action.

## 3. Node and edge kinds (W1)

| Node kind  | id form                                         | parsed                   |
| ---------- | ----------------------------------------------- | ------------------------ |
| File       | `File:<path>`                                   | yes                      |
| Symbol     | `Symbol:<path>:<qualified name>`                | yes                      |
| Block      | `Block:<path>:<startLine>:<kind>` (kind `body`) | yes                      |
| Test       | `Test:<path>`                                   | yes                      |
| DocSection | `DocSection:<path>:<startLine>`                 | yes (Markdown)           |
| ConfigKey  | -                                               | no (deferred, not faked) |

| Edge kind     | from -> to                                                                   | parsed                                             |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| contains      | File -> Symbol/Block/DocSection/Test                                         | yes                                                |
| imports       | File -> File (relative specifiers only)                                      | yes                                                |
| references    | the using node (the enclosing Symbol, else the File) -> the used Symbol node | yes, only with the semantics service (section 6.3) |
| calls / tests | -                                                                            | no (deferred, not faked)                           |

`<path>` is the resolved display path. The qualified name of a Symbol is its declaration name;
nested names are not resolved in v0. A test path is `*.test.ts`, `*.test.tsx`, `*.test.js` (also the
jsx/mjs/cjs variants) or a `Test.ts` segment.

## 4. Spans and fingerprints

- `Span` is 1-based, inclusive on both ends.
- A Symbol's span runs from its declaration line to its closing brace (brace counting; a declaration
  without a brace ends at its statement line). A Block's span is the symbol's body: the line after
  the brace-open through the closing brace line - always inside the symbol's span. A symbol whose
  closing brace sits on the declaration line has no Block.
- The fingerprint is `sha256(normalized text + "\n" + kind + "\n" + name)` in hex, where the
  normalized text is the node's span text with CRLF -> LF and trailing whitespace stripped per line;
  a node without a name hashes the empty name. The stable id survives edits; the fingerprint detects
  content change.
- Every edge carries a source span: a `contains` edge carries the contained node's span; an
  `imports` edge carries the import's line.

## 5. Parser limits (v0 honesty)

- TypeScript/JavaScript: line/regex scanning, no compiler API. Comment lines are skipped. Braces
  inside strings are counted naively - a string with an unbalanced brace can skew a span.
- Imports: static `from "..."` and dynamic `import("...")`. Only relative specifiers produce an edge
  (the target id is the specifier resolved against the file's directory, no extension added); a
  non-relative specifier is counted (State.SkippedImports) and produces no node and no edge.
- Markdown: one `DocSection` per `^#{1,6} ` heading, spanning to the line before the next heading of
  the same or higher level.
- Config files: not parsed in W1.

## 6. Service surface

- `async indexFile(path) -> Outcome` - resolve through `ctx.fs.resolve` (the backend's own cwd),
  stat, gate (enabled, exclude, include, file type, language, size), read, parse, node-cap check,
  store the record (mirror + KV, awaiting the pending open), bump `indexRevision`, persist the
  `__meta` record, ledger.
- `async indexWorkspace(root?, { maxFiles? }) -> { indexed, skipped, failed, files }` - THE INDEXING
  TRIGGER. Resolve the root through `ctx.fs.resolve` (`root` omitted = `"."`, the backend's cwd, the
  session working directory), walk the tree breadth-first with every listing sorted by name, never
  follow an entry whose canonical identity is outside the root (`ctx.fs.contains` - a symlink out of
  the root or a `..` escape is rejected before any read), do not descend a directory whose path
  matches an `exclude` pattern, stop after `maxFiles` candidates (a finite option `>= 0` is
  honored - `0` indexes nothing; an absent, negative or non-finite option falls back to
  `Config.maxFiles`, so the walk can never run unbounded), and call `indexFile` for every
  candidate - the per-file gates are never duplicated. `indexed` / `skipped` / `failed` are this
  run's outcome tallies; `files` is the number of file records the graph holds afterwards. A root
  that cannot be listed rejects (never an honest-looking zero).
- `async removeFile(path) -> boolean` - delete the record from the mirror and the store, bump,
  persist, ledger `removed <path>`; false silently when there is no record.
- `getNode(id) -> Node | undefined`
- `find(query) -> Node[]` - `name` exact, `pattern` case-insensitive substring over id and name,
  `kind`; the limit defaults to `limitDefault` and is capped at `limitMaximum`.
- `expand(id, { kinds?, depth? }) -> Expansion` - outgoing edges only, breadth-first, depth default
  1 capped at 3; the start node first, each reachable node visited once.
- `neighborhood(path, limit?) -> { path, role, reason }[]` - the connected component around an
  anchor file, for the graph-suggester's declared contract. The anchor matches by exact display
  path, else by path suffix; entries are the anchor (`definition`), the files importing it (`test`
  when the path is a test path, else `importer`), the files it imports (`dependency`), and the
  DocSections in the anchor's own file (`doc`); deduplicated by path, ordered by role rank then
  path, sliced to `limit` (default 7). The component derives from `contains`/`imports` only: the
  `references` edges (section 6.3) are not folded into it, and callers still need the deferred
  `calls` edges.
- `snapshot() -> GraphSnapshot` - the loadAll read; a record that fails validation is skipped and
  counted (State.Invalid), never guessed.
- `statistics() -> GraphStatistics` - files, nodes, edges, indexRevision.

## 6.1 The trace adapter (the incremental wiring)

Registered ONCE from the constructor through `Trace/Adapter.ts` and ONLY when the graph is enabled
at construction - a disabled graph wires nothing. The graph consumes `observe/stamp` from the
family's trace bus (`ctx.trace`, provided by `@playform/ets-plugin-dsh-factory`) instead of
registering `ctx.root.on("fs/observed")` directly (D5: the indexer is inferred from the bus - no
separate process, no separate indexer plugin). The bus is PROBED (`ctx.get("trace")`), never
injected: the loader contract's `inject` stays `["fs", "storage"]`, so direct construction and
standalone use are unchanged; the factory's bundle must load first (the family's dependency-order
rule).

The consumer (`Trace/Consume.ts`) is synchronous, reads no file, never throws into the bus, and
applies this filter chain:

| Condition                              | Action                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `enabled === false`                    | ignore silently (the IDLE-forever posture)                                                          |
| a foreign envelope / malformed payload | ledger `failed unknown (malformed event: ...)`                                                      |
| the path matches an `exclude` pattern  | ignore silently (a Target/ build write schedules nothing)                                           |
| the stamp's version is `absent`        | emit `graph/invalidated` (reason `absent`); no re-index (the stale record stays until `removeFile`) |
| the path is already in flight          | ignore - the DETACHED LOOP coalesces it into the running re-index                                   |

The first accepted stamp schedules one detached re-index through the existing `indexFile` and
ledgers `reindexed <resolved path> (<status>)`. The coalescing is the trace library's detached loop
(`@playform/ets-lib-dsh-trace`, `Loop`): a queue keyed by the payload's path, ONE in-flight task per
key, no timer or wall clock, fail-open, and `State.Flush` is the loop's flush promise so a caller
(the smoke) can await it deterministically. The adapter's subscription and the loop are disposed on
the fiber effect (`graph-trace`).

## 6.2 The trace emissions

The graph emits two events (no ledger line is added - the module's strings stay byte-exact):

| Event               | When                                                                                                                                                                                                         | Payload                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `graph/indexed`     | a record was stored (a first index or a replacement)                                                                                                                                                         | `{ path, version, revision }` |
| `graph/invalidated` | the record previously held for a path is no longer valid: `reason` is `replaced` (a re-index replaced it; the previous `version` is included), `removed` (`removeFile`), or `absent` (an absent observation) | `{ path, reason, version? }`  |

The consumers (the context packet memo) drop what they cached for the path. An absent bus (no
factory mounted, a bare fixture) is a silent skip: the graph's store and ledger work exactly as
before.

## 6.3 The references edge (the semantics consumer wiring)

After the parse, `indexFile` ASKS the workspace-semantics service for the file's reference list and
turns every resolved reference into one `references` edge. The service is PROBED (`ctx.get`), never
injected: `inject` stays `["fs", "storage"]`. The probed names are `workspaceSemantics` (the
registered name) and the plan's short alias `semantics`.

| Condition                                                                     | Action                                                         |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| no service, or `resolve` answers `undefined` (disabled, excluded, no adapter) | NO references edges (never faked)                              |
| the reference's target head matches no Symbol node of this file               | the reference is dropped - no dangling edge                    |
| the use site falls inside a Symbol node's span                                | the edge starts at that Symbol (`from`)                        |
| the use site falls outside every Symbol span                                  | the edge starts at the File node (`from`)                      |
| otherwise                                                                     | `{ kind: "references", from, to, span }`, the use site's lines |

The service reads the file through its own fs seam (its model is its own); the graph hands it the
text it already read only to convert the service's character offsets into the graph's 1-based line
spans. The `graph: indexed ...` line's edge count includes the references edges; no new ledger line
is added (the module's strings stay byte-exact). A
`graph: indexed <path> ... (<n> nodes, <m> edges)` line with no service is therefore exactly what it
was before this edge existed.

## 7. Store

The KV facet through the storage domain: the domain named `Config.domain` (version 1, per-record
layout, `invalidRecords: "backup-and-skip"`), one `records` table, one record per path keyed by the
display path, plus the meta record keyed `__meta` carrying `{ indexRevision }`. An absent facility
is a silent skip (in-memory only); a failed open is one best-effort ledger line
(`storage open failed (...)`). On open, stored records load into the mirror after validation and the
meta revision is restored when ahead.

## 8. Ledger lines (byte-stable, module-owned)

```text
graph: activated (domain=<domain>, languages=<n>)
graph: indexed <path> version <version> (<nodes> nodes, <edges> edges)
graph: skipped <path> (<reason>)
graph: failed <path> (<reason>)
graph: removed <path>
graph: domain <domain> opened (<records> records)
graph: workspace indexed <n> files (<indexed> indexed, <skipped> skipped, <failed> failed)
graph: workspace capped at <maxFiles> files
graph: reindexed <path> (<status>)
```

The last three are the INDEXING TRIGGER's lines (the first four and the store line are the W1
contract's). `workspace indexed` closes every `indexWorkspace` call; `workspace capped at` is
emitted only when the walk stopped at the bound; `reindexed` is emitted once per fs/observed
re-index, with the status `indexFile` reported.

Every line goes through the module's own Append: logger first (`graph: <message>`), then the durable
ledger file (`[ISO] graph: <message>`) when the internal `State.Ledger` seam is set - the frozen
config table has no ledger knob, so the logger is the default surface.
