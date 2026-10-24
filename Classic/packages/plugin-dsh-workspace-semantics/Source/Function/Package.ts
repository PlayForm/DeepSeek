// Package - the package.json adapter (Function/Package): the dependency NAMES
// are the file's symbols (one kind `dependency` per name, whichever of the
// four dependency sections declares it first), a later occurrence of the same
// name is a reference to it (the same dependency listed in `dependencies` and
// `peerDependencies` is one dependency referenced twice), and the model's
// `dependencies` list is the names themselves - a package.json's dependencies
// ARE its dependency graph.
//
// This is a FILE adapter (no extension): the basename `package.json` is the
// registration key, checked before the `.json` extension adapter, so a
// package.json never falls through to the plain JSON key model.
import type Adapter from "@Interface/Adapter.js";
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";

/** One dependency section and its block body (the four dependency kinds). */
const Section =
	/"(dependencies|devDependencies|peerDependencies|optionalDependencies)"\s*:\s*\{([^}]*)\}/g;

/** One `"name": ...` entry inside a section block. */
const Entry = /"([^"]+)"\s*:/g;

/** Every dependency-name occurrence with its exact range, in file order. */
const Names = (Text: string): { text: string; span: Span }[] => {
	const Found: { text: string; span: Span }[] = [];
	for (const Match of Text.matchAll(Section)) {
		const Base = (Match.index ?? 0) + Match[0].indexOf("{") + 1;
		for (const Row of (Match[2] ?? "").matchAll(Entry)) {
			const Value = Row[1] ?? "";
			const Start = Base + (Row.index ?? 0) + 1;
			Found.push({ text: Value, span: { start: Start, end: Start + Value.length } });
		}
	}
	return Found;
};

export default {
	extensions: [],
	files: ["package.json"],
	scan(text: string, _path: string) {
		const Found = Names(text);
		const symbols: SymbolNode[] = [];
		const references: ReferenceNode[] = [];
		const dependencies: string[] = [];
		const declared = new Set<string>();
		for (const Token of Found) {
			switch (true) {
				case declared.has(Token.text):
					references.push({ target: Token.text, span: Token.span });
					break;
				default:
					declared.add(Token.text);
					dependencies.push(Token.text);
					symbols.push({
						kind: "dependency",
						qualifiedName: Token.text,
						span: Token.span,
						fingerprint: `dependency:${Token.text}`,
					});
			}
		}
		return { symbols, references, dependencies, certain: true };
	},
	rename(text: string, path: string, span: Span, to: string) {
		const From = text.slice(span.start, span.end);
		switch (true) {
			case From.length === 0 || /["\r\n]/.test(From):
				return undefined;
			default:
		}
		const edits: Span[] = Names(text)
			.filter((Token) => Token.text === From)
			.map((Token) => Token.span);
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
