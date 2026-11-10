import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
/**
 * @module Record
 *
 * Store a block in the session's council record and journal it (plan section
 * 2.1).
 *
 * @remarks
 *
 * Oversized text is capped, never dropped silently: the cap marker is appended
 * to the text and the journal line records the fact. The block is stored
 * UNREAD - the transfer never forces the reading.
 */
/**
 * Cap one text field; the marker records that a cap was applied.
 */
export declare const Cap: (Value: string, Bytes: number) => string;
export default _default;
declare function _default(State: State, Block: FeedbackBlock): void;
