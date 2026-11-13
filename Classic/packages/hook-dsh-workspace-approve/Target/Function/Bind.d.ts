import type Binding from "../Interface/Binding.js";
import type Candidate from "../Interface/Candidate.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Bind
 *
 * The service's bind path: register one EXACT candidate as a pending binding.
 *
 * @remarks
 *
 * The exact-approval semantics:
 *
 * - The candidate must carry a non-empty path, a non-empty fingerprint and a
 *   non-empty version - a candidate missing its identity is rejected (decision
 *   `rejected`, ledger `rejected <path> (<reason>)`), never bound with made-up
 *   values.
 * - With config `requireConstraints` (the default), a candidate without at
 *   least one constraint is rejected - the constraints travel with the approval
 *   (APPROVE.md), so an approval without a stated constraint set is not an
 *   approval.
 * - The binding id is `ap-<sequence>`; the sequence is the plugin's own
 *   monotonic counter, never a wall clock.
 *
 * The CALL-TIME master switch: a disabled hook refuses with `undefined` and
 * ZERO ledger lines (the live-flip law - State.On is read at the moment of
 * the call, never captured at mount).
 */
declare function _default(State: State, Candidate: Candidate): Binding | undefined;
