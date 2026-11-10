import type { ClientContext } from "./Interface/Client.js";
/**
 * @module Client
 *
 * The client-half entry: wiring only and style-free.
 *
 * @remarks
 *
 * The stylesheet mount lives in `Source/Bundle.ts`, which imports this module together with the
 * sheet. The two SDK services the body needs are declared as `inject` so the loader orders the
 * loads. The behavior itself lives in `Function/Client`; this module is the loader-facing shell.
 */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
declare const _default: {
    inject: string[];
    apply: typeof apply;
};
export default _default;
