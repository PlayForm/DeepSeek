import type State from "../Interface/State.js";
import type Validation from "../Interface/Validation.js";
/** The current status of one validation object, or undefined. */
declare const Check: (State: State, Id: string) => Validation["status"] | undefined;
/** The objects, optionally filtered by status, oldest sequence first. */
declare const List: (State: State, Status?: Validation["status"]) => Validation[];
/** The statistics pentuple. */
declare const Statistics: (State: State) => {
    validations: number;
    fresh: number;
    stale: number;
    superseded: number;
    sequence: number;
};
declare const _default: {
    Check: typeof Check;
    List: typeof List;
    Statistics: typeof Statistics;
};
export default _default;
