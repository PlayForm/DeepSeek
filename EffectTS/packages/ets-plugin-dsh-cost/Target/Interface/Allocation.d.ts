/**
 * @module Allocation
 *
 * One money row of the attribution model (Documentation/Plans/
 * COST-TRACK-PLUGIN.md section 2): the direct half (the output side,
 * weighted by changed bytes over the files the step wrote) and the
 * amortized half (the input side, weighted by per-file context mass) per
 * call and per path, plus the one unattributed row (Path null) that absorbs
 * the shared remainder and keeps the conservation law: the sum of every row
 * of a call equals the call's CostTotal within 1e-9. CallId is null until
 * the drain assigns the ledger's own row id.
 */
/**
 * One allocation row.
 */
export default interface Allocation {
    /**
     * The call the money belongs to (null until the drain assigns the
     * ledger's own row id).
     */
    readonly CallId: number | null;
    /**
     * The file the money is attributed to (null for the unattributed row).
     */
    readonly Path: string | null;
    /**
     * The direct half (the output side).
     */
    readonly DirectCost: number;
    /**
     * The amortized half (the input side).
     */
    readonly AmortizedCost: number;
    /**
     * The file's share of the call's context.
     */
    readonly ContextTokens: number;
    /**
     * The call's whole surface.
     */
    readonly SurfaceTokens: number;
    /**
     * The direct half's weight.
     */
    readonly Weight: number;
    /**
     * The attribution method the row was split with.
     */
    readonly Method: string;
}
