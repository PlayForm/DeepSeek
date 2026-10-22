import type { Context } from "@deepseek-ai/cordis";
/** Required client services: the slot registry and the locale service. */
export declare const inject: string[];
/**
 * Client plugin body: provide the playformFamilyPanel registry and mount
 * the two slot points. All registrations ride ctx.effect, so plugin unload
 * removes everything without residue.
 * @param ctx - client root context.
 */
export declare function apply(ctx: Context): void;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
