import type { ClientContext } from "@Interface/Client.js";
/** Required client services: the slot registry and the locale service. */
export declare const inject: string[];
/**
 * Client plugin body: provide the workspaceLive service and mount the
 * workspace-live tab. All registrations ride ctx.effect, so plugin unload
 * removes everything without residue.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
