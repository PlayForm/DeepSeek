/**
 * @module Fetch
 *
 * The dynamic tool-catalog fetch (plan Part 3 §3.1). The instruction set is
 * "static text + dynamic tool description": the same way the model is provided
 * the tools, the coach fetches them from the harness's own registry via
 * `ctx.tools.schemas()` (the deep-cloned projection of the in-memory registry,
 * allowlisted to name/description/parameters) and embeds
 *
 *   - the tool name,
 *   - the FIRST SENTENCE of the description (hard cap 120 chars, split at
 *     sentence-ending punctuation not inside parentheses, cut at a word
 *     boundary),
 *   - the primary parameter key (the first key of parameters.properties).
 *
 * `parameters` itself is NEVER embedded (budget).
 *
 * Failure handling (the fail-open envelope): if the tools service is absent,
 * schemas() throws, or a mapped tool's description is missing, the catalog
 * degrades to the STATIC_TOOL_LINES table and the ledger carries
 * `schema fetch failed -> static fallback`. A note NEVER fails the waterfall.
 * `fetchLive: false` (the escape hatch) uses the static table unconditionally
 * and never logs a fetch-failure line.
 */
import type { ToolCatalog } from "../Interface/Execution.js";
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
 * Extract the first sentence of a description: split at the first
 * sentence-ending punctuation (`.` / `!` / `?`) not inside parentheses, then
 * cap at 120 chars at a word boundary. Empty/whitespace results return null.
 */
export declare const FirstSentence: (Description: string) => string | null;
/**
 * The static fallback catalog.
 */
export declare const StaticCatalog: () => ToolCatalog;
export default _default;
/**
 * Fetch the tool catalog. `Tools` is the injected tools service (already
 * resolved; absent means the static fallback). `Log` receives the
 * fetch-failure ledger line when the live fetch fails.
 */
declare function _default(Tools: ToolsService | undefined, Log: (Message: string) => void): ToolCatalog;
