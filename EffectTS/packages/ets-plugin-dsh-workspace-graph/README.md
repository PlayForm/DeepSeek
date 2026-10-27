# @playform/plugin-dsh-workspace-graph

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/WAVE-1-BRIEF](../../../Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md)

## The role

The WORKSPACE GRAPH is a DeepSeek Harness service (`ctx.workspaceGraph`) that builds the W1 graph
schema v0 over the workspace files: four node kinds (`File`, `Symbol`, `Block`, `Test`) plus
Markdown `DocSection`s and three edge kinds (`contains`, `imports`, `references`), with stable ids,
content-derived fingerprints, and the `indexRevision` that the graph was built from.

The v0 parser is a line/regex scanner with no compiler API: TypeScript and JavaScript declarations
with brace-counted spans, relative-import edges, test-path detection, and one `DocSection` per
Markdown heading.

The plugin does NOT fake the remaining deferred kinds (`ConfigKey`, `calls`, `tests`), which are W2+
work.

## The references edge (the semantics consumer wiring)

After the parse, `indexFile` asks the workspace-semantics service
(`@playform/plugin-dsh-workspace-semantics`, probed through `ctx.get`, so the `inject` of the graph
stays `["fs", "storage"]`) for the reference list of the file.

The plugin emits one `references` edge per resolved reference: from the node that USES the symbol
(the enclosing `Symbol` node, else the `File`) to the used `Symbol` node, carrying the line span of
the use site.

The honesty rules: no service (or a service that answers `undefined`) means NO references edges.

The plugin drops a target that names no `Symbol` node of the same file rather than turning it into a
dangling edge, and the `graph: indexed ...` edge count includes the new edges while the plugin adds
no new ledger line.

The class-form loader contract: `export default class WorkspaceGraph extends Service` registered
under the exact name `workspaceGraph`, with `static inject = ["fs", "storage"]` and `static Config`
(the Schemastery schema, every field volatile).

The plugin ships DISABLED (`enabled: false` in the patch row and the schema default): the service
registers, and `indexFile` skips with the byte-exact `graph: skipped <path> (disabled)` line until
an explicit ACTIVATE.

## The indexing trigger (why the graph is no longer empty)

`indexWorkspace(root?, { maxFiles? })` fills the graph in one call: it resolves the root through
`ctx.fs.resolve` (omitted = the session working directory) and walks the tree deterministically
(sorted listings, breadth-first).

The walk never follows an entry whose canonical identity is outside the root (the plugin rejects a
symlink out of the root before any read), does not descend an excluded directory, and stops after
`maxFiles` candidates (`Config.maxFiles`, default 2000).

The walk indexes every candidate through the existing `indexFile`, so the per-file gates are reused
and never duplicated.

It returns `{ indexed, skipped, failed, files }` and ledgers a summary line.

`neighborhood(path, limit?)` serves the connected component that the declared contract of the
graph-suggester consumes (the definition, the importers/tests, the dependencies, the doc block),
derived from the W1 `contains`/`imports` edges only.

The `references` edges are not folded into the component, and the plugin fakes no caller.

The INCREMENTAL wiring (the trace adapter, D5): with the graph enabled, the constructor subscribes
to `observe/stamp` on the trace bus of the family (`ctx.trace`, provided by
`@playform/ets-plugin-dsh-factory`) through `Source/Trace/Adapter.ts`, so the graph no longer
registers `ctx.root.on("fs/observed")` directly.

The plugin probes the bus and does not inject it (`inject` stays `["fs", "storage"]`), so direct
construction and standalone use are unchanged, and the bundle of the factory must load first.

An accepted stamp is coalesced through the detached loop of the trace library (a queue keyed by
path, one in-flight re-index per path, no timer) and re-indexed through `indexFile`, and a coalesced
pair produces ONE byte-exact `graph: reindexed <path> (<status>)` line.

An absent stamp, a removed record, and a replaced record emit `graph/invalidated`, and a stored
record emits `graph/indexed`, which the consumers (the context packet memo) use.

A disabled graph wires nothing, and an excluded path is ignored silently.

The indexing trigger adds three NEW ledger lines (the rest of the W1 list is unchanged, SCHEME.md
section 8):

```text
graph: workspace indexed <n> files (<indexed> indexed, <skipped> skipped, <failed> failed)
graph: workspace capped at <maxFiles> files
graph: reindexed <path> (<status>)
```

Records live in the KV facet through the storage domain (one record per path plus the `__meta`
revision record in the `records` table of the domain named `Config.domain`, default
`workspace_graph`), and absent storage falls back to the in-memory mirror.

The plugin writes nothing outside its own domain.

Build and smoke:

```sh
pnpm --dir Classic/packages/plugin-dsh-workspace-graph run prepublishOnly
node Classic/packages/plugin-dsh-workspace-graph/Target/Test/ < Folder > /Test.js
```

Plan: Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md section 4 (the frozen contract).

Schema: see SCHEME.md.

### The policy block (D6)

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

## The plan

- [Workspace-Family/WAVE-1-BRIEF](../../../Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md)
  section 4 - the frozen contract.

    Schema: see SCHEME.md.

## License

CC0-1.0.
