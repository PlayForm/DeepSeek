/**
 * @module Expand
 *
 * The expand body: a breadth-first walk from the start node over outgoing edges only.
 *
 * @remarks
 * The walk is kind-filtered and bounded by depth (default 1, capped at 3). `nodes`
 * carries the start node first, then every reached node in visit order; `edges` carries
 * the traversed edges.
 *
 * Each reachable node is visited once (the cycle guard), so an edge back to a visited
 * node is not duplicated. An unknown id returns an empty expansion.
 */
import type { EdgeKind } from "../Interface/Edge.js";
import type Expansion from "../Interface/Expansion.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(StateRef: State, Id: string, Options?: {
    kinds?: EdgeKind[];
    depth?: number;
}): Expansion;
