// Open — the optional storageDomain seam setup (P5). Registered once per
// load by Function/Attach inside a `ctx.effect`: the facility is probed via
// `ctx.get?.("storageDomain")`; when present, the domain is declared ONCE
// (`defineDomain` — name/version/UNIT_NAME_RE fail loud here, at setup, not
// on any caller path), opened, and `State.Journal` is rewired from the
// pre-open queue to the real typed-record put; the queue is drained so the
// events that fired before the open (always: `activated`) are not lost.
//
// The domain is the SHARED package_governance v2 `events` table — identical
// across the modules (the event enum is the lifecycle vocabulary they
// already share, plus `normalized` — the non-manifest stream family's count
// records; a NEW event name requires a new domain version, hence v2).
//
// Best-effort and detached: this whole setup is awaited by nobody — the
// Attach effect kicks it off with `void`, every failure is contained here.
// An ABSENT facility is a SILENT SKIP at the Attach probe (no log line, no
// record — Open is never even called); a PRESENT facility whose open fails
// is LOUD (the P5 v2 incident): one best-effort ledger line via
// Function/Append (logger + the module's durable ledger file, never
// throws, never rethrown) — the previous silent catch made a permanent
// open failure undiagnosable: the sink was never bound, PendingJournal was
// never drained, and every record from every module buffered into it and
// died with the process. The human ledger stays the complete record, the
// storage journal is the structured, disposable one.
//
// THE V2 OPEN CONTRACT (the live version-mismatch finding): the domain
// declares `layout: "per-record"` + `compatibleVersions: [1]` — the
// single-layout unit parser enforces EXACT version equality (a v2 open
// against the v1-stamped `package_governance.json` hard-fails with
// `version-mismatch`; single layout has no migration and no
// `compatibleVersions` consultation), while the per-record backend's
// legacy bootstrap migrates a v1-stamped file into per-record documents
// when the file's version is in `compatibleVersions` — the pre-existing
// v1 records survive the bump automatically, the legacy file is left
// untouched, and they all validate against the widened enum.
// `invalidRecords: "backup-and-skip"` moves one corrupt stored record
// aside instead of letting it brick the whole open. The dynamic imports
// keep the optional
// packages off the module-load path (a module-level import of an
// unresolvable package would crash the whole bundle load — a live-verified
// pitfall); the type-only devDeps pin them to the host-era versions.
//
// SHARED SINK (the live single-open-domain finding): the harness's
// storageDomain enforces ONE open per domain name — the domain is shared
// across the modules, so the FIRST module whose open succeeds binds the
// table put on the factory instance (`SharedJournal`, probed by
// Function/Attach and passed in); every module's records then route through
// it (Function/Journal), so a later module's `already-open` failure never
// loses its records.
//
// THE BOOT-WINDOW RACE (the pre-bind buffer): each module's apply journals
// its `activated` record BEFORE its own Attach's Open completes, so records
// journaled in that pre-bind window buffer in the factory-level
// `PendingJournal` (Function/Journal stage 2) instead of the per-State
// queues — only the first module's open wins, so a per-State queue on a
// later module would never drain. On SUCCESS this module drains that
// factory-level buffer through the sink it just bound (timestamps
// preserved) and retires it (`PendingJournal = undefined` — the pre-bind
// stage is over; after that, records route straight through the shared
// sink).
import Append from "./Append.js";
import type State from "@Interface/State.js";
// The v2 domain spec's single source of truth: the shared package_governance
// vocabulary (`EVENTS`) and open contract (`DOMAIN` — name/version/layout/
// compatibleVersions/invalidRecords) live on the JournalService — the
// storage journal's shape belongs to the storage service, the open
// mechanics stay here.
import { DOMAIN, EVENTS } from "../Service/Journal.js";

export default async (
	State: State,
	// The probed DomainFacility, structurally — only `open` is consumed; the
	// handle's `close` is kept on State for the Attach effect's disposer.
	Facility: {
		open(spec: object): Promise<{
			close(): Promise<void>;
			table(name: string): {
				put(key: string, value: unknown): Promise<void>;
			};
		}>;
	},
	// The service instance (probed by Function/Attach via ctx.get
	// "pluginFactory") — receives the shared sink when THIS open is the first
	// successful one, and has its pre-bind buffer drained and retired here.
	Factory?: {
		SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
		PendingJournal?: { event: string; path: string; detail: string; at: number }[] | undefined;
	},
): Promise<void> => {
	try {
		const [Domain, Zod] = await Promise.all([
			import("@deepseek-ai/dsh-storage-domain"),
			import("zod"),
		]);
		const Handle = await Facility.open(
			Domain.defineDomain({
				// The v2 open contract constants (see header — now owned by the
				// JournalService): the shared package_governance name/version, the
				// per-record layout + the compatible v1 stamp — the legacy v1 file
				// self-migrates on the first open instead of hard-failing
				// `version-mismatch` — and the corrupt-record policy so a single bad
				// record can never brick the open again.
				...DOMAIN,
				tables: {
					events: Domain.domainTable(
						Zod.object({
							event: Zod.enum([...EVENTS]),
							path: Zod.string(),
							detail: Zod.string(),
							at: Zod.number(),
						}),
					),
				},
			}),
		);
		State.Domain = Handle;
		let Seq = 0;
		const Sink = (Event: string, Path: string, Detail: string, At?: number) => {
			void Handle.table("events")
				.put(`${Date.now()}-${++Seq}`, {
					event: Event,
					path: Path,
					detail: Detail,
					at: At ?? Date.now(),
				})
				.catch(() => {
					/* record writes best-effort */
				});
		};
		// The SHARED sink: the first successful open hands its put to the
		// factory instance — every module's records route through it (the
		// domain is single-open; later modules' own opens fail `already-open`).
		switch (true) {
			case !!Factory && !Factory.SharedJournal:
				Factory.SharedJournal = Sink;
				break;
		}
		State.Journal = Sink;
		// Drain the pre-open queue through the real sink, timestamps preserved.
		for (const Item of State.Queue.splice(0, State.Queue.length)) {
			State.Journal(Item.event, Item.path, Item.detail, Item.at);
		}
		// Drain the FACTORY-LEVEL pre-bind buffer (the boot-window race): the
		// records journaled before ANY open succeeded — including the other
		// modules' `activated` records — route through this sink with
		// timestamps preserved, then the buffer is retired (the pre-bind stage
		// is over; Function/Journal routes straight through the shared sink).
		switch (true) {
			case !!Factory && Array.isArray(Factory.PendingJournal): {
				for (const Item of Factory.PendingJournal.splice(
					0,
					Factory.PendingJournal.length,
				)) {
					Sink(Item.event, Item.path, Item.detail, Item.at);
				}
				Factory.PendingJournal = undefined;
				break;
			}
		}
	} catch (Cause) {
		// LOUD (see header — the P5 v2 incident): the failed open used to
		// vanish silently, the sink was never bound, PendingJournal never
		// drained, and every record from every module died with the process,
		// undiagnosable. One best-effort ledger line (Function/Append — logger
		// + the module's durable ledger file, never throws, never rethrown):
		// the best-effort posture is unchanged. The ABSENT facility is a
		// different, still-silent case — it never reaches this module (the
		// Attach probe only calls Open when `storageDomain` is present).
		Append(State, `storage journal open failed: ${(Cause as Error)?.message ?? Cause}`);
	}
};
