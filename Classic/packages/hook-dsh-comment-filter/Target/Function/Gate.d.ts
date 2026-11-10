import type State from "../Interface/State.js";
/**
 * @module Gate
 *
 * The PER-CALL decision of the comment filter: `true` = strip this tool result, `false` = leave
 * it BY IDENTITY.
 *
 * @remarks
 *
 * The core then returns the downstream decision unchanged and writes no ledger line. It is PURE,
 * TOTAL and NEVER THROWS: the only inputs are the State and the execution's identity, and a
 * state that cannot be read means "leave the result alone" (the fail-open direction - a broken
 * gate must never corrupt a result).
 *
 * The arms, in order (the mission's order, which is also the cheapest-first order: two
 * string-list checks before the intent lookup):
 *
 * 1. the whole filter off (`enabled`) -> false
 * 2. the tool is not a target (`targets`) -> false
 * 3. the tool is exempt (`exempt`) -> false (the core arm checks the same list too - belt and
 *    braces: the module Gate is the decision point, the core list is the second line of defense)
 * 4. the intent gate off (`intent`) -> true (the blunt mode: strip unconditionally)
 * 5. the task text: the agent's last user message (stashed at `agent/pre-step`), lowercased;
 *    the global fallback when the execution carries no agent identity
 * 6. the task text mentions a comment keyword -> false (the task is ABOUT comments - stripping
 *    the very bytes it is asking about would sabotage it)
 * 7. anything else -> true (strip)
 *
 * `exec.agent` is the tool execution's agent identity (the harness's ToolExecutionInput.agent,
 * "the agent on whose behalf the call runs"); it is the SAME object the agent/pre-step payload
 * carries, which is what makes the `Map<object, string>` stash work. A call with no agent (a
 * bare dispatch) falls back to the last text seen by ANY agent - the documented Global fallback.
 */
/**
 * The structural tool execution: only the fields the gate reads.
 */
type Execution = {
    name?: unknown;
    agent?: unknown;
};
export default _default;
declare function _default(State: State, Exec: Execution): boolean;
