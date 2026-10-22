// ScanSymbols - the v0 TypeScript/JavaScript declaration scanner (no
// compiler API). A symbol match is one declaration line: optional export /
// default / declare / abstract / async modifiers, then one of the tracked
// keywords (function, class, interface, type, enum, const, let, var), then
// the name - exported and non-exported alike. Nested names are NOT resolved
// in v0: the qualified name is the declaration name. A symbol's span runs
// from its declaration line to its closing brace (brace counting; a
// declaration without a brace ends at its statement line), and when the
// closing brace sits on a later line the body span (one Block per symbol
// body) runs from the line after the brace-open to the closing brace line.
// Comment lines are skipped; braces inside strings are counted naively (the
// v0 honesty limit - a string containing an unbalanced brace can skew a span).
import type { Span } from "@Interface/Node.js";

export interface SymbolMatch {
	name: string;
	keyword: string;
	span: Span;
	body?: Span;
}

const Pattern =
	/^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(function\*?|class|interface|type|enum|const|let|var)\s+([A-Za-z_$][\w$]*)/;

const Comment = /^\s*(\/\/|\*|\/\*)/;

export default (Lines: string[]): SymbolMatch[] => {
	const Matches: SymbolMatch[] = [];
	for (let Index = 0; Index < Lines.length; Index++) {
		const Line = Lines[Index] as string;
		if (Comment.test(Line)) {
			continue;
		}
		const Match = Pattern.exec(Line);
		if (Match === null) {
			continue;
		}
		const Start = Index + 1;
		const Open = Line.indexOf("{");
		if (Open < 0) {
			Matches.push({
				keyword: Match[1] ?? "",
				name: Match[2] ?? "",
				span: { startLine: Start, endLine: Start },
			});
			continue;
		}
		// Brace counting from the declaration line to the matching close.
		let Depth = 0;
		let Close = Start;
		for (let Walk = Index; Walk < Lines.length; Walk++) {
			for (const Char of Lines[Walk] as string) {
				switch (Char) {
					case "{":
						Depth++;
						break;
					case "}":
						Depth--;
						break;
				}
			}
			if (Depth <= 0) {
				Close = Walk + 1;
				break;
			}
		}
		const Match_: SymbolMatch = {
			keyword: Match[1] ?? "",
			name: Match[2] ?? "",
			span: { startLine: Start, endLine: Close },
		};
		if (Close > Start) {
			Match_.body = { startLine: Start + 1, endLine: Close };
		}
		Matches.push(Match_);
	}
	return Matches;
};
