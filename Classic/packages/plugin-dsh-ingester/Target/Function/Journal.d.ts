import type State from "../Interface/State.js";
export default _default;
/**
 * @module Journal
 *
 * The durable log writer (Function/Journal): one JSON line per apply event,
 * appended to the ledger file (one log per module, the family convention).
 *
 * @remarks
 *
 * Best-effort: a ledger failure never breaks the service. The plan section 4:
 * "the journal record before and after; the ledger line per target".
 */
declare function _default(State: State, Event: string, ProposalId: string, Path: string, Detail: string): void;
