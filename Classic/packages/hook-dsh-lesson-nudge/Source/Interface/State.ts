// State - the nudge hook's runtime state: the factory's shared shape plus the
// hook's own three fields.
//
// `On` and `Cap` are the config's volatile cells (refreshed in place by the
// factory's loader listener, so a hot flip lands on the next status transition
// without a remount). `Reviews` is the per-agent counter that enforces the cap:
// keyed by the agent object, because the cap is per SESSION, and two agents on
// one host must not share a budget.
import type Config from "./Config.js";

export default interface State extends Config {
	/** The master switch, unwrapped from its cell. */
	On: boolean;
	/** The per-session review cap, unwrapped. */
	Cap: number;
	/** The factory service (the ledger sink). */
	Factory: any;
	/** Reviews already triggered, per agent. */
	Reviews: Map<unknown, number>;
	/** The activation proof has been written (the one-shot warn guard). */
	Warned: boolean;
}
