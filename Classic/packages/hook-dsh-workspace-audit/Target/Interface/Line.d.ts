export default interface AuditLine {
    /** The line's own id: `a<sequence>` (the plugin's monotonic counter). */
    id: string;
    /** The operation identifier this line belongs to. */
    operation: string;
    /** The parent operation identifier (the chain's parent pointer). */
    parent: string;
    /** The event category - one node kind of the traceability graph. */
    category: "announcement" | "interpretation" | "intent-revision" | "commitment" | "plan-revision" | "proposed-change" | "authorization" | "execution-attempt" | "outcome-evidence" | "intent-assessment";
    /** The subject path of the event ("" for pathless events). */
    path: string;
    /** The outcome of the event. */
    outcome: "success" | "failure" | "conflict" | "pending" | "refused";
    /** The assessment detail: for an intent-assessment line, whether the
     *  IntentSpecification was satisfied ("" otherwise). */
    assessment: string;
    /** The line's sequence (the plugin's own monotonic counter, never a wall
     *  clock). */
    sequence: number;
    /** Epoch ms when the event happened. */
    at: number;
}
