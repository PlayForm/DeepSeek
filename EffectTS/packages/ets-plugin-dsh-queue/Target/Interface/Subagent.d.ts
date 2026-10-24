import type Agent from "./Agent.js";
import type { AgentRoute } from "./Task.js";
/** One model-facing content block (the harness's ContentBlock subset the
 * queue writes: a single text block carrying the task's spec verbatim). */
export interface Content {
    type: "text";
    text: string;
}
/** The start request the activation carries (label/signal live on the spec). */
export interface SubagentRequest {
    prompt: Content[];
    parent: Agent;
    agentOptions?: AgentRoute | undefined;
    cwd?: string | undefined;
    maxDepth?: number | undefined;
}
/** One managed child execution (the activation's caller-facing half). */
export interface SubagentActivation {
    childId: string;
    messageId?: string | undefined;
    result: Promise<{
        stopReason: string;
        output?: readonly Content[];
    }>;
    dispose: () => Promise<void>;
}
/** The activation spec the queue builds. */
export interface SubagentActivationSpec {
    provider: string;
    label: string;
    request: SubagentRequest;
    signal: AbortSignal;
    delivery: "parent" | "caller";
}
/** The structural shape the queue probes for (the `ctx.subagents` service). */
export default interface SubagentsService {
    startActivation: (Spec: SubagentActivationSpec) => Promise<SubagentActivation>;
    getProvider?: ((Name: string) => unknown) | undefined;
    list?: (() => string[]) | undefined;
}
