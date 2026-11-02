// Digest - the bounded transcript digest the review model receives, ported rule
// for rule from Hermes' `_digest_history` (`agent/background_review.py:332-362`)
// as plan section 4.4 states it.
//
// WHY A DIGEST AT ALL: the review runs on a ROUTED model, whose prompt cache is
// cold for this conversation anyway, so a compact replay costs a fraction of a
// full one and loses nothing the reviewer needs (plan section 4.1). The Hermes
// function returns messages; this package's digest is a STRING because the whole
// request is one user message carrying "the digest text, then the skill index,
// then the phase marker" (plan section 4.1). The one adaptation that follows
// from it: Hermes prepends a synthetic user message to the kept tail messages,
// while here the collapsed lines and the kept tail are rendered into one text,
// in that order, so the tail still follows the summary exactly as the header
// promises.
//
// THE TWO RULES THAT MAKE A DIGEST SAFE:
//
//   1. THE TAIL IS VERBATIM AND NEVER STARTS ON A TOOL RESULT. A digest that
//      cuts between a tool call and its result hands the reviewer an unanswered
//      call, and the first thing it does is reason about a result it cannot see.
//      The tail therefore grows until it starts on a non-`tool` message
//      (`agent/background_review.py:337-341`).
//   2. THE COLLAPSE KEEPS BOTH SIDES. A digest of assistant turns only hides
//      exactly the corrections the review exists to catch; a digest of user
//      turns only hides the workflow that was corrected. So a user message
//      contributes `USER: `, an assistant message contributes its tool names and
//      its text, and everything else contributes nothing to the SUMMARY
//      (`agent/background_review.py:345-356`).
//
// THE TWO PER-LINE CAPS BOUND THE SUMMARY, NOT THE TAIL. That is the Hermes
// split: the caps exist because the summary is invented text, while the tail is
// the reviewer's evidence and is kept whole (plan section 4.4, "kept verbatim").
// There is no total cap, by the same row: the tail bound and the two per-line
// caps are the whole budget.
import type Message from "@Interface/Message.js";

/** The three caps the digest reads from the resolved knobs. */
export interface DigestLimits {
	/** Messages kept verbatim; older ones collapse into the summary lines. */
	readonly digestTail: number;
	/** The cap on one `USER: ` summary line. */
	readonly digestUserChars: number;
	/** The cap on one `ASSISTANT: ` summary line. */
	readonly digestAssistantChars: number;
}

/** The digest text plus the two counts the report prints to prove its shape. */
export interface DigestResult {
	/** The digest text; empty only for an empty transcript. */
	readonly text: string;
	/** How many trailing messages were kept verbatim. */
	readonly kept: number;
	/** How many leading messages collapsed into the summary. */
	readonly collapsed: number;
}

/** One bracketed line naming the digest and why it exists (`agent/background_review.py:357-361`). */
const Header =
	"[Earlier conversation digest - older turns summarised to bound the review's cost. Recent turns follow verbatim below.]";

/** The two per-line caps; `undefined` means uncapped, which is the verbatim tail. */
interface Caps {
	readonly user: number | undefined;
	readonly assistant: number | undefined;
}

/** The tail is uncapped: it is evidence, not a summary. */
const Whole: Caps = { user: undefined, assistant: undefined };

/** Newlines flattened to one space, then trimmed (`agent/background_review.py:349`). */
const Flatten = (Text: string): string => Text.replace(/\s+/g, " ").trim();

/** A message's text, from its `text` blocks only, in order. */
const Text = (Message: Message): string => {
	const Parts: string[] = [];
	for (const Block of Message.content) {
		// A tool-call block contributes its name, never its text (plan section 4.4).
		if (Block.type === "text" && typeof Block.text === "string") Parts.push(Block.text);
	}
	return Parts.join("\n");
};

/** The tool names a message calls, with `?` where a name is absent. */
const Names = (Message: Message): readonly string[] => {
	const Called: string[] = [];
	for (const Block of Message.content) {
		if (Block.type !== "tool-call") continue;
		const Name = (Block.name ?? "").trim();
		Called.push(Name === "" ? "?" : Name);
	}
	return Called;
};

/** One line's text, cut to its cap when the line is a summary line. */
const Cut = (Text: string, Limit: number | undefined): string =>
	Limit === undefined ? Text : Text.slice(0, Limit);

/**
 * One message as digest lines: `USER: `, `ASSISTANT[tools: a, b]` plus
 * `ASSISTANT: `, or `<ROLE>: ` for the roles a summary drops. Empty text yields
 * no line, which is the "empty text contributes nothing" rule
 * (`agent/background_review.py:345-356`).
 */
const Lines = (Message: Message, Cap: Caps): readonly string[] => {
	const Body = Flatten(Text(Message));
	switch (true) {
		case Message.role === "user":
			return Body === "" ? [] : [`USER: ${Cut(Body, Cap.user)}`];
		case Message.role === "assistant": {
			const Rendered: string[] = [];
			const Called = Names(Message);
			switch (true) {
				case Called.length > 0:
					Rendered.push(`ASSISTANT[tools: ${Called.join(", ")}]`);
					break;
				default:
					break;
			}
			switch (true) {
				case Body !== "":
					Rendered.push(`ASSISTANT: ${Cut(Body, Cap.assistant)}`);
					break;
				default:
					break;
			}
			return Rendered;
		}
		default:
			// A tool result, a system prompt, or a developer note: the verbatim tail
			// still shows it, the summary does not.
			return Body === "" ? [] : [`${Message.role.toUpperCase()}: ${Body}`];
	}
};

export default (Messages: readonly Message[], Limits: DigestLimits): DigestResult => {
	switch (true) {
		case Messages.length === 0:
			return { text: "", kept: 0, collapsed: 0 };
		default:
			break;
	}
	// The tail: `digestTail` messages, grown until it does not start on a tool result.
	const Tail = Math.max(1, Limits.digestTail);
	let Keep = Math.min(Tail, Messages.length);
	while (Keep < Messages.length && Messages[Messages.length - Keep]?.role === "tool") {
		Keep += 1;
	}
	const Kept = Messages.slice(Messages.length - Keep);
	const Older = Messages.slice(0, Messages.length - Keep);
	const Verbatim = Kept.flatMap((Entry) => Lines(Entry, Whole));
	// The no-op case: the transcript already fits in the tail, so it is returned
	// unchanged and no header is invented (`agent/background_review.py:342-343`).
	switch (true) {
		case Older.length === 0:
			return { text: Verbatim.join("\n"), kept: Kept.length, collapsed: 0 };
		default:
			return {
				text: [
					Header,
					...Older.flatMap((Entry) =>
						Lines(Entry, {
							user: Limits.digestUserChars,
							assistant: Limits.digestAssistantChars,
						}),
					),
					...Verbatim,
				].join("\n"),
				kept: Kept.length,
				collapsed: Older.length,
			};
	}
};
