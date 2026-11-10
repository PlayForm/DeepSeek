/**
 * @module Touch
 *
 * One file interaction parsed out of one tool/call event
 * (Documentation/Plans/COST-TRACK-PLUGIN.md section 1): the path in the
 * session's project coordinates, the interaction kind, and the byte counts
 * when they are known.
 *
 * @remarks
 * Both byte counts are null in the normal live case - a tool result carries
 * no size - so the delta stays null and the allocator's equal-split
 * fallback applies; a later refinement may enrich them.
 */
/**
 * One parsed file interaction.
 */
export default interface Touch {
    /**
     * The session the interaction happened in.
     */
    readonly SessionId: string;
    /**
     * The interaction's turn.
     */
    readonly Turn: number;
    /**
     * The interaction's step.
     */
    readonly Step: number;
    /**
     * The event's sequence number.
     */
    readonly Seq: number;
    /**
     * The call key the interaction's touch row is keyed by.
     */
    readonly CallKey: string;
    /**
     * The tool that performed the interaction.
     */
    readonly Tool: string;
    /**
     * The file's path in the session's project coordinates.
     */
    readonly Path: string;
    /**
     * The interaction kind.
     */
    readonly Kind: "read" | "write" | "edit" | "delete" | "search";
    /**
     * The file's size before the interaction (null when unknown).
     */
    readonly BytesBefore: number | null;
    /**
     * The file's size after the interaction (null when unknown).
     */
    readonly BytesAfter: number | null;
    /**
     * The size delta the interaction caused (null when unknown).
     */
    readonly BytesDelta: number | null;
}
