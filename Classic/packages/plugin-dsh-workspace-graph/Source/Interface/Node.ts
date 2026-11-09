/**
 * @module Node
 *
 * One graph node (`Interface/Node` in the brief's section 4.3 schema).
 *
 * @remarks
 * The id forms are frozen: `File:<path>`, `Symbol:<path>:<qualified name>`,
 * `Block:<path>:<startLine>:<kind>`, `Test:<path>` and `DocSection:<path>:<startLine>`. The
 * stable id survives edits; the fingerprint detects content change. Every node carries the
 * file version token it was indexed at.
 *
 * The deferred kinds (ConfigKey and the deferred edge kinds) do NOT appear here - they are W2+
 * and are not faked.
 */
export type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";

export type Language = "typescript" | "javascript" | "markdown";

export interface Span {
	/** The first line of the span, 1-based and inclusive. */
	startLine: number;
	/** The last line of the span, 1-based and inclusive. */
	endLine: number;
}

export default interface Node {
	/** The stable node id, one of the frozen id forms above. */
	id: string;
	/** The node kind. */
	kind: NodeKind;
	/** The resolved display path of the node's file. */
	path: string;
	/** The declaration or heading name, when the kind carries one. */
	name?: string;
	/** The parsed language of the node's file. */
	language?: Language;
	/** The 1-based line span the node covers. */
	span?: Span;
	/** The content-derived fingerprint that detects a content change. */
	fingerprint: string;
	/** The file version token the node was indexed at. */
	version: string;
}
