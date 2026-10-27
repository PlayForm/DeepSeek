// Backfill - the replay of the sessions that predate the plugin
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 6): on first run the
// ledger is empty and every past conversation is unpriced, so the walk reads
// the session-history query service (probed with ctx.get - the service is
// optional and the plugin does not inject it), reads each session's events,
// and pushes them through the same Capture/Drain path the live listeners use,
// so a backfilled session lands the same rows a live session would. The
// Cursor table makes it resumable and idempotent: a session already folded to
// its last event's sequence is skipped whole, and the drain itself skips the
// events at or below the recorded sequence. The walk runs only when the
// Config.capture.backfill gate is on, and it runs inside the backfill job -
// never on the boot path.
import type { DatabaseSync } from "node:sqlite";

import type { Context } from "@deepseek-ai/cordis";

import type Config from "../Interface/Config.js";
import Capture from "./Capture.js";
import Drain from "./Drain.js";

// One raw session-log event: the fields the drain folds.
type EventRecord = { type?: unknown; data?: unknown; seq?: unknown; time?: unknown };

// The structural session-history query surface the walk needs: the corpus
// listing and the complete replay-validated log of one session.
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
			Fold(Subject, Batch);
			Sessions += 1;
			const After = (CountCalls.get(Id) as { Calls: unknown } | undefined)?.Calls;
			if (typeof Before === "number" && typeof After === "number") {
				Calls += After - Before;
			}
		}
		return { Sessions, Calls };
	};
