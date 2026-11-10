/**
 * @module Node
 *
 * One graph node, per the brief's section 4.3 schema.
 *
 * @remarks
 *
 * The id forms are frozen: `File:<path>`, `Symbol:<path>:<qualified name>`,
 * `Block:<path>:<startLine>:<kind>`, `Test:<path>` and
 * `DocSection:<path>:<startLine>`. The stable id survives edits; the
 * fingerprint detects content change. Every node carries the file version
 * token it was indexed at. The deferred kinds (ConfigKey and the deferred
 * edge kinds) do NOT appear here - they are W2+ and are not faked.
 */

/**
 * The node kinds the W1 graph emits.
 */
export type NodeKind = "File" | "Symbol" | "Block" | "Test" | "DocSection";

/**
 * The parsed languages.
 */
export type Language = "typescript" | "javascript" | "markdown";

export interface Span {
	startLine: number; // 1-based, inclusive
	endLine: number; // 1-based, inclusive
}

export default interface Node {
	/**
	 * The frozen id form for the node kind.
	 */
	id: string;

	/**
	 * The node kind.
	 */
	kind: NodeKind;

	/**
	 * The resolved display path of the owning file.
	 */
	path: string;

	/**
	 * The declaration or section name, when the kind carries one.
	 */
	name?: string;

	/**
	 * The parsed language of the owning file.
	 */
	language?: Language;

	/**
	 * The 1-based line span in the owning file.
	 */
	span?: Span;

	/**
	 * The content-derived fingerprint.
	 */
	fingerprint: string;

	/**
	 * The file version token the node was indexed at.
	 */
	version: string;
}
