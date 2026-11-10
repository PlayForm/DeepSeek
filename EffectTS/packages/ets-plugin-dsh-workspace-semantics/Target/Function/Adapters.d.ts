import type State from "../Interface/State.js";
export default _default;
/**
 * @module Adapters
 *
 * The opt-in any-file adapter registration: each configured NAME is resolved
 * through the catalog (Variable/Adapters) and registered.
 *
 * @remarks
 *
 * Registration goes through the same Function/Register the service's `adapt()`
 * uses, so every registration keeps its byte-exact
 * `adapters registered (N extensions)` line. The names are validated at load
 * (Function/Apply's Validate), so an unknown name never reaches this module.
 */
declare function _default(State: State, Names: string[]): void;
