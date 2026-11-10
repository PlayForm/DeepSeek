/**
 * @module Parse
 *
 * The reverse of Render: extract a FeedbackBlock from transferred text.
 *
 * @remarks
 * The input is an inbox splice body. A parse miss is a silent no-op - only a matching block is
 * recorded; nothing is ever invented from partial text.
 */
import type FeedbackBlock from "../Interface/Block.js";
export default _default;
/**
 * Parse the FIRST honest-feedback block in the text, or null.
 */
declare function _default(Text: string): FeedbackBlock | null;
