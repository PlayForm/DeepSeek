// Packet - the orientation-packet renderer (WORKSPACE-FAMILY-V4-1.md
// section 3.5): the packet is the orient step of the orient -> drill -> act
// loop, rendered as the fixed eight-line grammar:
//
//   WORKSPACE <name> @ <indexRevision>
//   SCOPE <the query or focus>
//   MAP <the top modules and their one-line roles>
//   FOCUS <the node, its span, its fingerprint, its version>
//   NEIGHBORS <the strongest edges, ranked>
//   EVIDENCE <the files/spans the packet is built from>
//   OPEN <the questions the packet cannot answer>
//   STALE <the version the caller held, if it differs>
//
// Multi-value bands (MAP/NEIGHBORS/EVIDENCE/OPEN) render one entry per
// line under the tag; absent bands render `MAP (none)` style placeholders -
// the grammar is always COMPLETE, never partially omitted. STALE renders
// only when the caller's version differs. Pure: PacketView in, text out;
// the token budget is the CALLER's concern (it owns the counter seam).
import type { PacketView } from "@Interface/Section.js";

/** One band of the grammar: tag + entries + the empty placeholder. */
const Band = (Tag: string, Entries: string[]): string[] =>
	Entries.length === 0 ? [`${Tag} (none)`] : Entries.map((Entry) => `${Tag} ${Entry}`);

export default (View: PacketView): string => {
	const Lines: string[] = [
		`WORKSPACE ${View.workspace} @ ${View.indexRevision}`,
		`SCOPE ${View.scope}`,
		...Band("MAP", View.map),
	];
	if (View.focus !== undefined) {
		Lines.push(`FOCUS ${View.focus}`);
	}
	Lines.push(...Band("NEIGHBORS", View.neighbors));
	Lines.push(...Band("EVIDENCE", View.evidence));
	Lines.push(...Band("OPEN", View.open));
	if (View.stale !== undefined) {
		Lines.push(`STALE ${View.stale}`);
	}
	return Lines.join("\n");
};
