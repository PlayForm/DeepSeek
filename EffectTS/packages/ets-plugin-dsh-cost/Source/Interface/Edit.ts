// Edit - one edit row of the edit grain (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 17.3): the hunk's ordinal in its tool call,
// the line counts of both sides, the UTF-8 encoded byte counts of both
// sides, the time the call was seen, and the optional basis marker that
// names a side the arguments cannot measure. The marker is "removal-unknown"
// when the call carries one side only - a write supplies the new content and
// never the before content, and a batch operation that replaces or removes a
// match carries the matched text only in the file - so the row says the
// removed side is unknown rather than implying it was zero. The ledger's
// Edit table has no note column, so the marker lives on this interface row
// and is not persisted.
export default interface Hunk {
	readonly Ordinal: number;
	readonly LinesAdded: number;
	readonly LinesRemoved: number;
	readonly BytesAdded: number;
	readonly BytesRemoved: number;
	readonly At: number;
	readonly Basis?: string;
}
