import type State from "@Interface/State.js";
export default _default;
/**
 * @module Adapter
 *
 * The context's trace adapter: the `graph/invalidated` memo invalidation.
 *
 * @remarks
 *
 * D5. The bus (`ctx.trace`) is provided by
 * @playform/ets-plugin-dsh-factory, which the context already injects; the
 * adapter resolves it through the factory's probe-once `Seam` accessor
 * (`ctx.get("trace")`), so a context without the bus (a bare fixture)
 * behaves exactly as before and subscribes to nothing.
 *
 * Wired from apply ONLY after the enabled gate (the IDLE-forever posture: a
 * disabled context wires nothing), and the subscription is registered on
 * the fiber effect so an unload drops it.
 */
declare function _default(State: State): void;
