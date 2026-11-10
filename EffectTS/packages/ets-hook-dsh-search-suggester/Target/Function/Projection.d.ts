/**
 * @module Projection
 *
 * The P2 GRAPH PROJECTION builder (the re-spec: the plan's generated repo
 * index becomes a projection of ctx.workspaceGraph; the graph supersedes the
 * hand-generated index, Completion-Spec 00-OVERVIEW section 6 and
 * 03-SUGGESTERS section 3).
 *
 * @remarks
 * The service is OPTIONAL and is PROBED through `ctx.get`, never injected: a
 * repo without the graph plugin must still emit (the neutral fallback), and
 * a graph mounted after this plugin's apply must still be found. One
 * `snapshot()` read produces the whole projection:
 *
 *   - the node facts: the normalized path, its kinds, its depth below the
 *     snapshot's common root, and its version-token rank;
 *   - the root: the common directory prefix of every node path (the
 *     workspace root for a full index), so a partial index still measures
 *     depth from its own base;
 *   - the revision: the graph's indexRevision, carried for the docs and the
 *     refresh test.
 *
 * The recency rank is the graph's own order - the version token the graph
 * stores per node (the fs version it indexed at) ranked across the snapshot,
 * NEVER a wall clock. A snapshot with no nodes, a missing service, a service
 * without `snapshot`, or a throwing read all yield `undefined`: the caller
 * then scores every candidate with the documented neutral literal 0.5 and
 * renders the static pack list (the PoC behavior, byte-identical).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Projection from "../Interface/Projection.js";
export default _default;
declare function _default(
/**
 * The plugin context (the optional-service probe).
 */
Context: Context): Projection | undefined;
