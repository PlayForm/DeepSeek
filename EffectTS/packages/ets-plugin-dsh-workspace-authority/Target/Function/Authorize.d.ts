import type State from "../Interface/State.js";
export default _default;
/**
 * @module Authorize
 *
 * The authorization check: whether the holder holds a covering capability.
 *
 * @remarks
 *
 * Does the holder hold a NON-REVOKED, NON-EXPIRED capability covering
 * (resource, operation)? The check is pure: it reads the capability records
 * only - never the weights, never the residency. Authority is NOT
 * knowledge: the five separate judgments stay separate, this is the
 * permission judgment alone.
 */
declare function _default(State: State, Holder: string, Resource: string, Operation: string): boolean;
