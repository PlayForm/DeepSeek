// Node - one graph node (Interface/Node in the brief's section 4.3 schema).
// The id forms are frozen: `File:<path>`, `Symbol:<path>:<qualified name>`,
// `Block:<path>:<startLine>:<kind>`, `Test:<path>` and
// `DocSection:<path>:<startLine>`. The stable id survives edits; the
// fingerprint detects content change. Every node carries the file version
// token it was indexed at. The deferred kinds (ConfigKey and the deferred
// edge kinds) do NOT appear here - they are W2+ and are not faked.
export type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";

export type Language = "typescript" | "javascript" | "markdown";

export interface Span {
	startLine: number; // 1-based, inclusive
	endLine: number; // 1-based, inclusive
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
