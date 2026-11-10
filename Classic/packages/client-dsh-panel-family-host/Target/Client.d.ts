import type { Context } from "@deepseek-ai/cordis";
/**
 * @module Client
 *
 * The client half entry of @playform/client-dsh-panel-family-host: the named
 * `inject` and the named `apply(ctx)` wiring.
 *
 * @remarks
 *
 * The built `./client` export; the module system serves it as a lazy-CJS
 * factory. The body lives in `Function/Client.ts` - this entry is wiring only.
 *
 * @example
 * ```ts
 * export default { inject, apply };
 * ```
 */
/**
 * Required client service: the harness's Remote gateway face.
 */
export declare const inject: string[];
/**
 * Client plugin body: forward the host package's bridge and trace faces into
 * the browser under the names the panel resolves.
 *
 * @param ctx - Client root context.
 */
export declare function apply(ctx: Context): void;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
