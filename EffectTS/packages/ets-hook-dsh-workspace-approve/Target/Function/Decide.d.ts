import type Binding from "../Interface/Binding.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Decide
 *
 * The human decision paths (Function/Decide): approve, deny, revoke.
 *
 * @remarks
 *
 * The decision records the COMMITMENT (who accepted responsibility - NOT the
 * authorization machinery itself, which is the authority's job two steps
 * earlier in the flow) and flips the binding's lifecycle state.
 *
 *   - approve(id, who, constraints?): a `pending` binding becomes
 *     `approved`. Constraints provided at approval time are compared with
 *     the bound ones: a changed constraint set REJECTS the approval - the
 *     constraints travel with the approval (APPROVE.md), so modifying them
 *     afterwards is a new candidate, not an amendment.
 *   - deny(id, who): a `pending` binding becomes `denied`.
 *   - revoke(id, who): an `approved` binding becomes `revoked` (a later
 *     decision supersedes the earlier one).
 *   - Any other transition is refused with its own ledger line and the
 *     binding is returned unchanged.
 */
declare function _default(State: State, Id: string, Action: "approve" | "deny" | "revoke", Who: string, Constraints: string[] | undefined): Binding | undefined;
