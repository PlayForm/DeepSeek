// Record - THE PRODUCER (Function/Record): append one judged call to the
// recall history. Two tiers are written in one step:
//   * the in-memory RING, per agent (`AgentMemory.History`) and the durable
//     tier's mirror (`State.History`), both newest-first and both bounded by
//     `historyDepth` - the fast read the next call in this session uses;
//   * the DURABLE tier, scheduled on the store chain: the KV domain
//     `replay_history` when the harness provides storage, the JSON fallback
//     otherwise (Function/Persist). The write is detached, so the hot path
//     never awaits the disk; the Flush seam awaits the chain.
//
// THE ENTRY IS RETURNED so the caller can LABEL it once the classifier has
// spoken (a call the classifier matched becomes `Repeat`, an unmatched one
// keeps the family name `replay`). The persist runs after the listener
// returns, so the label is final by the time it is written.
//
// THE SEQ is the store's monotonic order: assigned here, never reused (the
// restored store continues from its highest), so the KV keys stay unique
// across sessions and the episode window is deterministic.
import type Entry from "@Interface/Entry.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";

import Persist from "./Persist.js";

/** One call's draft: everything the entry needs except the sequence. */
export interface Draft {
	path: string;
	intent: string;
	outcome: string;
	at: number;
	probe: string;
}

export default (
	/** The plugin state (the mirror, the sequence, the store chain). */
	State: State,
	/** The agent's memory (its own ring). */
	Memory: AgentMemory,
	/** The call's draft fields. */
	Draft: Draft,
): Entry => {
	const Entry_: Entry = { seq: State.Seq, ...Draft };
	State.Seq += 1;
	Memory.History.unshift(Entry_);
	Memory.History.length = Math.min(Memory.History.length, State.Depth);
	State.History.unshift(Entry_);
	State.History.length = Math.min(State.History.length, State.Depth);
	// The store's size AFTER this append, captured now: the persist runs
	// later on the chain, and the ledger line must report the append's own
	// bounded size, not whatever the mirror grew to by then.
	const Size = State.History.length;
	State.Pending = State.Pending.then(() => Persist(State, Entry_, Size));
	return Entry_;
};
