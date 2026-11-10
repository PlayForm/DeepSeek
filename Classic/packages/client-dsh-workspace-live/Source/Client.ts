import ClientApply from "@Function/Client.js";
import type { ClientContext } from "@Interface/Client.js";

/**
 * @module Client
 *
 * The client half entry of @playform/client-dsh-workspace-live: the named `inject` and the named `apply(ctx)`.
 *
 * @remarks
 *
 * The built `./client` export; the module system serves it as a lazy-CJS
 * factory. `inject` lists the required client services: the slots registry and
 * the locale service. The body lives in `Function/Client.ts` - this entry is
 * wiring only, and the stylesheet mount lives in `Source/Bundle.ts` so the ESM
 * half stays style-free.
 */
/**
 * Required client services: the slot registry and the locale service.
 */
export const inject = ["slots", "locale"];

/**
 * Client plugin body: provide the workspaceLive service and mount the
 * workspace-live tab.
 *
 * All registrations ride ctx.effect, so plugin unload removes everything
 * without residue.
 *
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
	// The knobs mount with their schema defaults; the end-phase wires the
	// shared config channel (the PoC report DECISIONS).
	ClientApply(ctx, { tabOrder: 25, maxEvents: 50, maxRepresentations: 100 });
}

export default { inject, apply };
