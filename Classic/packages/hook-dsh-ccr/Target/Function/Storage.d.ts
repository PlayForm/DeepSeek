import type State from "@Interface/State.js";
export default _default;
/** Open the CCR hook's own domain (best-effort, never awaited by the
 *  caller: an absent facility is the effect's silent skip, a failed open is
 *  the one ledger line below). */
declare function _default(State: State, Facility: unknown): Promise<void>;
/** Close the open handle (the effect's disposer; a no-op when absent or
 *  already closed). */
export declare const Close: () => void;
