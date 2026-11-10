import type State from "@Interface/State.js";
export default _default;
/**
 * @module Clock
 *
 * The only time source in the module.
 *
 * @remarks
 *
 * This follows the live-containers Clock precedent and the no-real-timers
 * rule: the smoke advances the clock, never sleeps. Production leaves
 * State.Now undefined and the clock falls back to Date.now(); the smoke sets
 * State.Now through the `ctx.__hookDshWorkspaceMonitorState` probe
 * attachment. Every read is defensive: a throwing override degrades to the
 * real clock, never a throw into a listener.
 */
declare function _default(Agent: State): number;
