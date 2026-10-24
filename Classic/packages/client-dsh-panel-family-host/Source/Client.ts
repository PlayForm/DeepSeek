// Client - the client half entry of @playform/client-dsh-panel-family-host
// (the built `./client` export; the module system serves it as a lazy-CJS
// factory). The named `inject` (the harness's Remote gateway) and the named
// `apply(ctx)`; the body lives in Function/Client.ts - this entry is wiring
// only.
import type { Context } from "@deepseek-ai/cordis";
import ClientApply from "@Function/Client.js";

/** Required client service: the harness's Remote gateway face. */
export const inject = ["remote"];

/**
 * Client plugin body: forward the host package's bridge and trace faces into
 * the browser under the names the panel resolves.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
	ClientApply(ctx);
}

export default { inject, apply };
