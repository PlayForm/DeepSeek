import type State from "../Interface/State.js";
export default _default;
/**
 * @module Status
 *
 * The write API's setStatus: the state transition (idle -> active -> completed -> failed ->
 * interrupted; the queue movements).
 *
 * @remarks
 *
 * A terminal status (completed/failed/interrupted) stamps finishedAt once, drops the member from
 * the queue (the members behind shift up), and appends the completion to the bounded ring (the
 * oldest drop is implicit - the ring is compact by contract, plan section 3 item 5). A reactivation
 * to active clears finishedAt. The transition is ledgered and emitted AFTER the state is updated.
 */
declare function _default(State: State, Agent: string, Status: string): void;
