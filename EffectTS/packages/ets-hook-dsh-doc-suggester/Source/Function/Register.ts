// Register - the OPTIONAL registration of the hook's projection unit on
// `ctx.sessionProjections`, the seam that receives every committed session
// event once for every agent.
//
// WHY `ctx.inject` AND NOT THE `inject` ARRAY: the registry is a service a
// shipped composition provides, but the hook must LOAD without it (a bare
// mount, a test ctx, an older profile). Declaring `sessionProjections` in the
// plugin's `inject` would make the whole hook pending until the registry
// exists; the documented optional-contributor form is
// `ctx.inject(['sessionProjections'], ...)` ("Contributors may preserve
// optional registration through `ctx.inject(['sessionProjections'], ...)`"),
// which runs the callback when the service is available and disposes the
// registration with the child fiber. A context without `inject` (a bare
// object) is skipped silently.
//
// THE AWAIT IS PART OF THE CONTRACT: "Callers must await registration before
// publishing consumers; registration may perform asynchronous work." The
// callback is async and awaits `register`, so the unit is installed before the
// plugin's activation is considered finished.
//
// NO LEDGER LINE: the ledger strings are byte-exact and module-owned, and the
// activation proof must stay one line, so a missing registry is a silent
// degradation (the history stays empty and only an explicit pack may speak) -
// the same posture as the `workingDirectory` probe in Function/Apply.
import type { Context } from "@deepseek-ai/cordis";

import type { InjectingContext } from "../Interface/Projection.js";
import Unit from "./Unit.js";

export default (Context: Context): void => {
	try {
		const Inject = (Context as unknown as InjectingContext).inject;
		if (typeof Inject !== "function") {
			return;
		}
		void Inject.call(Context, ["sessionProjections"], async (Child) => {
			try {
				await Child.sessionProjections.register(Unit);
			} catch (Error) {
				// Fail-open: a registry that refuses the unit must never fail the
				// plugin load; the history simply stays empty.
				try {
					Context.logger?.warn(
						`hook-dsh-doc-suggester: the projection unit did not register: ${String(Error)}`,
					);
				} catch {
					/* logger optional */
				}
			}
		});
	} catch {
		/* an absent seam: the history stays empty, the explicit pack may speak */
	}
};
