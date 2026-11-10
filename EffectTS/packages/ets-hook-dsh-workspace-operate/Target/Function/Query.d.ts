/**
 * @module Query
 *
 * The read side of the proposal table: the filtered list, the single
 * lookup, and the honest statistics triple.
 *
 * @remarks
 * The list limit defaults to config limitDefault and is capped at config
 * limitMaximum - the graph's own rule.
 */
import type Filter from "../Interface/Filter.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
import type Statistics from "../Interface/Statistics.js";
export declare const List: (State: State, Filter: Filter | undefined) => Proposal[];
export declare const One: (State: State, Id: string) => Proposal | undefined;
export declare const Statistics: (State: State) => Statistics;
