// Seam — the probe-once accessor for an OPTIONAL service (the documented
// optional-dep probe, `ctx.get(name)` — tutorial 03:82-90). NEVER the direct
// accessor fallback: `ctx.<name>` (e.g. `ctx.subprocess`) THROWS on service
// accessors without inject ("cannot get property … without inject" —
// live-verified 2026-10-03); the probe is the safe form. The result is cached
// on the state's Seams map, so repeated calls probe ONCE per load (the P9
// shape) — including a cached `undefined` for a genuinely absent service.
// The State builder uses this exact accessor for the "subprocess" seam; new
// optional seams (storageDomain, jobs) should prefer it over ad-hoc probes.
import type { State as State } from "@playform/ets-dsh-hook";

export default (State: State, Name: string): unknown => {
	switch (true) {
		case State.Seams.has(Name):
			return State.Seams.get(Name);
	}
	let Found: unknown;
	try {
		Found = State.Context.get?.(Name);
	} catch {
		Found = undefined; // a throwing probe is an absent service
	}
	State.Seams.set(Name, Found);
	return Found;
};
