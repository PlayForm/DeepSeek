// RateRow - one effective-dated rate inside a pricing revision (the valuation
// model; the research's sections 5 and 6): the same provider, model, currency
// and per-million-token columns the capture-time Price row carries - input
// and output required, cache read, cache write and reasoning optional because
// an absent rate is an unpriced bucket and never a guessed zero - plus the
// window, the tier bounds, the mode and the region that make one rate card a
// family of rows. The effective interval is half-open (ValidFrom <= at <
// ValidTo, a NULL ValidTo is the open end) and it lives inside an immutable
// revision, so a rate is corrected by publishing a new revision, never by
// editing this row. Note is the free-text provenance the rate editor writes;
// the catalog's name and the revision's reason carry the rest, which is why
// the Price row's Source column has no counterpart here.
export default interface RateRow {
	readonly RateRowId: number;
	readonly RevisionId: number;
	readonly Provider: string;
	readonly Model: string;
	readonly Currency: string;
	readonly InputRate: number;
	readonly OutputRate: number;
	readonly CacheReadRate: number | null;
	readonly CacheWriteRate: number | null;
	readonly ReasoningRate: number | null;
	readonly ValidFrom: number;
	readonly ValidTo: number | null;
	readonly Mode: string;
	readonly Region: string | null;
	readonly Window: string;
	readonly TierFrom: number;
	readonly TierTo: number | null;
	readonly Note: string | null;
}
