// Touch - one file interaction parsed out of one tool/call event
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 1): the path in the
// session's project coordinates, the interaction kind, and the byte counts
// when they are known. Both byte counts are null in the normal live case - a
// tool result carries no size - so the delta stays null and the allocator's
// equal-split fallback applies; a later refinement may enrich them.
export default interface Touch {
	readonly SessionId: string;
	readonly Turn: number;
	readonly Step: number;
	readonly Seq: number;
	readonly CallKey: string;
	readonly Tool: string;
	readonly Path: string;
	readonly Kind: "read" | "write" | "edit" | "delete" | "search";
	readonly BytesBefore: number | null;
	readonly BytesAfter: number | null;
	readonly BytesDelta: number | null;
}
