/**
 * @module Extract
 *
 * The proposal extraction: from one tool execution to the proposal record the
 * gate evaluates.
 *
 * @remarks
 * When the operate family attached its record (`arguments.proposal`) the
 * record is used as-is (validated field by field, never guessed); otherwise a
 * MINIMAL proposal is synthesized from the call itself - kind = tool name,
 * target = the first of the path-ish argument keys, holder = the agent
 * identity, operation / parent / category from the call's identifiers (the
 * recursion-prevention fields are NEVER left empty), declared = false (the
 * lenient reading: the contributes obligation evaluates "n/a").
 */
import type Proposal from "../Interface/Proposal.js";
export default _default;
declare function _default(Exec: {
    name?: string;
    callId?: string;
    rootCallId?: string;
    arguments?: unknown;
    agent?: unknown;
}): Proposal;
