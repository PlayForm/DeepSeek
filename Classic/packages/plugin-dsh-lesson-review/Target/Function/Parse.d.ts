/**
 * @module Parse
 *
 * The strict reply parser: one JSON object, a closed operation set, and nothing repaired.
 *
 * @remarks
 * THE FAILURE MODE THIS PREVENTS: a lenient parser. A reviewer that answers
 * with prose, a fenced block, or an operation kind nobody implemented must
 * be a FAILED review, not a silently empty one - an empty proposal and a
 * broken reply look identical to the lifecycle, and the difference is the
 * only signal that the prompt or the route needs attention.
 *
 * THREE TOLERANCES, all deliberate and all bounded:
 *
 * - a ```json fence (models add one reflexively) - stripped, because the
 *   content is otherwise exactly the contract;
 * - surrounding prose - sliced to the outermost object, because a one-line
 *   preamble carries no meaning for the judge;
 * - a missing `ops` on an otherwise valid object - read as "no
 *   operations", which is the same answer as the explicit `Nothing to
 *   save.`.
 *
 * EVERYTHING ELSE IS REFUSED: an unknown `op`, a non-string name, a
 * `support` without a `file`, or more operations than the cap.
 */
import type { Operation, Proposal } from "@Interface/Proposal.js";
/**
 * The closed operation set (the judge's vocabulary; Parse owns admission).
 */
export declare const Operations: readonly Operation[];
/**
 * The parse result: a proposal, or the reason there is none.
 */
export type ParseResult = {
    ok: true;
    proposal: Proposal;
} | {
    ok: false;
    error: string;
};
export default _default;
declare function _default(Reply: string, MaxProposals: number): ParseResult;
