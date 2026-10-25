import type { PostToolDecision } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
/** The schema-default scopes (the fallback for a hand-built config). */
export declare const DefaultScopes: {
    conversation: boolean;
    reasoning: boolean;
    toolInput: boolean;
    toolResults: boolean;
    files: boolean;
    batch: boolean;
};
/** The schema-default exemption list (the fallback for a hand-built config). */
export declare const DefaultExempt: string[];
declare const _default: (Exec: {
    name?: unknown;
    callId?: unknown;
}, Result: {
    content?: unknown;
}, Next: () => Promise<PostToolDecision>, State: State) => Promise<PostToolDecision>;
export default _default;
