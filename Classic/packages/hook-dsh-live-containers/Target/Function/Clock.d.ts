import type State from "../Interface/State.js";
export default _default;
/**
 * @module Clock
 *
 * The ONLY time source in the module.
 *
 * @remarks
 *
 * The smoke's fake-clock requirement, IMPLEMENTATION-DESIGN.md section 7.1:
 * "the plugin reads time ONLY through a Clock module ... the smoke advances
 * the clock, never sleeps". Production leaves `State.Now` undefined and the
 * clock falls back to `Date.now()`; the smoke sets `State.Now` through the
 * `ctx.__hookDshLiveContainersState` probe attachment. Every read is
 * defensive: a throwing override degrades to the real clock, never a throw
 * into a listener.
 */
declare function _default(Agent: State): number;
