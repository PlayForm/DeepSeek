// Snapshot - the live-session projection: the ONE integration seam of this
// package, and the only module that reads a harness object it does not own.
//
// THE CONTRACT IS "MESSAGES IN", NOT "SESSION OUT". The service's `Review`
// takes a snapshot (Interface/Review), exactly like the Hermes fork takes
// `messages_snapshot`; this module is the adapter that produces one from a
// live agent. Keeping the adapter separate means:
//
//   * the review, the digest, the parse, the judge and the apply are all
//     testable without a session (the smokes pass literal snapshots), and
//   * the harness-specific read is confined to one guarded function, so a
//     projection shape that changes upstream cannot take the review down.
//
// THE SURFACE READ IS PROBED, NOT ASSUMED (SCHEME §6): the harness exposes the
// ordered surface over a session's event log, and this package has not
// verified the accessor names against a live host. Each candidate is tried in
// order and every read is guarded; an empty result is NOT an error - the
// caller reports `unavailable` and the ledger says why, which is strictly
// better than reviewing a transcript the reviewer invented.
//
// A message's text is read from its content blocks: `text` blocks join, and
// every other block type is named rather than stringified (a tool-call block
// stringified into a digest is noise the reviewer would treat as prose).
import type { ReviewMessage } from "@Interface/Review.js";

/** The role + content shape any candidate projection is expected to carry. */
interface Projected {
	role?: unknown;
	content?: unknown;
}

/** The text of one projected message. */
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

/** Coerce one candidate list into messages, dropping unreadable rows. */
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

/** The guarded probe of one candidate accessor. */
const Probe = (Read_: () => unknown): unknown => {
	try {
		return Read_();
	} catch {
		return undefined;
	}
};

export default (Agent: unknown): ReviewMessage[] => {
	const Session = (Agent as { session?: Record<string, unknown> } | undefined)?.session;
	const Surface = Session?.["surface"] as Record<string, unknown> | undefined;
	const Candidates: unknown[] = [
		Probe(() => Surface?.["messages"]),
		Probe(() => (Surface?.["projection"] as Record<string, unknown> | undefined)?.["messages"]),
		Probe(() => (Surface as { snapshot?: () => unknown } | undefined)?.snapshot?.()),
		Probe(() => Session?.["messages"]),
	];
	for (const Candidate of Candidates) {
		const Messages = Read(
			(Candidate as { messages?: unknown } | undefined)?.messages ?? Candidate,
		);
		switch (true) {
			case Messages.length > 0:
				return Messages;
			default:
				break;
		}
	}
	return [];
};
