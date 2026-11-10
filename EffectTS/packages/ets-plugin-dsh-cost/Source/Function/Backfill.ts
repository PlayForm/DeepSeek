import type { DatabaseSync } from "node:sqlite";

import type { Context } from "@deepseek-ai/cordis";

import type Config from "../Interface/Config.js";
import Capture from "./Capture.js";
import Drain from "./Drain.js";

/**
 * @module Backfill
 *
 * The replay of the sessions that predate the plugin
 * (Documentation/Plans/COST-TRACK-PLUGIN.md section 6): on first run the
 * ledger is empty and every past conversation is unpriced.
 *
 * @remarks
 *
 * The walk reads the session-history query service (probed with ctx.get -
 * the service is optional and the plugin does not inject it), reads each
 * session's events, and pushes them through the same Capture/Drain path the
 * live listeners use, so a backfilled session lands the same rows a live
 * session would. The Cursor table makes it resumable and idempotent: a
 * session already folded to its last event's sequence is skipped whole, and
 * the drain itself skips the events at or below the recorded sequence. The
 * walk runs only when the Config.capture.backfill gate is on, and it runs
 * inside the backfill job - never on the boot path.
 *
 * A session whose cursor is past zero was partially booked, and the
 * in-memory replay state the later events depend on (the surface buffer,
 * the pending touch sets, the per-file histories, the per-file versions,
 * the restoration flags, the read targets) died with the process that held
 * it, so skipping the prefix is not the same as reconstructing it (E2, A2
 * section 1.4). The walk therefore separates two boundaries: the replay
 * boundary is the session's first event, where a replay-only drain pass
 * rebuilds the state without writing a row or moving the cursor, and the
 * booking boundary is the cursor, where the normal fold starts booking. A
 * zero cursor means nothing was booked, so the normal fold already covers
 * the whole log and no prefix is replayed.
 */
/**
 * One raw session-log event: the fields the drain folds.
 */
type EventRecord = { type?: unknown; data?: unknown; seq?: unknown; time?: unknown };

/**
 * The structural session-history query surface the walk needs: the corpus
 * listing and the complete replay-validated log of one session.
 */
type Query = {
	listSessions?: () => Promise<readonly unknown[]>;
	readSession?: (Id: string) => Promise<unknown>;
};

export default (Context: Context, Database: DatabaseSync, Config: Config) =>
	async (): Promise<{
		Sessions: number;
		Calls: number;
	}> => {
		if (!Config.capture.backfill) {
			return { Sessions: 0, Calls: 0 };
		}
		const Service = Context.get("sessionQuery") as Query | undefined;
		if (
			Service === undefined ||
			typeof Service.listSessions !== "function" ||
			typeof Service.readSession !== "function"
		) {
			return { Sessions: 0, Calls: 0 };
		}
		const Fold = Drain(Context, Database, Config);
		const Queue = Capture(Config);
		const SelectCursor = Database.prepare("SELECT LastSeq FROM Cursor WHERE SessionId = ?");
		const CountCalls = Database.prepare(
			"SELECT COUNT(*) AS Calls FROM Call WHERE SessionId = ?",
		);

		// The failed replay prefixes: a session whose state could not be
		// rebuilt is never booked, and the walk reports the failures together
		// after every other session has had its turn, so one broken prefix
		// does not hide the sessions behind it.
		let Failures = 0;
		let Reason = "";

		let Listed: readonly unknown[];
		try {
			Listed = await Service.listSessions();
		} catch {
			return { Sessions: 0, Calls: 0 };
		}
		let Sessions = 0;
		let Calls = 0;
		for (const Record of Listed) {
			const Header = (Record as { header?: { id?: unknown; cwd?: unknown } } | undefined)
				?.header;
			const Id = Header?.id;
			if (typeof Id !== "string" || Id.length === 0) {
				continue;
			}
			let Log: { events?: unknown };
			try {
				Log = (await Service.readSession(Id)) as { events?: unknown };
			} catch {
				continue;
			}
			const Events = (Array.isArray(Log?.events) ? Log.events : []) as EventRecord[];
			let Highest = -1;
			for (const One of Events) {
				const Seq = typeof One?.seq === "number" ? One.seq : -1;
				if (Seq > Highest) {
					Highest = Seq;
				}
			}
			const Row = SelectCursor.get(Id) as { LastSeq: unknown } | undefined;
			const Reached = typeof Row?.LastSeq === "number" ? Row.LastSeq : -1;
			if (Reached >= Highest) {
				continue;
			}
			const Home = Header?.cwd;
			const Subject = { id: Id, cwd: typeof Home === "string" ? Home : undefined };
			const Before = (CountCalls.get(Id) as { Calls: unknown } | undefined)?.Calls;
			for (const One of Events) {
				Queue.Push(Subject, One);
			}
			const Batch = Queue.Take(Id);
			if (Batch.length === 0) {
				continue;
			}
			// The replay boundary (E2, A2 section 1.4): the events at or below
			// the cursor are already booked, so the fold below skips them and
			// the in-memory state they built is gone. Replaying that prefix in
			// replay-only mode rebuilds exactly what a continuous run would
			// hold when it reaches the booking boundary - and writes nothing
			// itself, so the ledger rows, the cursor and the capture queue stay
			// exactly where the last committed batch left them. The event at
			// the cursor was folded with it, so the prefix ends there; a zero
			// cursor means nothing was booked and no prefix is replayed.
			if (Reached > 0) {
				const Prefix = Events.filter((One) => {
					const Seq = typeof One?.seq === "number" ? One.seq : -1;
					return Seq >= 0 && Seq <= Reached;
				});
				if (Prefix.length > 0 && !Fold(Subject, Prefix, { Replay: true })) {
					// The prefix could not be reconstructed, so booking the
					// rest would price the session against a half-built state.
					// Nothing is booked for this session and the walk reports
					// the failure after the other sessions have had their turn.
					Failures += 1;
					if (Reason.length === 0) {
						Reason = Id;
					}
					continue;
				}
			}
			Fold(Subject, Batch);
			Sessions += 1;
			const After = (CountCalls.get(Id) as { Calls: unknown } | undefined)?.Calls;
			if (typeof Before === "number" && typeof After === "number") {
				Calls += After - Before;
			}
		}
		if (Failures > 0) {
			// The job's own rejection handler reports this line as its failed
			// status, so a prefix that could not be replayed surfaces instead
			// of leaving a half-reconstructed session quietly unbooked.
			throw new Error(
				`plugin-dsh-cost: the replay prefix of ${Failures} session(s) could not be ` +
					`reconstructed, so nothing was booked for them (first: ${Reason})`,
			);
		}
		return { Sessions, Calls };
	};
