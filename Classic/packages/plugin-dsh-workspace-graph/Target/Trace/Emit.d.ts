/**
 * @module Emit
 *
 * The graph's trace emission: resolve the family's bus through the context probe
 * (`ctx.get("trace")`, the factory's optional-service posture - the graph does not inject the
 * factory) and publish one draft.
 *
 * @remarks
 * The bus is OPTIONAL: an absent service, an unmounted factory or a throwing probe is a silent
 * skip - the graph's own work (the store, the ledger) is already done and a trace failure can
 * never reach it.
 */
import type State from "../Interface/State.js";
import { type Draft } from "@playform/lib-dsh-trace";
export default _default;
declare function _default(StateRef: State, Draft: Draft): void;
