// Client - the client half entry of @playform/client-dsh-panel-family (the
// built `./client` export; the module system serves it as a lazy-CJS
// factory). The module system contract on the client half is the same
// loader-contract family shape: the named `inject` (required client
// services: the slots registry and the locale service) and the named
// `apply(ctx)`. The body lives in Function/Client.ts; this entry is wiring
// only.
import type { Context } from "@deepseek-ai/cordis";
import ClientApply from "@Function/Client.js";

/** Required client services: the slot registry and the locale service. */
export const inject = ["slots", "locale"];

/**
 * Client plugin body: provide the playformFamilyPanel registry and mount
 * the two slot points. All registrations ride ctx.effect, so plugin unload
 * removes everything without residue.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
	// The knobs mount with their schema defaults (tabOrder 20); the client
	// half cannot read the Loader row's config object directly - the
	// end-phase wires the shared config channel (the PoC report DECISIONS).
	ClientApply(ctx);
}

export default { inject, apply };
