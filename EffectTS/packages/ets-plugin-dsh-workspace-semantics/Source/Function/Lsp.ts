// Lsp - the PRIMARY TypeScript deepener (Function/Lsp): the harness's LSP
// seam (`ctx.lsp`, @deepseek-ai/dsh-lsp) answers the scope-resolved
// `findReferences` query the lexical scanner only approximates. THE SEAM HAS
// FOUR READ OPERATIONS ONLY - `goToDefinition`, `findReferences`,
// `goToImplementation`, `hover` - no symbol enumeration and no
// rename/WorkspaceEdit, so this deepener supplies the REFERENCE SET and the
// RENAME EDITS derived from it, while the SYMBOLS still come from the lexical
// adapter's declaration scan.
//
// THE API USED (the harness's normalized request/result, never JSON-RPC):
//
//   ctx.lsp.query({ operation: "findReferences", filePath, position,
//                   workspaceRoot }) -> { kind: "locations", locations, ... }
//
// with zero-based UTF-16 positions. One query runs per declared symbol (the
// cursor is the symbol's identifier offset inside its declaration span), and
// only same-file locations are kept: the semantic model is per file
// (ReferenceNode carries no path), so a cross-file location cannot be
// represented honestly and is dropped rather than guessed into the model.
//
// THE FALLBACK RULE (Interface/Deepening): an absent seam, a seam with no
// provider for the extension, a failed query, or a result that is not the
// `locations` variant is `undefined` - the lexical answer stands. The seam is
// PROBED (`ctx.get("lsp")`), never injected: the loader contract's `inject`
// stays ["pluginFactory", "fs"].
import { fileURLToPath } from "node:url";

import type Deepening from "@Interface/Deepening.js";
import type ReferenceNode from "@Interface/ReferenceNode.js";
import type RenamePlan from "@Interface/RenamePlan.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";

/** A zero-based UTF-16 cursor coordinate (the seam's wire convention). */
interface Cursor {
	line: number;
	character: number;
}

/** The structural slice of one resolved location the deepener reads. */
interface Location {
	uri: string;
	range: { start: Cursor; end: Cursor };
}

/** The structural slice of `ctx.lsp` the deepener consumes. */
interface Seam {
	query(request: {
		operation: "findReferences";
		filePath: string;
		position: Cursor;
		workspaceRoot: string;
	}): Promise<unknown>;
}

/** Probe the optional seam through ctx.get (never an inject accessor). */
const Probe = (Context: unknown): Seam | undefined => {
	const Service = (Context as { get?: (Name: string) => unknown } | null)?.get?.("lsp");
	switch (true) {
		case typeof (Service as { query?: unknown } | null)?.query !== "function":
			return undefined;
		default:
			return Service as Seam;
	}
};

/** The zero-based cursor of one character offset. */
const CursorOf = (Text: string, Offset: number): Cursor => {
	let Line = 0;
	let Start = 0;
	for (let Index = 0; Index < Offset && Index < Text.length; Index += 1) {
		switch (Text[Index]) {
			case "\n":
				Line += 1;
				Start = Index + 1;
				break;
			default:
		}
	}
	return { line: Line, character: Offset - Start };
};

/** The character offset of one zero-based cursor. */
const OffsetOf = (Text: string, At: Cursor): number => {
	let Line = 0;
	let Index = 0;
	while (Line < At.line && Index < Text.length) {
		switch (Text[Index]) {
			case "\n":
				Line += 1;
				break;
			default:
		}
		Index += 1;
	}
	return Math.min(Text.length, Index + Math.max(0, At.character));
};

/** The file path of a location URI; a non-file URI answers "". */
const PathOf = (Uri: string): string => {
	try {
		return fileURLToPath(Uri);
	} catch {
		return "";
	}
};

/** Whether a location belongs to the queried path (the same-file filter). */
const Same = (Uri: string, Path: string): boolean => {
	const File = PathOf(Uri);
	switch (true) {
		case File === "":
			return false;
		case File === Path:
			return true;
		default:
			return File.endsWith(Path) || Path.endsWith(File);
	}
};

/** The identifier's offset inside the symbol's declaration span. */
const Locate = (Text: string, Symbol: SymbolNode): number => {
	const Name = Symbol.qualifiedName.split(".").at(-1) ?? "";
	const At = Text.indexOf(Name, Symbol.span.start);
	return At >= 0 && At + Name.length <= Symbol.span.end ? At : Symbol.span.start;
};

/** One findReferences query; undefined when the seam cannot answer. */
const Ask = async (
	Seam: Seam,
	Root: string,
	Path: string,
	At: Cursor,
): Promise<Location[] | undefined> => {
	try {
		const Result = (await Seam.query({
			operation: "findReferences",
			filePath: Path,
			position: At,
			workspaceRoot: Root,
		})) as { kind?: unknown; locations?: unknown } | null;
		switch (true) {
			case Result?.kind !== "locations" || !Array.isArray(Result.locations):
				return undefined;
			default:
				return Result.locations as Location[];
		}
	} catch {
		return undefined;
	}
};

export default {
	name: "lsp",
	extensions: [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"],
	async references(
		Context: unknown,
		Root: string,
		Path: string,
		Text: string,
		Symbols: SymbolNode[],
	): Promise<ReferenceNode[] | undefined> {
		const Seam = Probe(Context);
		switch (true) {
			case Seam === undefined:
				return undefined;
			case Symbols.length === 0:
				// Nothing to resolve: the lexical list (also empty) stands, and
				// the seam is never asked a question it cannot answer.
				return undefined;
			default:
		}
		const References: ReferenceNode[] = [];
		const Seen = new Set<string>();
		for (const Symbol of Symbols) {
			const Locations = await Ask(Seam, Root, Path, CursorOf(Text, Locate(Text, Symbol)));
			switch (true) {
				case Locations === undefined:
					// The seam failed mid-file: the whole answer is the lexical
					// list - never a half-deepened mixture.
					return undefined;
				default:
			}
			for (const Location of Locations ?? []) {
				if (!Same(Location.uri, Path)) {
					continue;
				}
				const Start = OffsetOf(Text, Location.range.start);
				const End = OffsetOf(Text, Location.range.end);
				const Key = `${Start}:${End}`;
				switch (true) {
					case Seen.has(Key):
						break;
					default:
						Seen.add(Key);
						References.push({
							target: Symbol.qualifiedName,
							span: { start: Start, end: End },
						});
				}
			}
		}
		return References;
	},
	async rename(
		Context: unknown,
		Root: string,
		Path: string,
		Text: string,
		Range: Span,
		To: string,
	): Promise<RenamePlan | undefined> {
		const From = Text.slice(Range.start, Range.end);
		switch (true) {
			case !/^[A-Za-z_$][\w$]*$/.test(From):
				return undefined;
			default:
		}
		const Seam = Probe(Context);
		switch (true) {
			case Seam === undefined:
				return undefined;
			default:
		}
		const Locations = await Ask(Seam, Root, Path, CursorOf(Text, Range.start));
		switch (true) {
			case Locations === undefined:
				return undefined;
			default:
		}
		const edits: Span[] = [];
		for (const Location of Locations ?? []) {
			if (!Same(Location.uri, Path)) {
				continue;
			}
			edits.push({
				start: OffsetOf(Text, Location.range.start),
				end: OffsetOf(Text, Location.range.end),
			});
		}
		switch (true) {
			case edits.length === 0:
				// No same-file use sites: the adapter's plan (and its own
				// refusal) stands rather than an empty plan.
				return undefined;
			default:
		}
		return {
			path: Path,
			from: From,
			to: To,
			edits,
			certainty: "references" as const,
		};
	},
} satisfies Deepening;
