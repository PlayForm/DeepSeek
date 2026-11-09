// Client - the client-half entry: wiring only and style-free. The stylesheet
// mount lives in Source/Bundle.ts, which imports this module together with the
// sheet. The two SDK services the body needs are declared as inject so the
// loader orders the loads. The behavior itself lives in Function/Client; this
// module is the loader-facing shell.
import ClientApply from "@Function/Client.js";
import type { ClientContext } from "@Interface/Client.js";

export const inject = ["slots", "locale"];

export function apply(ctx: ClientContext): void {
	ClientApply(ctx);
}

export default { inject, apply };
