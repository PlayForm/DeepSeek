// Subagent - the SELF-CONTAINED declaration of the harness subagent
// service's start surface (the `ctx.subagents` service,
// @deepseek-ai/dsh-subagent's SubagentRuntime.startActivation). This is the
// ONLY launch seam the queue uses: never a private spawn, never a shell.
//
// The real contract (verified in the harness checkout,
// packages/subagent/subagent/src/index.ts):
//
//   startActivation(spec: SubagentActivationSpec): Promise<SubagentActivation>
//     spec.provider   - a REGISTERED backend name ("spawn", "fork", "acp", ...)
//     spec.label      - the short task label retained in the child catalog
//     spec.request    - { prompt: ContentBlock[], parent: Agent, agentOptions?,
//                         cwd?, maxDepth?, outputSchema? }
//     spec.signal     - the caller's cancellation (the activation's own channel)
//     spec.delivery   - "parent" notifies the model; "caller" only returns the
//                       result to the caller (the queue is the caller)
//   -> { childId, messageId?, result, dispose() }
//
// `startActivation` requires the EXACT live parent Agent (identity-compared
// against the registry), which is why the queue reads it from
// `ctx.agents.currentInitiator()` rather than constructing one.

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
	result: Promise<{ stopReason: string; output?: readonly Content[] }>;
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
