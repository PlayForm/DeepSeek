// Library - the loader contract (the plugin entry): the four identity
// members and nothing else. The name agrees with the package manifest and
// the patch row; Config is validated at load and fails loud; inject is
// empty because the host half only registers a route through ctx.get and
// never depends on a named service. The host apply registers the read-only
// ledger route through Function/Serve; the client half is served through
// the ./client export and never enters this module. Version is re-exported
// for the manifest-facing consumers.
import type { Context } from "@deepseek-ai/cordis";
import Serve from "@Function/Serve.js";
import Config from "@Variable/Config.js";
import Version from "@Variable/Version.js";

export const name = "client-dsh-panel-cost";

export const inject: string[] = [];

export { Config, Version };

export function apply(ctx: Context): void {
	Serve(ctx);
}

export default { name, inject, Config, apply };
