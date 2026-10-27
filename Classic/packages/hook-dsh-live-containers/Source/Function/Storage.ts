// Storage - the P5-style monitor-domain open, the record sink and the
// recovery load (the FILE-MONITOR design section 1, the factory's
// plugin-dsh-factory Function/{Open,Attach}.ts pattern).
//
// THE DOMAIN: a NEW storage domain `live_containers_monitors` (version 1,
// layout per-record, invalidRecords backup-and-skip, ONE table `checks`).
// NOT extension records in the shared package_governance domain: the v2 open contract (a NEW event name requires
// a new domain version) would force a package_governance v3 bump whose blast
// radius is the whole governance family (the single-layout parser enforces
// EXACT version equality). A new domain name has no collision (the harness
// enforces ONE open per domain NAME) and the plugin owns its record schema.
//
// Best-effort and detached, exactly like the factory's P5 arm: the open is
// kicked off from the plugin's own effect with `void`, every failure is
// contained here. An ABSENT facility is a SILENT SKIP (no log line, no
// record; the pre-bind queue is dropped and the sink retired - after a
// restart the bands degrade to `not run yet`, never a fabricated clean). A
// PRESENT facility whose open fails is LOUD: one best-effort ledger line
// `monitors storage open failed: <reason>` (the P5 v2 incident posture,
// never rethrown).
//
// THE RECOVERY (once, on mount, before the first band render): the loaded
// records rebuild the monitor set - the newest monitor-check record per
// (path, agent, check set) becomes the entry's recovered check, the enrolled
// records rebuild the enrollment (a file enrolled before the restart stays
// enrolled), and every loaded entry logs `monitor recovered <path> (<n>
// checks)`. When the read surface is absent or fails: no recovery - the
// bands render `not run yet` (honesty, never fabrication).
import type { Log } from "@Function/Render.js";
import type { MonitorEntry, MonitorRecord } from "@Interface/Events.js";
import type State from "@Interface/State.js";

/** The queue cap for the pre-bind buffer (the factory Queue pattern). */
const QUEUE_CAP = 256;

/** The record write path (best-effort, never on a caller path): through the
 * bound sink when the domain is open, else buffered in the pre-bind queue. */
export const Record = (State: State, Entry: MonitorRecord): void => {
	try {
		if (State.MonitorsPersist) {
			State.MonitorsJournal(Entry);
			return;
		}
		if (State.MonitorsQueue.length < QUEUE_CAP) {
			State.MonitorsQueue.push(Entry);
		}
	} catch {
		/* record writes best-effort */
	}
};

/** The recovery load: rebuild the monitor set from the domain's records. */
const Recover = (
	State: State,
	Handle: { table(name: string): { entries(): IterableIterator<[string, unknown]> } },
	Append: Log,
): void => {
	try {
		const Rows = [...Handle.table("checks").entries()] as [string, MonitorRecord][];
		type Group = {
			agent: string;
			path: string;
			enrolled: MonitorRecord | undefined;
			checks: MonitorRecord[];
		};
		const Groups = new Map<string, Group>();
		for (const [, Row] of Rows) {
			if (!Row || typeof Row.path !== "string" || typeof Row.agent !== "string") {
				continue;
			}
			const Key = `${Row.agent}\u0000${Row.path}`;
			const Group = Groups.get(Key) ?? {
				agent: Row.agent,
				path: Row.path,
				enrolled: undefined,
				checks: [],
			};
			if (Row.event === "monitor-enrolled") {
				Group.enrolled = Row;
			} else if (Row.event === "monitor-check") {
				Group.checks.push(Row);
			}
			Groups.set(Key, Group);
		}
		for (const [, Group] of Groups) {
			// The newest check per check set (one result per set, first-seen order).
			const Newest = new Map<string, MonitorRecord>();
			for (const Row of Group.checks) {
				const Previous = Newest.get(Row.checkSetId);
				if (Previous === undefined || Row.ranAt >= Previous.ranAt) {
					Newest.set(Row.checkSetId, Row);
				}
			}
			const Checks = [...Newest.values()].sort((Left, Right) => Left.ranAt - Right.ranAt);
			const PerAgent = State.Monitors.get(Group.agent) ?? new Map<string, MonitorEntry>();
			State.Monitors.set(Group.agent, PerAgent);
			const Enrolled = Group.enrolled;
			PerAgent.set(Group.path, {
				path: Group.path,
				pathKey: Group.path,
				agentId: Group.agent,
				enrolledAt: Enrolled?.ranAt ?? Checks[0]?.ranAt ?? 0,
				lastVersion: Enrolled?.version || Checks[0]?.version || undefined,
				lastWriter: Enrolled?.writer || Checks[0]?.writer || undefined,
				lastObservedAt: undefined,
				pending: new Map(),
				sets: Checks.map((Row) => Row.checkSetId),
				checks: Checks.map((Row) => ({
					setId: Row.checkSetId,
					jobId: "",
					ranAt: Row.ranAt,
					checkedVersion: Row.version,
					writer: Row.writer,
					exit: Row.exit,
					infra: Row.infra,
					tail: Row.tail,
					provenance: "recovered" as const,
				})),
			});
			Append(`monitor recovered ${Group.path} (${Checks.length} checks)`);
		}
	} catch {
		// The read surface is absent or failed: no recovery - the bands render
		// `not run yet` (the R3 scenario 6 honesty, never a fabricated clean).
	}
};

/** Open the monitor domain (best-effort, never awaited by the caller). The
 * facility shape is the factory's structural view: only `open` is consumed;
 * the handle's `close` is kept on State for the effect's disposer. */
export default async (
	State: State,
	Facility: {
		open(spec: object): Promise<{
			close(): Promise<void>;
			table(name: string): {
				put(key: string, value: unknown): Promise<void>;
				entries(): IterableIterator<[string, unknown]>;
			};
		}>;
	},
	Append: Log,
): Promise<void> => {
	try {
		// The dynamic imports keep the optional packages off the module-load
		// path (the factory Open.ts pattern - a module-level import of an
		// unresolvable package would crash the whole bundle load); the
		// type-only devDependencies pin them to the host-era versions.
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Handle = await Facility.open(
			Domain.defineDomain({
				name: "live_containers_monitors",
				version: 1,
				layout: "per-record",
				invalidRecords: "backup-and-skip",
				tables: {
					checks: Domain.domainTable(
						Zod.object({
							event: Zod.enum([
								"monitor-enrolled",
								"monitor-check",
								"monitor-retired",
							]),
							path: Zod.string(),
							agent: Zod.string(),
							version: Zod.string(),
							writer: Zod.string(),
							checkSetId: Zod.string(),
							ranAt: Zod.number(),
							exit: Zod.number().nullable(),
							infra: Zod.string().nullable(),
							tail: Zod.string(),
							provenance: Zod.enum(["live", "recovered"]),
						}) as unknown as Parameters<typeof Domain.domainTable>[0],
					),
				},
			}),
		);
		State.MonitorDomain = Handle;
		let Seq = 0;
		State.MonitorsJournal = (Entry: MonitorRecord) => {
			void Handle.table("checks")
				.put(`${Date.now()}-${++Seq}`, Entry)
				.catch(() => {
					/* record writes best-effort */
				});
		};
		// Drain the pre-bind buffer through the real sink, in order.
		for (const Entry of State.MonitorsQueue.splice(0, State.MonitorsQueue.length)) {
			State.MonitorsJournal(Entry);
		}
		State.MonitorsPersist = true;
		// The recovery runs once, on mount, before the first band render.
		Recover(State, Handle, Append);
	} catch (Cause) {
		// LOUD (the P5 v2 incident posture): one best-effort ledger line, then
		// the same degradation as the absent facility - the sink retires, the
		// queue is dropped, nothing rethrows onto any caller path.
		Append(`monitors storage open failed: ${(Cause as Error)?.message ?? Cause}`);
		State.MonitorsQueue.length = 0;
		State.MonitorsJournal = () => {};
		State.MonitorsPersist = false;
	}
};
