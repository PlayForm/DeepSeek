// Capture - the synchronous event recorder (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 1): the session/event listener's only duty.
// Push stores one event in its session's queue when the capture gates allow
// (capture.sessions for every session; capture.subagents additionally
// required once the session's origin is known to be "subagent", learned from
// the session header record or the session subject) and never throws, never
// awaits and never touches I/O. Take removes and returns one session's queue
// for the flush; Size reports the queued count.
import type Config from "../Interface/Config.js";

export default (
	Config: Config,
): {
	Push(Session: unknown, Event: unknown): void;
	Take(SessionId: string): readonly unknown[];
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
				Queues.set(Id, Queue);
			} catch {
				/* a capture failure never reaches the emit dispatch */
			}
		},
		Take(SessionId: string): readonly unknown[] {
			const Queue = Queues.get(SessionId) ?? [];
			Queues.delete(SessionId);
			return Queue;
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
