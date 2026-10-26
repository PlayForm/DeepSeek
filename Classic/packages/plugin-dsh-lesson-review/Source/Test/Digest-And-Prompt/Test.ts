// Source/Test/Digest-And-Prompt/Test.ts - WHAT THE REVIEW SENDS.
//
// Two bounded artifacts leave this package on every review: the digest (the
// conversation, compressed) and the prompt (the rules, constant). Both are
// asserted directly, because both are where an unattended review goes wrong
// quietly - a digest that hides the correction, a prompt whose rules drifted.
import assert from "node:assert/strict";

import Digest from "../../../Target/Function/Digest.js";
import Prompt from "../../../Target/Function/Prompt.js";
import { Check, Finish, Make, MakeCounter } from "../Harness.js";

/** A conversation of `Count` alternating messages. */
const Conversation = (Count: number) =>
	Array.from({ length: Count }, (_, Index) => ({
		role: Index % 2 === 0 ? "user" : "assistant",
		text: Index % 2 === 0 ? `question ${Index}` : `answer ${Index}`,
	}));

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	Check(Count, "D1: a short conversation is kept verbatim, nothing collapsed", () => {
		const Result = Digest(Conversation(4), 24, 120_000);
		assert.equal(Result.kept, 4, "every message is kept");
		assert.equal(Result.collapsed, 0, "nothing is summarised");
		assert.equal(Result.trimmed, false, "nothing is trimmed");
		assert.match(Result.text, /USER: question 0/, "the first user turn is present");
		assert.match(Result.text, /ASSISTANT: answer 3/, "the last assistant turn is present");
	});

	Check(Count, "D2: a long conversation collapses the older turns and keeps the tail", () => {
		const Result = Digest(Conversation(40), 24, 120_000);
		assert.equal(Result.collapsed, 16, "the leading turns collapse");
		assert.equal(Result.kept, 24, "the tail is kept verbatim");
		assert.match(Result.text, /Earlier conversation digest/, "the digest announces itself");
		assert.match(Result.text, /USER: question 0/, "the collapsed part keeps the user side");
		assert.match(Result.text, /ASSISTANT: answer 1/, "and the assistant side");
		assert.match(Result.text, /answer 39/, "the newest turn is verbatim");
	});

	Check(Count, "D3: the tail never starts on a tool result", () => {
		const Messages = [
			{ role: "user", text: "do the thing" },
			{ role: "assistant", text: "calling the tool" },
			{ role: "tool", text: "result one" },
			{ role: "tool", text: "result two" },
		];
		const Result = Digest(Messages, 2, 120_000);
		assert.equal(Result.kept, 3, "the tail grew to include the call it answers");
		assert.equal(Result.collapsed, 1, "only the first turn collapsed");
	});

	Check(Count, "D4: the character cap trims from the front and says so", () => {
		const Result = Digest(Conversation(40), 24, 200);
		assert.equal(Result.trimmed, true, "the cap was applied");
		assert.match(Result.text, /answer 39/, "the newest turn survives the trim");
		assert.doesNotMatch(Result.text, /question 0/, "the oldest collapsed turn was dropped");
	});

	Check(Count, "D5: an empty conversation is a marker, never an empty string", () => {
		const Result = Digest([], 24, 120_000);
		assert.equal(Result.text, "[No conversation to review.]", "the reviewer is told there is nothing");
	});

	Check(Count, "P1: the prompt is the blocks in the judge's order", () => {
		const Text = Prompt();
		assert.ok(Text.startsWith("Review the conversation above"), "the task comes first");
		assert.ok(
			Text.indexOf("What a skill IS") < Text.indexOf("Signals to look for"),
			"the shape precedes the signals",
		);
		assert.ok(
			Text.indexOf("Preference order") < Text.indexOf("Do NOT capture as skills"),
			"the preference order precedes the prohibitions",
		);
		assert.ok(
			Text.indexOf('{ "note"') > Text.indexOf("Do NOT capture as skills"),
			"the reply contract is the LAST rule the model reads",
		);
	});

	Check(Count, "P2: both stores are named, with the one-store rule", () => {
		const Text = Prompt();
		assert.match(Text, /SKILL CORPUS/, "the corpus is named");
		assert.match(Text, /WORKING AGREEMENT/, "the agreement is named");
		assert.match(Text, /put it in ONE/, "the routing rule is stated");
		assert.match(Text, /never writes\s+`AGENTS\.md`/, "the agreement is proposal-only");
	});

	Check(Count, "P3: an explicit focus is appended after the contract", () => {
		const Text = Prompt("look at the naming of the new plugin");
		assert.ok(
			Text.indexOf("look at the naming of the new plugin") > Text.indexOf('{ "note"'),
			"the focus lands after the reply contract",
		);
		assert.ok(Text.includes("explicitly requested this review"), "and is labelled as such");
	});

	Check(Count, "P4: the service's prompt is the same bytes as the function's", () => {
		const Run = Make();
		assert.equal(Run.Service.Prompt(), Prompt(), "no drift between the service and the composer");
	});

	return Finish(Count, "Digest-And-Prompt");
};

// Standalone entry: `node Target/Test/Digest-And-Prompt/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Digest-And-Prompt`);
}
