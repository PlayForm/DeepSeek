import type { ToolCatalog } from "@Interface/Execution.js";
/** The tools-service surface Fetch needs (structural; the injected `tools`). */
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
/** The static fallback catalog. */
export declare const StaticCatalog: () => ToolCatalog;
export default _default;
/**
 * Fetch the tool catalog. `Tools` is the injected tools service (already
 * resolved; absent means the static fallback). `Log` receives the
 * fetch-failure ledger line when the live fetch fails.
 */
declare function _default(Tools: ToolsService | undefined, Log: (Message: string) => void): ToolCatalog;
