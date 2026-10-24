// Resolve - the role-resolution service's deterministic core
// (ROUTING-ENFORCER-PLUGIN.md section 2.1): Routing(launchRequest, UserPolicy)
// -> { provider, model, reasoningEffort }. Pure and deterministic - the same
// request and the same policy always produce the same route. NO LLM
// involvement, NO ambiguity.
//
// The policy is the law (section 3): the user's configuration is the
// plugin's law and the plugin never decides policy itself.
//
//   - A declared or inferred task type selects the policy's role row.
//   - An explicitly passed route is kept ONLY when it is complete (all three
//     fields) and legal: the model is in the allowed set AND the route
//     matches the role row (the task-type rules). A partial or illegal
//     explicit route is silently CORRECTED to the policy row (the
//     user's configuration is the law; the orchestrator is never bothered)
//     and the audit trail keeps what was passed.
//   - The escalation flag overrides everything: the escalation rung is the
//     planner lane (DeepSeek max) per the attempts ladder, when the policy
//     enables escalation. The rung's model is verified against the LIVE
//     catalog when the caller read one (Function/Ladder), so a model that
//     left the catalog can never be routed to.
import Classify from "@Function/Classify.js";
import Ladder from "@Function/Ladder.js";
import type { Role, RoleSpec } from "@Interface/Policy.js";
import type Request from "@Interface/Request.js";
import type Route from "@Interface/Route.js";
import { DEFAULT_KEYWORDS } from "@Variable/Keywords.js";

export default (
	Request_: Request,
	Policy: {
		coder: RoleSpec;
		explorer: RoleSpec;
		planner: RoleSpec;
		allowedModels: string[];
		escalation: { enabled: boolean; max: number };
	},
	DefaultRole: Role,
	Keywords = DEFAULT_KEYWORDS,
	Advertised?: readonly string[],
): Route => {
	// The escalation rung: the planner lane at max, when the policy allows it
	// (the attempts ladder's automatic DeepSeek re-dispatch with artifacts).
	if (Request_.escalate === true && Policy.escalation.enabled) {
		return { ...Ladder(Policy, Advertised), taskType: "planner", source: "escalated" };
	}
	// The task type: the declared one, else the keyword inference, else the
	// policy's default role (the omission's cheap lane).
	const Role_ = Request_.taskType ?? Classify(Request_.spec ?? "", Keywords) ?? DefaultRole;
	const Resolved: RoleSpec = Policy[Role_];
	const Passed = Request_.route;
	const Complete =
		Passed !== undefined &&
		typeof Passed.provider === "string" &&
		Passed.provider.length > 0 &&
		typeof Passed.model === "string" &&
		Passed.model.length > 0 &&
		typeof Passed.reasoningEffort === "string" &&
		Passed.reasoningEffort.length > 0;
	const Legal =
		Complete &&
		Policy.allowedModels.includes(Passed.model as string) &&
		Passed.model === Resolved.model &&
		Passed.provider === Resolved.provider &&
		Passed.reasoningEffort === Resolved.reasoningEffort;
	if (Legal) {
		// A complete, policy-legal explicit route: untouched (the user's
		// configuration agrees with the orchestrator).
		return {
			provider: Passed.provider as string,
			model: Passed.model as string,
			reasoningEffort: Passed.reasoningEffort as RoleSpec["reasoningEffort"],
			taskType: Role_,
			source: "kept",
			passed: Passed,
		};
	}
	if (Complete) {
		// Complete but ILLEGAL: silently corrected per the policy (section 2.2).
		return { ...Resolved, taskType: Role_, source: "corrected", passed: Passed };
	}
	// The omission (or a partial explicit route): resolved silently.
	return { ...Resolved, taskType: Role_, source: "resolved" };
};
