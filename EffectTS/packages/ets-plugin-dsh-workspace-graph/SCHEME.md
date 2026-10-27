# The workspace graph - schema and behavior

The service is `ctx.workspaceGraph`, registered under the exact name `workspaceGraph`.

Everything below is what the code does today, and the document claims nothing else.

## 1. Identity

- **Package and tag.**

    The package is `@playform/plugin-dsh-workspace-graph`, the service name is `workspaceGraph`, and
    the ledger tag is `graph: `.

- **Loader contract.**

    The loader contract uses the class form: `export default class WorkspaceGraph extends Service`,
    `super(Context, "workspaceGraph")`, `static inject = ["fs", "storage"]`, and `static Config`
    (Schemastery).

- **Accessor.**

    Declaration merging gives `ctx.workspaceGraph` as a typed accessor.

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

`maxFiles` is the one field that the INDEXING TRIGGER added to the frozen W1 table, and it bounds
the `indexWorkspace` walk (an explicit `maxFiles` option of a caller overrides it for that call).

Fail-loud at construction (exact messages, asserted by the smoke):

- `invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/`
- `invalid config: languages must be a non-empty array of "typescript" | "javascript" | "markdown"`
- `invalid config: <field> must be a positive integer` (the five number fields, `maxFiles` included)
- `invalid config: limitDefault must not exceed limitMaximum`
- `invalid config: <field> must be an array of strings` (include, exclude)
- Schemastery's own type errors throw first for wrong-typed fields.

## The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's
block) and maps it to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The actions of the graph are index, all **AUTOMATIC**.

It has **no gated action** (no file write, no batch commit, no spawn), so the block documents the
posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount.

The `policy` section of a resolved pack overrides the defaults for each action (the wiring is the
next refinement).

The plain `Configuration` keeps the frozen W1 table and no hidden knobs, and the block rides from
the schema straight onto `State.Allow` in the constructor.

The package adds no ledger line, because it has no gated action.

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

`<path>` is the resolved display path, and the qualified name of a Symbol is its declaration name,
because v0 does not resolve nested names.

A test path is `*.test.ts`, `*.test.tsx`, `*.test.js` (also the jsx/mjs/cjs variants) or a `Test.ts`
segment.

## 4. Spans and fingerprints

- **The span range.**

    `Span` is 1-based and inclusive on both ends.

- **The Symbol span.**

    A Symbol's span runs from its declaration line to its closing brace (brace counting; a
    declaration without a brace ends at its statement line).

- **The Block span.**

    A Block's span is the symbol's body: the line after the brace-open through the closing brace
    line, always inside the symbol's span.

    A symbol whose closing brace sits on the declaration line has no Block.

- **The fingerprint.**

    The fingerprint is `sha256(normalized text + "\n" + kind + "\n" + name)` in hex, where the
    normalized text is the span text of the node with CRLF -> LF and trailing whitespace stripped
    per line, and a node without a name hashes the empty name.

    The stable id survives edits, and the fingerprint detects a content change.

- **The edge span.**

    Every edge carries a source span: a `contains` edge carries the span of the contained node, and
    an `imports` edge carries the line of the import.

## 5. Parser limits (v0 honesty)

- **TypeScript/JavaScript.**

    The parser uses line/regex scanning and no compiler API, and it skips comment lines.

    Braces inside strings are counted naively, so a string with an unbalanced brace can skew a span.

- **Imports.**

    The parser reads static `from "..."` and dynamic `import("...")`.

    Only relative specifiers produce an edge (the target id is the specifier resolved against the
    directory of the file, with no extension added), and a non-relative specifier is counted
    (State.SkippedImports) and produces no node and no edge.

- **Markdown.**

    The parser makes one `DocSection` per `^#{1,6} ` heading, spanning to the line before the next
    heading of the same or higher level.

- **Config files.**

    W1 does not parse config files.

## 6. Service surface

- **`indexFile`.**

    `async indexFile(path) -> Outcome` resolves through `ctx.fs.resolve` (the backend's own cwd),
    stats, gates (enabled, exclude, include, file type, language, size), reads, parses, and checks
    the node cap.

    The method then stores the record (mirror + KV, awaiting the pending open), bumps
    `indexRevision`, persists the `__meta` record, and ledgers.

- **`indexWorkspace`.**

    `async indexWorkspace(root?, { maxFiles? }) -> { indexed, skipped, failed, files }` is THE
    INDEXING TRIGGER.

    It resolves the root through `ctx.fs.resolve` (`root` omitted = `"."`, the cwd of the backend,
    the session working directory) and walks the tree breadth-first with every listing sorted by
    name.

    The walk never follows an entry whose canonical identity is outside the root (`ctx.fs.contains`
    rejects a symlink out of the root or a `..` escape before any read), does not descend a
    directory whose path matches an `exclude` pattern, and stops after `maxFiles` candidates (a
    finite option `>= 0` is honored, so `0` indexes nothing, and an absent, negative, or non-finite
    option falls back to `Config.maxFiles`, so the walk can never run unbounded).

    The walk calls `indexFile` for every candidate, so the per-file gates are never duplicated.

    `indexed` / `skipped` / `failed` are the outcome tallies of this run, and `files` is the number
    of file records that the graph holds afterwards.

    A root that cannot be listed rejects and never returns an honest-looking zero.

- **`removeFile`.**

    `async removeFile(path) -> boolean` deletes the record from the mirror and the store, bumps,
    persists, and ledgers `removed <path>`, and it returns false silently when there is no record.

- **`getNode`.**

    The method is `getNode(id) -> Node | undefined`.

- **`find`.**

    `find(query) -> Node[]` matches `name` exactly, `pattern` as a case-insensitive substring over
    id and name, and `kind`, with the limit defaulting to `limitDefault` and capped at
    `limitMaximum`.

- **`expand`.**

    `expand(id, { kinds?, depth? }) -> Expansion` follows outgoing edges only, breadth-first, with
    depth default 1 capped at 3, the start node first, and each reachable node visited once.

- **`neighborhood`.**

    `neighborhood(path, limit?) -> { path, role, reason }[]` gives the connected component around an
    anchor file for the declared contract of the graph-suggester.

    The anchor matches by exact display path, else by path suffix, and the entries are the anchor
    (`definition`), the files that import it (`test` when the path is a test path, else `importer`),
    the files that it imports (`dependency`), and the DocSections in the anchor's own file (`doc`).

    The entries are deduplicated by path, ordered by role rank then path, and sliced to `limit`
    (default 7).

    The component derives from `contains`/`imports` only, so the `references` edges (section 6.3)
    are not folded into it, and callers still need the deferred `calls` edges.

- **`snapshot`.**

    `snapshot() -> GraphSnapshot` is the loadAll read, and a record that fails validation is skipped
    and counted (State.Invalid) and never guessed.

- **`statistics`.**

    `statistics() -> GraphStatistics` reports files, nodes, edges, and indexRevision.

## 6.1 The trace adapter (the incremental wiring)

The constructor registers the adapter ONCE through `Trace/Adapter.ts` and ONLY when the graph is
enabled at construction, so a disabled graph wires nothing.

The graph consumes `observe/stamp` from the trace bus of the family (`ctx.trace`, provided by
`@playform/ets-plugin-dsh-factory`) instead of registering `ctx.root.on("fs/observed")` directly
(D5: the indexer is inferred from the bus - no separate process, no separate indexer plugin).

The plugin PROBES the bus (`ctx.get("trace")`) and never injects it: the `inject` of the loader
contract stays `["fs", "storage"]`, so direct construction and standalone use are unchanged, and the
bundle of the factory must load first (the dependency-order rule of the family).

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
ledgers `reindexed <resolved path> (<status>)`.

The coalescing is the detached loop of the trace library (`@playform/ets-lib-dsh-trace`, `Loop`): a
queue keyed by the path of the payload, ONE in-flight task per key, no timer or wall clock, and
fail-open.

`State.Flush` is the flush promise of the loop, so a caller (the smoke) can await it
deterministically.

The fiber effect (`graph-trace`) disposes the subscription of the adapter and the loop.

## 6.2 The trace emissions

The graph emits two events, and it adds no ledger line (the strings of the module stay byte-exact):

| Event               | When                                                                                                                                                                                                         | Payload                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `graph/indexed`     | a record was stored (a first index or a replacement)                                                                                                                                                         | `{ path, version, revision }` |
| `graph/invalidated` | the record previously held for a path is no longer valid: `reason` is `replaced` (a re-index replaced it; the previous `version` is included), `removed` (`removeFile`), or `absent` (an absent observation) | `{ path, reason, version? }`  |

The consumers (the context packet memo) drop what they cached for the path.

An absent bus (no factory mounted, a bare fixture) is a silent skip, and the store and ledger of the
graph work exactly as before.

## 6.3 The references edge (the semantics consumer wiring)

After the parse, `indexFile` ASKS the workspace-semantics service for the reference list of the file
and turns every resolved reference into one `references` edge.

The plugin PROBES the service (`ctx.get`) and never injects it, so `inject` stays
`["fs", "storage"]`.

The probed names are `workspaceSemantics` (the registered name) and the short alias of the plan,
`semantics`.

| Condition                                                                     | Action                                                         |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| no service, or `resolve` answers `undefined` (disabled, excluded, no adapter) | NO references edges (never faked)                              |
| the reference's target head matches no Symbol node of this file               | the reference is dropped - no dangling edge                    |
| the use site falls inside a Symbol node's span                                | the edge starts at that Symbol (`from`)                        |
| the use site falls outside every Symbol span                                  | the edge starts at the File node (`from`)                      |
| otherwise                                                                     | `{ kind: "references", from, to, span }`, the use site's lines |

The service reads the file through its own fs seam, because its model is its own, and the graph
hands it the text that the graph already read only to convert the character offsets of the service
into the 1-based line spans of the graph.

The edge count of the `graph: indexed ...` line includes the references edges, and the plugin adds
no new ledger line (the strings of the module stay byte-exact).

A `graph: indexed <path> ... (<n> nodes, <m> edges)` line with no service is therefore exactly what
it was before this edge existed.

## 7. Store

The store is the KV facet through the storage domain: the domain named `Config.domain` (version 1,
per-record layout, `invalidRecords: "backup-and-skip"`), one `records` table, one record per path
keyed by the display path, plus the meta record keyed `__meta` that carries `{ indexRevision }`.

An absent facility is a silent skip (in-memory only), and a failed open is one best-effort ledger
line (`storage open failed (...)`).

On open, the stored records load into the mirror after validation, and the meta revision is restored
when it is ahead.

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

The last three are the lines of the INDEXING TRIGGER, and the first four and the store line belong
to the W1 contract.

`workspace indexed` closes every `indexWorkspace` call, `workspace capped at` is emitted only when
the walk stopped at the bound, and `reindexed` is emitted once per fs/observed re-index with the
status that `indexFile` reported.

Every line goes through the Append of the module: the logger first (`graph: <message>`), then the
durable ledger file (`[ISO] graph: <message>`) when the internal `State.Ledger` seam is set, because
the frozen config table has no ledger knob and the logger is the default surface.
