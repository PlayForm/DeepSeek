import type Entry from "@Interface/Entry.js";
import type { AgentMemory } from "@Interface/State.js";
import type State from "@Interface/State.js";
/** One call's draft: everything the entry needs except the sequence. */
export interface Draft {
    path: string;
    intent: string;
    outcome: string;
    at: number;
    probe: string;
}
export default _default;
declare function _default(
/** The plugin state (the mirror, the sequence, the store chain). */
State: State, 
/** The agent's memory (its own ring). */
Memory: AgentMemory, 
/** The call's draft fields. */
Draft: Draft): Entry;
