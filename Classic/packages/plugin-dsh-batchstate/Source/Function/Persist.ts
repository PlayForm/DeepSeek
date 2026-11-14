import { mkdirSync as Make, writeFileSync as Write } from "node:fs";
import { dirname as Parent } from "node:path";

import type Handle from "@Interface/Handle.js";
import type State from "@Interface/State.js";
import { Expand } from "@playform/lib-dsh-core";

/**
 * @module Persist
 *
 * The state write: the PRIMARY/FALLBACK split of the completion spec's wave 3 storage migration.
 *
 * @remarks
 *
 * THE PRIMARY: the storage-domain KV domain (Function/Storage, the config `domain`). Every state
 * change writes only the tables whose contents changed (the per-table dirty marker on the State,
 * Interface/State's `Dirty`) into the four tables - the members keyed by id, the queue under
 * `__queue`, the proposals keyed by id, the gates keyed by name - and every WRITTEN table is
 * RECONCILED first: a record the live state no longer holds is deleted, so a clear cannot
 * resurrect a member from the medium. The marker is born fully dirty per mount (Function/Apply),
 * so the first sync after a restore/open still writes everything; each mutation site marks its own
 * tables; a write clears the markers BEFORE it runs, so a mutation that lands mid-write re-marks
 * its table and re-queues its own write, and a failed table write re-marks itself (the store is
 * best-effort, but a retry is never silently dropped). The writes are serialised on State.Pending
 * (the same chain the open/recovery runs on), so the open always lands before the first write and
 * the smokes can await the chain without a sleep.
 *
 * THE FALLBACK: the well-known JSON file (the plan's file-based fallback), engaged only when no
 * storage facility is present or its open failed. Its write is SYNCHRONOUS and unconditional - the
 * exact behaviour the file-only lane shipped, so a mount without storage keeps the file readable
 * the moment a state change returns (the restart smokes depend on that ordering).
 *
 * THE FILE IS THE PLUGIN'S OWN STORE: a plain fs write, NOT a governed file (the same documented
 * exemption the ledger carries - ctx.fs has no append, and re-reading + rewriting the plugin's own
 * snapshot through a governed write would be both racy and wrong). The tilde is expanded once at
 * the write site (the config default is `~/.dsh/batch-state.json`).
 *
 * Best-effort: a failed persist (a missing parent directory, a read-only volume, a closed domain)
 * is swallowed - the ledger and the live state stay the truth, and a state change must never fail
 * on its store.
 */
/**
 * The meta key of the idle-queue record in the `queue` table.
 */
const QUEUE = "__queue";

/**
 * Write the full state into the JSON fallback file (the file-only path).
 */
const File = (State: State): void => {
	try {
		const Target = Expand(State.StateFile);
		Make(Parent(Target), { recursive: true });
		Write(
			Target,
			JSON.stringify({
				members: [...State.Members.values()],
				queue: [...State.IdleQueue],
				proposals: [...State.Proposals.values()],
				gates: [...State.Gates.values()],
			}),
			"utf8",
		);
	} catch {
		/* the store is best-effort - the live state is the truth */
	}
};

/**
 * Reconcile one table with the live rows: drop the absent keys, put the rest.
 */
const Sync = async (Handle: Handle, Name: string, Rows: [string, unknown][]): Promise<void> => {
	const Table = Handle.table(Name);
	const Keep = new Set(Rows.map(([Key]) => Key));
	for (const Key of [...Table.keys()]) {
		switch (true) {
			case Keep.has(Key):
				continue;
			default:
				await Table.delete(Key);
		}
	}
	for (const [Key, Value] of Rows) {
		await Table.put(Key, Value);
	}
};

/**
 * Write the changed tables of the state into the KV domain's four tables (only the dirty ones; the
 * rows are read at the write site, exactly as the full rewrite read them).
 */
const Domain = async (State: State, Handle: Handle): Promise<void> => {
	// The dirty snapshot: the markers clear BEFORE the writes, so a mutation
	// that lands mid-write re-marks its own table and re-queues its own write
	// instead of being erased by the write that is still running.
	const Dirty = new Set(State.Dirty);
	State.Dirty.clear();
	const Tables: [string, () => [string, unknown][]][] = [
		["members", () => [...State.Members.entries()]],
		["queue", () => [[QUEUE, [...State.IdleQueue]]]],
		["proposals", () => [...State.Proposals.entries()]],
		["gates", () => [...State.Gates.entries()]],
	];
	try {
		for (const [Name, Rows] of Tables) {
			switch (true) {
				case Dirty.has(Name):
					await Sync(Handle, Name, Rows());
					break;
				default:
			}
		}
	} catch (Cause) {
		// The store is best-effort: the tables of this sync stay dirty, so the
		// next change retries them (a table that already wrote is rewritten
		// with the same rows - the store's content does not move).
		for (const Name of Dirty) {
			State.Dirty.add(Name);
		}
		throw Cause;
	}
};

export default (State: State): void => {
	switch (State.Store) {
		case "file":
			// The fallback: synchronous, exactly the file-only lane's write. The
			// unconditional file write covers every table, and it is synchronous
			// (no mutation can land mid-write), so the markers clear with it.
			File(State);
			State.Dirty.clear();
			return;
		case "pending":
			// The open is still in flight: the decision is made on the chain,
			// after the open has resolved the store kind.
			State.Pending = State.Pending.then(async () => {
				const Handle = State.Handle;
				switch (true) {
					case Handle === undefined:
						File(State);
						State.Dirty.clear();
						return;
					default:
						break;
				}
				try {
					await Domain(State, Handle);
				} catch {
					/* the store is best-effort */
				}
			});
			return;
		default:
			// The primary: serialised on the chain (the open landed first).
			State.Pending = State.Pending.then(async () => {
				const Handle = State.Handle;
				switch (true) {
					case Handle === undefined:
						// Nothing was written - the markers stay dirty.
						return;
					default:
						break;
				}
				try {
					await Domain(State, Handle);
				} catch {
					/* the store is best-effort */
				}
			});
	}
};
