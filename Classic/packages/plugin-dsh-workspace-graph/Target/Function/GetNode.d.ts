import type Node from "../Interface/Node.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module GetNode
 *
 * The getNode body: a linear scan over the mirror's nodes by id.
 *
 * @remarks
 *
 * The first match wins, because ids are unique by construction. The scan is synchronous
 * and performs no I/O.
 */
declare function _default(StateRef: State, Id: string): Node | undefined;
