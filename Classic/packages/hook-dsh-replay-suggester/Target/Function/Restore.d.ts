import type State from "../Interface/State.js";
export default _default;
declare function _default(
/** The plugin state (the mirror, the sequence and the ledger). */
State: State, 
/** The tier's rows, in store order (untrusted). */
Rows: unknown[], 
/** The tier's name for the ledger line (`replay_history` or `file`). */
Source: string): void;
