/**
 * @module Lookup
 *
 * The symbol lookup: an exact qualified-name match within the path's built
 * model.
 *
 * @remarks
 * The match is exact within the path's built model. No index entry is NO
 * lookup: the caller resolves first (a read path never silently builds).
 */
import type State from "../Interface/State.js";
import type SymbolNode from "../Interface/SymbolNode.js";
export default _default;
declare function _default(State: State, Path: string, QualifiedName: string): SymbolNode | undefined;
