// Deepening - the OPTIONAL async deepener that sits beside an adapter
// (Interface/Deepening): the scope-resolved answer a language service can
// give where the lexical adapter only approximates. The harness exposes
// exactly one such seam today - `ctx.lsp` (@deepseek-ai/dsh-lsp) with its
// four read operations (goToDefinition / findReferences / goToImplementation
// / hover) - so the deepener supplies the REFERENCE SET and the RENAME EDITS
// derived from it, while the SYMBOLS still come from the adapter's scan (the
// seam has no symbol enumeration and no rename/WorkspaceEdit operation).
//
// THE FALLBACK RULE: `undefined` is the deepener's "cannot answer" (the seam
// is absent, has no provider for the extension, or failed) and the adapter's
// lexical answer stands. An ARRAY (possibly empty) is an answer and replaces
// the lexical reference list. The deepener never reads or writes a file: it
// is handed the text the service already read.
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type RenamePlan from "@Interface/RenamePlan.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";

export default interface Deepening {
	/** The name the ledger reports (`deepened <path> ... via <name>`). */
	name: string;
	/** The file extensions (with dot, lowercase) the deepener owns. */
	extensions: string[];
	/** The scope-resolved references for the file's declared symbols;
	 *  `undefined` means "cannot answer" - the lexical list stands. */
	references(
		Context: unknown,
		Root: string,
		Path: string,
		Text: string,
		Symbols: SymbolNode[],
	): Promise<ReferenceNode[] | undefined>;
	/** The scope-resolved rename plan for the identifier at `span`;
	 *  `undefined` means "cannot answer" - the adapter's plan stands. */
	rename(
		Context: unknown,
		Root: string,
		Path: string,
		Text: string,
		Span: Span,
		To: string,
	): Promise<RenamePlan | undefined>;
}
