import type Entry from "@Interface/Entry.js";
import type Gate from "@Interface/Gate.js";
import type Handle from "@Interface/Handle.js";
import type Member from "@Interface/Member.js";
import type State from "@Interface/State.js";

import Recover from "./Recover.js";
import Restore from "./Restore.js";

/**
 * @module Storage
 *
 * The storage-domain open and recovery: the PRIMARY store.
 *
 * @remarks
 *
 * THE OPEN routes through the factory's shared `OpenDomain` (the P5 posture
 * the storage consumers hand-copied): the dynamic import of the optional
 * storage package, the `defineDomain` declaration and the open itself live in
 * `plugin-dsh-factory` (`Function/Domain`); this module keeps what is its own
 * - the FOUR table schemas (zod), the recovery (the SAME Function/Restore the
 * JSON fallback uses) and the fallback. zod is still dynamically imported
 * here, because the table SCHEMAS are built at call time; the optional
 * storage package is no longer imported in this package at all.
 *
 * THE DOMAIN: the plugin's OWN domain, named by the config `domain` (default `batch_state`).
 * Version 1, per-record layout, backup-and-skip invalid records, and NO `compatibleVersions` - the
 * library rejects an entry that is not strictly BELOW the declared version, so `[1]` against
 * version 1 throws at load (the family's learned rule; the shared method omits the key for a
 * version-1 domain). FOUR tables:
 *
 * - `members` - one record per agent id: the member as last written;
 * - `queue` - ONE record `__queue`: the idle queue (member ids);
 * - `proposals` - one record per proposal id: the spliced board entry;
 * - `gates` - one record per gate name: the arbiter truth.
 *
 * The recovery is the SAME Function/Restore the JSON fallback uses: the four tables are projected
 * onto Interface/File and restored once on mount (the OpenDomain restore hook), so the byte-exact
 * `recovered (<n> members, queue <n>)` line, the honest active -> interrupted downgrade and the
 * malformed-row skip are identical on both stores.
 *
 * Best-effort and detached (the family's P5-style posture): the open is kicked off from Apply's
 * effect with `void`, every failure is contained here. A PRESENT facility whose open fails is LOUD:
 * one best-effort ledger line `storage open failed: <reason>` (composed HERE - the module's own
 * string, byte-identical - and appended by the factory's Append), then the JSON fallback recovers
 * (the documented degraded store) - never rethrown. An ABSENT facility never reaches this module
 * (the Apply probe only calls Storage when one is present).
 */
/**
 * One table's records, in store order (the untrusted rows Restore filters).
 */
const Rows = (Handle: Handle, Name: string): unknown[] =>
	[...Handle.table(Name).entries()].map(([, Value]) => Value);

export default async (State: State, Facility: unknown): Promise<void> => {
	const Zod = await import("zod");
	const Member = Zod.object({
		id: Zod.string(),
		role: Zod.string(),
		task: Zod.string(),
		status: Zod.enum(["idle", "active", "completed", "failed", "interrupted"]),
		queue: Zod.number(),
		scope: Zod.array(Zod.string()),
		startedAt: Zod.number(),
		finishedAt: Zod.number(),
	});
	const Proposal = Zod.object({
		id: Zod.string(),
		intent: Zod.string(),
		targets: Zod.array(
			Zod.object({ path: Zod.string(), version: Zod.string(), why: Zod.string() }),
		),
		operations: Zod.array(
			Zod.object({
				kind: Zod.string(),
				path: Zod.string(),
				value: Zod.string().optional(),
				find: Zod.string().optional(),
				replace: Zod.string().optional(),
				why: Zod.string().optional(),
			}),
		),
		preview: Zod.object({
			entries: Zod.array(
				Zod.object({ path: Zod.string(), before: Zod.string(), after: Zod.string() }),
			),
			changes: Zod.number(),
			skipped: Zod.array(Zod.object({ path: Zod.string(), why: Zod.string() })),
		}),
		digest: Zod.string(),
		revision: Zod.number(),
		expiresAt: Zod.number(),
		confidence: Zod.number().optional(),
		origin: Zod.string().optional(),
	});
	const Entry = Zod.object({
		proposal: Proposal,
		status: Zod.enum(["proposed", "approved", "denied", "expired"]),
		at: Zod.number(),
	});
	const Gate = Zod.object({
		name: Zod.string(),
		state: Zod.enum(["green", "red", "unknown"]),
		owner: Zod.string(),
	});
	const Handle = await State.Factory.OpenDomain(State, Facility, {
		Name: State.DomainName,
		Version: 1,
		// The module's own raw zod schemas (see header) - the shared method
		// wraps them with domainTable inside its dynamic-import scope.
		Tables: {
			members: Member,
			queue: Zod.array(Zod.string()),
			proposals: Entry,
			gates: Gate,
		},
		// The module's own loud line, byte-identical (the factory only appends
		// it - see header).
		Line: (Cause) => `storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		// The recovery (see header): the four tables project onto
		// Interface/File and restore once, exactly as the JSON fallback does.
		Restore: (Open) => {
			const Domain = Open as Handle;
			Restore(State, {
				members: Rows(Domain, "members") as Member[],
				queue: (Domain.table("queue").get("__queue") as string[] | undefined) ?? [],
				proposals: Rows(Domain, "proposals") as Entry[],
				gates: Rows(Domain, "gates") as Gate[],
			});
		},
	});
	switch (true) {
		case Handle !== undefined:
			State.Handle = Handle as Handle;
			State.Store = "domain";
			break;
		default:
			// The open failed (the loud line is already appended by the shared
			// method): the JSON fallback recovers - never rethrown.
			State.Store = "file";
			Recover(State);
	}
};
