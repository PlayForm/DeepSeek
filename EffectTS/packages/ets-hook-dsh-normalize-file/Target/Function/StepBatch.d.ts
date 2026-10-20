import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import type State from "@Interface/State.js";
/** A structural pre-step payload: only the fields the arm reads. */
type Payload = {
    turn?: unknown;
    step?: unknown;
    messages?: readonly unknown[];
};
export default _default;
/** The agent/pre-step arm (the listener body; Function/Apply registers it
 *  with default ordering - nothing needs to precede it). */
declare function _default(P: Payload, Next: () => Promise<PreStepDecision>, State: State): Promise<PreStepDecision>;
