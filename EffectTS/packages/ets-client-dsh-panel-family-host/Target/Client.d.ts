import type { Context } from "@deepseek-ai/cordis";
/**
 * @module Client
 *
 * The client half entry of @playform/ets-client-dsh-panel-family-host.
 *
 * @remarks
 *
 * The built `./client` export; the module system serves it as a lazy-CJS
 * factory. The named `inject` (the harness's Remote gateway) and the named
 * `apply(ctx)`; the body lives in Function/Client.ts - this entry is wiring
 * only.
 */
/**
 * Required client service: the harness's Remote gateway face.
 */
export declare const inject: string[];
/**
 * Client plugin body: forward the host package's bridge and trace faces into
 * the browser under the names the panel resolves.
 *
 * @param ctx - client root context.
 */
export declare function apply(ctx: Context): void;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
