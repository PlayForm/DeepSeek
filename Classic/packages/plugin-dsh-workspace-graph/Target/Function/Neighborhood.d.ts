/**
 * @module Neighborhood
 *
 * The connected component around an anchor file, the read query that the graph-suggester's
 * declared contract consumes (`ctx.workspaceGraph.neighborhood(path, limit)`).
 *
 * @remarks
 * The component is synchronous and derived ONLY from the W1 graph: the anchor (definition),
 * the files with an `imports` edge into it (importers, split into tests by the test-path
 * pattern), the files the anchor imports (dependencies), and the DocSections in the anchor's
 * own file (the doc block).
 *
 * The anchor is matched by exact display path first, then by path SUFFIX - the caller (a
 * tool probe) usually carries a repo-relative path while the graph stores resolved display
 * paths. No anchor, no entries: an unknown path is an empty component, never a guessed one.
 * Entries are deduplicated by path (the strongest role wins), ordered by role rank and then
 * by path, and sliced to `limit` (default 7 - the suggester's maxCandidates default).
 *
 * NOT FAKED: callers and references need the deferred `calls`/`references` edges; W1 serves
 * importers only, and says so in SCHEME.md.
 */
import type Neighborhood from "../Interface/Neighborhood.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(StateRef: State, Path: string, Limit?: number): Neighborhood[];
