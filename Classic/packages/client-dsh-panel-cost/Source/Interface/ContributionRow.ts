/**
 * @module ContributionRow
 *
 * The mirror of the engine's CostContributionRow: one conversation that allocated money to one
 * file.
 *
 * @remarks
 *
 * The row carries the conversation's identity and its stored title, the distinct calls that
 * contributed, the direct and amortized money those calls allocated to the file with their sum in
 * `total`, the conversation's share of the file's whole lifetime total across every session, the
 * first and last call times, and the distinct `Provider/Model` ids the contributing calls used.
 * The engine (plugin-dsh-cost) produces it; this package mirrors the shape so the expanded file
 * row renders without importing the ledger library. `title` stays null when the ledger stored
 * none, and `firstAt` and `lastAt` stay null only when the statement stored no call time.
 */
export default interface CostContributionRow {
	/**
	 * The conversation's session id.
	 */
	sessionId: string;
	/**
	 * The title the ledger stored for the conversation, or null.
	 */
	title: string | null;
	/**
	 * The distinct calls that contributed to the file.
	 */
	calls: number;
	/**
	 * The direct money the calls allocated to the file.
	 */
	direct: number;
	/**
	 * The amortized money the calls allocated to the file.
	 */
	amortized: number;
	/**
	 * The sum of the direct and amortized money.
	 */
	total: number;
	/**
	 * The conversation's share of the file's whole lifetime total.
	 */
	share: number;
	/**
	 * The first call time, or null when the statement stored no call time.
	 */
	firstAt: number | null;
	/**
	 * The last call time, or null when the statement stored no call time.
	 */
	lastAt: number | null;
	/**
	 * The distinct `Provider/Model` ids the contributing calls used.
	 */
	models: readonly string[];
}
