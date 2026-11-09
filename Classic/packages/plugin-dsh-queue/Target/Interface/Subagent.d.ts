/**
 * @module Subagent
 *
 * The SELF-CONTAINED declaration of the harness subagent
 * service's start surface (the `ctx.subagents` service,
 * @deepseek-ai/dsh-subagent's SubagentRuntime.startActivation).
 *
 * @remarks
 * This is the
 * ONLY launch seam the queue uses: never a private spawn, never a shell.
 *
 * The real contract (verified in the harness checkout,
 * packages/subagent/subagent/src/index.ts):
 *
 *   startActivation(spec: SubagentActivationSpec): Promise<SubagentActivation>
 *     spec.provider   - a REGISTERED backend name ("spawn", "fork", "acp", ...)
 *     spec.label      - the short task label retained in the child catalog
 *     spec.request    - { prompt: ContentBlock[], parent: Agent, agentOptions?,
 *                         cwd?, maxDepth?, outputSchema? }
 *     spec.signal     - the caller's cancellation (the activation's own channel)
 *     spec.delivery   - "parent" notifies the model; "caller" only returns the
 *                       result to the caller (the queue is the caller)
 *   -> { childId, messageId?, result, dispose() }
 *
 * `startActivation` requires the EXACT live parent Agent (identity-compared
 * against the registry), which is why the queue reads it from
 * `ctx.agents.currentInitiator()` rather than constructing one.
 */
import type Agent from "./Agent.js";
import type { AgentRoute } from "./Task.js";
/**
 * One model-facing content block (the harness's ContentBlock subset the
 * queue writes: a single text block carrying the task's spec verbatim).
 */
export interface Content {
    /**
     * The block kind (`text` only).
     */
    type: "text";
    /**
     * The block's text (the task's spec verbatim).
     */
    text: string;
}
/**
 * The start request the activation carries (label/signal live on the spec).
 */
export interface SubagentRequest {
    /**
     * The prompt blocks: one text block carrying the task's spec verbatim.
     */
    prompt: Content[];
    /**
     * The EXACT live parent Agent (identity-compared by the harness).
     */
    parent: Agent;
    /**
     * The resolved route in the harness's launch form, when routed.
     */
    agentOptions?: AgentRoute | undefined;
    /**
     * The child's working directory override.
     */
    cwd?: string | undefined;
    /**
     * The depth limit below the current agent.
     */
    maxDepth?: number | undefined;
}
/**
 * One managed child execution (the activation's caller-facing half).
 */
export interface SubagentActivation {
    /**
     * The harness child's id.
     */
    childId: string;
    /**
     * The model-visible message id, when the delivery is "parent".
     */
    messageId?: string | undefined;
    /**
     * The child's terminal result (stopReason plus optional output blocks).
     */
    result: Promise<{
        stopReason: string;
        output?: readonly Content[];
    }>;
    /**
     * Dispose the activation.
     */
    dispose: () => Promise<void>;
}
/**
 * The activation spec the queue builds.
 */
export interface SubagentActivationSpec {
    /**
     * A REGISTERED backend name ("spawn", "fork", "acp", ...).
     */
    provider: string;
    /**
     * The short task label retained in the child catalog.
     */
    label: string;
    /**
     * The start request (prompt, parent, agentOptions).
     */
    request: SubagentRequest;
    /**
     * The caller's cancellation (the activation's own channel).
     */
    signal: AbortSignal;
    /**
     * "parent" notifies the model; "caller" only returns the result to the
     * caller (the queue is the caller).
     */
    delivery: "parent" | "caller";
}
/**
 * The structural shape the queue probes for (the `ctx.subagents` service).
 */
export default interface SubagentsService {
    /**
     * Start one managed child execution.
     */
    startActivation: (Spec: SubagentActivationSpec) => Promise<SubagentActivation>;
    /**
     * One registered backend by name, or undefined.
     */
    getProvider?: ((Name: string) => unknown) | undefined;
    /**
     * The registered backend names.
     */
    list?: (() => string[]) | undefined;
}
