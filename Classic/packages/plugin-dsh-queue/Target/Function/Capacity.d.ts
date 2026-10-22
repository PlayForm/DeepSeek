import type State from "../Interface/State.js";
/** The agent key for the main conversation's pool. */
export declare const MAIN = "main";
export default _default;
/** How many slots the agent currently has free (negative = over-committed;
 * the caller treats any value <= 0 as no capacity). */
declare function _default(State: State, Agent: string): number;
/** Take one seat for the agent (the dispatcher calls this on an assignment). */
export declare const Seat: (State: State, Agent: string) => void;
/** Release one seat for the agent (settle; never goes below zero). */
export declare const Release: (State: State, Agent: string) => void;
