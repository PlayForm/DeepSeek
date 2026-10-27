// Allocate - the attribution model (Documentation/Plans/COST-TRACK-PLUGIN.md
// section 2): one call's price split into the direct half (the output side -
// the model's decision to act - weighted by changed bytes over the files the
// step wrote) and the amortized half (the input side - the context that made
// the decision possible - split per cache bucket: the uncached input weighted
// by each file's uncached mass, the cached input by its cached mass, because
// one blended ratio misprices a file whose tokens are cached against one
// whose are not), plus the one unattributed row that absorbs the shared
// remainder and keeps the conservation law (section 2.3): the sum of every
// row equals the call's CostTotal within 1e-9, asserted here because a
// violation is a bug in the allocator, not a rounding artifact to be waved
// through. With no cache data the cached half is empty and the whole mass is
// uncached, so the old call shape behaves exactly as before.
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

type Massed = {
	Surface: number;
	PerPath: Map<string, number>;
	Cached?: Map<string, number>;
	CachedSurface?: number;
};

type Share = { Weight: number; Context: number; Uncached: number; Cached: number };

// One path's accumulated shares: two touches of the same path in one step
// merge into one row with the summed weight and the summed masses (the total
// context, its cached portion and its uncached remainder).
const Accumulate = (
	Shares: Map<string, Share>,
	Path: string,
	Weight: number,
	Context: number,
	Uncached: number,
	Cached: number,
): void => {
	const Share = Shares.get(Path) ?? { Weight: 0, Context: 0, Uncached: 0, Cached: 0 };
	Share.Weight += Weight;
	Share.Context += Context;
	Share.Uncached += Uncached;
	Share.Cached += Cached;
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
	// The cache-write allocation (section 18, decision 7): the write is paid
	// by the set that benefits from the later reads, so it rides the cached
	// side with the cache reads instead of the uncached side. With no cache
	// data the cached half is empty and the whole mass is uncached, so the
	// old call shape behaves exactly as before.
	const UncachedInput = Cost.Input;
	const CachedInput = Cost.CacheRead + Cost.CacheWrite;
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
						Accumulate(Shares, Pair.Row.Path, Pair.Delta / Total, 0, 0, 0);
					}
					break;
				default:
					// the equal rule, and the bytes rule with no known deltas
					for (const Pair of Pairs) {
						Accumulate(Shares, Pair.Row.Path, 1 / Pairs.length, 0, 0, 0);
					}
			}
			break;
		}
		case Touches.length > 0:
			// the step touched but wrote nothing: the touched files share equally
			for (const Row of Touches) {
				Accumulate(Shares, Row.Path, 1 / Touches.length, 0, 0, 0);
			}
			break;
		default:
			// the step touched nothing: the whole output cost is unattributed
			Unattributed.Direct = Output;
	}

	// --- the amortized half: the input side split per cache bucket (section
	// 2.2). Prompt caching is prefix-based, so each file carries an uncached
	// mass (its total mass minus its cached portion) and a cached mass, and
	// the input cost splits as the uncached rate on the uncached mass plus
	// the cache-read and cache-write rates on the cached mass - the write is
	// paid by the set that benefits from the later reads (section 18,
	// decision 7). With no cache data (the old call shape) the cached half
	// is empty, CachedSurface is zero and the whole per-path mass is
	// uncached, so the split reduces to the single-ratio rule the earlier
	// build used.
	const Surface = Math.max(0, Math.round(Mass.Surface));
	const CachedSurface = Math.max(0, Math.round(Mass.CachedSurface ?? 0));
	const SurfaceUncached = Math.max(0, Surface - CachedSurface);
	let UncachedMassed = 0;
	let CachedMassed = 0;
	for (const [Path, Tokens] of Mass.PerPath) {
		const Context = Math.max(0, Math.round(Tokens));
		const Cached = Math.min(
			Mass.Cached === undefined ? 0 : Math.max(0, Math.round(Mass.Cached.get(Path) ?? 0)),
			Context,
		);
		const Uncached = Context - Cached;
		UncachedMassed += Uncached;
		CachedMassed += Cached;
		Accumulate(Shares, Path, 0, Context, Uncached, Cached);
	}
	// the masses never exceed the surfaces they came from; a perverse estimate
	// is scaled back per bucket instead of pushing shares past one hundred
	// percent
	const UncachedCoverage =
		UncachedMassed > SurfaceUncached && SurfaceUncached > 0
			? SurfaceUncached / UncachedMassed
			: 1;
	const CachedCoverage =
		CachedMassed > CachedSurface && CachedSurface > 0 ? CachedSurface / CachedMassed : 1;
	switch (true) {
		case Config.attribution.amortized !== "context" || Surface <= 0:
			// the input half is dropped to the unattributed bucket; the per-path
			// masses stay on their rows for the analysis plugin to see
			Unattributed.Amortized = UncachedInput + CachedInput;
			break;
		default:
			// when a bucket's surface is zero there is no mass to price that
			// bucket's input against: the whole bucket goes unattributed
			Unattributed.Amortized =
				(SurfaceUncached > 0
					? UncachedInput - (UncachedInput * UncachedMassed * UncachedCoverage) / SurfaceUncached
					: UncachedInput) +
				(CachedSurface > 0
					? CachedInput - (CachedInput * CachedMassed * CachedCoverage) / CachedSurface
					: CachedInput);
	}
	Unattributed.Context =
		Math.max(0, SurfaceUncached - Math.round(UncachedMassed * UncachedCoverage)) +
		Math.max(0, CachedSurface - Math.round(CachedMassed * CachedCoverage));

	// --- the rows: one per path with both halves, then the unattributed row
	const Rows: Allocation[] = [];
	for (const [Path, Share] of Shares) {
		Rows.push({
			CallId: null,
			Path,
			DirectCost: Output * Share.Weight,
			AmortizedCost:
				Config.attribution.amortized === "context" && Surface > 0
					? (SurfaceUncached > 0
							? (UncachedInput * (Share.Uncached * UncachedCoverage)) / SurfaceUncached
							: 0) +
						(CachedSurface > 0
							? (CachedInput * (Share.Cached * CachedCoverage)) / CachedSurface
							: 0)
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
