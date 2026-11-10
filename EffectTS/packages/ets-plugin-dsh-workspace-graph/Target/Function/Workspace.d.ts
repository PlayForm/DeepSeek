import type IndexSummary from "../Interface/IndexSummary.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Workspace
 *
 * The `indexWorkspace` body: the INDEXING TRIGGER the family was missing.
 *
 * @remarks
 *
 * The body resolves the root through ctx.fs.resolve (the caller's path, else
 * "." - the backend's own cwd, the session working directory), walks the tree
 * deterministically (Function/Walk), and indexes every candidate by simply
 * calling the EXISTING per-file entry (Function/Index) - the gates are never
 * duplicated here: enabled, exclude, include, file type, language and size
 * all stay indexFile's. The counts are the per-file outcome tallies of this
 * run plus the file records the graph holds afterwards.
 *
 * The bound: `options.maxFiles`, else Config.maxFiles. When the walk stops at
 * the bound it ledgers the byte-exact `workspace capped at <n> files` line,
 * so a truncated index is never silent. Every run closes with the byte-exact
 * summary line `workspace indexed <n> files (<indexed> indexed, <skipped>
 * skipped, <failed> failed)`.
 *
 * A root that cannot be listed propagates the fs error to the caller (the
 * tool reports it); a failure BELOW the root is not fatal (Function/Walk).
 */
declare function _default(StateRef: State, Root?: string, Options?: {
    maxFiles?: number;
}): Promise<IndexSummary>;
