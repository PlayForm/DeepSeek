import type State from "../Interface/State.js";
/** The resolved target of a node-targeted operation. */
export interface Located {
    ok: true;
    /** The 1-based inclusive span to rewrite. */
    span: {
        startLine: number;
        endLine: number;
    };
    /** The fingerprint's kind component (Symbol / Block). */
    kind: string;
    /** The fingerprint's name component (a Block hashes the empty name). */
    name: string;
}
/** A refusal with its documented reason. */
export interface Refused {
    ok: false;
    reason: string;
}
export default _default;
declare function _default(State: State, Id: string, Path: string, Fallback?: {
    startLine: number;
    endLine: number;
}): Promise<Located | Refused>;
