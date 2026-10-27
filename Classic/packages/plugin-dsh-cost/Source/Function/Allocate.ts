// Allocate - the attribution model (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 2): one call's price split into the direct half (the output side -
// the model's decision to act - weighted by changed bytes over the files the
// step wrote) and the amortized half (the input side - the context that made
// the decision possible - weighted by per-file context mass over the whole
// surface), plus the one unattributed row that absorbs the shared remainder
// and keeps the conservation law (section 2.3): the sum of every row equals
// the call's CostTotal within 1e-9, asserted here because a violation is a
// bug in the allocator, not a rounding artifact to be waved through.
import type Allocation from "../Interface/Allocation.js";
import type Config from "../Interface/Config.js";
import type Touch from "../Interface/Touch.js";
import type Usage from "../Interface/Usage.js";

type Costed = {
	Input: number;
	Output: number;
	CacheRead: number;
	CacheWrite: number;
	Reasoning: number;
	Total: number;
	Currency: string;
};

type Massed = { Surface: number; PerPath: Map<string, number> };

type Share = { Weight: number; Context: number };

// One path's accumulated shares: two touches of the same path in one step
// merge into one row with the summed weight and the summed context mass.
const Accumulate = (
	Shares: Map<string, Share>,
	Path: string,
	Weight: number,
	Context: number,
): void => {
	const Share = Shares.get(Path) ?? { Weight: 0, Context: 0 };
	Share.Weight += Weight;
	Share.Context += Context;
	Shares.set(Path, Share);
};

export default (
	Usage: Usage,
	Cost: Costed,
	Touches: readonly Touch[],
	Mass: Massed,
	Config: Config,
): readonly Allocation[] => {
	const Output = Cost.Output + Cost.Reasoning;
	const Input = Cost.Input + Cost.CacheRead + Cost.CacheWrite;
	const Method = `${Config.attribution.direct}/${Config.attribution.amortized}`;
	const Unattributed = { Direct: 0, Amortized: 0, Context: 0 };
	const Shares = new Map<string, Share>();

	// --- the direct half: the output side belongs to the files the step wrote
	const Writes = Touches.filter((Row) => Row.Kind !== "read" && Row.Kind !== "search");
	switch (true) {
		case Writes.length > 0: {
			const Pairs = Writes.map((Row) => ({ Row, Delta: Math.abs(Row.BytesDelta ?? 0) }));
			const Total = Pairs.reduce((Sum, Pair) => Sum + Pair.Delta, 0);
			switch (true) {
				case Config.attribution.direct === "bytes" && Total > 0:
					for (const Pair of Pairs) {
						Accumulate(Shares, Pair.Row.Path, Pair.Delta / Total, 0);
					}
					break;
				default:
					// the equal rule, and the bytes rule with no known deltas
					for (const Pair of Pairs) {
						Accumulate(Shares, Pair.Row.Path, 1 / Pairs.length, 0);
					}
			}
			break;
		}
		case Touches.length > 0:
			// the step touched but wrote nothing: the touched files share equally
			for (const Row of Touches) {
				Accumulate(Shares, Row.Path, 1 / Touches.length, 0);
			}
			break;
		default:
			// the step touched nothing: the whole output cost is unattributed
			Unattributed.Direct = Output;
	}

	// --- the amortized half: the input side belongs to whatever occupied the
	// context, in proportion to how much each file occupied
	const Surface = Math.max(0, Math.round(Mass.Surface));
	let Assigned = 0;
	for (const [Path, Tokens] of Mass.PerPath) {
		const Context = Math.max(0, Math.round(Tokens));
		Assigned += Context;
		Accumulate(Shares, Path, 0, Context);
	}
	// the masses never exceed the surface they came from; a perverse estimate
	// is scaled back instead of pushing shares past one hundred percent
	const Coverage = Assigned > Surface && Surface > 0 ? Surface / Assigned : 1;
	switch (true) {
		case Config.attribution.amortized !== "context" || Surface <= 0:
			// the input half is dropped to the unattributed bucket; the per-path
			// masses stay on their rows for the analysis plugin to see
			Unattributed.Amortized = Input;
			break;
		default:
			Unattributed.Amortized = Input - (Input * Assigned * Coverage) / Surface;
	}
	Unattributed.Context = Math.max(0, Surface - Math.round(Assigned * Coverage));

	// --- the rows: one per path with both halves, then the unattributed row
	const Rows: Allocation[] = [];
	for (const [Path, Share] of Shares) {
		Rows.push({
			CallId: null,
			Path,
			DirectCost: Output * Share.Weight,
			AmortizedCost:
				Config.attribution.amortized === "context" && Surface > 0
					? (Input * Share.Context * Coverage) / Surface
					: 0,
			ContextTokens: Share.Context,
			SurfaceTokens: Surface,
			Weight: Share.Weight,
			Method,
		});
	}
	switch (true) {
		case Rows.length === 0 || Unattributed.Direct !== 0 || Unattributed.Amortized !== 0:
			Rows.push({
				CallId: null,
				Path: null,
				DirectCost: Unattributed.Direct,
				AmortizedCost: Unattributed.Amortized,
				ContextTokens: Unattributed.Context,
				SurfaceTokens: Surface,
				Weight: 0,
				Method,
			});
			break;
		default:
	}

	// --- the conservation law (section 2.3): the rows sum to the call's price
	const Summed = Rows.reduce((Sum, Row) => Sum + Row.DirectCost + Row.AmortizedCost, 0);
	if (Math.abs(Summed - Cost.Total) > 1e-9) {
		throw new Error(
			`plugin-dsh-cost: allocation conservation violated at turn ${Usage.Turn} step ${Usage.Step} ` +
				`- the rows sum to ${Summed} but the call costs ${Cost.Total} ` +
				`(${Config.attribution.direct}/${Config.attribution.amortized}, ` +
				`${Touches.length} touches, surface ${Surface})`,
		);
	}
	return Rows;
};
