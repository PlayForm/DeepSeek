/**
 * @module Edit
 *
 * One edit row of the edit grain: the hunk's ordinal in its tool call, the
 * line and byte counts of both sides, the time the call was seen, and the
 * optional basis marker that names a side the arguments cannot measure.
 *
 * @remarks
 *
 * The row follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 17.3. The
 * marker is "removal-unknown" when the call carries one side only - a write
 * supplies the new content and never the before content, and a batch operation
 * that replaces or removes a match carries the matched text only in the file -
 * so the row says the removed side is unknown rather than implying it was zero.
 * The ledger's Edit table has no note column, so the marker lives on this
 * interface row and is not persisted.
 */
export default interface Hunk {
	/**
	 * The hunk's index in its tool call, 0 for a call-wide row.
	 */
	readonly Ordinal: number;
	/**
	 * The added side's line count, counted with a split.
	 */
	readonly LinesAdded: number;
	/**
	 * The removed side's line count, counted with a split.
	 */
	readonly LinesRemoved: number;
	/**
	 * The added side's UTF-8 encoded byte count.
	 */
	readonly BytesAdded: number;
	/**
	 * The removed side's UTF-8 encoded byte count.
	 */
	readonly BytesRemoved: number;
	/**
	 * The instant the call was seen, in epoch milliseconds.
	 */
	readonly At: number;
	/**
	 * The basis marker, "removal-unknown" when the removed side is unknown.
	 */
	readonly Basis?: string;
}
