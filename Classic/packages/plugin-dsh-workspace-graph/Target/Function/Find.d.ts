import type Node from "../Interface/Node.js";
import type Query from "../Interface/Query.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Find
 *
 * The find body: filter every mirror node by name, pattern and kind, then stop at the
 * limit.
 *
 * @remarks
 *
 * `name` matches exactly, `pattern` is a case-insensitive substring over the id and the
 * name, and `kind` filters on the node kind.
 *
 * The limit defaults to `Config.limitDefault` and is capped at `Config.limitMaximum`.
 */
declare function _default(StateRef: State, Query?: Query): Node[];
