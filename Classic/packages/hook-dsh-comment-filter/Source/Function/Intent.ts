// Intent - the agent/pre-step waterfall listener: the PER-TASK INTENT STASH.
// It is a PURE OBSERVER of the step: `next()` is awaited FIRST and the
// downstream decision is returned UNCHANGED (the decision contract belongs to
// the agent loop; this listener only records). On every step it extracts the
// LAST USER MESSAGE's text, lowercases it, and stores it:
//
//   * in `State.IntentMap`, keyed by `payload.agent` (the agent proposing the
//     step - the SAME object a tool execution carries as `exec.agent`, which
//     is what makes the per-agent lookup in Function/Gate work), and
//   * in `State.Global`, the fallback for a dispatch with no agent identity.
//
// WHY A STASH AND NOT A RE-READ: the tools/post-execute arm cannot see the
// conversation - it sees one execution and its result. The intent has to be
// captured where the messages are visible (the step) and consulted where the
// bytes are (the result). The stash is the seam between them, and the gate's
// whole point: a task whose last user message is ABOUT comments must keep
// them.
//
// A STEP WITH NO USER MESSAGE KEEPS THE PREVIOUS INTENT: a later step of the
// same task usually carries tool results and assistant text only, and wiping
// the stash there would silently defeat the gate for every read after the
// first step - the feature would work only on step one.
//
// FAIL-OPEN: anything that throws (a malformed payload, a weird content
// shape) leaves the previous stash untouched and the decision unchanged -
// never throw into the waterfall.
import type State from "@Interface/State.js";

/**
 * The user text of the step: the last user message's text content,
 * lowercased. Reimplemented in this leaf (the family never imports one
 * package from another) from the search-suggester precedent's UserText
 * (Classic/packages/hook-dsh-search-suggester/Source/Function/Apply.ts:134).
 * Handles both content shapes the harness produces: a plain string and the
 * block array (`{ type: "text", text }`); non-text blocks contribute "".
 */
const UserText = (Payload: unknown): string => {
	const Step = Payload as { messages?: { role?: string; content?: unknown }[] } | undefined;
	const Message = Array.isArray(Step?.messages)
		? [...Step.messages].reverse().find((Entry) => Entry?.role === "user")
		: undefined;
	const Content = Message?.content;
	if (typeof Content === "string") {
		return Content.toLowerCase();
	}
	if (Array.isArray(Content)) {
		return Content.map((Block) =>
			typeof Block === "object" && Block !== null && "text" in Block
				? String((Block as { text: unknown }).text)
				: "",
		)
			.join(" ")
			.toLowerCase();
	}
	return "";
};

export default async <Decision>(
	Payload: unknown,
	Next: () => Promise<Decision>,
	State: State,
): Promise<Decision> => {
	// next() FIRST: the downstream listeners settle before any observation.
	const Decision = await Next();
	try {
		const Text = UserText(Payload);
		// No user message in this step: there is no NEW intent to record.
		if (Text === "") {
			return Decision;
		}
		const Agent = (Payload as { agent?: unknown } | undefined)?.agent;
		// The per-agent stash (the Map<object, string> contract).
		switch (true) {
			case typeof Agent === "object" && Agent !== null:
				State.IntentMap.set(Agent, Text);
		}
		// The global fallback (a dispatch with no agent identity).
		State.Global = Text;
	} catch {
		// Fail-open: keep the previous stash, return the decision unchanged.
	}
	return Decision;
};
