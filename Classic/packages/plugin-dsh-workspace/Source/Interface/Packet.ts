// Packet - the orientation packet's shape (WORKSPACE-FAMILY-V4-1.md section
// 3.5), declared here because the PoC is self-contained: the shared client
// library's own PacketView is structurally identical, but the end-phase
// wires the real import (POC-BRIEF section 2, rule 5). The packet is the
// orient step of the orient -> drill -> act loop: bounded, ranked by edge
// strength, and always versioned so a stale view is detectable.
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
