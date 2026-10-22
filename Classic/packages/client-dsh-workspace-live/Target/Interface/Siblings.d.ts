export type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";
export type Span = {
    startLine: number;
    endLine: number;
};
export type GraphNode = {
    id: string;
    kind: NodeKind;
    path: string;
    name?: string;
    fingerprint: string;
    version: string;
};
export type GraphSnapshot = {
    indexRevision: string;
    nodes: GraphNode[];
};
export type Stamp = {
    path: string;
    version: string;
    origin: "fs/observed" | "manual";
    sequence: number;
};
export type WorkspaceEvent = {
    operationId: string;
    parentId: string;
    category: string;
    path?: string;
    sequence: number;
};
