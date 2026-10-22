// Render - the orientation packet's text renderer (the fixed eight-line
// grammar, V4-1 §3.5), declared locally because the PoC is self-contained:
// the shared client library's Packet renderer is structurally identical, and
// the end-phase wires the real import (POC-BRIEF section 2 rule 5 - the
// lib-dsh-workspace-live dependency). Multi-value bands render one entry per
// line under the tag; absent bands render the `(none)` placeholder - the
// grammar is always COMPLETE, never partially omitted. Pure: PacketView in,
// text out.
import type { PacketView } from "@Interface/Packet.js";

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
