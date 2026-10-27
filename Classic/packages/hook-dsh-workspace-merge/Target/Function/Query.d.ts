import type Record from "../Interface/Record.js";
import type State from "../Interface/State.js";
import type Statistics from "../Interface/Statistics.js";
export declare const One: (State: State, Id: string) => Record | undefined;
export declare const All: (State: State) => Record[];
export declare const Statistics: (State: State) => Statistics;
