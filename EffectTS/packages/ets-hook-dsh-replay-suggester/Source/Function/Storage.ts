// Storage - the storage-domain open and recovery (Function/Storage), the
// PRIMARY tier of the recall store. THE DOMAIN: `replay_history`, version 1,
// per-record layout, backup-and-skip invalid records, and NO
// `compatibleVersions` - the library rejects an entry that is not strictly
// BELOW the declared version, so `[1]` against version 1 throws at load (the
// family's learned rule). TWO tables:
//   * `history` - one record per entry: key `String(seq)`, value the Entry;
//   * `meta`    - ONE record `__savedAt`: the snapshot timestamp.
//
// The recovery lands in the SAME Function/Restore the JSON fallback uses, so
// the byte-exact `store recovered <n> entries (<source>)` line, the newest-N
// bound and the malformed-row skip are identical on both tiers.
//
// Best-effort and detached (the family's P5-style posture): the open runs on
// the store chain from Apply, and every failure is contained here. A PRESENT
// facility whose open fails is LOUD: one best-effort ledger line
// `store open failed: <reason>`, then the JSON fallback recovers (the
// documented degraded store) - never rethrown.
//
// The dynamic imports keep the optional storage packages off the module-load
// path (a module-level import of an unresolvable package would crash the
// whole bundle load - the factory's live-verified pitfall).
import type Handle from "@Interface/Handle.js";
import type State from "@Interface/State.js";

import Recover from "./Recover.js";
import Restore from "./Restore.js";

export default async (
	/** The plugin state (the mirror, the handle, the ledger). */
	State: State,
	/** The probed storage facility (ctx.storage.domain or ctx.storageDomain). */
	Facility: unknown,
): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Entry = Zod.object({
			seq: Zod.number(),
			path: Zod.string(),
			intent: Zod.string(),
			outcome: Zod.string(),
			at: Zod.number(),
			probe: Zod.string(),
		});
		const Handle = await (
			Facility as {
				open(Specification: object): Promise<Handle>;
			}
		).open(
			Domain.defineDomain({
				name: "replay_history",
				version: 1,
				layout: "per-record",
				invalidRecords: "backup-and-skip",
				tables: {
					history: Domain.domainTable(Entry),
					meta: Domain.domainTable(Zod.number()),
				},
			}),
		);
		State.Handle = Handle;
		Restore(
			State,
			[...Handle.table("history").entries()].map(([, Value]) => Value),
			"replay_history",
		);
	} catch (Cause) {
		// LOUD (see header): one best-effort ledger line, then the JSON
		// fallback recovers - never rethrown.
		State.Factory.Append(
			State,
			`store open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
		State.Handle = undefined;
		Recover(State);
	}
};
