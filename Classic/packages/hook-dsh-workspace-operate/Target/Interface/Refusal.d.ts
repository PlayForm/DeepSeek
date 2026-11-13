/**
 * @module Refusal
 *
 * The REFUSAL-TO-GUESS made explicit: a first class result, never a thrown
 * string and never a guessed proposal.
 *
 * @remarks
 *
 * The resolution rules (Function/Rules.ts) return either a Proposal or a
 * Refusal; the reason vocabulary is frozen below and the tool renders the
 * detail verbatim.
 *
 * The frozen reasons:
 *
 *   - graph-unavailable - the workspaceGraph service is not mounted; the
 *     rules refuse rather than guess without it.
 *   - unknown-symbol - the rename/connect endpoint is not in the graph.
 *   - name-collision - the new name already exists in the same file.
 *   - duplicate-edge - the connect edge already exists.
 *   - incompatible-edge - the edge kind cannot connect those node kinds.
 *   - missing-version - no version fence was supplied.
 *   - stale-version - the fence contradicts the hook's own observed
 *     version or the fs stat.
 *   - span-beyond-file - the replace span does not fit the file.
 *   - bad-request - the input is not shaped as the kind requires.
 *   - full - the proposal table is at config maxProposals.
 *   - disabled - the hook is disabled (enabled=false); the call-time master
 *     switch refuses before any rule runs, with ZERO ledger lines.
 */
export default interface Refusal {
    /**
     * The kind the input claimed (never guessed into another kind).
     */
    kind: "rename" | "connect" | "replace" | "unknown";
    /**
     * The frozen reason (see the module remarks).
     */
    reason: string;
    /**
     * The human detail (rendered verbatim by the tool).
     */
    detail: string;
}
