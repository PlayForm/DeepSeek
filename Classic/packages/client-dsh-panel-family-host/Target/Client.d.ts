import type { Context } from "@deepseek-ai/cordis";
/** Required client service: the harness's Remote gateway face. */
export declare const inject: string[];
/**
 * Client plugin body: forward the host package's bridge and trace faces into
 * the browser under the names the panel resolves.
 * @param ctx - client root context.
 */
export declare function apply(ctx: Context): void;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
