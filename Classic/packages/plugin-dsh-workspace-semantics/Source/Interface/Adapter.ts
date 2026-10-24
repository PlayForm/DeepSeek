// Adapter - the any-file adapter's semantics contract (the ANY-FILE-ADAPTERS
// rule: think adapters, think graphs - each file type gets its adapter that
// produces the file's knowledge graph and answers the type's operations). The
// adapter is a pure function object: it never reads files, never writes, and
// never throws on ordinary content (a scan failure is the adapter returning
// its best partial model plus `certain: false`).
//
// TWO REGISTRATION KEYS: an adapter owns either a set of EXTENSIONS (the
// TypeScript/JavaScript family, JSON, YAML, Markdown) or an exact BASENAME (a
// format that lives in exactly one file - package.json - is a file adapter,
// not an extension adapter). The basename is checked before the extension
// (Function/Select), so package.json never falls through to the JSON adapter.
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type RenamePlan from "@Interface/RenamePlan.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";

export default interface Adapter {
	/** The file extensions (with dot, lowercase) the adapter owns. */
	extensions: string[];
	/** The exact basenames the adapter owns (checked before the extension).
	 *  Absent or empty for the extension adapters. */
	files?: string[];
	/** Build the model from the file's text. */
	scan(
		text: string,
		path: string,
	): {
		symbols: SymbolNode[];
		references: ReferenceNode[];
		dependencies: string[];
		certain: boolean;
	};
	/** Compute the rename plan for the identifier at `span` (or refuse).
	 *  The refusal-to-guess rule lives HERE: an adapter that cannot be
	 *  certain returns undefined, and the service reports the refusal. */
	rename(text: string, path: string, span: Span, to: string): RenamePlan | undefined;
}
