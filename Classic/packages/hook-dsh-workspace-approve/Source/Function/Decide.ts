// Decide - the human decision paths (Function/Decide): approve, deny, revoke.
// The decision records the COMMITMENT (who accepted responsibility - NOT the
// authorization machinery itself, which is the authority's job two steps
// earlier in the flow) and flips the binding's lifecycle state.
//
//   * approve(id, who, constraints?): a `pending` binding becomes
//     `approved`. Constraints provided at approval time are compared with
//     the bound ones: a changed constraint set REJECTS the approval - the
//     constraints travel with the approval (APPROVE.md), so modifying them
//     afterwards is a new candidate, not an amendment.
//   * deny(id, who): a `pending` binding becomes `denied`.
//   * revoke(id, who): an `approved` binding becomes `revoked` (a later
//     decision supersedes the earlier one).
//   * Any other transition is refused with its own ledger line and the
//     binding is returned unchanged.
import Record from "@Function/Record.js";
import type Binding from "@Interface/Binding.js";
import type State from "@Interface/State.js";

export default (
	State: State,
	Id: string,
	Action: "approve" | "deny" | "revoke",
	Who: string,
	Constraints: string[] | undefined,
): Binding | undefined => {
	const Binding = State.ById.get(Id);
	if (Binding === undefined) {
		State.Factory.Append(State, `unknown ${Id}`);
		return undefined;
	}
	const By = Who.length > 0 ? Who : "unknown";
	switch (Action) {
		case "approve":
			if (Binding.decision !== "pending") {
				State.Factory.Append(
					State,
					`refused ${Binding.id} (approve on ${Binding.decision})`,
				);
				return Binding;
			}
			if (
				Constraints !== undefined &&
				JSON.stringify(Constraints) !== JSON.stringify(Binding.constraints)
			) {
				Binding.decision = "rejected";
				Binding.committedBy = By;
				State.Factory.Append(State, `rejected ${Binding.id} (constraints changed)`);
				Record(State, Binding);
				return Binding;
			}
			Binding.decision = "approved";
			Binding.committedBy = By;
			State.Factory.Append(State, `decided ${Binding.id} approved by ${By}`);
			Record(State, Binding);
			return Binding;
		case "deny":
			if (Binding.decision !== "pending") {
				State.Factory.Append(State, `refused ${Binding.id} (deny on ${Binding.decision})`);
				return Binding;
			}
			Binding.decision = "denied";
			Binding.committedBy = By;
			State.Factory.Append(State, `decided ${Binding.id} denied by ${By}`);
			Record(State, Binding);
			return Binding;
		case "revoke":
			if (Binding.decision !== "approved") {
				State.Factory.Append(
					State,
					`refused ${Binding.id} (revoke on ${Binding.decision})`,
				);
				return Binding;
			}
			Binding.decision = "revoked";
			Binding.committedBy = By;
			State.Factory.Append(State, `revoked ${Binding.id} by ${By}`);
			Record(State, Binding);
			return Binding;
	}
};
