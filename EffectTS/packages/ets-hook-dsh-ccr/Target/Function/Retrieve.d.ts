import type State from "../Interface/State.js";
export default _default;
/**
 * @module Retrieve
 *
 * The ccr_retrieve tool: the plugin's ONE registered ToolDefinition, the DSH
 * analog of Aphrodite's `aphrodite_retrieve(hash)` relay (R§3: the 13 relays
 * become 1).
 *
 * @remarks
 *
 * The model calls it with the hash from a marker to restore the original
 * bytes; the optional `range` applies a granular line slice (R:199-203:
 * prefer granular, batch retrievals) to the joined text. The contract:
 * - The hash is matched EXACTLY - no prefix or fuzzy matching (the marker
 *   contract's rule); the full 24-hex string must be supplied.
 * - An unknown or expired hash is a SELF-DESCRIBING error (the registry turns
 *   a thrown body into a failure result): the message tells the model the
 *   entry is gone and to re-run the original tool.
 * - Success returns the canonical value `{ hash, type, size, text }` - `text`
 *   is the original content's text blocks newline-joined (the marker's `size`
 *   still counts the FULL serialized bytes, so a range result is shorter);
 *   `render` projects the text verbatim, so the model sees the original
 *   bytes, not an envelope.
 * - Every hit refreshes the entry's lastAccessed (the LRU clock) and logs the
 *   retrieval; every miss logs the miss with its reason.
 *
 * The registration is READONLY after registration (the skill's rule): the
 * definition object is never mutated - this file only BUILDS it; the
 * registration call lives in Function/Apply (the wire-up, after the
 * post-execute listener). `exec.signal` is honored: the registry rejects a
 * pre-aborted invocation before the body runs, and the body rechecks.
 */
declare function _default(State: State): import("@deepseek-ai/dsh-tools").ToolDefinition;
