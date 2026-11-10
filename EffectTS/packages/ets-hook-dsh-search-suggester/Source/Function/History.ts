/**
 * @module History
 *
 * The DETECTION-TIME read of one session's folded touch history: the
 * projection unit's live host state through the registry's own face,
 * `stateOf(session, key)` ("reads one unit's live read-only host state without
 * computing unrelated views").
 *
 * @remarks
 * WHY `ctx.get` AND NOT `ctx.sessionProjections`: the service is NOT in the
 * plugin's `inject` array (the hook must load without the registry), and a
 * property read on an undeclared service throws. The documented rule is
 * explicit: "For a service a plugin reads opportunistically but does NOT
 * declare in `static inject`, use `ctx.get(name)`, never `ctx.<name>` ...
 * `ctx.get(name)` is the topology-independent lookup." `ctx.get` also reads an
 * inactive backend as `undefined` (strict by default), so a registry that is
 * being torn down reads as absence instead of handing back a dying instance.
 *
 * THE READ IS FAIL-OPEN BY CONSTRUCTION: a missing registry, a session the
 * registry has never seen (its cell builds lazily from `init`, so this is the
 * empty history), a throwing getter, or a foreign `stateOf` all yield the
 * empty list - the caller then falls back to the explicit pack, or abstains
 * `abstained no-history  0.00`. The returned array is the registry's live
 * state: it is read only, never mutated (the subsystem guide: "callers must
 * not mutate the borrowed reference").
 *
 * THE CELL IS KEYED ON THE SESSION: the retired fold fell back to the Agent
 * object and then to one shared default entry, but a projection unit is keyed
 * per session by the registry, so a call that carries no session reads the
 * empty history instead of a shared one - it falls back to the explicit pack,
 * or abstains `abstained no-history  0.00`.
 */
import type { Context } from "@deepseek-ai/cordis";
import type { Touch } from "@playform/ets-lib-dsh-pack";

import type { ProbingContext, ProjectionRegistry } from "../Interface/Session.js";
import { ProjectionKey } from "../Variable/Projection.js";

export default (Context: Context, Session: unknown): readonly Touch[] => {
	try {
		if (Session === undefined || Session === null) {
			return [];
		}
		const Registry = (Context as unknown as ProbingContext).get?.("sessionProjections") as
			ProjectionRegistry | undefined;
		const State = Registry?.stateOf?.(Session, ProjectionKey);
		return Array.isArray(State?.Touches) ? State.Touches : [];
	} catch {
		return [];
	}
};
