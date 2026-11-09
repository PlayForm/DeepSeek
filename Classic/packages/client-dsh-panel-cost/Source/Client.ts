// Client - the client-half entry: wiring only. The stylesheet lands before
// the tab registers so the first paint never renders unstyled, and the two
// SDK services the body needs are declared as inject so the loader orders
// the loads. The behavior itself lives in Function/Client; this module is
// the loader-facing shell the client bundle compiles from.
import ClientApply from "@Function/Client.js";
import Styles from "@Function/Styles.js";
import type { ClientContext } from "@Interface/Client.js";

Styles();

export const inject = ["slots", "locale"];

export function apply(ctx: ClientContext): void {
	ClientApply(ctx);
}

export default { inject, apply };
