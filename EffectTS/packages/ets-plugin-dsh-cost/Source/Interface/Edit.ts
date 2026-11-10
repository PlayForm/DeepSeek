/**
 * @module Edit
 *
 * One edit row of the edit grain (Documentation/Plans/COST-TRACK-PLUGIN.md
 * section 17.3): the hunk's ordinal in its tool call, the line counts of
 * both sides, the UTF-8 encoded byte counts of both sides, the time the
 * call was seen, and the optional basis marker that names a side the
 * arguments cannot measure.
 *
 * @remarks
 *
 * The marker is "removal-unknown" when the call carries one side only - a
 * write supplies the new content and never the before content, and a batch
 * operation that replaces or removes a match carries the matched text only
 * in the file - so the row says the removed side is unknown rather than
 * implying it was zero. The ledger's Edit table has no note column, so the
 * marker lives on this interface row and is not persisted.
 */

/**
 * One edit hunk row.
 */
export default interface Hunk {
	/**
	 * The hunk's ordinal in its tool call (0 for a call-wide row).
	 */
	readonly Ordinal: number;

	/**
	 * The lines the hunk added.
	 */
	readonly LinesAdded: number;

	/**
	 * The lines the hunk removed.
	 */
	readonly LinesRemoved: number;

	/**
	 * The UTF-8 encoded bytes the hunk added.
	 */
	readonly BytesAdded: number;

	/**
	 * The UTF-8 encoded bytes the hunk removed.
	 */
	readonly BytesRemoved: number;

	/**
	 * The time the call was seen (epoch ms).
	 */
	readonly At: number;

	/**
	 * The basis marker that names a side the arguments cannot measure.
	 */
	readonly Basis?: string;
}
