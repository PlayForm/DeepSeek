import type { ToolCatalog, ToolParam } from "../Interface/Execution.js";
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
    schemas: () => {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }[];
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
 * Extract the first sentence of a description: split at the first
 * sentence-ending punctuation (`.` / `!` / `?`) not inside parentheses, then
 * cap at 120 chars at a word boundary. Empty/whitespace results return null.
 */
export declare const FirstSentence: (Description: string) => string | null;
/**
 * The default a parameter declares: the `default` annotation when present, else
 * the "Defaults to X." sentence in its description. Undefined means the schema
 * states no default, and the note then renders the key without one.
 */
export declare const DefaultOf: (Parameter: ParameterNode | undefined) => string | undefined;
/**
 * Project a parameters object onto the full parameter surface, in the schema's
 * own declaration order (the order the model sees).
 */
export declare const ParamsOf: (Parameters: ParametersNode | undefined) => ToolParam[];
/**
 * The primary parameter key: the first REQUIRED key, else the first key. This
 * is the schema's own answer, not "whatever happens to be declared first" -
 * `edit` declares `file_path` first but requires `old_string` and `new_string`
 * as well, and `bash` requires both `description` and `command`.
 */
export declare const PrimaryOf: (Params: ToolParam[]) => string;
/**
 * The static fallback catalog: the generated table, projected through the SAME
 * path as the live fetch, so the fallback carries the harness's parameter
 * surface and defaults rather than a hand-maintained approximation.
 */
export declare const StaticCatalog: () => ToolCatalog;
export default _default;
/**
 * Fetch the tool catalog. `Tools` is the injected tools service (already
 * resolved; absent means the static fallback). `Log` receives the
 * fetch-failure ledger line when the live fetch fails.
 */
declare function _default(Tools: ToolsService | undefined, Log: (Message: string) => void): ToolCatalog;
