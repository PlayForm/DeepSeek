// Yaml - the YAML adapter (Function/Yaml): the mapping keys are the file's
// symbols and a plain scalar VALUE that repeats a key's text is a reference to
// that key (the same v0 cross-reference convention the JSON adapter uses:
// YAML's identifier space is its keys, so a repeated scalar is the only
// in-file reference the format offers). Nesting is NOT qualified in v0: the
// symbol name is the key token.
//
// Quoted scalars are not references (the quote style would have to be
// preserved through a rename); a scalar that carries anything beyond the plain
// token grammar (a colon, a quote, a trailing comment) is left alone. The
// spans are the token's exact range, so a rename rewrites the token only.
import type Adapter from "@Interface/Adapter.js";
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";

/** One mapping key: group 1 is the indent (plus an optional list dash),
 *  group 2 the key token. */
const Key = /^([ \t]*(?:-[ \t]+)?)([A-Za-z0-9_.$-]+)([ \t]*):/gm;

/** One plain scalar value: group 1 is the key prefix, group 2 the value. */
const Scalar = /^([ \t]*(?:-[ \t]+)?[A-Za-z0-9_.$-]+[ \t]*:[ \t]+)([A-Za-z0-9_.$/-]+)[ \t]*$/gm;

/** Every key token with its exact range. */
const Keys = (Text: string): { text: string; span: Span }[] => {
	const Found: { text: string; span: Span }[] = [];
	for (const Match of Text.matchAll(Key)) {
		const Start = (Match.index ?? 0) + (Match[1] ?? "").length;
		const Value = Match[2] ?? "";
		Found.push({ text: Value, span: { start: Start, end: Start + Value.length } });
	}
	return Found;
};

/** Every plain scalar value with its exact range. */
const Scalars = (Text: string): { text: string; span: Span }[] => {
	const Found: { text: string; span: Span }[] = [];
	for (const Match of Text.matchAll(Scalar)) {
		const Start = (Match.index ?? 0) + (Match[1] ?? "").length;
		const Value = Match[2] ?? "";
		Found.push({ text: Value, span: { start: Start, end: Start + Value.length } });
	}
	return Found;
};

export default {
	extensions: [".yml", ".yaml"],
	scan(text: string, _path: string) {
		const Found = Keys(text);
		const names = new Set(Found.map((Token) => Token.text));
		const symbols: SymbolNode[] = Found.map((Token) => ({
			kind: "key" as const,
			qualifiedName: Token.text,
			span: Token.span,
			fingerprint: `key:${Token.text}`,
		}));
		const references: ReferenceNode[] = [];
		for (const Token of Scalars(text)) {
			switch (true) {
				case names.has(Token.text):
					references.push({ target: Token.text, span: Token.span });
					break;
				default:
			}
		}
		return { symbols, references, dependencies: [], certain: true };
	},
	rename(text: string, path: string, span: Span, to: string) {
		const From = text.slice(span.start, span.end);
		switch (true) {
			case !/^[A-Za-z0-9_.$-]+$/.test(From):
				return undefined;
			default:
		}
		const edits: Span[] = [
			...Keys(text)
				.filter((Token) => Token.text === From)
				.map((Token) => Token.span),
			...Scalars(text)
				.filter((Token) => Token.text === From)
				.map((Token) => Token.span),
		];
		switch (true) {
			case edits.length === 0:
				return undefined;
			default:
		}
		return {
			path,
			from: From,
			to,
			edits,
			certainty: "references" as const,
		};
	},
} satisfies Adapter;
