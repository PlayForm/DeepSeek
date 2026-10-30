import type State from "../Interface/State.js";
/** Flush every queued line now and resolve once the drain chain is empty. */
export declare const Flush: () => Promise<void>;
export default _default;
declare function _default(State: State, Message: string): void;
