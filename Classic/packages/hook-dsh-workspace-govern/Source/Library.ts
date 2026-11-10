import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

/**
 * @module Library
 *
 * The entry module of the WORKSPACE-GOVERN hook
 * (@playform/hook-dsh-workspace-govern).
 *
 * @remarks
 *
 * Loader contract: `export const name` plus `export const apply` plus
 * `export const Config` plus `export const inject` plus
 * `export default { name, apply, Config, inject }` - the ONLY named exports in
 * the tree (cordis requires them); every other module is a nameless default
 * export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the default
 * object, or service accessors throw `cannot get property ... without inject`
 * (live-verified in the factory; a smoke that calls apply directly never
 * catches this).
 *
 * THE ROLE: the governance gate of the invisible flow - operate proposes ->
 * the govern gates -> the authority licenses. On every gated tools/pre-execute
 * call, and for every proposal handed to the `workspaceGovern` service, the
 * hook runs the four INDEPENDENT MEANS-CHECKS on the ProposedChange:
 *
 * - `contributes` - the proposal declares what it contributes to the operation
 *   (the intent-model semantics: an intent must not authorize its own means,
 *   so the gate checks the MEANS independently of the intent).
 * - Authorized scope - the target lies inside the actor's claimed scope (the
 *   scope allowlist; fail-CLOSED per the recovery table - an unevaluable scope
 *   check denies).
 * - Policy - the policy table lookup by proposal kind (allow | deny |
 *   escalate; a policy-table read failure fails OPEN - the gate never blocks on
 *   its own config).
 * - Preconditions - the proposal's declared preconditions are satisfied
 *   (explicitly unsatisfied denies; unevaluable fails OPEN).
 *
 * The outcome is one gate decision: pass, deny (the waterfall returns the deny
 * decision downstream - the proposals become effects ONLY through the gates),
 * or escalate (the ask decision - the approval is the approve family's step).
 * Recursion prevention: every proposal carries the operation identifier, the
 * parent identifier and the event category, and an operation identifier gated
 * more than the loop bound is dropped with a ledger line.
 *
 * The plugin is the OBJECT form (name/apply/Config/inject); the
 * `workspaceGovern` service is a Service subclass in its own module
 * (`Function/Service`) and is registered from apply - the same posture the
 * workspace-observe hook uses.
 */
export const name = "hook-dsh-workspace-govern";

/**
 * Loader contract (cordis): the exported schema is validated and defaulted
 * while the plugin loads; apply receives a plain validated config object.
 */
export const Config = Definition;

/**
 * The compiled package version (`Source/Variable/Version`, built in by the
 * ESBuild define) - NOT a loader key: the contract's four names (name, apply,
 * Config, inject) are unchanged, and the default object below stays exactly
 * { name, apply, Config, inject }.
 */
export { Version };

/**
 * Required services. `pluginFactory` provides the State builder (cell unwrap
 * plus shared fields plus the P10 volatile refresh) and the ledger. No `fs`
 * inject: the gate reads no file content - it decides on the proposal record
 * alone.
 */
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
