// Ladder - the escalation rung's MODEL, verified against the LIVE catalog
// (ROUTING-ENFORCER-PLUGIN.md section 2.2 + exploration item 4): the policy's
// planner row is the rung, but its model is only usable when the provider
// actually advertises it. The catalog is the one `list_subagent_models`
// reads (`ctx.llm.listProviders` / `listModels`), so a model that left the
// catalog can never be silently routed to.
//
// The rule, deterministic and confined to the user's allowed set:
//   1. the rung's own model, when the catalog advertises it (or when no
//      catalog could be read - fail-open to the policy, the user's law);
//   2. otherwise the FIRST advertised model that is also in
//      `policy.allowedModels` (the fallback lane, e.g. deepseek-v4-flash-0731
//      when the primary 1017 left the catalog);
//   3. otherwise the policy's rung unchanged (no proof either way).
//
// The plugin never invents a model: every candidate comes from the user's
// allowed set, and the escalation's effort stays the planner row's `max`.
import type { PolicyShape, RoleSpec } from "@Interface/Policy.js";

export default (Policy: PolicyShape, Advertised?: readonly string[]): RoleSpec => {
	const Rung = Policy.planner;
	if (Advertised === undefined || Advertised.includes(Rung.model)) {
		return { ...Rung };
	}
	const Fallback = Advertised.find((Model) => Policy.allowedModels.includes(Model));
	return Fallback === undefined ? { ...Rung } : { ...Rung, model: Fallback };
};
