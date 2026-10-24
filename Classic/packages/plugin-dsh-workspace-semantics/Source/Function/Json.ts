// Json - the JSON adapter (Function/Json): the file's keys are its symbols and
// a string VALUE that repeats a key's text is a reference to that key (the v0
// JSON cross-reference convention: JSON has no identifier space beyond the
// key/string namespace, so a repeated string is the only in-file reference the
// format offers). Nested keys are NOT qualified in v0: the symbol name is the
// key token, so the same key in two objects is one symbol name.
//
// The spans are the token's INNER range (without the quotes): the rename plan
// rewrites that range, so the quotes survive. The certainty is "references":
// the plan rewrites every key and every value token with the same text - the
// reference list's reach, not a scope analysis.
import type Adapter from "@Interface/Adapter.js";
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";

/** One quoted JSON token; group 1 is the inner text. */
const Token = /"((?:[^"\\]|\\.)*)"/g;

/** The next non-space character after `From` is a colon: the token is a key. */
const IsKey = (Text: string, From: number): boolean => {
	let Index = From;
	while (
		Index < Text.length &&
		(Text[Index] === " " ||
			Text[Index] === "\t" ||
			Text[Index] === "\r" ||
			Text[Index] === "\n")
	) {
		Index += 1;
	}
	return Text[Index] === ":";
};

/** One token: the inner range and whether it is a key. */
const Tokens = (Text: string): { text: string; span: Span; key: boolean }[] => {
	const Found: { text: string; span: Span; key: boolean }[] = [];
	for (const Match of Text.matchAll(Token)) {
		const Inner = Match[1] ?? "";
		const Start = (Match.index ?? 0) + 1;
		Found.push({
			text: Inner,
			span: { start: Start, end: Start + Inner.length },
			key: IsKey(Text, Start + Inner.length + 1),
		});
	}
	return Found;
};

export default {
	extensions: [".json"],
	scan(text: string, _path: string) {
		const Found = Tokens(text);
		const keys = new Set(Found.filter((Token_) => Token_.key).map((Token_) => Token_.text));
		const symbols: SymbolNode[] = [];
		const references: ReferenceNode[] = [];
		for (const Token_ of Found) {
			switch (true) {
				case Token_.key:
					symbols.push({
						kind: "key",
						qualifiedName: Token_.text,
						span: Token_.span,
						fingerprint: `key:${Token_.text}`,
					});
					break;
				case keys.has(Token_.text):
					// A string value that repeats a key of this file: the v0
					// cross-reference. Any other value references nothing.
					references.push({ target: Token_.text, span: Token_.span });
					break;
				default:
			}
		}
		return { symbols, references, dependencies: [], certain: true };
	},
	rename(text: string, path: string, span: Span, to: string) {
		const From = text.slice(span.start, span.end);
		switch (true) {
			case From.length === 0 || /["\\\r\n]/.test(From):
				return undefined;
			default:
		}
		const edits: Span[] = [];
		for (const Token_ of Tokens(text)) {
			if (Token_.text === From) {
				edits.push(Token_.span);
			}
		}
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
