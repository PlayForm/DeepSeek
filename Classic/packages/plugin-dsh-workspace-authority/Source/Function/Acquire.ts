import type Lease from "@Interface/Lease.js";
import type State from "@Interface/State.js";

import Policy from "./Policy.js";

/**
 * @module Acquire
 *
 * The lease acquisition path: the HOW LONG record.
 *
 * @remarks
 *
 * Validate, sweep the holder's expired leases first (lazy expiry), enforce the
 * per-holder ceiling, stamp the record with the TTL (the policy table's
 * per-kind `ttlMs` override when one matches the resource kind, else the config
 * default), ledger.
 */
export default (
	State: State,
	Holder: string,
	Resource: string,
	Kind: string,
	TTLMs?: number | undefined,
): Lease | undefined => {
	switch (true) {
		case !State.On:
			State.Factory.Append(State, `refused lease (the authority is disabled)`);
			return undefined;
		case typeof Holder !== "string" ||
			Holder.length === 0 ||
			typeof Resource !== "string" ||
			Resource.length === 0:
			State.Factory.Append(State, `refused lease (invalid specification)`);
			return undefined;
	}
	// Lazy expiry sweep: the holder's expired leases close on touch, never
	// silently - each is ledgered.
	const Now = Date.now();
	for (const Record of State.Leases.values()) {
		switch (true) {
			case Record.holder === Holder && !Record.closed && Record.expiresAt <= Now:
				Record.closed = true;
				State.Factory.Append(State, `expired ${Record.id}`);
				break;
		}
	}
	const Held = [...State.Leases.values()].filter(
		(Record) => Record.holder === Holder && !Record.closed,
	).length;
	if (Held >= State.MaxLeases) {
		State.Factory.Append(State, `refused lease (${Holder} holds ${Held})`);
		return undefined;
	}
	// The TTL: the explicit request, else the policy table's per-kind
	// override, else the config default.
	const Rule = Policy(State.PolicyRules, {
		resource: Resource,
		kind: Kind ?? "",
		weight: 0,
		since: 0,
		promoted: false,
		disposition: "none",
	});
	const TTL =
		typeof TTLMs === "number" && TTLMs > 0 ? TTLMs : (Rule?.ttlMs ?? State.DefaultTTLMs);
	State.Sequence += 1;
	const Record: Lease = {
		id: `lease:${State.Sequence}`,
		holder: Holder,
		resource: Resource,
		acquiredAt: Now,
		expiresAt: Now + TTL,
		closed: false,
	};
	State.Leases.set(Record.id, Record);
	State.Factory.Append(
		State,
		`leased ${Record.id} (${Holder} -> ${Resource}, expires ${Record.expiresAt})`,
	);
	return Record;
};
