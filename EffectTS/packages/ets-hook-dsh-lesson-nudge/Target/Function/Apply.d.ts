/**
 * @module Apply
 *
 * The plugin entry function: the State build, the activation proof, and the ONE listener
 * of the nudge's surface.
 *
 * @remarks
 * THE SURFACE IS `agent/status` (emit, idle <-> running). The idle edge is the only
 * moment a review may run: the turn is over, the driver is quiescent, and
 * `agent.runMaintenance` exists precisely to claim that phase for non-turn work.
 * Reviewing on any other edge would put a second model call beside the live turn's - the
 * exact contention the Hermes review avoids by forking after the turn and deferring on a
 * shared endpoint.
 *
 * THE FOUR GATES, in order, cheapest first:
 *
 * 1. the switch (`enabled`), so a disabled hook costs one comparison;
 * 2. the edge (`status === "idle"`);
 * 3. the service (`ctx.lesson`, probed per transition - the service may load after this
 *    hook, and a missing service is a WARN, never a throw into an emit);
 * 4. the cadence (`Lesson.Tick(agent).due`) and the hook's own cap
 *    (`maxReviewsPerSession`, the runaway guard for a mis-set interval).
 *
 * FAIL-OPEN, ALWAYS: every body is one try/catch. A status listener that throws breaks
 * the harness's status publication, which is a far worse outcome than a skipped review -
 * so the catch warns and returns.
 *
 * THE SNAPSHOT COMES FROM THE SERVICE (`Lesson.Snapshot(agent)`), not from this hook: the
 * projection of a live session into messages is the review package's integration seam,
 * and duplicating it here would give the same session two different digests depending on
 * who asked.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
