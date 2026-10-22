// Residence - the residency record path (Function/Residence): register or
// touch the residency record for one resource (the WHAT STAYS record). The
// weight is stored in its own field - representation only: it ranks the
// eviction candidates, it never decides a disposition (the logged
// license/weight conflation pitfall).
import type Residency from "@Interface/Residency.js";
import type State from "@Interface/State.js";

export default (
	State: State,
	Resource: string,
	Kind: string,
	Weight: number,
): Residency | undefined => {
	switch (true) {
		case !State.On:
			State.Factory.Append(State, `refused residency (the authority is disabled)`);
			return undefined;
		case typeof Resource !== "string" || Resource.length === 0:
			State.Factory.Append(State, `refused residency (invalid resource)`);
			return undefined;
	}
	const Existing = State.Residency.get(Resource);
	if (Existing !== undefined) {
		Existing.kind = Kind || Existing.kind;
		Existing.weight = Weight;
		Existing.disposition = "none";
		State.Factory.Append(State, `residency ${Resource} (weight ${Weight})`);
		return Existing;
	}
	const Record: Residency = {
		resource: Resource,
		kind: Kind || "unknown",
		weight: Weight,
		since: Date.now(),
		promoted: false,
		disposition: "none",
	};
	State.Residency.set(Resource, Record);
	State.Factory.Append(State, `residency ${Resource} (weight ${Weight})`);
	return Record;
};
