import { Service, type Context } from "@deepseek-ai/cordis";
import type { EdgeKind } from "./Interface/Edge.js";
import type Expansion from "./Interface/Expansion.js";
import type IndexSummary from "./Interface/IndexSummary.js";
import type Neighborhood from "./Interface/Neighborhood.js";
import type Node from "./Interface/Node.js";
import type Outcome from "./Interface/Outcome.js";
import type Query from "./Interface/Query.js";
import type Snapshot from "./Interface/Snapshot.js";
import type State from "./Interface/State.js";
import type Statistics from "./Interface/Statistics.js";
import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of the WORKSPACE GRAPH (`@playform/plugin-dsh-workspace-graph`).
 *
 * @remarks
 *
 * Loader contract, CLASS form (the brief's section 3): `export default class WorkspaceGraph
 * extends Service` with `super(Context, "workspaceGraph")` (the service registers immediately
 * on construction and is removed with its owning fiber) and `static inject = ["fs",
 * "storage"]` (the fs seam for every read, the storage hub for the KV domain). `static Config`
 * carries the Schemastery schema so the loader validates and defaults the config before the
 * class runs; the ONLY other named exports are the TYPE re-exports (the consumer contract, the
 * factory's P0-1 pattern) - every other module is a nameless default export composed
 * Rust-style, and each service method is a thin delegate to one Function module.
 *
 * THE SERVICE SURFACE (`ctx.workspaceGraph`, the brief's section 4.3 plus the INDEXING TRIGGER
 * the later stages needed):
 *
 * - `indexFile(path)` - resolve, stat, gate, read, parse, store, bump, ledger
 * - `indexWorkspace(root?, { maxFiles? })` - the walk plus per-file `indexFile`, the counts
 *   out (the indexing trigger: it fills the graph in one call)
 * - `removeFile(path)` - delete the record, bump, ledger
 * - `getNode(id)` - the node by stable id
 * - `find(query)` - name/pattern/kind filtered, limit clamped
 * - `expand(id, opts)` - outgoing BFS, depth default 1 capped at 3
 * - `neighborhood(path, limit?)` - the connected component the graph-suggester consumes
 * - `snapshot()` - the loadAll read (invalid records skipped and counted)
 * - `statistics()` - files, nodes, edges, `indexRevision`
 *
 * THE CONSTRUCTOR: unwrap the volatile config cells, run the fail-loud validation
 * (`Function/Validate` - a bad config throws at construction, which is the class-form "at
 * load"), attach the `__workspaceGraphState` probe (the family's smoke seam), ledger the
 * byte-exact `graph: activated (domain=<domain>, languages=<n>)` line, fire the best-effort
 * storage-domain open (`Function/Open`) detached - its promise is kept on the state and
 * awaited by the async writers, so the store behavior is deterministic without a sleep - and,
 * when enabled, wire the TRACE ADAPTER (`Trace/Adapter`): the graph consumes `observe/stamp`
 * from the family's bus (`ctx.trace`, provided by the factory) instead of registering
 * `ctx.root.on("fs/observed")` directly, and emits `graph/indexed` / `graph/invalidated`. The
 * indexer is inferred from the bus - there is no separate process and no separate indexer
 * plugin (D5).
 *
 * DECLARATION MERGING: the module augments the cordis Context with
 * `workspaceGraph: WorkspaceGraph`, so `ctx.workspaceGraph` is a typed accessor (the brief's
 * section 4.3; the compile proof lives in the smoke).
 *
 * THE IDLE-FOREVER POSTURE: the plugin ships disabled (the schema default and the patch row);
 * with config `enabled=false` the service still registers, `indexFile` skips with the
 * byte-exact `skipped <path> (disabled)` line, and NO listener is wired (a disabled graph
 * hears nothing).
 */
export type { default as Node } from "./Interface/Node.js";
export type { default as Edge } from "./Interface/Edge.js";
export type { default as Outcome } from "./Interface/Outcome.js";
export type { default as Query } from "./Interface/Query.js";
export type { default as Expansion } from "./Interface/Expansion.js";
export type { default as Snapshot } from "./Interface/Snapshot.js";
export type { default as Statistics } from "./Interface/Statistics.js";
export type { default as IndexSummary } from "./Interface/IndexSummary.js";
export type { default as Neighborhood } from "./Interface/Neighborhood.js";
export { Version };
export default class WorkspaceGraph extends Service {
    static inject: string[];
    static Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        domain: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        languages: import("@deepseek-ai/schemastery").default<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
        include: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        exclude: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        maxFileBytes: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxNodesPerFile: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxFiles: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        limitDefault: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        limitMaximum: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        policy: import("@deepseek-ai/schemastery").default<NoInfer<Schemastery.ObjectS<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, "volatile">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        domain: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        languages: import("@deepseek-ai/schemastery").default<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
        include: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        exclude: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        maxFileBytes: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxNodesPerFile: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxFiles: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        limitDefault: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        limitMaximum: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        policy: import("@deepseek-ai/schemastery").default<NoInfer<Schemastery.ObjectS<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, "volatile">;
    }>>, "plain">;
    /**
     * The internal runtime state (the __workspaceGraphState probe seam).
     */
    State: State;
    constructor(Context: Context, Raw?: unknown);
    /**
     * Resolve, stat, gate, read, parse, store the record, bump, ledger.
     */
    indexFile(Path: string): Promise<Outcome>;
    /**
     * Walk the root (default: the session cwd) and index every candidate.
     */
    indexWorkspace(Root?: string, Options?: {
        maxFiles?: number;
    }): Promise<IndexSummary>;
    /**
     * Delete the record, bump the revision, ledger the removed line.
     */
    removeFile(Path: string): Promise<boolean>;
    /**
     * The node by stable id, or undefined.
     */
    getNode(Id: string): Node | undefined;
    /**
     * The filtered node list, the limit clamped to [0, limitMaximum].
     */
    find(Query?: Query): Node[];
    /**
     * The outgoing breadth-first expansion, depth default 1 capped at 3.
     */
    expand(Id: string, Options?: {
        kinds?: EdgeKind[];
        depth?: number;
    }): Expansion;
    /**
     * The connected component around an anchor file (the suggester's read).
     */
    neighborhood(Path: string, Limit?: number): Neighborhood[];
    /**
     * The loadAll read; a record that fails validation is skipped and counted.
     */
    snapshot(): Snapshot;
    /**
     * The counts: files, nodes, edges, indexRevision.
     */
    statistics(): Statistics;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        workspaceGraph: WorkspaceGraph;
    }
}
