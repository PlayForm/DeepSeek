// Hint - the ROUTING HINT: the one-line statement of a routed lane that the
// child's prompt carries (the completion spec's acceptance: "a routed prompt
// injects the hint silently"). Byte-stable template:
//
//   [route: <taskType> <provider> <model> <effort>]
//
// The prefix is exported because the seam is IDEMPOTENT: both launch paths
// (tools/pre-execute for the `subagent` tool, agent/pre-step for a child that
// was started straight through `ctx.subagents.startActivation`) check for it
// before adding a hint, so one prompt never carries two.
//
// The hint is model-facing context, not a ledger line: the audit line stays
// `route <taskType> <source> <provider> <model> <effort>` (Function/Inject).
import type { Role } from "@Interface/Policy.js";

/** The hint's opening token (the idempotence marker). */
export const PREFIX = "[route: ";

/** The resolved triple plus the task type the hint names. */
export interface Hinted {
	taskType: Role;
	provider: string;
	model: string;
	reasoningEffort: string;
}

export default (Route: Hinted): string =>
	`${PREFIX}${Route.taskType} ${Route.provider} ${Route.model} ${Route.reasoningEffort}]`;
