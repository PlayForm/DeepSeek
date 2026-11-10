/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * durable activation proof, the `dshRoute` service instantiation and the two
 * launch-path listeners.
 *
 * @remarks
 * The function returns NOTHING - the loader treats apply returns specially,
 * and a returned value silently kills event delivery.
 *
 * The listener set is exactly two, the two halves of one seam:
 * Function/Inject on tools/pre-execute (the `subagent` tool's launch - the
 * silent route injection plus the prompt hint), and Function/Launch on
 * agent/pre-step (the child's first step - the hint for a child started
 * straight through `ctx.subagents.startActivation`, which never passes
 * through a tool).
 *
 * Everything else - the resolution, the classification, the escalation - is
 * the `dshRoute` service surface consumed by the sibling orchestration
 * plugins (the queue's routed dispatch) and by the user's audit.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
