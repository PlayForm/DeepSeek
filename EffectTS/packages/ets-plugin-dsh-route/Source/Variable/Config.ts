// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load
// instead of silently falling back per-field, and `apply` receives a
// validated plain config object. The shape this schema produces is
// Interface/Config.ts.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
// a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The plugin hooks the tools waterfalls,
// not fs/observed, so the schema never advertises updateCooldownms /
// mutationTools / policyFile / exclude - machinery the module has none of.
// The plugin's own `logFile` default (its SEPARATE ledger, one log per
// module) is supplied through its own fields.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-
// update event; the factory's State builder refreshes the mapped State
// fields IN PLACE, so a policy edit lands on the next launch without a
// remount (the plan's "the config hot-reload or the restart").
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";
import { DEFAULT_KEYWORDS } from "@Variable/Keywords.js";
import { DEFAULT_POLICY } from "@Variable/Policy.js";

// One role's schema (the route triple; effort exactly low / high / max).
const Role = () =>
	Schema.object({
		provider: Schema.string().default("cloudflare-workers-ai"),
		model: Schema.string().default("@cf/zai-org/glm-5.3-flash"),
		reasoningEffort: Schema.union(["low", "high", "max"]).default("low"),
	});

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/route.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The omission's default role: the CHEAP lane is the safe default - the
	// plan's incident is the expensive parent route being inherited silently.
	defaultRole: Schema.union(["explorer", "coder", "planner"]).default("explorer").volatile(),
	// The user's policy. The defaults are the shipped DEFAULT_POLICY (the
	// task-routing skill's routing table); the user's ~/.dsh values override
	// them through this schema - the plugin NEVER writes the policy.
	policy: Schema.object({
		coder: Role(),
		explorer: Role(),
		planner: Schema.object({
			provider: Schema.string().default("cloudflare-workers-ai"),
			model: Schema.string().default("@cf/deepseek-ai/deepseek-v4.1-flash-1017"),
			reasoningEffort: Schema.union(["low", "high", "max"]).default("max"),
		}),
		allowedModels: Schema.array(Schema.string()).default(DEFAULT_POLICY.allowedModels),
		escalation: Schema.object({
			enabled: Schema.boolean().default(true),
			// The attempts ladder: at most ONE DeepSeek max re-dispatch.
			max: Schema.number().default(1),
		}),
	})
		.default(DEFAULT_POLICY)
		.volatile(),
	// The keyword table for the task-type inference. The DICT is the volatile
	// cell; its leaves stay plain (the schemastery rule - the tool-coach's
	// patternTable precedent). A user dict MERGES over DEFAULT_KEYWORDS at
	// use time (Function/Classify), so user keywords add triggers.
	keywords: Schema.dict(Schema.array(Schema.string())).default(DEFAULT_KEYWORDS).volatile(),
});
