import type Entry from "../Interface/Entry.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(
/** The plugin state (the handle, the mirror, the record path, the ledger). */
State: State, 
/** The entry just recorded (its intent is final by now). */
Entry_: Entry, 
/** The bounded store size right after this append (captured at record time). */
Size: number): Promise<void>;
