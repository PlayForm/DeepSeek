/**
 * @module Declare
 *
 * The validation recorder: the service's validate(), one claim to one object.
 *
 * @remarks
 * One claim becomes one validation object with its truth kind, its honest
 * verdict (the service records what the caller asserted - it never invents a
 * verdict), its declared dependencies, and a fresh status. A revalidation of
 * the same id SUPERSEDES the previous object (never resurrected to fresh
 * implicitly; the new object is the only fresh one).
 *
 * The store cap: when the store exceeds `maxValidations`, the oldest objects by
 * sequence drop first (the observe ring's cap pattern). The sequence is the
 * service's own monotonic counter - never a wall clock.
 */
import type State from "@Interface/State.js";
import type { TruthKind } from "@Interface/TruthKind.js";
import type Validation from "@Interface/Validation.js";
export default _default;
declare function _default(State: State, Id: string, Kind: TruthKind, Subject: string, Dependencies: string[], Verdict: "verified" | "unverified"): Validation;
