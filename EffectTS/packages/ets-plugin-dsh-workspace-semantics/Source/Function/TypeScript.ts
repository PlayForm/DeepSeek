// TypeScript - the default TypeScript adapter (Function/TypeScript), the
// seed of the adapter registry. A LIGHT LEXICAL SCAN, deliberately: no
// language-service dependency in the PoC (ctx.lsp's four read operations
// carry no rename/WorkspaceEdit; the language adapters deepen in the
// end-phase). It extracts the v0 symbol kinds from declarations, the
// references as qualified-name word occurrences outside its own
// declarations, and the dependencies from import specifiers. The certainty
// is "true": the scan is deterministic for ordinary content.
import type Adapter from "@Interface/Adapter.js";
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";

/** The v0 declaration pattern: kind keyword then the name. */
const Declaration = /\b(function|class|interface|type|const)\s+([A-Za-z_$][\w$]*)/g;

/** A qualified-name-shaped word used outside a declaration. */
const Word = /[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+/g;

/** A quoted import specifier. */
const Import = /(?:from|import)\s*["']([^"']+)["']/g;

const Name: Record<string, SymbolNode["kind"]> = {
	function: "function",
	class: "class",
	interface: "interface",
	type: "type",
	const: "const",
};

export default {
	extensions: [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"],
	scan(text: string, _path: string) {
		const symbols: SymbolNode[] = [];
		const declared = new Set<string>();
		for (const Match of text.matchAll(Declaration)) {
			// The capture groups are always present (the regex has no optional
			// groups); the guards only satisfy the checker.
			const Kind = Name[Match[1] ?? ""] as SymbolNode["kind"];
			const NameToken = Match[2] ?? "";
			const Index = Match.index ?? 0;
			declared.add(NameToken);
			symbols.push({
				kind: Kind,
				qualifiedName: NameToken,
				span: { start: Index, end: Index + Match[0].length },
				fingerprint: `${Kind}:${NameToken}`,
			});
		}
		const references: ReferenceNode[] = [];
		for (const Match of text.matchAll(Word)) {
			const Index = Match.index ?? 0;
			const Head = Match[0].split(".")[0] ?? "";
			if (!declared.has(Head)) {
				continue;
			}
			references.push({
				target: Match[0],
				span: { start: Index, end: Index + Match[0].length },
			});
		}
		const dependencies: string[] = [];
		for (const Match of text.matchAll(Import)) {
			dependencies.push(Match[1] ?? "");
		}
		return {
			symbols,
			references,
			dependencies,
			certain: true,
		};
	},
	rename(text: string, path: string, span: Span, to: string) {
		// The identifier at the span is the text slice itself: the caller
		// points at the use site it wants renamed. Certainty is
		// "references": the plan rewrites every identifier occurrence whose
		// head matches, which is the reference list's reach, not an exact
		// scope analysis.
		const From = text.slice(span.start, span.end);
		if (!/^[A-Za-z_$][\w$]*$/.test(From)) {
			return undefined;
		}
		const edits: Span[] = [];
		const Pattern = new RegExp(
			`\\b${From.replace(/\$/g, "\\$")}(?:\\.[A-Za-z_$][\\w$]*)*\\b`,
			"g",
		);
		for (const Match of text.matchAll(Pattern)) {
			const Index = Match.index ?? 0;
			edits.push({ start: Index, end: Index + From.length });
		}
		if (edits.length === 0) {
			return undefined;
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
