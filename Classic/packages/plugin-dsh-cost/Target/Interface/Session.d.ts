/**
 * @module Session
 *
 * The resolved session row: the Session table's own columns joined through
 * Project and Client, with every nullable column carried as null when the
 * ledger stores no value.
 *
 * @remarks
 *
 * The shape follows Design.md section 9.3.
 */
export default interface CostSession {
    /**
     * The session's own id.
     */
    id: string;
    /**
     * The project name the session was resolved into, null when unrecorded.
     */
    project: string | null;
    /**
     * The project root the session ran in, null when unrecorded.
     */
    root: string | null;
    /**
     * The client the project is billed to, null when unrecorded.
     */
    client: string | null;
    /**
     * The session's stored title, null when none.
     */
    title: string | null;
    /**
     * The session's working directory, null when none.
     */
    cwd: string | null;
    /**
     * The session's origin, null when the log named none.
     */
    origin: string | null;
    /**
     * The agent preset the session ran under, null when none.
     */
    agentPreset: string | null;
    /**
     * The delegating session's id, null for a root session.
     */
    parentSessionId: string | null;
    /**
     * The delegation depth, null when the log named none.
     */
    delegationDepth: number | null;
    /**
     * When the session was created, in epoch milliseconds.
     */
    createdAt: number;
    /**
     * When the session ended, null while it is live.
     */
    endedAt: number | null;
}
