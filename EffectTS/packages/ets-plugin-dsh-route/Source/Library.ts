// Library - the entry module of the ROUTING ENFORCER
// (@playform/plugin-dsh-route). Loader contract: `export const name` +
// `export const apply` + `export const Config` + `export const inject` +
// `export default { name, apply, Config, inject }` - the ONLY named exports
// in the tree (cordis requires them); every other module is a nameless
// default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "..." without
// inject` (the live-verified lesson recorded in the plugin-development skill
// and in the live-containers entry).
//
// @playform/plugin-dsh-route - the routing enforcer: the SILENT model-route
// policy enforcement on every subagent launch. The user owns the
// configuration (the policy in his config files); the plugin enforces it,
// model-independently, and the orchestrator is NOT even bothered:
//
//   - A launch that omits provider/model/reasoningEffort is resolved per the
//     user's policy (the task-type rules of the task-routing skill) and the
//     resolved triple is INJECTED into the launch. No warning, no error, no
//     reminder.
//   - An explicit-but-wrong route is silently CORRECTED per the policy and
//     logged to the plugin's own ledger - never surfaced to the orchestrator.
//   - The routing hint (`[route: <taskType> <provider> <model> <effort>]`)
//     rides into the child's prompt through BOTH halves of the launch seam:
//     the `subagent` tool's tools/pre-execute waterfall (the launch prompt)
//     and the child's agent/pre-step waterfall (a child started straight
//     through `ctx.subagents.startActivation` never passes through a tool).
//   - The escalation path (the attempts ladder: one DeepSeek max re-dispatch
//     with the artifacts) is automatic and silent: an `ESCALATION:` marker in
//     the launch spec selects the rung, whose model is verified against the
//     LIVE catalog (`ctx.llm.listModels` - the `list_subagent_models` source).
//   - Every resolved route is recorded in the plugin's ledger (the audit
//     format the user reads when he reviews his configuration).
//
// The task-type inference applies the documented keyword table
// (Variable/Keywords) when the launch does not declare a role; the user's
// policy is the final authority.
//
// The plugin ships DISABLED - the IDLE-forever posture: it never appears in
// the profile's bundles and enables only by an explicit ACTIVATE; a cold
// mount logs `disabled (enabled=false)` and both launch-path listeners no-op
// to a passthrough (they check State.On first).
//
// Sits NEXT TO the BATCH-STATE plugin in the orchestration layer
// (Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md section 0); the
// subagent-queue plugin's dispatcher consumes the `dshRoute` service for the
// routed dispatch. The interface imports are type-only and publish the
// `tools/pre-execute` vocabulary through @deepseek-ai/dsh-tools' own
// augmentations (never re-declared here).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "plugin-dsh-route";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services. The factory (@playform/ets-plugin-dsh-factory) provides the
// State builder (cell unwrap + shared fields + the P10 volatile refresh) and
// the ledger. The plugin registers NO fs/observed listener and never touches
// the factory executor; it never writes files outside its own ledger.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
