import type State from "../Interface/State.js";
/**
 * @module Launch
 *
 * The LAUNCH SEAM's second half: the `agent/pre-step` waterfall listener that
 * puts the routing hint INTO the child's prompt.
 *
 * @remarks
 *
 * WHY A SECOND SEAM: `tools/pre-execute` covers the model-facing `subagent`
 * tool (Function/Inject), but a child started straight through the harness
 * service (`ctx.subagents.startActivation` - the queue's spawn, any host
 * integration) never passes through a tool. The harness dispatches
 * `agent/pre-step` for EVERY agent (payload: `{ agent, messages, turn, step,
 * signal }`, decision: `{ kind: "enter", messages }`), and an untagged
 * listener receives every agent's event, so this listener sees the spawned
 * child at its first step and hands it the hint.
 *
 * THE CHILD TEST: `agent.options.subagentDepth` /
 * `session.header.delegationDepth` (the harness's own depth accounting) -
 * depth 0 is the main conversation, which the plugin never touches; a child
 * is depth >= 1.
 *
 * THE ROUTE THE HINT REPORTS: the child's OWN effective triple
 * (`agent.options.provider/model/reasoningEffort`, which the launch already
 * resolved) with the task type classified from the prompt text - the hint
 * states the lane the child actually runs on, never a route it is not using.
 *
 * IDEMPOTENCE: each delegated child receives its hint ONCE (the State's
 * `Hinted` set is keyed by the exact live agent), and a prompt that already
 * carries a hint (the tool path annotated it at launch) is left alone - so a
 * routed prompt carries exactly one hint, at the child's first offered
 * prompt.
 *
 * FAIL-OPEN: any error logs the byte-stable warning and returns the decision
 * UNCHANGED - a hint can never block or alter a step.
 */
/**
 * One model-facing content block (the fields the hint reads).
 */
interface Block {
    type?: string | undefined;
    text?: string | undefined;
}
/**
 * One step message (the harness's UserMessage, read structurally).
 */
interface Message {
    id?: string | undefined;
    role?: string | undefined;
    content?: readonly Block[] | undefined;
    source?: unknown;
}
/**
 * The child agent, read structurally (no harness import).
 */
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
/**
 * The `agent/pre-step` payload.
 */
interface Payload {
    agent: Child;
    messages: readonly Message[];
    turn: number;
    step: number;
    signal?: AbortSignal | undefined;
}
/**
 * The `agent/pre-step` decision.
 */
type Decision = {
    kind: "reject";
} | {
    kind: "enter";
    messages: Message[];
    startsRequestSeries?: true;
};
export default _default;
declare function _default(State: State, Payload_: Payload, Next: () => Promise<Decision>, Append: (Message: string) => void): Promise<Decision>;
