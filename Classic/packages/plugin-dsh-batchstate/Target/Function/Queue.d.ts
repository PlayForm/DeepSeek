import type State from "../Interface/State.js";
export default _default;
/**
 * @module Queue
 *
 * The idle-queue append: it enqueues one member at the tail (the plan's queue management: the
 * plugin holds the idle queue + the pair schedule).
 *
 * @remarks
 *
 * Idempotent: an already-queued id is a no-op (the queue position is unchanged). The append is
 * ledgered and emitted after the state is updated. Removal happens through setStatus's terminal
 * transition (Function/Status) - a removal shifts the remaining members up.
 */
declare function _default(State: State, Agent: string): void;
