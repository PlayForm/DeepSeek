/**
 * @module Allocation
 *
 * One money row of the attribution model: the direct half and the amortized
 * half per call and per path, plus the one unattributed row that absorbs the
 * shared remainder and keeps the conservation law.
 *
 * @remarks
 *
 * The row follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 2. The
 * direct half is the output side, weighted by changed bytes over the files the
 * step wrote; the amortized half is the input side, weighted by per-file
 * context mass. The conservation law holds that the sum of every row of a call
 * equals the call's CostTotal within 1e-9. CallId is null until the drain
 * assigns the ledger's own row id.
 */
export default interface Allocation {
    /**
     * The ledger's own call row id, null until the drain assigns it.
     */
    readonly CallId: number | null;
    /**
     * The attributed file path, null for the one unattributed row.
     */
    readonly Path: string | null;
    /**
     * The direct half: the output side weighted by changed bytes.
     */
    readonly DirectCost: number;
    /**
     * The amortized half: the input side weighted by per-file context mass.
     */
    readonly AmortizedCost: number;
    /**
     * The per-file context tokens the call carried.
     */
    readonly ContextTokens: number;
    /**
     * The call's whole surface tokens.
     */
    readonly SurfaceTokens: number;
    /**
     * The direct split's share weight for the path.
     */
    readonly Weight: number;
    /**
     * The attribution method string, `<direct>/<amortized>`.
     */
    readonly Method: string;
}
