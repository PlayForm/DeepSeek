import type { Edge, NodeKind } from "./Graph.js";
import type { PacketView } from "./Packet.js";
/** The compact node row the tools print (id, path, span, kind - plus the
 * fingerprint and the version so staleness is detectable in every answer). */
export interface NodeRow {
    id: string;
    kind: NodeKind;
    path: string;
    name?: string;
    startLine?: number;
    endLine?: number;
    fingerprint: string;
    version: string;
}
/** The workspace_map result: the top-level modules, the file count, the
 * entry points, the hot symbols. */
export interface MapResult {
    indexRevision: string;
    modules: {
        id: string;
        path: string;
        role: string;
    }[];
    files: number;
    entryPoints: string[];
    hotSymbols: NodeRow[];
    truncated: boolean;
    cursor?: string;
}
/** The workspace_find result: the matching nodes with id, path, span, kind. */
export interface FindResult {
    indexRevision: string;
    nodes: NodeRow[];
    truncated: boolean;
    cursor?: string;
}
/** The workspace_expand result: the neighbors (references, calls, imports,
 * tests) around the focus node. */
export interface ExpandResult {
    indexRevision: string;
    /** The focus node - absent when the id does not resolve (an honest miss,
     * never a fabricated row). */
    node?: NodeRow;
    nodes: NodeRow[];
    edges: {
        kind: Edge["kind"];
        from: string;
        to: string;
        startLine?: number;
    }[];
    truncated: boolean;
}
/** The workspace_context result: the orientation packet plus its token
 * estimate (the budget the packet used, so the caller sees the cost). */
export interface ContextResult {
    indexRevision: string;
    packet: PacketView;
    text: string;
    tokens: number;
    budget: number;
    truncated: boolean;
}
