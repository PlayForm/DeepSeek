import type Entry from "../Interface/Entry.js";
import type { AgentMemory } from "../Interface/State.js";
import type State from "../Interface/State.js";
/**
 * @module Record
 *
 * THE PRODUCER: it appends one judged call to the recall history, in two
 * tiers written in one step.
 *
 * @remarks
 *
 *   - the in-memory RING, per agent (`AgentMemory.History`) and the durable
 *     tier's mirror (`State.History`), both newest-first and both bounded by
 *     `historyDepth` - the fast read the next call in this session uses;
 *   - the DURABLE tier, scheduled on the store chain: the KV domain
 *     `replay_history` when the harness provides storage, the JSON fallback
 *     otherwise (Function/Persist). The write is detached, so the hot path
 *     never awaits the disk; the Flush seam awaits the chain.
 *
 * THE ENTRY IS RETURNED so the caller can LABEL it once the classifier has
 * spoken (a call the classifier matched becomes `Repeat`, an unmatched one
 * keeps the family name `replay`). The persist runs after the listener
 * returns, so the label is final by the time it is written.
 *
 * THE SEQ is the store's monotonic order: assigned here, never reused (the
 * restored store continues from its highest), so the KV keys stay unique
 * across sessions and the episode window is deterministic.
 */
/**
 * One call's draft: everything the entry needs except the sequence.
 */
export interface Draft {
    path: string;
    intent: string;
    outcome: string;
    at: number;
    probe: string;
}
export default _default;
declare function _default(
/**
 * The plugin state (the mirror, the sequence, the store chain).
 */
State: State, 
/**
 * The agent's memory (its own ring).
 */
Memory: AgentMemory, 
/**
 * The call's draft fields.
 */
Draft: Draft): Entry;
