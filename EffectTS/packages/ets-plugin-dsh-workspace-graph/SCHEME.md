# The workspace graph - schema and behavior

The service `ctx.workspaceGraph` (registered under the exact name
`workspaceGraph`). Everything below is what the code does today; nothing else
is claimed.

## 1. Identity

- Package `@playform/plugin-dsh-workspace-graph`, service name
  `workspaceGraph`, ledger tag `graph: `.
- Loader contract, class form: `export default class WorkspaceGraph extends
  Service`, `super(Context, "workspaceGraph")`,
  `static inject = ["fs", "storage"]`, `static Config` (Schemastery).
- Declaration merging gives `ctx.workspaceGraph` as a typed accessor.

## 2. Config (Schemastery, all volatile)

| Field           | Type                              | Default                                     |
| --------------- | --------------------------------- | ------------------------------------------- |
| enabled         | boolean                           | false                                       |
| domain          | string                            | `workspace_graph`                           |
| languages       | array of the three languages      | all three                                   |
| include         | array of glob strings             | []                                          |
| exclude         | array of glob strings             | `node_modules/**`, `**/Target/**`, `**/.git/**` |
| maxFileBytes    | number                            | 1000000                                     |
| maxNodesPerFile | number                            | 5000                                        |
| limitDefault    | number                            | 50                                          |
| limitMaximum    | number                            | 500                                         |

Fail-loud at construction (exact messages, asserted by the smoke):

- `invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/`
- `invalid config: languages must be a non-empty array of "typescript" | "javascript" | "markdown"`
- `invalid config: <field> must be a positive integer` (the four number fields)
- `invalid config: limitDefault must not exceed limitMaximum`
- `invalid config: <field> must be an array of strings` (include, exclude)
- Schemastery's own type errors throw first for wrong-typed fields.

## 3. Node and edge kinds (W1)

| Node kind  | id form                            | parsed |
| ---------- | ---------------------------------- | ------ |
| File       | `File:<path>`                      | yes    |
| Symbol     | `Symbol:<path>:<qualified name>`   | yes    |
| Block      | `Block:<path>:<startLine>:<kind>` (kind `body`) | yes |
| Test       | `Test:<path>`                      | yes    |
| DocSection | `DocSection:<path>:<startLine>`    | yes (Markdown) |
| ConfigKey  | -                                  | no (deferred, not faked) |

| Edge kind  | from -> to                       | parsed |
| ---------- | -------------------------------- | ------ |
| contains   | File -> Symbol/Block/DocSection/Test | yes |
| imports    | File -> File (relative specifiers only) | yes |
| references / calls / tests | -               | no (deferred, not faked) |

`<path>` is the resolved display path. The qualified name of a Symbol is its
declaration name; nested names are not resolved in v0. A test path is
`*.test.ts`, `*.test.tsx`, `*.test.js` (also the jsx/mjs/cjs variants) or a
`Test.ts` segment.

## 4. Spans and fingerprints

- `Span` is 1-based, inclusive on both ends.
- A Symbol's span runs from its declaration line to its closing brace (brace
  counting; a declaration without a brace ends at its statement line). A
  Block's span is the symbol's body: the line after the brace-open through
  the closing brace line - always inside the symbol's span. A symbol whose
  closing brace sits on the declaration line has no Block.
- The fingerprint is `sha256(normalized text + "\n" + kind + "\n" + name)` in
  hex, where the normalized text is the node's span text with CRLF -> LF and
  trailing whitespace stripped per line; a node without a name hashes the
  empty name. The stable id survives edits; the fingerprint detects content
  change.
- Every edge carries a source span: a `contains` edge carries the contained
  node's span; an `imports` edge carries the import's line.

## 5. Parser limits (v0 honesty)

- TypeScript/JavaScript: line/regex scanning, no compiler API. Comment lines
  are skipped. Braces inside strings are counted naively - a string with an
  unbalanced brace can skew a span.
- Imports: static `from "..."` and dynamic `import("...")`. Only relative
  specifiers produce an edge (the target id is the specifier resolved against
  the file's directory, no extension added); a non-relative specifier is
  counted (State.SkippedImports) and produces no node and no edge.
- Markdown: one `DocSection` per `^#{1,6} ` heading, spanning to the line
  before the next heading of the same or higher level.
- Config files: not parsed in W1.

## 6. Service surface

- `async indexFile(path) -> Outcome` - resolve through `ctx.fs.resolve`
  (the backend's own cwd), stat, gate (enabled, exclude, include, file type,
  language, size), read, parse, node-cap check, store the record (mirror +
  KV, awaiting the pending open), bump `indexRevision`, persist the `__meta`
  record, ledger.
- `async removeFile(path) -> boolean` - delete the record from the mirror and
  the store, bump, persist, ledger `removed <path>`; false silently when
  there is no record.
- `getNode(id) -> Node | undefined`
- `find(query) -> Node[]` - `name` exact, `pattern` case-insensitive substring
  over id and name, `kind`; the limit defaults to `limitDefault` and is capped
  at `limitMaximum`.
- `expand(id, { kinds?, depth? }) -> Expansion` - outgoing edges only,
  breadth-first, depth default 1 capped at 3; the start node first, each
  reachable node visited once.
- `snapshot() -> GraphSnapshot` - the loadAll read; a record that fails
  validation is skipped and counted (State.Invalid), never guessed.
- `statistics() -> GraphStatistics` - files, nodes, edges, indexRevision.

## 7. Store

The KV facet through the storage domain: the domain named `Config.domain`
(version 1, per-record layout, `invalidRecords: "backup-and-skip"`), one
`records` table, one record per path keyed by the display path, plus the meta
record keyed `__meta` carrying `{ indexRevision }`. An absent facility is a
silent skip (in-memory only); a failed open is one best-effort ledger line
(`storage open failed (...)`). On open, stored records load into the mirror
after validation and the meta revision is restored when ahead.

## 8. Ledger lines (byte-stable, module-owned)

```text
graph: activated (domain=<domain>, languages=<n>)
graph: indexed <path> version <version> (<nodes> nodes, <edges> edges)
graph: skipped <path> (<reason>)
graph: failed <path> (<reason>)
graph: removed <path>
graph: domain <domain> opened (<records> records)
```

Every line goes through the module's own Append: logger first
(`graph: <message>`), then the durable ledger file (`[ISO] graph: <message>`)
when the internal `State.Ledger` seam is set - the frozen config table has no
ledger knob, so the logger is the default surface.
