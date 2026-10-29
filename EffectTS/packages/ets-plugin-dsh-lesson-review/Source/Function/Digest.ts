// Digest - the bounded conversation digest the review model receives.
//
// THE SHAPE COMES FROM HERMES' `_digest_history`, and so does the reason for
// it: when the review runs on the SAME model as the live turn it replays the
// transcript as warm cache reads, but a routed (cheaper) model has a cold
// cache anyway, so a compact digest is strictly better than a full replay -
// the same lesson lands for a fraction of the tokens.
//
// THE TWO RULES that make a digest safe:
//
//   1. THE TAIL IS VERBATIM AND NEVER STARTS ON A TOOL RESULT. A digest that
//      cuts between a tool call and its result hands the reviewer an
//      unanswered call, and the first thing it does is reason about a result
//      it cannot see. The tail therefore grows until it starts on a
//      non-`tool` message.
//   2. THE COLLAPSE KEEPS BOTH SIDES. A digest of assistant turns only hides
//      exactly the corrections the review exists to catch; a digest of user
//      turns only hides the workflow that was corrected.
//
// The character cap is applied LAST, from the FRONT: the recent turns are what
// the reviewer needs, so the oldest collapsed lines are what get dropped.
import type { ReviewMessage } from "@Interface/Review.js";

/** One collapsed or verbatim line's cap (the Hermes 300/200 split). */
const UserCap = 300;
const AssistantCap = 200;

/** One line of a message, truncated to its role's cap. */
const Line = (Message: ReviewMessage): string => {
	const Text = Message.text.replace(/\s+/g, " ").trim();
	switch (true) {
		case Message.role === "user":
			return `USER: ${Text.slice(0, UserCap)}`;
		case Message.role === "assistant":
			return `ASSISTANT: ${Text.slice(0, AssistantCap)}`;
		case Message.role === "tool":
			return `TOOL: ${Text.slice(0, AssistantCap)}`;
		default:
			return `${Message.role.toUpperCase()}: ${Text.slice(0, AssistantCap)}`;
	}
};

/** The digest result: the text plus what it cost to build. */
export interface DigestResult {
	/** The digest text (never empty - an empty conversation yields a marker). */
	text: string;
	/** How many trailing messages were kept verbatim. */
	kept: number;
	/** How many leading messages collapsed into the summary. */
	collapsed: number;
	/** Whether the character cap dropped collapsed lines. */
	trimmed: boolean;
}

export default (
	Messages: readonly ReviewMessage[],
	Tail: number,
	MaxChars: number,
): DigestResult => {
	const All = Array.isArray(Messages) ? Messages.filter((M) => M !== undefined) : [];
	switch (true) {
		case All.length === 0:
			return { text: "[No conversation to review.]", kept: 0, collapsed: 0, trimmed: false };
		default:
			break;
	}
	// The tail: `Tail` messages, grown until it does not start on a tool result.
	let Keep = Math.min(Math.max(2, Tail), All.length);
	while (Keep < All.length && All[All.length - Keep]?.role === "tool") {
		Keep++;
	}
	const Kept = All.slice(All.length - Keep);
	const Older = All.slice(0, All.length - Keep);
	const Lines = Older.map(Line);
	const Header = Older.length
		? [
				"[Earlier conversation digest - older turns summarised to bound the",
				"review's cost. Recent turns follow verbatim below.]",
			].join("\n")
		: "";
	// The cap is applied to the COLLAPSED part first (the recent turns are the
	// reviewer's evidence), then to the whole.
	let Summary = Lines.join("\n");
	let Trimmed = false;
	const KeptText = Kept.map(Line).join("\n");
	const Budget = Math.max(0, MaxChars - KeptText.length - Header.length - 2);
	switch (true) {
		case Summary.length > Budget:
			Trimmed = true;
			Summary = Summary.slice(Summary.length - Budget);
			// Never leave a half line at the seam.
			Summary = Summary.slice(Math.max(0, Summary.indexOf("\n") + 1));
			break;
		default:
			break;
	}
	const Parts = [Header, Summary, KeptText].filter((Part) => Part !== "");
	return {
		text: Parts.join("\n\n"),
		kept: Kept.length,
		collapsed: Older.length,
		trimmed: Trimmed,
	};
};
