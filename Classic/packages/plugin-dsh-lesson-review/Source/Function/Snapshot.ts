import type { ReviewMessage } from "@Interface/Review.js";

/**
 * @module Snapshot
 *
 * The live-session projection: the ONE integration seam of this package, and the only module that reads a harness object it does not own.
 *
 * @remarks
 *
 * THE CONTRACT IS "MESSAGES IN", NOT "SESSION OUT". The service's `Review`
 * takes a snapshot (Interface/Review), exactly like the Hermes fork takes
 * `messages_snapshot`; this module is the adapter that produces one from a
 * live agent. Keeping the adapter separate means:
 *
 * - the review, the digest, the parse, the judge and the apply are all
 *   testable without a session (the smokes pass literal snapshots), and
 * - the harness-specific read is confined to one guarded function, so a
 *   projection shape that changes upstream cannot take the review down.
 *
 * THE HISTORY READ IS `Session.deriveMessages()` (SCHEME §6): it is the
 * accessor the agent loop itself calls to build the model-visible history,
 * and it is verified against the installed `dsh-session` declarations, so
 * it is the PRIMARY arm. The four surface shapes this module used to probe
 * are kept behind it, in their original order, so an older host that lacks
 * the accessor degrades to them instead of throwing. Every read is
 * guarded; a host that HAS the accessor and throws is reported through
 * `OnFailure` and the caller turns that into `unavailable` with the cause,
 * which is strictly better than reviewing a transcript the reviewer
 * invented. An empty result is NOT an error: the caller reports
 * `unavailable` and the ledger says why.
 *
 * A message's text is read from its content blocks: `text` blocks join, and
 * every other block type is named rather than stringified (a tool-call
 * block stringified into a digest is noise the reviewer would treat as
 * prose).
 */
/**
 * The role + content shape any candidate projection is expected to carry.
 */
interface Projected {
	/**
	 * The message's role, when the projection carries one.
	 */
	role?: unknown;
	/**
	 * The message's content, when the projection carries one.
	 */
	content?: unknown;
}

/**
 * The text of one projected message.
 */
const Text = (Message: Projected): string => {
	const Content = Message.content;
	switch (true) {
		case typeof Content === "string":
			return Content;
		case Array.isArray(Content):
			return (Content as Record<string, unknown>[])
				.map((Block) => {
					switch (true) {
						case Block?.["type"] === "text" && typeof Block["text"] === "string":
							return Block["text"] as string;
						case typeof Block?.["type"] === "string":
							return `[${Block["type"] as string}]`;
						default:
							return "";
					}
				})
				.filter((Part) => Part !== "")
				.join("\n");
		default:
			return "";
	}
};

/**
 * Coerce one candidate list into messages, dropping unreadable rows.
 */
const Read = (List: unknown): ReviewMessage[] => {
	switch (true) {
		case !Array.isArray(List):
			return [];
		default:
			break;
	}
	const Messages: ReviewMessage[] = [];
	for (const Row of List as Projected[]) {
		const Role = typeof Row?.role === "string" ? (Row.role as string) : "";
		const Body = Text(Row ?? {});
		switch (true) {
			case Role === "" || Body.trim() === "":
				continue;
			default:
				Messages.push({ role: Role, text: Body });
		}
	}
	return Messages;
};

/**
 * The guarded probe of one candidate accessor.
 */
const Probe = (Read_: () => unknown): unknown => {
	try {
		return Read_();
	} catch {
		return undefined;
	}
};

/**
 * One guarded member read: a non-object, an absent key, or a throwing
 * getter is `undefined`.
 */
const Member = (Value: unknown, Key: string): unknown =>
	Probe(() => {
		switch (true) {
			case Value === null || typeof Value !== "object":
				return undefined;
			default:
				return Reflect.get(Value, Key);
		}
	});

/**
 * One clause naming a thrown value, read through the same guard (no cast).
 */
const Reason = (Thrown: unknown): string => {
	const Detail = Member(Thrown, "message");
	switch (true) {
		case typeof Detail === "string" && Detail.trim() !== "":
			return Detail;
		default:
			return String(Thrown);
	}
};

export default (Agent: unknown, OnFailure?: (Detail: string) => void): ReviewMessage[] => {
	const Session = Member(Agent, "session");
	const Surface = Member(Session, "surface");

	// THE PRIMARY ARM: the derived history the agent loop itself reads. The
	// member read is guarded, so an older host without the accessor falls
	// through to the legacy probes; the call is guarded too, and a throw is
	// REPORTED rather than swallowed, because a broken history read is not an
	// empty session.
	const Derive = Member(Session, "deriveMessages");
	switch (true) {
		case typeof Derive === "function":
			try {
				const Messages = Read(Reflect.apply(Derive, Session, []));
				switch (true) {
					case Messages.length > 0:
						return Messages;
					default:
						break;
				}
			} catch (Cause) {
				OnFailure?.(`deriveMessages failed: ${Reason(Cause)}`);
				return [];
			}
			break;
		default:
			break;
	}
	const Candidates: unknown[] = [
		Member(Surface, "messages"),
		Member(Member(Surface, "projection"), "messages"),
		Probe(() => {
			const Snapshot_ = Member(Surface, "snapshot");
			return typeof Snapshot_ === "function"
				? Reflect.apply(Snapshot_, Surface, [])
				: undefined;
		}),
		Member(Session, "messages"),
	];
	for (const Candidate of Candidates) {
		const Messages = Read(Member(Candidate, "messages") ?? Candidate);
		switch (true) {
			case Messages.length > 0:
				return Messages;
			default:
				break;
		}
	}
	return [];
};
