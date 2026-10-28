import type FeedbackBlock from "../Interface/Block.js";
import type State from "../Interface/State.js";
/** Cap one text field; the marker records that a cap was applied. */
export declare const Cap: (Value: string, Bytes: number) => string;
export default _default;
declare function _default(State: State, Block: FeedbackBlock): void;
