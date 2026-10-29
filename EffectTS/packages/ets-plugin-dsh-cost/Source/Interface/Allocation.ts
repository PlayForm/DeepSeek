// Allocation - one money row of the attribution model
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 2): the direct half (the
// output side, weighted by changed bytes over the files the step wrote) and
// the amortized half (the input side, weighted by per-file context mass) per
// call and per path, plus the one unattributed row (Path null) that absorbs
// the shared remainder and keeps the conservation law: the sum of every row
// of a call equals the call's CostTotal within 1e-9. CallId is null until
// the drain assigns the ledger's own row id.
export default interface Allocation {
	readonly CallId: number | null;
	readonly Path: string | null;
	readonly DirectCost: number;
	readonly AmortizedCost: number;
	readonly ContextTokens: number;
	readonly SurfaceTokens: number;
	readonly Weight: number;
	readonly Method: string;
}
