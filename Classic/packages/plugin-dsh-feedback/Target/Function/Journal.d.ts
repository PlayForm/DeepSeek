import type FeedbackBlock from "../Interface/Block.js";
import type { Event } from "../Interface/Event.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Journal
 *
 * The durable log writer (Function/Journal): one JSON line per recorded
 * event, appended to the ledger file (one log per module, the family
 * convention).
 *
 * @remarks
 *
 * Best-effort: a ledger failure never breaks the service. The session and the
 * agent id are read from the block itself.
 */
declare function _default(State: State, Event: Event, Block: FeedbackBlock): void;
