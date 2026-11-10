/**
 * @module StageRow
 *
 * One CostStageRow per stage this session's touches reached: the stage name,
 * the touch count, the tokens the carrying calls reported and the money those
 * calls allocated to the touched files.
 *
 * @remarks
 *
 * The row is the STAGES view. A touch with no stage reads "unclassified",
 * never dropped. The tokens are zero when the ledger stores none, because a
 * token total per file does not exist in the ledger's grain. The money is
 * direct plus amortized, rounded to six decimals.
 */
export default interface CostStageRow {
	/**
	 * The stage name, "unclassified" when no touch carried a stage.
	 */
	stage: string;
	/**
	 * How many touches the session made in the stage.
	 */
	touches: number;
	/**
	 * The tokens the carrying calls reported, zero when none.
	 */
	tokens: number;
	/**
	 * The money the calls allocated to the touched files.
	 */
	cost: number;
}
