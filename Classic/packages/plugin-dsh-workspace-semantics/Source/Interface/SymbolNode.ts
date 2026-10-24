// SymbolNode - one symbol of the semantic model (the graph schema v0's
// Symbol node, V4-1 section 3.1): kind, qualified name, span, fingerprint.
// The v0 TypeScript kinds (function/class/type/const/interface) plus the
// any-file kinds the other adapters declare: `key` (a JSON/YAML key), `heading`
// (a Markdown heading) and `dependency` (a package.json dependency name).
import type Span from "@Interface/Span.js";

export default interface SymbolNode {
	/** The symbol kind (the v0 TypeScript set plus the any-file kinds). */
	kind: "function" | "class" | "type" | "const" | "interface" | "key" | "heading" | "dependency";
	/** The qualified name as the adapter resolved it (e.g. `Foo.bar`). */
	qualifiedName: string;
	/** The half-open character range of the symbol's declaration. */
	span: Span;
	/** The adapter's cheap content fingerprint for the symbol. */
	fingerprint: string;
}
