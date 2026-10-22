export type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";
export type Language = "typescript" | "javascript" | "markdown";
export interface Span {
    startLine: number;
    endLine: number;
}
export default interface Node {
    id: string;
    kind: NodeKind;
    path: string;
    name?: string;
    language?: Language;
    span?: Span;
    fingerprint: string;
    version: string;
}
