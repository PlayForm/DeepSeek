// ContributionRow - the mirror of the engine's CostContributionRow: one
// conversation that allocated money to one file - the conversation's
// identity and its stored title, the distinct calls that contributed, the
// direct and amortized money those calls allocated to the file with their
// sum in `total`, the conversation's share of the file's whole lifetime
// total across every session, the first and last call times, and the
// distinct `Provider/Model` ids the contributing calls used. The engine
// (plugin-dsh-cost) produces it; this package mirrors the shape so the
// expanded file row renders without importing the ledger library. `title`
// stays null when the ledger stored none, and `firstAt` and `lastAt` stay
// null only when the statement stored no call time.
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
