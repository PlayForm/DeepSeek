// Storage - the storage-domain open and recovery (Function/Storage), the
// PRIMARY store. THE DOMAIN: the plugin's OWN domain, named by the config
// `domain` (default `batch_state`). Version 1, per-record layout,
// backup-and-skip invalid records, and NO `compatibleVersions` - the library
// rejects an entry that is not strictly BELOW the declared version, so `[1]`
// against version 1 throws at load (the family's learned rule). FOUR tables:
//   * `members`   - one record per agent id: the member as last written;
//   * `queue`     - ONE record `__queue`: the idle queue (member ids);
//   * `proposals` - one record per proposal id: the spliced board entry;
//   * `gates`     - one record per gate name: the arbiter truth.
//
// The recovery is the SAME Function/Restore the JSON fallback uses: the four
// tables are projected onto Interface/File and restored once on mount, so the
// byte-exact `recovered (<n> members, queue <n>)` line, the honest
// active -> interrupted downgrade and the malformed-row skip are identical on
// both stores.
//
// Best-effort and detached (the family's P5-style posture): the open is
// kicked off from Apply's effect with `void`, every failure is contained
// here. A PRESENT facility whose open fails is LOUD: one best-effort ledger
// line `storage open failed: <reason>`, then the JSON fallback recovers (the
// documented degraded store) - never rethrown.
//
// The dynamic imports keep the optional storage packages off the module-load
// path (a module-level import of an unresolvable package would crash the
// whole bundle load - the factory's live-verified pitfall).
import type Entry from "@Interface/Entry.js";
import type Gate from "@Interface/Gate.js";
import type Handle from "@Interface/Handle.js";
import type Member from "@Interface/Member.js";
import type State from "@Interface/State.js";

import Recover from "./Recover.js";
import Restore from "./Restore.js";

/** One table's records, in store order (the untrusted rows Restore filters). */
const Rows = (Handle: Handle, Name: string): unknown[] =>
	[...Handle.table(Name).entries()].map(([, Value]) => Value);

export default async (State: State, Facility: unknown): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
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
		const Handle = await (
			Facility as {
				open(spec: object): Promise<Handle>;
			}
		).open(
			Domain.defineDomain({
				name: State.DomainName,
				version: 1,
				layout: "per-record",
				invalidRecords: "backup-and-skip",
				tables: {
					members: Domain.domainTable(
						Member as unknown as Parameters<typeof Domain.domainTable>[0],
					),
					queue: Domain.domainTable(
						Zod.array(Zod.string()) as unknown as Parameters<
							typeof Domain.domainTable
						>[0],
					),
					proposals: Domain.domainTable(
						Entry as unknown as Parameters<typeof Domain.domainTable>[0],
					),
					gates: Domain.domainTable(
						Gate as unknown as Parameters<typeof Domain.domainTable>[0],
					),
				},
			}),
		);
		Restore(State, {
			members: Rows(Handle, "members") as Member[],
			queue: (Handle.table("queue").get("__queue") as string[] | undefined) ?? [],
			proposals: Rows(Handle, "proposals") as Entry[],
			gates: Rows(Handle, "gates") as Gate[],
		});
		State.Handle = Handle;
		State.Store = "domain";
	} catch (Cause) {
		// LOUD (see header): one best-effort ledger line, then the JSON
		// fallback recovers - never rethrown.
		State.Factory.Append(
			State,
			`storage open failed: ${(Cause as Error)?.message ?? String(Cause)}`,
		);
		State.Store = "file";
		Recover(State);
	}
};
