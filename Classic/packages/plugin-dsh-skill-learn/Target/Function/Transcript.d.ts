import type Agent from "../Interface/Agent.js";
import type Message from "../Interface/Message.js";
/** The projection result: the messages, and how many tool calls they carry. */
export interface TranscriptResult {
    /** Every message that carries a known role and a block list, in order. */
    readonly messages: readonly Message[];
    /** The number of `tool-call` blocks across the whole transcript. */
    readonly toolCalls: number;
}
export default _default;
declare function _default(Agent: Agent): TranscriptResult;
