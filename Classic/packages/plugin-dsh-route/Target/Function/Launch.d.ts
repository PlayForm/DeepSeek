import type State from "../Interface/State.js";
/** One model-facing content block (the fields the hint reads). */
interface Block {
    type?: string | undefined;
    text?: string | undefined;
}
/** One step message (the harness's UserMessage, read structurally). */
interface Message {
    id?: string | undefined;
    role?: string | undefined;
    content?: readonly Block[] | undefined;
    source?: unknown;
}
/** The child agent, read structurally (no harness import). */
interface Child {
    options?: {
        provider?: string | undefined;
        model?: string | undefined;
        reasoningEffort?: string | undefined;
        subagentDepth?: number | undefined;
    } | undefined;
    session?: {
        header?: {
            delegationDepth?: number | null;
        } | undefined;
    } | undefined;
}
/** The `agent/pre-step` payload. */
interface Payload {
    agent: Child;
    messages: readonly Message[];
    turn: number;
    step: number;
    signal?: AbortSignal | undefined;
}
/** The `agent/pre-step` decision. */
type Decision = {
    kind: "reject";
} | {
    kind: "enter";
    messages: Message[];
    startsRequestSeries?: true;
};
export default _default;
declare function _default(State: State, Payload_: Payload, Next: () => Promise<Decision>, Append: (Message: string) => void): Promise<Decision>;
