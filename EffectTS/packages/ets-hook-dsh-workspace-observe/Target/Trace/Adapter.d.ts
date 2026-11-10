import type Stamp from "../Interface/Stamp.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Adapter
 *
 * The observe hook's trace adapter (D5: the first source of the indexer): on
 * each recorded stamp, emit `observe/stamp` on the family's bus.
 *
 * @remarks
 *
 * THE BUS IS OPTIONAL HERE: the service (`ctx.trace`) is provided by
 * @playform/ets-plugin-dsh-factory, and the hook already injects the
 * factory - the adapter resolves the bus through the factory's probe-once
 * `Seam` accessor (`ctx.get("trace")`), so a context without the bus (a bare
 * fixture, an unmounted factory) records stamps exactly as before and emits
 * nothing. The emit never throws into the recorder: the adapter is one
 * contained call and the bus itself is fail-open.
 */
declare function _default(State: State, Stamp: Stamp): void;
