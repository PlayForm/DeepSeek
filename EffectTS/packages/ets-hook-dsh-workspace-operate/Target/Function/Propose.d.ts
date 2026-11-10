import type Outcome from "../Interface/Outcome.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Propose
 *
 * The propose path: runs the resolution rules (Function/Rules) and, on a
 * pass, assigns the id and sequence, stores the proposal, persists it, and
 * ledgers the byte-stable `proposed <id> <kind> <path>` line.
 *
 * @remarks
 *
 * On a refusal the Refused counter increments, the meta record persists, and
 * the line is `refused <kind> <path> (<reason>)`.
 *
 * The live-table bound (config maxProposals) is enforced here: a pass when
 * the table is full is refused `full` - never silently dropped, never an
 * oldest-evicted guess.
 */
declare function _default(State: State, Kind: Proposal["kind"], Input: unknown): Promise<Outcome>;
