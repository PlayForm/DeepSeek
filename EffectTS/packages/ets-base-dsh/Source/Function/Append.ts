import * as FileSystem from "node:fs";
import { dirname as Parent } from "node:path";

import type State from "@Interface/State.js";

import Expand from "./Expand.js";

/**
 * @module Append
 *
 * The ledger: one global log line - logger first (optional), then the durable
 * ledger file when enabled.
 *
 * @remarks
 *
 * Both sinks are best-effort and never rethrow.
 *
 * The write is byte-identical with the trio's `Function/Append`: the logger
 * prefix is `<State.Module>: ` (the module identity - "hook-dsh-governor-package"
 * etc. - is the historical prefix, so the refactor keeps every line
 * byte-identical), and the message strings are the module's own (the factory
 * never owns them - they are asserted by the modules' smoke suites and must
 * stay identical).
 *
 * Exemption (documented): the ledger is the plugin's own diagnostic log, not a
 * governed file - it is appended with a plain `appendFileSync` because `ctx.fs`
 * has no append operation, and re-reading plus rewriting a shared log through
 * `ctx.fs.writeText` would be both racy and wrong. Every write of a governed
 * file goes through `ctx.fs` (`Function/Write`).
 */
export default (State: State, Message: string): void => {
	try {
		State.Context.logger.info(`${State.Module}: ${Message}`);
	} catch {
		/* logger optional */
	}
	switch (true) {
		case State.Enabled:
			try {
				const Ledger = Expand(State.Ledger);
				FileSystem.mkdirSync(Parent(Ledger), { recursive: true });
				FileSystem.appendFileSync(Ledger, `[${new Date().toISOString()}] ${Message}\n`);
			} catch {
				/* ledger best-effort */
			}
	}
};
