// Operation - the one-call reflective operations (Interface/Operation). Each
// operation bundles the WHOLE transformation - the AST-aware rename/connect/
// replace across the affected references - one call instead of a tool
// choreography (REFLECT.md, the one-call semantics). The spans are 1-based and
// inclusive, the same span grammar the graph's nodes use.
//
// THE REPLACE HAS TWO TARGET FORMS:
//   * a NODE TARGET - `node` is the graph's frozen node id (the AST source:
//     `Symbol:<path>:<name>` or `Block:<path>:<line>:<kind>`), and
//     `fingerprint` is the content-derived fingerprint the caller expects that
//     span to have. The graph resolves the span; the fingerprint is verified
//     against the CURRENT text before anything is written - a mismatch is the
//     `fingerprint mismatch` refusal. The explicit span is then optional, and
//     it is the fallback when the graph is absent.
//   * a TEXTUAL SPAN - `startLine`/`endLine` only (the pre-AST form), still
//     supported unchanged.
//
// A NAMED type export (the machine-contract exception): a discriminated
// union cannot be a default interface under verbatimModuleSyntax, and the
// union IS the contract (the reply is part of the type; the kind drives the
// dispatch).
export type Operation =
	| {
			kind: "rename";
			/** The file holding the block. */
			path: string;
			/** The block span (1-based, inclusive). */
			startLine: number;
			endLine: number;
			/** The identifier to rename (matched whole-word). */
			oldName: string;
			/** The new identifier. */
			newName: string;
			/** The scope: the block span, or the whole file. Overrides config
			 *  `propagate`. */
			scope?: "block" | "file";
	  }
	| {
			kind: "connect";
			/** The file the reference is added to. */
			fromPath: string;
			/** The file (and optional symbol) the reference points at. */
			toPath: string;
			/** The symbol to import; without it the operation inserts a
			 *  reference comment, not a code import. */
			symbol?: string;
	  }
	| {
			kind: "replace";
			/** The file holding the block. */
			path: string;
			/** The block span to replace (1-based, inclusive). Optional for a
			 *  node target (the graph resolves it); required otherwise. */
			startLine?: number;
			endLine?: number;
			/** The replacement text (replaces the span's lines exactly). */
			text: string;
			/** The graph node id the span is resolved from (the AST source).
			 *  Requires `fingerprint`. */
			node?: string;
			/** The expected content fingerprint of the targeted span - verified
			 *  before the write; a mismatch refuses. */
			fingerprint?: string;
	  };
