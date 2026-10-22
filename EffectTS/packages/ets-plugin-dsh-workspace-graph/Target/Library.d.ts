import { Service, type Context } from "@deepseek-ai/cordis";
import type { EdgeKind } from "@Interface/Edge.js";
import type Expansion from "@Interface/Expansion.js";
import type Node from "@Interface/Node.js";
import type Outcome from "@Interface/Outcome.js";
import type Query from "@Interface/Query.js";
import type Snapshot from "@Interface/Snapshot.js";
import type State from "@Interface/State.js";
import type Statistics from "@Interface/Statistics.js";
export type { default as Node } from "@Interface/Node.js";
export type { default as Edge } from "@Interface/Edge.js";
export type { default as Outcome } from "@Interface/Outcome.js";
export type { default as Query } from "@Interface/Query.js";
export type { default as Expansion } from "@Interface/Expansion.js";
export type { default as Snapshot } from "@Interface/Snapshot.js";
export type { default as Statistics } from "@Interface/Statistics.js";
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
        limitDefault: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        limitMaximum: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        domain: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        languages: import("@deepseek-ai/schemastery").default<NoInfer<("javascript" | "markdown" | "typescript")[]>, NoInfer<("javascript" | "markdown" | "typescript")[]>, "volatile-defined">;
        include: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        exclude: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        maxFileBytes: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        maxNodesPerFile: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        limitDefault: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        limitMaximum: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    }>>, "plain">;
    /** The internal runtime state (the __workspaceGraphState probe seam). */
    State: State;
    constructor(Context: Context, Raw?: unknown);
    /** Resolve, stat, gate, read, parse, store the record, bump, ledger. */
    indexFile(Path: string): Promise<Outcome>;
    /** Delete the record, bump the revision, ledger the removed line. */
    removeFile(Path: string): Promise<boolean>;
    /** The node by stable id, or undefined. */
    getNode(Id: string): Node | undefined;
    /** The filtered node list, the limit clamped to [0, limitMaximum]. */
    find(Query?: Query): Node[];
    /** The outgoing breadth-first expansion, depth default 1 capped at 3. */
    expand(Id: string, Options?: {
        kinds?: EdgeKind[];
        depth?: number;
    }): Expansion;
    /** The loadAll read; a record that fails validation is skipped and counted. */
    snapshot(): Snapshot;
    /** The counts: files, nodes, edges, indexRevision. */
    statistics(): Statistics;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        workspaceGraph: WorkspaceGraph;
    }
}
