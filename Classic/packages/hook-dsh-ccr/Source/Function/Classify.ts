// Classify - the REDUCED 7-type classifier (the plan §2.2: Aphrodite's
// 30-type taxonomy is proxy-shaped; DSH needs 7) plus the error override.
// Verdict order:
//
//   1. `error`  - a FAILURE result is always type `error` (the ×8 tier:
//                 errors are high-signal, compress late) when
//                 compressFailures is on; a passing-through failure is never
//                 classified;
//   2. the NAME table - the tool name's type, seeded from Aphrodite's tiers:
//        bash        → terminal   (the terminal family; exit-code preview)
//        grep        → grep       (match lists)
//        search      → grep       (the search family is grep-shaped output)
//        glob        → paths      (path lists)
//        list        → paths      (path lists)
//        read        → file       (file slices; full-content hash so
//                                  retrieval restores the bytes)
//        web_fetch   → web
//        web_search  → web
//   3. the SHAPE fallback - any OTHER gated tool name (the targets list is
//        user-extendable): content whose joined text parses as a JSON object
//        or array is `json`; anything else is `default`.
//
// The verdict feeds the gate's multiplier lookup (the `multipliers` map:
// terminal, error, grep, paths, file, json, web, default) and the preview
// builder (Function/Preview). Pure - no I/O, no clock.
import type { ContentBlock } from "@deepseek-ai/dsh-llm";

// The joined TEXT of the content blocks (the text blocks' text, newline-
// joined; non-text blocks fall through to their JSON projection). Shared by
// the classifier's shape fallback and the preview builders.
export const Text = (Content: ContentBlock[]): string => {
	const Parts = Content.filter((Block) => Block.type === "text").map(
		(Block) => Block.text,
	);
	switch (true) {
		case Parts.length > 0:
			return Parts.join("\n");
		default:
			return JSON.stringify(Content);
	}
};

export default (Name: string, IsError: boolean, Content: ContentBlock[]): string => {
	switch (true) {
		case IsError:
			return "error";
	}
	switch (Name) {
		case "bash":
			return "terminal";
		case "grep":
		case "search":
			return "grep";
		case "glob":
		case "list":
			return "paths";
		case "read":
			return "file";
		case "web_fetch":
		case "web_search":
			return "web";
	}
	// The shape fallback (the gate already let the name through).
	switch (true) {
		case isJson(Text(Content)):
			return "json";
		default:
			return "default";
	}
};

// The JSON probe: a joined text whose WHOLE body parses into an object or an
// array (scalars and strings stay `default` - a JSON-looking string is
// usually terminal or file output).
const isJson = (Text: string): boolean => {
	switch (true) {
		case Text.length === 0:
			return false;
		case Text[0] !== "{" && Text[0] !== "[":
			return false;
	}
	try {
		const Parsed: unknown = JSON.parse(Text);
		return typeof Parsed === "object" && Parsed !== null;
	} catch {
		return false;
	}
};
