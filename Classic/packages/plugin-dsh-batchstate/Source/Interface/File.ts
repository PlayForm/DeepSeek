// File - the persisted state shape (Interface/File): what one durable store
// holds - the members, the idle queue, the spliced proposals and the arbiter
// gates. ONE shape, TWO sources: the JSON fallback's file (Function/Recover
// reads it) and the KV domain's four tables (Function/Storage projects them
// onto it), so the recovery (Function/Restore) is written once and both
// stores feed it.
import type Entry from "@Interface/Entry.js";
import type Gate from "@Interface/Gate.js";
import type Member from "@Interface/Member.js";

export default interface File {
	/** The members, keyed by agent id once restored. */
	members: Member[];
	/** The idle queue (member ids, in order). */
	queue: string[];
	/** The spliced batch proposals (the board's memory). */
	proposals: Entry[];
	/** The arbiter gates (the Gates block's truth). */
	gates: Gate[];
}
