/**
 * @module Classify
 *
 * The reduced 7-type classifier plus the error override.
 *
 * @remarks
 * The plan §2.2: Aphrodite's 30-type taxonomy is proxy-shaped; DSH needs 7.
 * The verdict order:
 *
 *   1. `error` - a FAILURE result is always type `error` (the ×8 tier: errors
 *      are high-signal, compress late) when compressFailures is on; a
 *      passing-through failure is never classified;
 *   2. the NAME table - the tool name's type, seeded from Aphrodite's tiers:
 *        bash        → terminal   (the terminal family; exit-code preview)
 *        grep        → grep       (match lists)
 *        search      → grep       (the search family is grep-shaped output)
 *        glob        → paths      (path lists)
 *        list        → paths      (path lists)
 *        read        → file       (file slices; full-content hash so
 *                                  retrieval restores the bytes)
 *        web_fetch   → web
 *        web_search  → web
 *   3. the SHAPE fallback - any OTHER gated tool name (the targets list is
 *      user-extendable): content whose joined text parses as a JSON object
 *      or array is `json`; anything else is `default`.
 *
 * The verdict feeds the gate's multiplier lookup (the `multipliers` map:
 * terminal, error, grep, paths, file, json, web, default) and the preview
 * builder (Function/Preview). Pure - no I/O, no clock.
 */
import type { ContentBlock } from "@deepseek-ai/dsh-llm";
/**
 * The joined TEXT of the content blocks (the text blocks' text, newline-
 * joined; non-text blocks fall through to their JSON projection). Shared by
 * the classifier's shape fallback and the preview builders.
 */
export declare const Text: (Content: ContentBlock[]) => string;
export default _default;
declare function _default(Name: string, IsError: boolean, Content: ContentBlock[]): string;
