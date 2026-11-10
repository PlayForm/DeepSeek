/**
 * @module Render
 *
 * The block text (plan section 1).
 *
 * @remarks
 * The format is fixed so the transfer stays mechanical: the parents parse the
 * SAME format and append their deltas; the honest content is never rewritten.
 */
import type FeedbackBlock from "../Interface/Block.js";
export default _default;
declare function _default(Block: FeedbackBlock, MaxBlockBytes: number): string;
