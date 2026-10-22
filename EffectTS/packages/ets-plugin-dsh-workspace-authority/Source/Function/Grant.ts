// Grant - the capability grant path (Function/Grant): validate, enforce the
// per-holder ceiling, stamp the record, ledger. The capability is the
// WHAT record: the holder, the resource, the permitted operations, the
// expiration, the delegation rule - never a weight, never a priority (the
// license/weight conflation is a logged pitfall). A grant when disabled is
// refused honestly ("the authority is disabled"), never faked.
import type Capability from "@Interface/Capability.js";
import type State from "@Interface/State.js";

export default (
	State: State,
	Spec: {
		holder: string;
		resource: string;
		operations: string[];
		expiresAt?: number | undefined;
		delegation?: "none" | "delegate";
	},
): Capability | undefined => {
	switch (true) {
		case !State.On:
			State.Factory.Append(State, `refused grant (the authority is disabled)`);
			return undefined;
		case typeof Spec?.holder !== "string" ||
			Spec.holder.length === 0 ||
			typeof Spec.resource !== "string" ||
			Spec.resource.length === 0 ||
			!Array.isArray(Spec.operations) ||
			Spec.operations.length === 0:
			State.Factory.Append(State, `refused grant (invalid specification)`);
			return undefined;
	}
	const Held = [...State.Capabilities.values()].filter(
		(Record) => Record.holder === Spec.holder && !Record.revoked,
	).length;
	if (Held >= State.MaxCapabilities) {
		State.Factory.Append(State, `refused grant (${Spec.holder} holds ${Held})`);
		return undefined;
	}
	State.Sequence += 1;
	const Record: Capability = {
		id: `cap:${State.Sequence}`,
		holder: Spec.holder,
		resource: Spec.resource,
		operations: [...Spec.operations],
		createdAt: Date.now(),
		expiresAt: Spec.expiresAt,
		delegation: Spec.delegation === "delegate" ? "delegate" : "none",
		revoked: false,
	};
	State.Capabilities.set(Record.id, Record);
	State.Factory.Append(
		State,
		`granted ${Record.id} (${Record.holder} -> ${Record.resource}, ${Record.operations.join(",")})`,
	);
	return Record;
};
