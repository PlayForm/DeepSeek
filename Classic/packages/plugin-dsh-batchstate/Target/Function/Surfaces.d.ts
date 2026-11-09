import type State from "../Interface/State.js";
export default _default;
/**
 * @module Surfaces
 *
 * The write API's setScope: the scope registry update - the surfaces (paths) the member owns.
 *
 * @remarks
 *
 * The list is copied (the caller's array is never aliased), the update is ledgered and emitted
 * after the state is updated.
 */
declare function _default(State: State, Agent: string, Surfaces: string[]): void;
