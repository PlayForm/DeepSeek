// Packet - the orientation packet: the eight fixed sections (V4-1 section
// 3.5), the built result and its text form. The builder (Function/Packet)
// produces the result; the render (Function/Render) produces the text the
// tool and the service return.
export default interface Packet {
	/** "WORKSPACE <name> @ <indexRevision>" - the workspace and the revision
	 *  the packet was built from. */
	workspace: string;
	/** "SCOPE <the query or focus>" - verbatim. */
	scope: string;
	/** "MAP" - the top modules and their one-line roles. */
	map: string[];
	/** "FOCUS <the node, its span, its fingerprint, its version>" or the
	 *  honest empty form. */
	focus: string;
	/** "NEIGHBORS" - the strongest edges, ranked, strongest first. */
	neighbors: string[];
	/** "EVIDENCE" - the files/spans the packet is built from. */
	evidence: string[];
	/** "OPEN" - the questions the packet cannot answer (honest gaps). */
	open: string[];
	/** "STALE <the version the caller held, if it differs>" - undefined when
	 *  the caller is current. */
	stale: string | undefined;
	/** The lens the packet was built through. */
	lens: string;
	/** The estimated token size of the packet's text form. */
	tokens: number;
	/** The focus node the packet resolved to, if any (for the focus tracker). */
	nodeId: string | undefined;
	/** The focus node's version (for the staleness contract). */
	nodeVersion: string | undefined;
}
