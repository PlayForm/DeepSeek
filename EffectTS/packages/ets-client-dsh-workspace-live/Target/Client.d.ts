import type { ClientContext } from "./Interface/Client.js";
/**
 * @module Client
 *
 * The client half entry of `@playform/client-dsh-workspace-live` (the built
 * `./client` export; the module system serves it as a lazy-CJS factory).
 *
 * @remarks
 *
 * The entry carries the named `inject` (required client services: the slots
 * registry and the locale service) and the named `apply(ctx)`; the body lives
 * in `Function/Client.ts` - this entry is wiring only, and the stylesheet mount
 * lives in `Source/Bundle.ts` so the ESM half stays style-free.
 */
/**
 * Required client services: the slot registry and the locale service.
 */
export declare const inject: string[];
/**
 * Client plugin body: provide the workspaceLive service and mount the
 * workspace-live tab. All registrations ride ctx.effect, so plugin unload
 * removes everything without residue.
 *
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
