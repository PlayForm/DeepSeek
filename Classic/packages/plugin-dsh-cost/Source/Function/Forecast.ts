// Forecast - the projection the plan asks to stay a query, not a stored
// guess (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.5): over the
// Rollup's daily rate per (Scope, Key) across the last window of days -
// anchored at each key's own latest day, so an old ledger still projects -
// the mean, the median, the mean of the last seven days, and the projection
// to a thirty-day period as the mean times thirty with the confidence band
// from the daily minimum and maximum times thirty. A history of fewer than
// two days projects with no spread (minimum and maximum both at the
// projection). The forecast never writes a row; the caller labels it an
// estimate in every export.
import type { DatabaseSync } from "node:sqlite";

type Row = {
	Scope: string;
	Key: string;
	Mean: number;
	Median: number;
	LastSeven: number;
	Projected: number;
	Minimum: number;
	Maximum: number;
};

type Series = { Scope: string; Key: string; Rates: Map<number, number> };

// One UTC day in milliseconds.
const Day = 86400000;

// The projection's period, in days.
const Period = 30;

// The last-seven tail, in days.
const Tail = 7;

// One ISO day stamp: "YYYY-MM-DD" to UTC midnight in milliseconds; a
// malformed day is outside every window.
const StampOf = (Text: string): number => {
	const Parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(Text);
	if (Parts === null) {
		return Number.NaN;
	}
	return Date.UTC(Number(Parts[1]), Number(Parts[2]) - 1, Number(Parts[3]));
};

// One money column, rounded to the sixth decimal - the reading precision of
// every other report row.
const Round = (Value: number): number => Math.round(Value * 1e6) / 1e6;

// One series' daily rates over its own window, anchored at the latest day
// the key itself reached.
const Windowed = (Held: Series, Window: number): readonly number[] => {
	const Stamps = [...Held.Rates.keys()].sort((One, Other) => One - Other);
	const Latest = Stamps[Stamps.length - 1];
	if (Latest === undefined) {
		return [];
	}
	const Floor = Latest - (Window - 1) * Day;
	const Rates: number[] = [];
	for (const Stamp of Stamps) {
		if (Stamp < Floor) {
			continue;
		}
		const Value = Held.Rates.get(Stamp);
		if (Value !== undefined) {
			Rates.push(Value);
		}
	}
	return Rates;
};

// One series' median: the middle value, or the mean of the two middle values
// when the day count is even.
const MedianOf = (Rates: readonly number[]): number => {
	const Ordered = [...Rates].sort((One, Other) => One - Other);
	const Middle = Math.floor(Ordered.length / 2);
	switch (true) {
		case Ordered.length % 2 === 1:
			return Ordered[Middle] ?? 0;
		default:
			return ((Ordered[Middle - 1] ?? 0) + (Ordered[Middle] ?? 0)) / 2;
	}
};

export default (Database: DatabaseSync) =>
	(Days: number): readonly Row[] => {
		const Window = Number.isFinite(Days) && Days > 0 ? Math.round(Days) : Period;
		const Found = Database.prepare(
			"SELECT Scope, Key, Day, Cost FROM Rollup ORDER BY Scope, Key, Day",
		).all() as { Scope: unknown; Key: unknown; Day: unknown; Cost: unknown }[];
		const Series = new Map<string, Series>();
		for (const One of Found) {
			const Scope = typeof One.Scope === "string" ? One.Scope : "";
			const Key = typeof One.Key === "string" ? One.Key : "";
			const Stamp = StampOf(typeof One.Day === "string" ? One.Day : "");
			const Cost = Number(One.Cost);
			if (!Number.isFinite(Stamp) || !Number.isFinite(Cost)) {
				continue;
			}
			const Identity = JSON.stringify([Scope, Key]);
			const Held = Series.get(Identity) ?? { Scope, Key, Rates: new Map<number, number>() };
			Held.Rates.set(Stamp, (Held.Rates.get(Stamp) ?? 0) + Cost);
			Series.set(Identity, Held);
		}
		const Rows: Row[] = [];
		for (const Held of Series.values()) {
			const Rates = Windowed(Held, Window);
			if (Rates.length === 0) {
				continue;
			}
			const Mean = Rates.reduce((Sum, Rate) => Sum + Rate, 0) / Rates.length;
			const Recent = Rates.slice(Math.max(0, Rates.length - Tail));
			const Projected = Mean * Period;
			const Ordered = [...Rates].sort((One, Other) => One - Other);
			const Low = Ordered[0] ?? 0;
			const High = Ordered[Ordered.length - 1] ?? 0;
			Rows.push({
				Scope: Held.Scope,
				Key: Held.Key,
				Mean: Round(Mean),
				Median: Round(MedianOf(Rates)),
				LastSeven: Round(Recent.reduce((Sum, Rate) => Sum + Rate, 0) / Recent.length),
				Projected: Round(Projected),
				// the confidence band (section 17.5): the observed daily spread
				// times the period; a history of fewer than two days carries no
				// spread, so the band collapses onto the projection itself
				Minimum: Round(Rates.length < 2 ? Projected : Low * Period),
				Maximum: Round(Rates.length < 2 ? Projected : High * Period),
			});
		}
		return Rows.sort((One, Other) => Other.Projected - One.Projected);
	};
