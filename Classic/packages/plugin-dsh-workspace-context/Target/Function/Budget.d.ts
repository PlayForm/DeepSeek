import type Packet from "../Interface/Packet.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Budget
 *
 * The packet's budget clamp (Function/Budget): build the text form, measure
 * it in tokens, and if it exceeds the target, drop the weakest NEIGHBORS
 * lines one by one until the packet fits the target or the neighbors run
 * out.
 *
 * @remarks
 *
 * The token measure is Function/Tokens: the harness tokenMeter where
 * available, else chars/4. The V4-1 contract: "the weakest neighbors are
 * dropped first". If the packet still exceeds the hard cap, truncate the
 * OPEN and EVIDENCE lines last and record the clamp in the ledger. Returns
 * the (possibly trimmed) packet.
 */
declare function _default(State: State, Item: Packet): Packet;
