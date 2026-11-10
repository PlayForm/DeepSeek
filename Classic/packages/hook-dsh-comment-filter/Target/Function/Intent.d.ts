/**
 * @module Intent
 *
 * The `agent/pre-step` waterfall listener: the PER-TASK INTENT STASH.
 *
 * @remarks
 * It is a PURE OBSERVER of the step: `next()` is awaited FIRST and the downstream decision is
 * returned UNCHANGED (the decision contract belongs to the agent loop; this listener only
 * records). On every step it extracts the LAST USER MESSAGE's text, lowercases it, and stores
 * it:
 *
 * - in `State.IntentMap`, keyed by `payload.agent` (the agent proposing the step - the SAME
 *   object a tool execution carries as `exec.agent`, which is what makes the per-agent lookup
 *   in Function/Gate work), and
 * - in `State.Global`, the fallback for a dispatch with no agent identity.
 *
 * WHY A STASH AND NOT A RE-READ: the `tools/post-execute` arm cannot see the conversation - it
 * sees one execution and its result. The intent has to be captured where the messages are
 * visible (the step) and consulted where the bytes are (the result). The stash is the seam
 * between them, and the gate's whole point: a task whose last user message is ABOUT comments
 * must keep them.
 *
 * A STEP WITH NO USER MESSAGE KEEPS THE PREVIOUS INTENT: a later step of the same task usually
 * carries tool results and assistant text only, and wiping the stash there would silently
 * defeat the gate for every read after the first step - the feature would work only on step
 * one.
 *
 * FAIL-OPEN: anything that throws (a malformed payload, a weird content shape) leaves the
 * previous stash untouched and the decision unchanged - never throw into the waterfall.
 */
import type State from "@Interface/State.js";
export default _default;
declare function _default<Decision>(Payload: unknown, Next: () => Promise<Decision>, State: State): Promise<Decision>;
