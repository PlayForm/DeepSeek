// Markdown - the Markdown adapter (Function/Markdown): the headings are the
// file's symbols and the link TARGETS are its references (a link target is a
// reference by construction, whether it names a local file, a URL or an
// anchor). The rename renames LINK TARGETS only: a heading rename would need
// the anchor slug the renderer derives, which is not derivable honestly from
// the text (the refusal-to-guess rule), so a span that is not a link target is
// the adapter's `undefined`.
import type Adapter from "@Interface/Adapter.js";
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";

/** One ATX heading: group 1 is the hashes, group 2 the heading text. */
const Heading = /^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/gm;

/** One inline link: group 1 is the target. */
const Link = /\[[^\]]*\]\(([^)\s]+)(?:[ \t]+"[^"]*")?\)/g;

/** Every link target with its exact range. */
const Targets = (Text: string): { text: string; span: Span }[] => {
	const Found: { text: string; span: Span }[] = [];
	for (const Match of Text.matchAll(Link)) {
		const Value = Match[1] ?? "";
		const Start = (Match.index ?? 0) + Match[0].lastIndexOf("(") + 1;
		Found.push({ text: Value, span: { start: Start, end: Start + Value.length } });
	}
	return Found;
};

export default {
	extensions: [".md", ".markdown"],
	scan(text: string, _path: string) {
		const symbols: SymbolNode[] = [];
		for (const Match of text.matchAll(Heading)) {
			const Value = Match[2] ?? "";
			const Start = (Match.index ?? 0) + Match[0].indexOf(Value);
			symbols.push({
				kind: "heading",
				qualifiedName: Value,
				span: { start: Start, end: Start + Value.length },
				fingerprint: `heading:${Value}`,
			});
		}
		const references: ReferenceNode[] = Targets(text).map((Token) => ({
			target: Token.text,
			span: Token.span,
		}));
		return { symbols, references, dependencies: [], certain: true };
	},
	rename(text: string, path: string, span: Span, to: string) {
		const From = text.slice(span.start, span.end);
		switch (true) {
			case From.length === 0:
				return undefined;
			default:
		}
		const edits: Span[] = Targets(text)
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
