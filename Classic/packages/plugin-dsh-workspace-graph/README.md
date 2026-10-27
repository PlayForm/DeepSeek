# @playform/plugin-dsh-workspace-graph

> v0.1.0 - UNPUBLISHED - plan:
> [Workspace-Family/WAVE-1-BRIEF](../../../Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md)

## The role

The WORKSPACE GRAPH is a DeepSeek Harness service (`ctx.workspaceGraph`) that builds the W1 graph schema v0 over the workspace files.

It covers four node kinds (`File`, `Symbol`, `Block`, `Test`) plus Markdown `DocSection`s and three edge kinds (`contains`, `imports`, `references`), with stable ids, content-derived fingerprints, and the `indexRevision` the graph was built from.

The v0 parser is a line/regex scanner (no compiler API): TypeScript and JavaScript declarations with brace-counted spans, relative-import edges, test-path detection, and one `DocSection` per Markdown heading.

The remaining deferred kinds (`ConfigKey`, `calls`, `tests`) are NOT faked, because they are W2+ work.

## The surfaces

- The service `ctx.workspaceGraph` (`indexFile`, `indexWorkspace`, `neighborhood`).
- The family's trace bus (`ctx.trace`): the `observe/stamp` subscription (the incremental wiring)
  and the `graph/indexed` / `graph/invalidated` emissions.
- The KV storage domain `workspace_graph` (config `domain`); no tool.

## The references edge (the semantics consumer wiring)

After the parse, `indexFile` asks the workspace-semantics service (`@playform/plugin-dsh-workspace-semantics`, probed through `ctx.get`, so the graph's `inject` stays `["fs", "storage"]`) for the file's reference list.

It emits one `references` edge per resolved reference, from the node that USES the symbol (the enclosing `Symbol` node, else the `File`) to the used `Symbol` node, carrying the use site's line span.

The honesty rules hold: no service (or a service that answers `undefined`) means NO references edges; a target that names no `Symbol` node of the same file is dropped rather than turned into a dangling edge; the `graph: indexed ...` edge count includes the new edges and no new ledger line is added.

The class-form loader contract is `export default class WorkspaceGraph extends Service`, registered under the exact name `workspaceGraph`, with `static inject = ["fs", "storage"]` and `static Config` (the Schemastery schema, every field volatile).

The plugin ships DISABLED (`enabled: false` in the patch row and the schema default): the service registers, and `indexFile` skips with the byte-exact `graph: skipped <path> (disabled)` line until an explicit ACTIVATE.

## The indexing trigger (why the graph is no longer empty)

`indexWorkspace(root?, { maxFiles? })` fills the graph in one call.

It resolves the root through `ctx.fs.resolve` (omitted = the session working directory) and walks the tree deterministically (sorted listings, breadth-first).

It never follows an entry whose canonical identity is outside the root (a symlink out of the root is rejected before any read), does not descend an excluded directory, and stops after `maxFiles` candidates (`Config.maxFiles`, default 2000).

It indexes every candidate through the existing `indexFile`, so the per-file gates are reused, never duplicated.

It returns `{ indexed, skipped, failed, files }` and ledgers a summary line.

`neighborhood(path, limit?)` serves the connected component the graph-suggester's declared contract consumes (the definition, the importers/tests, the dependencies, the doc block), derived from the W1 `contains`/`imports` edges only; the `references` edges are not folded into it and callers are not faked.

The INCREMENTAL wiring (the trace adapter, D5): with the graph enabled, the constructor subscribes to `observe/stamp` on the family's trace bus (`ctx.trace`, provided by `@playform/plugin-dsh-factory`) through `Source/Trace/Adapter.ts`, so the graph no longer registers `ctx.root.on("fs/observed")` directly.

The bus is probed, not injected (`inject` stays `["fs", "storage"]`), so direct construction and standalone use are unchanged, and the factory's bundle must load first.

An accepted stamp is coalesced through the trace library's detached loop (a queue keyed by path, one in-flight re-index per path, no timer) and re-indexed through `indexFile`, and a coalesced pair produces ONE byte-exact `graph: reindexed <path> (<status>)` line.

An absent stamp, a removed record, and a replaced record emit `graph/invalidated`, while a stored record emits `graph/indexed`, which the consumers (the context packet memo) use.

A disabled graph wires nothing, and an excluded path is ignored silently.

Records live in the KV facet through the storage domain (one record per path plus the `__meta` revision record in the `records` table of the domain named `Config.domain`, default `workspace_graph`), and absent storage falls back to the in-memory mirror.

The plugin writes nothing outside its own domain.

## The ledger

The three NEW lines the indexing trigger adds are below (the rest of the W1 list is unchanged, SCHEME.md section 8):

```text
graph: workspace indexed <n> files (<indexed> indexed, <skipped> skipped, <failed> failed)
graph: workspace capped at <maxFiles> files
graph: reindexed <path> (<status>)
graph: skipped <path> (disabled)
```

## The configuration

| Field             | Default           | Meaning                              |
| ----------------- | ----------------- | ------------------------------------ |
| `enabled`         | `false`           | the master switch (ships disabled)   |
| `log`             | `true`            | the ledger switch (shared cell)      |
| `domain`          | `workspace_graph` | the KV storage domain                |
| `maxFileBytes`    | `1000000`         | the per-file byte cap                |
| `maxNodesPerFile` | `5000`            | the per-file node cap                |
| `maxFiles`        | `2000`            | the `indexWorkspace` walk bound      |
| `limitDefault`    | `50`              | the default list limit               |
| `limitMaximum`    | `500`             | the maximum list limit               |
| `policy.*`        | D6 defaults       | the per-action allowlist (see below) |

Every field is volatile, so no remount is needed.

## The build and the tests

```sh
pnpm --dir Classic/packages/plugin-dsh-workspace-graph run prepublishOnly
node Classic/packages/plugin-dsh-workspace-graph/Target/Test/ < Folder > /Test.js
```

### The policy block (D6)

The config carries the shared per-action allowlist (`policy: Policy()`, composed from the factory's block), mapped to `State.Allow`:

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The graph's actions are index, all **AUTOMATIC**, and it has **no gated action** (no file write, no batch commit, no spawn), so the block documents the posture and refuses nothing.

The block is one volatile object, so a policy flip is hot-editable without a remount, and a resolved pack's `policy` section overrides the defaults per action (the wiring is the next refinement).

## The plan

- [Workspace-Family/WAVE-1-BRIEF](../../../Documentation/Plans/Workspace-Family/WAVE-1-BRIEF.md)
  section 4 - the frozen contract.

    Schema: see SCHEME.md.

## License

CC0-1.0.
