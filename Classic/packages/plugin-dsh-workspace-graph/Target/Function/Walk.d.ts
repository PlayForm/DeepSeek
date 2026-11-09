/**
 * @module Walk
 *
 * The deterministic directory walk behind `indexWorkspace`: a breadth-first descent from the
 * resolved root that yields the CANDIDATE file display paths in a stable order.
 *
 * @remarks
 * The rules, in the frozen order:
 *
 * 1. every listing is sorted by entry name (the backend already returns a stable order;
 *    sorting again makes the walk independent of it);
 * 2. an entry the backend does not report as inside the root is NEVER followed
 *    (`ctx.fs.contains` compares canonical target identities, so a symlink pointing out of
 *    the root - or a `..` escape - is rejected before anything is read). Such an entry is not
 *    a candidate and is not counted as skipped: it was never part of the workspace;
 * 3. a directory whose path matches an EXCLUDE pattern is not descended (its files are never
 *    candidates - the walk bound, not a per-file gate). Every candidate that IS yielded still
 *    passes `indexFile`'s own per-file gates (enabled, exclude, include, type, language,
 *    size);
 * 4. the walk stops after `Maximum` candidates; `capped` reports that a further candidate
 *    existed, so the caller can ledger the bound.
 *
 * A listing error BELOW the root is tolerated (an unreadable directory is skipped, never
 * fatal); a listing error AT the root propagates, because a typo'd root must fail loud instead
 * of reporting an honest-looking zero.
 */
import type State from "../Interface/State.js";
/** The minimal structural view of a resolved directory target. */
interface Target {
    targetKey: string;
    displayPath: string;
}
export default _default;
declare function _default(StateRef: State, Root: Target, Maximum: number): Promise<{
    candidates: string[];
    capped: boolean;
}>;
