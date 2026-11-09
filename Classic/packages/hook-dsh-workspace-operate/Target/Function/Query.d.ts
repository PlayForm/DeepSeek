import type Filter from "../Interface/Filter.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
import type Statistics from "../Interface/Statistics.js";
export declare const List: (State: State, Filter: Filter | undefined) => Proposal[];
export declare const One: (State: State, Id: string) => Proposal | undefined;
export declare const Statistics: (State: State) => Statistics;
