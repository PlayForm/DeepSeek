// Snapshot - the full batch snapshot (Interface/Snapshot): what getState()
// returns. The running lanes, the idle queue (in order), the recent
// completions, the spliced proposals and the arbiter gates - the LIVE truth,
// never the histories.
import type Entry from "@Interface/Entry.js";
import type Gate from "@Interface/Gate.js";
import type Member from "@Interface/Member.js";

export default interface Snapshot {
	/** The batch key (multi-batch support). */
	batch: string;
	/** Snapshot generation time (epoch ms). */
	generatedAt: number;
	/** The members currently active, queue order first. */
	running: Member[];
	/** The idle members, in queue order. */
	idle: Member[];
	/** The recent completions, newest first, bounded by maxRecent. */
	recent: { id: string; status: string; task: string; at: number }[];
	/** The spliced proposals, in splice order, bounded by maxProposals. */
	proposals: Entry[];
	/** The arbiter gates (the Gates block's truth). */
	gates: Gate[];
}
