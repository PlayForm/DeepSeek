// Authorize - the authorization check (Function/Authorize): does the holder
// hold a NON-REVOKED, NON-EXPIRED capability covering (resource, operation)?
// The check is pure: it reads the capability records only - never the
// weights, never the residency. Authority is NOT knowledge: the five
// separate judgments stay separate, this is the permission judgment alone.
import type State from "@Interface/State.js";

export default (State: State, Holder: string, Resource: string, Operation: string): boolean => {
	switch (true) {
		case !State.On:
			State.Factory.Append(
				State,
				`denied ${Holder} ${Resource} (${Operation}, the authority is disabled)`,
			);
			return false;
	}
	const Now = Date.now();
	for (const Record of State.Capabilities.values()) {
		switch (true) {
			case Record.holder !== Holder:
			case Record.resource !== Resource:
			case Record.revoked:
			case Record.expiresAt !== undefined && Record.expiresAt <= Now:
			case !Record.operations.includes("*") && !Record.operations.includes(Operation):
				continue;
			default:
				State.Factory.Append(State, `authorized ${Holder} ${Resource} (${Operation})`);
				return true;
		}
	}
	State.Factory.Append(State, `denied ${Holder} ${Resource} (${Operation})`);
	return false;
};
