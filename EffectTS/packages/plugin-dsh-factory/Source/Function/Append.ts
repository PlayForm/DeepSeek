// Append — the ledger: one global log line — logger first (optional), then
// the durable ledger file when enabled. Both best-effort, never rethrow.
// BYTE-IDENTICAL with the trio's Function/Append: the logger prefix is
// `<State.Module>: ` (the module identity — "hook-dsh-governor-package" etc. — is the
// historical prefix, so the refactor keeps every line byte-identical), and
// the message strings are the MODULE'S OWN (the factory never owns them —
// they are asserted by the modules' smoke suites and must stay identical).
//
// Exemption (documented): the ledger is the plugin's OWN diagnostic log, not
// a governed file — it is appended with a plain `appendFileSync` because
// `ctx.fs` has no append operation, and re-reading + rewriting a shared log
// through `ctx.fs.writeText` would be both racy and wrong. Every write of a
// GOVERNED file goes through `ctx.fs` (Function/Write).
import * as FileSystem from "node:fs";
import type State from "@Interface/State.js";

export default (State: State, Message: string): void => {
	try {
		State.Context.logger.info(`${State.Module}: ${Message}`);
	} catch {
		/* logger optional */
	}
	switch (true) {
		case State.Enabled:
			try {
				FileSystem.appendFileSync(
					State.Ledger,
					`[${new Date().toISOString()}] ${Message}\n`,
				);
			} catch {
				/* ledger best-effort */
			}
	}
};
