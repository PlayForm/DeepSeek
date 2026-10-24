// Evict - the disposition pass (Function/Evict): the eviction rule of the
// authority service. For every residency record (or the named subset), in
// WEIGHT-DESCENDING order (the weight only RANKS the candidates - it never
// decides anything), the policy table decides the disposition:
//
//   keep    - the record stays;
//   promote - the record is marked protected;
//   defer   - the decision is postponed (kept) until the record's residency
//             age exceeds the rule's maxResidencyMs, then it is evicted;
//   evict   - the record is removed from the residency set but kept in the
//             graveyard (recoverable);
//   discard - the record is removed permanently (the graveyard entry, if
//             any, goes too).
//
// THE LICENSE DECIDES, THE WEIGHT ONLY RANKS. Two shields force "keep" over
// the policy: an OPEN, NON-EXPIRED LEASE on the resource, and an ACTIVE
// CAPABILITY covering it (a revoked capability shields only within the
// revocation grace - the policy's revocation timing). Every disposition is
// ledgered: `evicted <resource> (<disposition>)`.
import type State from "@Interface/State.js";

import Policy from "./Policy.js";

const SHIELD = "keep";

export default (
	State: State,
	Resources?: string[],
): { resource: string; disposition: string }[] => {
	if (!State.On) {
		State.Factory.Append(State, `refused eviction (the authority is disabled)`);
		return [];
	}
	const Now = Date.now();
	const Candidates = [...State.Residency.values()]
		.filter((Record) => Resources === undefined || Resources.includes(Record.resource))
		// The weight only ranks the candidates.
		.sort((Left, Right) => Right.weight - Left.weight);
	const Out: { resource: string; disposition: string }[] = [];
	for (const Record of Candidates) {
		const Rule = Policy(State.PolicyRules, Record);
		const Disposition = (() => {
			// Shield 1: an open, non-expired lease.
			if (
				[...State.Leases.values()].some(
					(Lease) =>
						Lease.resource === Record.resource &&
						!Lease.closed &&
						Lease.expiresAt > Now,
				)
			) {
				return SHIELD;
			}
			// Shield 2: an active capability (revoked only within the grace).
			if (
				[...State.Capabilities.values()].some(
					(Capability) =>
						Capability.resource === Record.resource &&
						!Capability.revoked &&
						(Capability.expiresAt === undefined || Capability.expiresAt > Now),
				)
			) {
				return SHIELD;
			}
			if (
				[...State.Capabilities.values()].some(
					(Capability) =>
						Capability.resource === Record.resource &&
						Capability.revoked &&
						Capability.revokedAt !== undefined &&
						Now - Capability.revokedAt <= State.RevocationGraceMs,
				)
			) {
				return SHIELD;
			}
			return Rule?.disposition ?? "keep";
		})();
		switch (true) {
			case Disposition === "promote": {
				Record.promoted = true;
				Record.disposition = "promote";
				Out.push({ resource: Record.resource, disposition: "promote" });
				break;
			}
			case Disposition === "defer": {
				const Age = Now - Record.since;
				const Limit = Rule?.maxResidencyMs;
				if (Limit !== undefined && Age > Limit) {
					Record.disposition = "evict";
					State.Residency.delete(Record.resource);
					State.Graveyard.set(Record.resource, Record);
					Out.push({ resource: Record.resource, disposition: "evict" });
				} else {
					Record.disposition = "defer";
					Out.push({ resource: Record.resource, disposition: "defer" });
				}
				break;
			}
			case Disposition === "evict": {
				Record.disposition = "evict";
				State.Residency.delete(Record.resource);
				State.Graveyard.set(Record.resource, Record);
				Out.push({ resource: Record.resource, disposition: "evict" });
				break;
			}
			case Disposition === "discard": {
				Record.disposition = "discard";
				State.Residency.delete(Record.resource);
				State.Graveyard.delete(Record.resource);
				Out.push({ resource: Record.resource, disposition: "discard" });
				break;
			}
			default: {
				Record.disposition = "keep";
				Out.push({ resource: Record.resource, disposition: "keep" });
			}
		}
	}
	for (const Entry of Out) {
		State.Factory.Append(State, `evicted ${Entry.resource} (${Entry.disposition})`);
	}
	return Out;
};
