/**
 * @module Session
 *
 * The resolved session row.
 *
 * @remarks
 *
 * The shape is the Design.md section 9.3 one: the Session table's own columns joined through
 * Project and Client, with every nullable column carried as null when the ledger stores no value.
 */
export default interface CostSession {
    /**
     * The session's id.
     */
    id: string;
    /**
     * The project the session belongs to, or null.
     */
    project: string | null;
    /**
     * The session's project root, or null.
     */
    root: string | null;
    /**
     * The client the session ran under, or null.
     */
    client: string | null;
    /**
     * The session's stored title, or null.
     */
    title: string | null;
    /**
     * The session's working directory, or null.
     */
    cwd: string | null;
    /**
     * The session's origin, or null.
     */
    origin: string | null;
    /**
     * The agent preset the session ran under, or null.
     */
    agentPreset: string | null;
    /**
     * The parent session's id, or null.
     */
    parentSessionId: string | null;
    /**
     * How deep the session was delegated, or null.
     */
    delegationDepth: number | null;
    /**
     * When the session was created, in epoch milliseconds.
     */
    createdAt: number;
    /**
     * When the session ended, or null while it runs.
     */
    endedAt: number | null;
}
