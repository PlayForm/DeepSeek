import type Message from "../Interface/Message.js";
/** The three caps the digest reads from the resolved knobs. */
export interface DigestLimits {
    /** Messages kept verbatim; older ones collapse into the summary lines. */
    readonly digestTail: number;
    /** The cap on one `USER: ` summary line. */
    readonly digestUserChars: number;
    /** The cap on one `ASSISTANT: ` summary line. */
    readonly digestAssistantChars: number;
}
/** The digest text plus the two counts the report prints to prove its shape. */
export interface DigestResult {
    /** The digest text; empty only for an empty transcript. */
    readonly text: string;
    /** How many trailing messages were kept verbatim. */
    readonly kept: number;
    /** How many leading messages collapsed into the summary. */
    readonly collapsed: number;
}
export default _default;
declare function _default(Messages: readonly Message[], Limits: DigestLimits): DigestResult;
