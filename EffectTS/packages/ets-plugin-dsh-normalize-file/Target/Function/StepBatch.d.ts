import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import type State from "@Interface/State.js";
declare const _default: (P: {
    turn?: unknown;
    step?: unknown;
}, Next: () => Promise<PreStepDecision>, State: State) => Promise<PreStepDecision>;
export default _default;
