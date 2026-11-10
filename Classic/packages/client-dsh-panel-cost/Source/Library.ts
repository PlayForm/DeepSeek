import type { Context } from "@deepseek-ai/cordis";
import Serve from "@Function/Serve.js";
import Config from "@Variable/Config.js";
import Version from "@Variable/Version.js";

/**
 * @module Library
 *
 * The loader contract (the plugin entry): the four identity members and nothing else.
 *
 * @remarks
 *
 * The name agrees with the package manifest and the patch row; Config is validated at load and
 * fails loud. The host half is transport only: it registers the read-only ledger route through
 * `Function/Serve` and answers it from the `cost` service that `@playform/plugin-dsh-cost`
 * provides, resolved through `ctx.get`, so this package owns no SQL. The client half is served
 * through the `./client` export and never enters this module. Version is re-exported for the
 * manifest-facing consumers.
 *
 * The export surface is `name`, `apply`, `Config`, `inject` and the default object
 * `{ name, inject, Config, apply }`.
 */
export const name = "client-dsh-panel-cost";

/**
 * The webServer is required: the host apply registers the cost route during apply, so the loader
 * must order this row after the harness webServer (the PENDING seam). Every other host dependency
 * is still resolved structurally through `ctx.get` - the cost service the route answers from.
 */
export const inject: string[] = ["webServer"];

export { Config, Version };

export function apply(ctx: Context): void {
	Serve(ctx);
}

export default { name, inject, Config, apply };
