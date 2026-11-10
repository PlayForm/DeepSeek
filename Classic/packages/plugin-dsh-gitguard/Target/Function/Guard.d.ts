/**
 * @module Guard
 *
 * The tools/pre-execute listener (Function/Guard): the intercept
 * (ORCHESTRATION-PLUGINS.md section 3). Registered as a WATERFALL on the
 * plugin's own context (the guard judges only the dispatches the terminal
 * surface delivers; root registration is NOT used - a pre-execute transform is
 * scoped, unlike the observation listeners).
 *
 * @remarks
 * THE DISCIPLINE:
 *
 * - fail-open: ANY error in the guard body means the dispatch passes UNCHANGED
 *   (the guard must never break a legitimate tool call - the whole judged path
 *   is one try/catch, and the catch calls next());
 * - the deny arm is the ONE listener that deliberately omits next(): the
 *   refusal REPLACES the dispatch (the command must never execute - the plan's
 *   "the agent's correct path is simply the only executable one");
 * - denials surface ONCE (the refusal is the returned decision) and are
 *   ledgered for the user's audit - NEVER punished (no second refusal, no
 *   escalation);
 * - a command the guard cannot read (no command string found in the dispatch)
 *   passes unchanged - the guard never guesses.
 *
 * THE EXCLUDE: a dispatch whose working directory matches the configured
 * exclusion list (the factory's segment match) skips the guard entirely - the
 * paths the user declared out of the guard's jurisdiction.
 */
import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Payload: ToolExecution, Next: () => Promise<PreToolDecision>): Promise<PreToolDecision>;
