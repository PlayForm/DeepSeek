/**
 * @module Client
 *
 * The client half entry of `@playform/client-dsh-panel-family`, the built `./client` export that the
 * module system serves as a lazy-CJS factory.
 *
 * @remarks
 * The module system contract on the client half is the same loader-contract family shape: the named
 * `inject` (required client services: the slots registry and the locale service) and the named
 * `apply(ctx)`.
 *
 * The body lives in `Function/Client.ts`; this entry is wiring only, and the stylesheet mount lives
 * in `Source/Bundle.ts` so the ESM half stays style-free.
 */
import ClientApply from "@Function/Client.js";
import type { ClientContext } from "@Interface/Client.js";

/** Required client services: the slot registry and the locale service. */
export const inject = ["slots", "locale"];

/**
 * Client plugin body: provide the `playformFamilyPanel` registry, mount the two panels with their
 * declared child slots, and register the three reference adapters.
 *
 * @remarks
 * All registrations ride `ctx.effect`, so plugin unload removes everything without residue.
 *
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
	// The knobs mount with their schema defaults (tabOrder 20); the client half cannot read the
	// Loader row's config object directly, so the end-phase wires the shared config channel (the
	// PoC report DECISIONS).
	ClientApply(ctx);
}

export default { inject, apply };
