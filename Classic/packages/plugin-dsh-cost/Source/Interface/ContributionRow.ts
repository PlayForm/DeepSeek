/**
 * @module ContributionRow
 *
 * One CostContributionRow per conversation that ever allocated money to one
 * file: the conversation's identity, its contributing calls, their money and
 * their share of the file's whole lifetime total.
 *
 * @remarks
 *
 * The row is the file-scoped contribution read, the file-to-conversation
 * product surface. It carries the conversation's identity and its stored title,
 * the distinct calls that contributed, the direct and amortized money those
 * calls allocated to the file with their sum in `total`, the conversation's
 * share of the file's whole lifetime total across every session, the first and
 * last call times, and the distinct provider/model ids the contributing calls
 * used, each written `Provider/Model` and sorted. The money rounds to six
 * decimals and the share is a ratio in [0, 1] computed from those same rounded
 * totals - this row's total over the file's rounded lifetime - so the rows of
 * one file sum to one up to the rounding and a lifetime that rounds to zero
 * answers a share of zero. `title` stays null when the ledger stored none, and
 * `firstAt` and `lastAt` stay null only when the statement stored no call time.
 */
export default interface CostContributionRow {
	/**
	 * The contributing conversation's session id.
	 */
	sessionId: string;
	/**
	 * The conversation's stored title, null when the ledger stored none.
	 */
	title: string | null;
	/**
	 * The distinct calls that contributed to the file.
	 */
	calls: number;
	/**
	 * The direct money those calls allocated to the file.
	 */
	direct: number;
	/**
	 * The amortized money those calls allocated to the file.
	 */
	amortized: number;
	/**
	 * The direct and amortized money summed.
	 */
	total: number;
	/**
	 * This conversation's share of the file's rounded lifetime total.
	 */
	share: number;
	/**
	 * The first contributing call's instant, null when none is stored.
	 */
	firstAt: number | null;
	/**
	 * The last contributing call's instant, null when none is stored.
	 */
	lastAt: number | null;
	/**
	 * The distinct `Provider/Model` ids the contributing calls used.
	 */
	models: readonly string[];
}
