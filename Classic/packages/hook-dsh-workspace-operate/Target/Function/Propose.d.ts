import type Outcome from "../Interface/Outcome.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Propose
 *
 * The propose path: it runs the resolution rules and, on a pass, assigns the
 * id and sequence, stores and persists the proposal, and ledgers the line.
 *
 * @remarks
 *
 * On a pass the byte-stable `proposed <id> <kind> <path>` line is written. On
 * a refusal the Refused counter increments, the meta record persists, and the
 * line is `refused <kind> <path> (<reason>)`.
 *
 * The live-table bound (config maxProposals) is enforced here: a pass when
 * the table is full is refused `full` - never silently dropped, never an
 * oldest-evicted guess.
 */
declare function _default(State: State, Kind: Proposal["kind"], Input: unknown): Promise<Outcome>;
