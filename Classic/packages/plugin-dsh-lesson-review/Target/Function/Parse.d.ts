import type { Operation, Proposal } from "../Interface/Proposal.js";
/** The closed operation set (the judge's vocabulary; Parse owns admission). */
export declare const Operations: readonly Operation[];
/** The parse result: a proposal, or the reason there is none. */
export type ParseResult = {
    ok: true;
    proposal: Proposal;
} | {
    ok: false;
    error: string;
};
export default _default;
declare function _default(Reply: string, MaxProposals: number): ParseResult;
