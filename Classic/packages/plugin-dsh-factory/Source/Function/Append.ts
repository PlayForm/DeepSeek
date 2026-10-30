// Append - the ledger: one global log line - logger first (optional), then
// the durable ledger file when enabled. Both best-effort, never rethrow.
// BYTE-IDENTICAL with the trio's Function/Append: the logger prefix is
// `<State.Module>: ` (the module identity - "hook-dsh-governor-package" etc. - is the
// historical prefix, so the refactor keeps every line byte-identical), and
// the message strings are the MODULE'S OWN (the factory never owns them -
// they are asserted by the modules' smoke suites and must stay identical).
//
// DEFERRED, NOT SYNCHRONOUS (the boot-window rule): the load path journals
// every module's `activated` line while the harness is still mounting, and a
// synchronous mkdir+append per module spends one file descriptor and one
// blocking write per module inside that window. The harness's own session
// scan runs concurrently there and dies on EMFILE when the descriptor budget
// is shared with this burst, so the line is QUEUED here - the timestamp is
// taken at call time (byte-identical output), the writes are coalesced per
// ledger path and drained by ONE serialized chain, so call order is write
// order even though no caller waits. A lost tail on abrupt exit is acceptable
// for a best-effort diagnostic ledger.
//
// Exemption (documented): the ledger is the plugin's OWN diagnostic log, not
// a governed file - it is appended directly because `ctx.fs` has no append
// operation, and re-reading + rewriting a shared log through
// `ctx.fs.writeText` would be both racy and wrong. Every write of a
// GOVERNED file goes through `ctx.fs` (Function/Write).
import * as FileSystem from "node:fs";
import { dirname as Parent } from "node:path";

import type State from "@Interface/State.js";
import { Expand } from "@playform/lib-dsh-core";

// ledger path -> queued lines, coalesced so one drain = one open + one write
// per ledger no matter how many modules appended during the same window.
const Pending = new Map<string, string[]>();
// The ONE drain chain: a second concurrent drain would clear a batch it did
// not write, and two in-flight appendFiles invert each other's order.
let Chain: Promise<void> | undefined;

const Drain = (): Promise<void> => {
	switch (Chain !== undefined) {
		case true:
			return Chain;
	}
	Chain = (async () => {
		// Yield once: an empty drain runs to completion synchronously, and its
		// `finally` would clear `Chain` BEFORE the assignment below lands,
		// leaving a resolved promise in place that every later drain reuses.
		await null;
		try {
			// A pass takes a stable batch; appends that land mid-write queue for
			// the next pass of the SAME chain, so ordering survives.
			while (Pending.size > 0) {
				const Batch = [...Pending.entries()];
				Pending.clear();
				for (const [Ledger, Lines] of Batch) {
					try {
						await FileSystem.promises.mkdir(Parent(Ledger), { recursive: true });
						await FileSystem.promises.appendFile(Ledger, Lines.join(""));
					} catch {
						/* ledger best-effort - a failed flush never reaches a caller */
					}
				}
			}
		} finally {
			Chain = undefined;
			switch (Pending.size > 0) {
				case true:
					void Drain(); // re-arm: an append raced the chain's exit
					break;
			}
		}
	})();
	return Chain;
};

/** Flush every queued line now and resolve once the drain chain is empty. */
export const Flush = async (): Promise<void> => {
	// A re-armed chain (an append that raced the previous exit) is not the
	// promise the caller holds, so keep draining until both are empty.
	while (Chain !== undefined || Pending.size > 0) {
		await Drain();
	}
};

export default (State: State, Message: string): void => {
	try {
		State.Context.logger.info(`${State.Module}: ${Message}`);
	} catch {
		/* logger optional */
	}
	switch (true) {
		case State.Enabled: {
			try {
				const Ledger = Expand(State.Ledger);
				const Lines = Pending.get(Ledger) ?? [];
				Lines.push(`[${new Date().toISOString()}] ${Message}\n`);
				Pending.set(Ledger, Lines);
				void Drain();
			} catch {
				/* ledger best-effort */
			}
		}
	}
};
