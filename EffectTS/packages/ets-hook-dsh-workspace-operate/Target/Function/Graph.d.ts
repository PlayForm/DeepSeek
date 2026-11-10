/**
 * @module Graph
 *
 * The probe-once workspaceGraph seam: the resolution rules' data source.
 *
 * @remarks
 * The service is probed through `ctx.get("workspaceGraph")` exactly once per
 * State lifetime and cached in State.Graph; an ABSENT service is a
 * legitimate state (the graph package may not be mounted) - the rules answer
 * with the `graph-unavailable` refusal, they never guess without the graph.
 * A PRESENT service that fails the structural shape check is treated as
 * absent for the same reason: a half-mounted graph is worse than an honest
 * refusal.
 */
import type { GraphHandle } from "../Interface/Graph.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State): GraphHandle | undefined;
