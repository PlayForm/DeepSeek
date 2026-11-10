import type State from "../Interface/State.js";
/**
 * @module Journal
 *
 * The durable log writer: one JSON line per prepared proposal, appended to the
 * ledger file (one log per module, the family convention).
 *
 * @remarks
 *
 * Best-effort: a ledger failure never breaks the service. Plan section 3: "a
 * ledger line for the proposal; nothing written" (to the targets - the
 * pass-on's own log is not a target write).
 *
 * The event is `prepared` for the prepare paths (the byte-stable line the PoC
 * shipped) and `delivered` for the inbox delivery (Function/Deliver) - the
 * second line answers "did the proposal reach the channel the board listens
 * on" from the ledger alone. The field order is the contract: at, event,
 * proposal, digest, targets, note.
 */
/**
 * The fields the journal line reads (satisfied by both proposal shapes).
 */
interface Record {
    id: string;
    digest: string;
    targets: readonly unknown[];
}
export default _default;
declare function _default(State: State, Proposal: Record | null, Note: string, Event?: string): void;
