/**
 * @module Blocks
 *
 * The generic text-block rewrite shared by the overpass arms.
 *
 * @remarks
 * Walk a content array, rewrite only the text blocks through the caller's
 * transform, and return the ORIGINAL array by identity when nothing changed.
 * The identity rule is the caller's no-op contract: an unchanged content
 * array must be indistinguishable from the input, so a copy is made only when
 * at least one block actually changed.
 *
 * The selection is deliberately narrow:
 *
 * - `type === "text"` and a string `text` field - the only rewritable shape.
 *   Tool-call/argument blocks carry execution-critical raw JSON, reasoning
 *   and image blocks are not the overpass's scope, and unknown block types
 *   are passed through untouched.
 * - The CCR marker guard - a text block whose content already carries the
 *   CCR spill marker (`<<<CCR:`) is a compressed replacement and passes
 *   through untouched. The guard makes the arm order-safe against the CCR
 *   hook's own prepended post-execute listener under any bundle load order.
 *
 * The transform is injected, not hardcoded: each flavor closes over its table
 * and configured replacement, read per call from State so a volatile hot-edit
 * lands on the next dispatch. It must be pure and total on any string and
 * returns the family's `{ text, count }` contract; `count === 0` keeps the
 * block by identity and contributes nothing to the accumulator.
 *
 * The accumulator is the caller's mutable `{ value }` box, so a step batch
 * sums the counts across every message before composing one ledger line. The
 * block shape is structural (only the two fields this function reads), so
 * each consumer's own ContentBlock union satisfies it without importing a
 * shared LLM type here.
 *
 * Pure per call: no module-level state, no mutation of the input blocks - a
 * changed block is a shallow copy with only `text` replaced, preserving the
 * rest of the block verbatim.
 */
type Block = {
    type?: unknown;
    text?: unknown;
};
export default _default;
declare function _default<T extends Block>(Content: readonly T[], Transform: (Text: string) => {
    text: string;
    count: number;
}, Count: {
    value: number;
}): T[];
