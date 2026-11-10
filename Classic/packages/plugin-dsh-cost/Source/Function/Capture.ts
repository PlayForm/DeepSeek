/**
 * @module Capture
 *
 * The synchronous event recorder: the session/event listener's only duty, a
 * push of one event into its session's queue when the capture gates allow.
 *
 * @remarks
 * The recorder follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 1.
 * Push stores one event when the gates allow (capture.sessions for every
 * session; capture.subagents additionally required once the session's origin is
 * known to be "subagent", learned from the session header record or the session
 * subject) and never throws, never awaits and never touches I/O. The queue is
 * acknowledged only AFTER the flush commits (E1, A2 section 1.3): Peek returns
 * a session's pending batch without removing it, Acknowledge removes exactly
 * the acknowledged prefix, and Take - the whole-batch form the backfill walk
 * still uses - stays beside them. Size reports the queued count, and the
 * per-session bound keeps a queue whose drain keeps failing from growing
 * without limit.
 */
import type Config from "../Interface/Config.js";

// The per-session ceiling: past it the oldest pending events are dropped, so
// a batch that never commits costs a bounded amount of memory. A live flush
// keeps the queue far below it, and the bound sits above any plausible single
// session log the backfill walk pushes in one go. The dropped prefix is not
// lost accounting - the durable session log remains the recovery source, and
// the drain's cursor keeps a replayed prefix from being booked twice.
const Limit = 65_536;

export default (
	Config: Config,
): {
	Push(Session: unknown, Event: unknown): void;
	Take(SessionId: string): readonly unknown[];
	Peek(SessionId: string): readonly unknown[];
	Acknowledge(SessionId: string, Count: number): number;
	Size(): number;
} => {
	const Queues = new Map<string, unknown[]>();
	const Origins = new Map<string, string>();

	const Allowed = (Origin: string | undefined): boolean => {
		switch (true) {
			case !Config.capture.sessions:
				return false;
			case Origin === "subagent" && !Config.capture.subagents:
				return false;
			default:
				return true;
		}
	};

	// The session identity and origin as far as this one event reveals them:
	// the subject's own fields first, then the session header record's.
	const Subject = (
		Session: unknown,
		Event: unknown,
	): {
		Id: string | undefined;
		Origin: string | undefined;
	} => {
		const Session_ = Session as { id?: unknown; origin?: unknown } | undefined;
		const Record = Event as { type?: unknown; id?: unknown; origin?: unknown } | undefined;
		let Id: string | undefined;
		if (typeof Session_?.id === "string" && Session_.id.length > 0) {
			Id = Session_.id;
		} else if (
			Record?.type === "session" &&
			typeof Record.id === "string" &&
			Record.id.length > 0
		) {
			Id = Record.id;
		}
		let Origin: string | undefined;
		if (typeof Session_?.origin === "string") {
			Origin = Session_.origin;
		} else if (Record?.type === "session" && typeof Record.origin === "string") {
			Origin = Record.origin;
		}
		return { Id, Origin };
	};

	return {
		Push(Session: unknown, Event: unknown): void {
			try {
				const { Id, Origin } = Subject(Session, Event);
				if (Id === undefined) {
					return;
				}
				const Known = Origin ?? Origins.get(Id);
				if (typeof Origin === "string") {
					Origins.set(Id, Origin);
				}
				if (!Allowed(Known)) {
					return;
				}
				const Queue = Queues.get(Id) ?? [];
				Queue.push(Event);
				if (Queue.length > Limit) {
					Queue.splice(0, Queue.length - Limit);
				}
				Queues.set(Id, Queue);
			} catch {
				/* a capture failure never reaches the emit dispatch */
			}
		},
		// The whole-batch form: removes and returns one session's queue. The
		// backfill walk still takes its replay batch this way; the live flush
		// uses the peek/acknowledge pair below, so a failed fold keeps it.
		Take(SessionId: string): readonly unknown[] {
			const Queue = Queues.get(SessionId) ?? [];
			Queues.delete(SessionId);
			return Queue;
		},
		// The pending batch as a snapshot: the queue keeps every event, so a
		// fold that fails leaves the batch where the retry can find it.
		Peek(SessionId: string): readonly unknown[] {
			return [...(Queues.get(SessionId) ?? [])];
		},
		// Removes exactly the acknowledged prefix - the events the drain just
		// committed - and reports what is still queued. The queue is
		// append-only, so the prefix the flush peeked is still its prefix.
		Acknowledge(SessionId: string, Count: number): number {
			const Queue = Queues.get(SessionId);
			if (Queue === undefined) {
				return 0;
			}
			if (!(Count > 0)) {
				return Queue.length;
			}
			if (Count >= Queue.length) {
				Queues.delete(SessionId);
				return 0;
			}
			Queue.splice(0, Count);
			return Queue.length;
		},
		Size(): number {
			let Total = 0;
			for (const Queue of Queues.values()) {
				Total += Queue.length;
			}
			return Total;
		},
	};
};
