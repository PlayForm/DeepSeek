// Fetch - the dynamic tool-catalog fetch (plan Part 3 §3.1). The instruction
// set is "static text + dynamic tool description": the same way the model is
// provided the tools, the coach fetches them from the harness's own registry
// via `ctx.tools.schemas()` (the deep-cloned projection of the in-memory
// registry, allowlisted to name/description/parameters) and embeds
//   - the tool name,
//   - the FIRST SENTENCE of the description (hard cap 120 chars, split at
//     sentence-ending punctuation not inside parentheses, cut at a word
//     boundary),
//   - the primary parameter key (the first key of parameters.properties).
// `parameters` itself is NEVER embedded (budget).
//
// Failure handling (the fail-open envelope): if the tools service is absent,
// schemas() throws, or a mapped tool's description is missing, the catalog
// degrades to the STATIC_TOOL_LINES table and the ledger carries
// `schema fetch failed -> static fallback`. A note NEVER fails the waterfall.
// `fetchLive: false` (the escape hatch) uses the static table unconditionally
// and never logs a fetch-failure line.
import type { ToolCatalog, ToolEntry } from "@Interface/Execution.js";
import { STATIC_TOOL_LINES } from "@Variable/Notes.js";

/** The tools-service surface Fetch needs (structural; the injected `tools`). */
export interface ToolsService {
	schemas: () => { name: string; description: string; parameters: Record<string, unknown> }[];
}

/**
 * Extract the first sentence of a description: split at the first
 * sentence-ending punctuation (`.` / `!` / `?`) not inside parentheses, then
 * cap at 120 chars at a word boundary. Empty/whitespace results return null.
 */
export const FirstSentence = (Description: string): string | null => {
	const Text = Description.trim();
	if (!Text) {
		return null;
	}
	let End = Text.length;
	let Depth = 0;
	for (let Index = 0; Index < Text.length; Index += 1) {
		const Char = Text[Index];
		if (Char === "(") {
			Depth += 1;
		} else if (Char === ")") {
			Depth = Math.max(0, Depth - 1);
		} else if (Depth === 0 && (Char === "." || Char === "!" || Char === "?")) {
			End = Index + 1;
			break;
		}
	}
	let Sentence = Text.slice(0, End).trim();
	if (Sentence.length > 120) {
		const Cut = Sentence.lastIndexOf(" ", 120);
		Sentence = Sentence.slice(0, Cut > 0 ? Cut : 120).trim();
	}
	return Sentence || null;
};

/** The primary parameter key of a schema's parameters object. */
const PrimaryParam = (Parameters: Record<string, unknown>): string => {
	const Properties = Parameters?.["properties"] as Record<string, unknown> | undefined;
	if (Properties && typeof Properties === "object") {
		const Keys = Object.keys(Properties);
		if (Keys.length > 0) {
			return Keys[0] ?? "";
		}
	}
	return "";
};

/** The static fallback catalog. */
export const StaticCatalog = (): ToolCatalog => {
	const Tools = new Map<string, ToolEntry>();
	for (const [Name, Line] of Object.entries(STATIC_TOOL_LINES)) {
		Tools.set(Name, { description: Line.description, param: Line.param });
	}
	return { source: "static", tools: Tools };
};

/**
 * Fetch the tool catalog. `Tools` is the injected tools service (already
 * resolved; absent means the static fallback). `Log` receives the
 * fetch-failure ledger line when the live fetch fails.
 */
export default (Tools: ToolsService | undefined, Log: (Message: string) => void): ToolCatalog => {
	const Fallback = (): ToolCatalog => {
		Log("schema fetch failed -> static fallback");
		return StaticCatalog();
	};
	if (!Tools || typeof Tools.schemas !== "function") {
		return Fallback();
	}
	try {
		const Schemas = Tools.schemas();
		if (!Array.isArray(Schemas)) {
			return Fallback();
		}
		const Tools_ = new Map<string, ToolEntry>();
		for (const Schema of Schemas) {
			if (!Schema || typeof Schema.name !== "string") {
				continue;
			}
			const Sentence =
				typeof Schema.description === "string" ? FirstSentence(Schema.description) : null;
			if (!Sentence) {
				continue; // no description -> the static line covers this tool
			}
			Tools_.set(Schema.name, {
				description: Sentence,
				param:
					PrimaryParam(Schema.parameters) || STATIC_TOOL_LINES[Schema.name]?.param || "",
			});
		}
		if (Tools_.size === 0) {
			return Fallback();
		}
		// Unmapped known tools keep their static lines as a baseline.
		for (const [Name, Line] of Object.entries(STATIC_TOOL_LINES)) {
			if (!Tools_.has(Name)) {
				Tools_.set(Name, { description: Line.description, param: Line.param });
			}
		}
		return { source: "live", tools: Tools_ };
	} catch {
		return Fallback();
	}
};
