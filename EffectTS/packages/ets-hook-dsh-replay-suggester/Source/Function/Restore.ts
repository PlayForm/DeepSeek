// Restore - the shared store recovery (Function/Restore): validate the rows
// the tier returned, keep the newest `historyDepth`, and repopulate the
// in-memory mirror and the sequence counter. Both tiers (the KV domain and the
// JSON fallback) land here, so their behaviour is identical.
//
// THE VALIDATION IS LENIENT BY DESIGN (the seeded reader's posture): a row
// that is not a plausible Entry is dropped, never guessed. The newest-first
// order is the ring's order and the note's order.
//
// THE LEDGER: one line per mount - `store recovered <n> entries (<source>)`
// when the tier held anything, `store empty (starting fresh)` when it held
// nothing. Byte-exact (SCHEME.md) and distinct from the seeded history
// reader's lines: this is the PRODUCER's own store, not the fixtures' seed.
import type Entry from "@Interface/Entry.js";
import type State from "@Interface/State.js";

/** Whether a parsed value is a plausible entry. */
const Valid = (Value: unknown): Value is Entry => {
	if (Value === null || typeof Value !== "object") {
		return false;
	}
	const Row = Value as Partial<Entry>;
	return (
		typeof Row.seq === "number" &&
		typeof Row.path === "string" &&
		typeof Row.intent === "string" &&
		typeof Row.outcome === "string" &&
		typeof Row.at === "number" &&
		typeof Row.probe === "string"
	);
};

export default (
	/** The plugin state (the mirror, the sequence and the ledger). */
	State: State,
	/** The tier's rows, in store order (untrusted). */
	Rows: unknown[],
	/** The tier's name for the ledger line (`replay_history` or `file`). */
	Source: string,
): void => {
	const Entries = Rows.filter(Valid)
		.sort((Left, Right) => Right.seq - Left.seq)
		.slice(0, State.Depth);
	State.History = Entries;
	State.Seq = Entries.reduce((Next, Entry_) => Math.max(Next, Entry_.seq + 1), 0);
	switch (true) {
		case Entries.length === 0:
			State.Factory.Append(State, "store empty (starting fresh)");
			break;
		default:
			State.Factory.Append(State, `store recovered ${Entries.length} entries (${Source})`);
	}
};
