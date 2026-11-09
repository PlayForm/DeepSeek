// ContributionRow - one CostContributionRow per conversation that ever
// allocated money to one file (the file-scoped contribution read, the
// file-to-conversation product surface): the conversation's identity and its
// stored title, the distinct calls that contributed, the direct and
// amortized money those calls allocated to the file with their sum in
// `total`, the conversation's share of the file's whole lifetime total across
// every session, the first and last call times, and the distinct
// provider/model ids the contributing calls used, each written
// `Provider/Model` and sorted. The money rounds to six decimals and the share
// is a ratio in [0, 1] computed from those same rounded totals - this row's
// total over the file's rounded lifetime - so the rows of one file sum to one
// up to the rounding and a lifetime that rounds to zero answers a share of
// zero. `title` stays null when the ledger stored none, and `firstAt` and
// `lastAt` stay null only when the statement stored no call time.
export default interface CostContributionRow {
	sessionId: string;
	title: string | null;
	calls: number;
	direct: number;
	amortized: number;
	total: number;
	share: number;
	firstAt: number | null;
	lastAt: number | null;
	models: readonly string[];
}
