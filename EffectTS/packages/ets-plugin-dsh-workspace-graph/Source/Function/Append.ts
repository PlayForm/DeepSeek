// Append - the ledger: one global log line through the module's own channel
// (the family's Append pattern - logger first, then the durable ledger file).
// The logger prefix is the module's frozen `graph: ` tag; the message strings
// are the module's own and byte-stable (the brief's section 4.6 list). The
// durable file is appended only when a ledger path is set (the internal
// State.Ledger seam - the frozen config table has no ledger knob); it is the
// plugin's OWN diagnostic log, not a governed file, so the plain
// `appendFileSync` is the documented exemption (identical to the factory's).
// Both best-effort, never rethrow.
import * as FileSystem from "node:fs";
import { dirname as Parent } from "node:path";

import type State from "@Interface/State.js";
import { Expand } from "@playform/ets-base-dsh";

export default (StateRef: State, Message: string): void => {
	try {
		StateRef.Context.logger.info(`graph: ${Message}`);
	} catch {
		/* logger optional */
	}
	if (StateRef.Ledger !== "") {
		try {
			const Ledger = Expand(StateRef.Ledger);
			FileSystem.mkdirSync(Parent(Ledger), { recursive: true });
			FileSystem.appendFileSync(
				Ledger,
				`[${new Date().toISOString()}] graph: ${Message}\n`,
			);
		} catch {
			/* ledger best-effort */
		}
	}
};
