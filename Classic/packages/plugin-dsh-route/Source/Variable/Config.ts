import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose, Policy } from "@playform/plugin-dsh-factory";
import { DEFAULT_KEYWORDS } from "@Variable/Keywords.js";
import { DEFAULT_POLICY } from "@Variable/Policy.js";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load instead of silently
 * falling back per-field, and `apply` receives a validated plain config
 * object. The shape this schema produces is Interface/Config.ts.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
 * uses `shared: false` - the MINIMAL shared block, ONLY the two universal
 * volatile cells (`log`, `logFile`). The plugin hooks the tools waterfalls,
 * not fs/observed, so the schema never advertises updateCooldownms /
 * mutationTools / policyFile / exclude - machinery the module has none of. The
 * plugin's own `logFile` default (its SEPARATE ledger, one log per module) is
 * supplied through its own fields.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin via the loader's loader/volatile-update
 * event; the factory's State builder refreshes the mapped State fields IN
 * PLACE, so a policy edit lands on the next launch without a remount (the
 * plan's "the config hot-reload or the restart").
 *
 * `enabled` defaults to TRUE - the shipped posture is ON, and a profile turns
 * it off with `enabled: false` (the LIVE disabled posture: a cold mount logs
 * `disabled (enabled=false)` and every listener and the service stay
 * registered, reading the flag at call time).
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
 */
// The route defaults, hoisted (P1): the CHEAP lane is the safe role default
// and the planner stays on the DeepSeek flash lane at max.
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-route.log";
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultRoleProvider = "cloudflare-workers-ai";
const DefaultRoleModel = "@cf/zai-org/glm-5.3-flash";
const DefaultRoleEffort = "low";
const DefaultDefaultRole = "explorer";
const DefaultPlannerProvider = "cloudflare-workers-ai";
const DefaultPlannerModel = "@cf/deepseek-ai/deepseek-v4.1-flash-1017";
const DefaultPlannerEffort = "max";
const DefaultEscalationEnabled = true;
const DefaultEscalationMax = 1;

// One role's schema (the route triple; effort exactly low / high / max).
const Role = () =>
	Schema.object({
		provider: Schema.string().default(DefaultRoleProvider),
		model: Schema.string().default(DefaultRoleModel),
		reasoningEffort: Schema.union(["low", "high", "max"]).default(DefaultRoleEffort),
	});

export default Compose(false, {
	// The MASTER SWITCH (volatile: a flip is read at the next launch with no
	// remount): false = the mount appends `disabled (enabled=false)` to the
	// ledger while the listeners and the service stay registered and pass
	// through silently.
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	// Ledger enabled - write the durable log file (volatile; overrides the
	// minimal shared block's empty default).
	log: Schema.boolean().default(DefaultLog).volatile(),
	// Ledger file - the plugin-dsh-route ledger (one log per module) -
	// volatile: hot-editable without remounting (overrides the minimal shared
	// block's empty default).
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The omission's default role: the CHEAP lane is the safe default - the
	// plan's incident is the expensive parent route being inherited silently.
	defaultRole: Schema.union(["explorer", "coder", "planner"])
		.default(DefaultDefaultRole)
		.volatile(),
	// The user's policy. The defaults are the shipped DEFAULT_POLICY (the
	// task-routing skill's routing table); the user's ~/.dsh values override
	// them through this schema - the plugin NEVER writes the policy.
	policy: Schema.object({
		coder: Role(),
		explorer: Role(),
		planner: Schema.object({
			provider: Schema.string().default(DefaultPlannerProvider),
			model: Schema.string().default(DefaultPlannerModel),
			reasoningEffort: Schema.union(["low", "high", "max"]).default(DefaultPlannerEffort),
		}),
		allowedModels: Schema.array(Schema.string()).default(DEFAULT_POLICY.allowedModels),
		escalation: Schema.object({
			enabled: Schema.boolean().default(DefaultEscalationEnabled),
			// The attempts ladder: at most ONE DeepSeek max re-dispatch.
			max: Schema.number().default(DefaultEscalationMax),
		}),
	})
		.default(DEFAULT_POLICY)
		.volatile(),
	// The keyword table for the task-type inference. The DICT is the volatile
	// cell; its leaves stay plain (the schemastery rule - the tool-coach's
	// patternTable precedent). A user dict MERGES over DEFAULT_KEYWORDS at
	// use time (Function/Classify), so user keywords add triggers.
	keywords: Schema.dict(Schema.array(Schema.string())).default(DEFAULT_KEYWORDS).volatile(),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block. The key is `automation`, NOT `policy` - this plugin's `policy`
	// is already the user's ROUTING policy (the role table, the allowed
	// models, the escalation ladder), and the two are different contracts.
	// The router reads and suggests (`read`/`suggest`, both automatic) and
	// never writes, commits or spawns - those verdicts are declared for family
	// uniformity and stay the shipped `approve`. A resolved pack's `policy`
	// section overrides the defaults per action (the wiring is the next
	// refinement).
	automation: Policy(),
});
