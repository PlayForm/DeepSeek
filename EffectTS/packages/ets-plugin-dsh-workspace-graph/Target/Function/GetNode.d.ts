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
 * First match wins; ids are unique by construction. Sync, no I/O.
 */
declare function _default(StateRef: State, Id: string): Node | undefined;
