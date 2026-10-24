# @playform/plugin-dsh-workspace-graph

The WORKSPACE GRAPH: a DeepSeek Harness service (`ctx.workspaceGraph`) that builds the W1 graph
schema v0 over the workspace files - four node kinds (`File`, `Symbol`, `Block`, `Test`) plus
Markdown `DocSection`s and three edge kinds (`contains`, `imports`, `references`), with stable ids,
content-derived fingerprints, and the `indexRevision` the graph was built from.

The v0 parser is a line/regex scanner (no compiler API): TypeScript and JavaScript declarations with
brace-counted spans, relative-import edges, test-path detection, and one `DocSection` per Markdown
heading. The remaining deferred kinds (`ConfigKey`, `calls`, `tests`) are NOT faked - W2+ work.

## The references edge (the semantics consumer wiring)

After the parse, `indexFile` asks the workspace-semantics service
(`@playform/plugin-dsh-workspace-semantics`, probed through `ctx.get` - the graph's `inject` stays
`["fs", "storage"]`) for the file's reference list and emits one `references` edge per resolved
reference: from the node that USES the symbol (the enclosing `Symbol` node, else the `File`) to the
used `Symbol` node, carrying the use site's line span. The honesty rules: no service (or a service
that answers `undefined`) means NO references edges; a target that names no `Symbol` node of the
same file is dropped rather than turned into a dangling edge; the `graph: indexed ...` edge count
includes the new edges and no new ledger line is added.

The class-form loader contract: `export default class WorkspaceGraph extends Service` registered
under the exact name `workspaceGraph`, `static inject = ["fs", "storage"]`, and `static Config` (the
Schemastery schema, every field volatile). The plugin ships DISABLED (`enabled: false` in the patch
row and the schema default): the service registers, and `indexFile` skips with the byte-exact
`graph: skipped <path> (disabled)` line until an explicit ACTIVATE.

## The indexing trigger (why the graph is no longer empty)

`indexWorkspace(root?, { maxFiles? })` fills the graph in one call: it resolves the root through
`ctx.fs.resolve` (omitted = the session working directory), walks the tree deterministically (sorted
listings, breadth-first), never follows an entry whose canonical identity is outside the root (a
symlink out of the root is rejected before any read), does not descend an excluded directory, stops
after `maxFiles` candidates (`Config.maxFiles`, default 2000), and indexes every candidate through
the existing `indexFile` - the per-file gates are reused, never duplicated. It returns
`{ indexed, skipped, failed, files }` and ledgers a summary line.

`neighborhood(path, limit?)` serves the connected component the graph-suggester's declared contract
consumes (the definition, the importers/tests, the dependencies, the doc block) - derived from the
W1 `contains`/`imports` edges only; the `references` edges are not folded into it and callers are
not faked.

The INCREMENTAL wiring (the trace adapter, D5): with the graph enabled, the constructor subscribes
to `observe/stamp` on the family's trace bus (`ctx.trace`, provided by
`@playform/ets-plugin-dsh-factory`) through `Source/Trace/Adapter.ts` - the graph no longer registers
`ctx.root.on("fs/observed")` directly. The bus is probed, not injected (`inject` stays
`["fs", "storage"]`), so direct construction and standalone use are unchanged; the factory's bundle
must load first. An accepted stamp is coalesced through the trace library's detached loop (a queue
keyed by path, one in-flight re-index per path, no timer) and re-indexed through `indexFile`; a
coalesced pair produces ONE byte-exact `graph: reindexed <path> (<status>)` line. An absent stamp, a
removed record and a replaced record emit `graph/invalidated`; a stored record emits
`graph/indexed` - the consumers (the context packet memo) use them. A disabled graph wires nothing;
an excluded path is ignored silently.

The three NEW ledger lines the indexing trigger adds (the rest of the W1 list is unchanged,
SCHEME.md section 8):

```text
graph: workspace indexed <n> files (<indexed> indexed, <skipped> skipped, <failed> failed)
graph: workspace capped at <maxFiles> files
graph: reindexed <path> (<status>)
```

Records live in the KV facet through the storage domain (one record per path plus the `__meta`
revision record in the `records` table of the domain named `Config.domain`, default
`workspace_graph`); absent storage falls back to the in-memory mirror. The plugin writes nothing
outside its own domain.

Build and smoke:

```sh
pnpm --dir Classic/packages/plugin-dsh-workspace-graph run prepublishOnly
node Classic/packages/plugin-dsh-workspace-graph/Target/Test/ < Folder > /Test.js
```

Plan: Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md section 4 (the frozen contract). Schema:
see SCHEME.md.

### The policy block (D6)

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
