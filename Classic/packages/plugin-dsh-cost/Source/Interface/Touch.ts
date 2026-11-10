/**
 * @module Touch
 *
 * One file interaction parsed out of one tool/call event: the path in the
 * session's project coordinates, the interaction kind, and the byte counts
 * when they are known.
 *
 * @remarks
 *
 * The shape follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 1. Both
 * byte counts are null in the normal live case - a tool result carries no size
 * - so the delta stays null and the allocator's equal-split fallback applies; a
 * later refinement may enrich them.
 */
export default interface Touch {
	/**
	 * The session the interaction belongs to.
	 */
	readonly SessionId: string;
	/**
	 * The conversation turn the interaction ran in.
	 */
	readonly Turn: number;
	/**
	 * The step of that turn the interaction ran in.
	 */
	readonly Step: number;
	/**
	 * The log sequence number the interaction was folded from.
	 */
	readonly Seq: number;
	/**
	 * The call key the interaction attaches to.
	 */
	readonly CallKey: string;
	/**
	 * The tool that performed the interaction.
	 */
	readonly Tool: string;
	/**
	 * The file's resolved absolute path.
	 */
	readonly Path: string;
	/**
	 * The interaction kind the tool vocabulary maps to.
	 */
	readonly Kind: "read" | "write" | "edit" | "delete" | "search";
	/**
	 * The file's byte size before the interaction, null when unknown.
	 */
	readonly BytesBefore: number | null;
	/**
	 * The file's byte size after the interaction, null when unknown.
	 */
	readonly BytesAfter: number | null;
	/**
	 * The byte delta the edit grain measured, null when unknown.
	 */
	readonly BytesDelta: number | null;
}
