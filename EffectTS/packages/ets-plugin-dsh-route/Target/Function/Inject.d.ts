/**
 * @module Inject
 *
 * The silent route injection listener on the `subagent` tool's launch path.
 *
 * @remarks
 * ROUTING-ENFORCER-PLUGIN.md section 2.2: a tools/pre-execute waterfall
 * listener that intercepts the `subagent` tool (the launch path in the
 * current harness - the subagent tool's agentOptions carry provider / model
 * / reasoningEffort ONLY) and silently resolves + injects the route per the
 * user's policy.
 *
 * THE SILENCE CONTRACT: no warning, no error, no reminder. The
 * orchestrator's call succeeds exactly as if it had passed the right values;
 * the orchestrator NEVER sees the model configuration. The only record is
 * the plugin's own ledger line (section 2.3): the launch, the task type, the
 * resolved triple, and the explicit-or-resolved / corrected-or-kept flag.
 *
 * THE WATERFALL DISCIPLINE: next() is awaited FIRST; the listener is
 * fail-open - on any error a logger.warn records it and the downstream
 * decision is returned UNCHANGED. A routing failure never breaks a launch.
 * The mutation is in-place on the exec's arguments (the same pattern the
 * live-containers wave-2 detach listener uses for tagged execs), so the
 * downstream dispatch sees the injected route.
 *
 * THE ESCALATION MARKER (the completion wave): a launch whose spec carries
 * the delegation spec's `ESCALATION: <reason>` marker asks for the attempts
 * ladder's rung, so the request escalates and the rung's model is verified
 * against the LIVE catalog (Function/Catalog -> Function/Ladder) - the same
 * catalog `list_subagent_models` reads. A launch without the marker never
 * touches the catalog.
 *
 * THE HINT (the completion wave): the resolved lane is appended to the
 * launch's prompt as the byte-stable `[route: <taskType> <provider> <model>
 * <effort>]` line, so a routed prompt carries its hint INTO the child. A
 * prompt that already carries a hint is left alone (Function/Launch adds the
 * hint for children started outside this tool, and the two never double up).
 */
import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Route from "../Interface/Route.js";
import type State from "../Interface/State.js";
/**
 * The ledger line (the audit format, section 2.3 + exploration item 5).
 * Byte-stable template: `route <taskType> <source> <provider> <model> <effort>`.
 */
export declare const LedgerLine: (Route_: Route) => string;
export default _default;
declare function _default(State: State, Exec: ToolExecution, Next: () => Promise<PreToolDecision>, Append: (Message: string) => void): Promise<PreToolDecision>;
