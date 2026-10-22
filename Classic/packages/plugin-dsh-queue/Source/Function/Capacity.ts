// Capacity - the seat/release bookkeeping (SUBAGENT-QUEUE-PLUGIN.md section
// 2.2). The RESERVATION model: the queue holds the tasks as data; the
// dispatcher spawns when the capacity allows. Two capacities:
//
//   Capacity(main)  = capacity.main  - active(main)   # the main's pool (10)
//   Capacity(agent) = capacity.child - active(agent)   # the per-agent cap (2)
//
// The seat bookkeeping is the Seats map: agent id -> the number of ACTIVE
// (dispatched or running) tasks. The key `main` is the main conversation's
// pool; every other key is a spawned agent whose own children are capped -
// the two-active regime that makes the workflow fan-out flood structurally
// impossible. A seat is taken at dispatch and released at completion, failure
// or interruption (Function/Settle).
import type State from "@Interface/State.js";

/** The agent key for the main conversation's pool. */
export const MAIN = "main";

/** How many slots the agent currently has free (negative = over-committed;
 * the caller treats any value <= 0 as no capacity). */
export default (State: State, Agent: string): number => {
	const Active = State.Seats.get(Agent) ?? 0;
	const Limit = Agent === MAIN ? State.Capacity.main : State.Capacity.child;
	return Limit - Active;
};

/** Take one seat for the agent (the dispatcher calls this on an assignment). */
export const Seat = (State: State, Agent: string): void => {
	State.Seats.set(Agent, (State.Seats.get(Agent) ?? 0) + 1);
};

/** Release one seat for the agent (settle; never goes below zero). */
export const Release = (State: State, Agent: string): void => {
	const Active = State.Seats.get(Agent) ?? 0;
	State.Seats.set(Agent, Math.max(0, Active - 1));
};
