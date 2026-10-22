export interface PacketView {
    /** The workspace name (the `WORKSPACE` line). */
    workspace: string;
    /** The index revision the packet was built from (the version stamp). */
    indexRevision: string;
    /** The query or focus the packet answers (the `SCOPE` line). */
    scope: string;
    /** The top modules and their one-line roles (the `MAP` lines). */
    map: string[];
    /** The focus node: id, span, fingerprint, version (the `FOCUS` line). */
    focus?: string;
    /** The strongest edges, ranked (the `NEIGHBORS` lines). */
    neighbors: string[];
    /** The files/spans the packet was built from (the `EVIDENCE` lines). */
    evidence: string[];
    /** The questions the packet cannot answer (the `OPEN` lines). */
    open: string[];
    /** The version the caller held, if it differs (the `STALE` line). */
    stale?: string;
}
