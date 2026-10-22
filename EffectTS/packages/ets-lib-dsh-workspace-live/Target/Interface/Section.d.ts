/** What the section presents: the orientation packet, the workspace map, the
 * focus node, the neighbor band, the evidence band, the open questions, the
 * stale marker, or a free-form note. */
export type SectionKind = "packet" | "map" | "focus" | "neighbors" | "evidence" | "open" | "stale" | "note";
/** One framed section of the operational view. */
export interface Section {
    /** The stable section id (the frame label and the collapse key). */
    id: string;
    /** What the section presents. */
    kind: SectionKind;
    /** The one-line title inside the frame. */
    title: string;
    /** The body lines (already wrapped by the producer; the renderer never reflows). */
    lines: string[];
    /** The version the section was rendered from (the staleness stamp). */
    version?: string;
}
/** The orientation packet (WORKSPACE-FAMILY-V4-1.md section 3.5): the model
 * orients in a loop (orient -> drill -> act) and the packet is the orient
 * step - bounded, ranked by edge strength, and always versioned. */
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
