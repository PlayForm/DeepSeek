import type { ToolCatalog, ToolEntry, ToolParam } from "@Interface/Execution.js";
import { CATALOG } from "@Variable/Catalog.js";

/**
 * @module Fetch
 *
 * The dynamic tool-catalog fetch: the same way the model is provided the tools,
 * the coach fetches them from the harness's own registry and embeds their names,
 * descriptions and FULL parameter surfaces.
 *
 * @remarks
 *
 * Plan Part 3 §3.1. The instruction set is "static text + dynamic tool data":
 * the coach fetches the tools via `ctx.tools.schemas()` (the deep-cloned
 * projection of the in-memory registry, allowlisted to
 * name/description/parameters) and embeds
 *   - the tool name,
 *   - the FIRST SENTENCE of the description (hard cap 120 chars, split at
 *     sentence-ending punctuation not inside parentheses, cut at a word
 *     boundary),
 *   - EVERY parameter key, with its requiredness and its declared default.
 *
 * WHY THE WHOLE SURFACE: a note that names only the first parameter tells the
 * model how to make the one call that cannot answer the question. The canonical
 * failure is `head -40` on a 45k-line log: the note named `read` with
 * `file_path`, and the one call shape that reads lines 45200-45240 is
 * `read { file_path, offset, limit }` - the two keys the old projection threw
 * away. The harness states each default as a sentence on the parameter
 * ("Defaults to 1.", "Defaults to 2000." - the house convention across
 * packages/*\/tool-*), and the schema DSL also carries an optional `default`
 * annotation, so both carriers are read here and the annotation wins.
 *
 * The static table (Variable/Catalog) is GENERATED from the harness's own
 * `docs/tool-catalog.md` by Maintain/Generate/Catalog, so the fallback carries
 * the same shape as the live fetch and one projection serves both: this module
 * is the only place that decides what a default means.
 *
 * Failure handling (the fail-open envelope): if the tools service is absent,
 * schemas() throws, or a mapped tool's description is missing, the catalog
 * degrades to the generated table and the ledger carries
 * `schema fetch failed -> static fallback`. A note NEVER fails the waterfall.
 * `fetchLive: false` (the escape hatch) uses the static table unconditionally
 * and never logs a fetch-failure line.
 */
/**
 * The tools-service surface Fetch needs (structural; the injected `tools`).
 */
export interface ToolsService {
	schemas: () => { name: string; description: string; parameters: Record<string, unknown> }[];
}

/**
 * One parameter node as the projection reads it: the JSON Schema property
 * (`description` + optional `default` annotation).
 */
export interface ParameterNode {
	description?: unknown;
	default?: unknown;
}

/**
 * The shape the projection needs from a parameters object (live JSON Schema or
 * the generated table - both are structurally identical here).
 */
export interface ParametersNode {
	properties?: Record<string, ParameterNode | undefined>;
	required?: unknown;
}

/**
 * The "Defaults to X." sentence the harness states on a parameter.
 */
const DEFAULT_CLAUSE = /\bDefaults? to\s+([^.;\n]+)/i;

/**
 * A clause that is a continuation, not a value: `Defaults to and is capped by
 * configuration.` states no default, so it must not be rendered as one.
 */
const CONTINUATION = /^(and|or|but|when|unless|where)\b/i;

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

/**
 * The default a parameter declares: the `default` annotation when present, else
 * the "Defaults to X." sentence in its description. Undefined means the schema
 * states no default, and the note then renders the key without one.
 */
export const DefaultOf = (Parameter: ParameterNode | undefined): string | undefined => {
	if (Parameter === undefined) {
		return undefined;
	}
	if (Parameter.default !== undefined && Parameter.default !== null) {
		return String(Parameter.default);
	}
	if (typeof Parameter.description !== "string") {
		return undefined;
	}
	const Match = DEFAULT_CLAUSE.exec(Parameter.description);
	if (Match === null) {
		return undefined;
	}
	const Value = Match[1]?.trim() ?? "";
	return Value.length === 0 || CONTINUATION.test(Value) ? undefined : Value;
};

/**
 * Project a parameters object onto the full parameter surface, in the schema's
 * own declaration order (the order the model sees).
 */
export const ParamsOf = (Parameters: ParametersNode | undefined): ToolParam[] => {
	const Properties = Parameters?.properties ?? {};
	const Required = new Set(
		Array.isArray(Parameters?.required)
			? (Parameters?.required as unknown[]).filter(
					(Name): Name is string => typeof Name === "string",
				)
			: [],
	);
	return Object.entries(Properties).map(([Name, Node]) => {
		const Value = DefaultOf(Node);
		return {
			name: Name,
			required: Required.has(Name),
			...(Value === undefined ? {} : { default: Value }),
		};
	});
};

/**
 * The primary parameter key: the first REQUIRED key, else the first key. This
 * is the schema's own answer, not "whatever happens to be declared first" -
 * `edit` declares `file_path` first but requires `old_string` and `new_string`
 * as well, and `bash` requires both `description` and `command`.
 */
export const PrimaryOf = (Params: ToolParam[]): string =>
	Params.find((Param) => Param.required)?.name ?? Params[0]?.name ?? "";

/**
 * One entry from a description and a parameters object (live or generated).
 */
const Entry = (Description: string, Parameters: ParametersNode | undefined): ToolEntry => {
	const Params = ParamsOf(Parameters);
	return {
		description: FirstSentence(Description) ?? "",
		param: PrimaryOf(Params),
		params: Params,
	};
};

/**
 * The static fallback catalog: the generated table, projected through the SAME
 * path as the live fetch, so the fallback carries the harness's parameter
 * surface and defaults rather than a hand-maintained approximation.
 */
export const StaticCatalog = (): ToolCatalog => {
	const Tools = new Map<string, ToolEntry>();
	for (const [Name, Tool] of Object.entries(CATALOG)) {
		Tools.set(Name, Entry(Tool.description, Tool.parameters));
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
			const Entry_ = Entry(
				Schema.description,
				Schema.parameters as unknown as ParametersNode,
			);
			if (!Entry_.description) {
				continue; // no description -> the static line covers this tool
			}
			Tools_.set(Schema.name, Entry_);
		}
		if (Tools_.size === 0) {
			return Fallback();
		}
		// Unmapped known tools keep their generated lines as a baseline.
		for (const [Name, Tool] of Object.entries(CATALOG)) {
			if (!Tools_.has(Name)) {
				Tools_.set(Name, Entry(Tool.description, Tool.parameters));
			}
		}
		return { source: "live", tools: Tools_ };
	} catch {
		return Fallback();
	}
};
