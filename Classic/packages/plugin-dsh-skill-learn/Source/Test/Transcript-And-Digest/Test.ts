/**
 * @module Test
 *
 * The transcript projection and the bounded digest the review model receives.
 *
 * @remarks
 * `deriveMessages()` is the only history accessor the harness has, and the
 * digest is the only place the review spends its input budget. The two rules
 * that make the digest safe are the two that are easiest to break: the tail is
 * verbatim and never starts on a tool result, and the summary keeps both sides
 * of the conversation rather than an assistant-only highlight reel.
 *
 * The projection is asserted against the harness's real block union: a
 * `reasoning` block is a block the plugin never sends, so it must be dropped at
 * the boundary rather than silently reaching the digest.
 */
import assert from "node:assert/strict";

import Digest from "../../../Target/Function/Digest.js";
import type { DigestLimits } from "../../../Target/Function/Digest.js";
import Transcript from "../../../Target/Function/Transcript.js";
import type Message from "../../../Target/Interface/Message.js";
import { Call, Check, FakeAgent, Finish, Foreign, MakeCounter, Say, Turn } from "../Harness.js";

/** The digest's one bracketed header, copied byte for byte from `Function/Digest.ts:58-59`. */
const Header =
	"[Earlier conversation digest - older turns summarised to bound the review's cost. Recent turns follow verbatim below.]";

/** The three limits one scenario reads. */
const Limits = (Tail: number, User = 300, Assistant = 200): DigestLimits => ({
	digestTail: Tail,
	digestUserChars: User,
	digestAssistantChars: Assistant,
});

/** A row whose content is not a block list, which the projection must still handle. */
const Broken = (Role: string): Message => JSON.parse(JSON.stringify({ role: Role, content: "not-a-list" }));

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	Check(Count, "P1: the projection keeps text and tool-call blocks and drops the rest", () => {
		const Agent = FakeAgent({
			messages: [
				Foreign("assistant", [
					{ type: "text", text: "kept" },
					{ type: "reasoning", text: "dropped" },
					{ type: "tool-call", name: "read" },
				]),
			],
		});
		const Derived = Transcript(Agent);
		assert.equal(Derived.messages.length, 1, "one message");
		assert.deepEqual(
			Derived.messages[0]?.content,
			[
				{ type: "text", text: "kept" },
				{ type: "tool-call", name: "read" },
			],
			"the harness's other five block types contribute nothing",
		);
		assert.equal(Derived.toolCalls, 1, "and the call is counted");
	});

	Check(Count, "P2: an unknown role is dropped and a non-list content is kept empty", () => {
		const Agent = FakeAgent({
			messages: [Foreign("narrator", []), Broken("user"), Say("user", "kept")],
		});
		const Derived = Transcript(Agent);
		assert.deepEqual(
			Derived.messages.map((Message_) => Message_.role),
			["user", "user"],
			"a row that is not a message never reaches the digest",
		);
		assert.deepEqual(Derived.messages[0]?.content, [], "a non-list content is an empty message");
		assert.equal(Derived.messages[1]?.content.length, 1, "and the real message survives");
	});

	Check(Count, "P3: a session that refuses to derive is an empty transcript, not a crash", () => {
		const Derived = Transcript(FakeAgent({ deriveThrows: true }));
		assert.deepEqual(Derived, { messages: [], toolCalls: 0 }, "a disposed session has nothing to review");
	});

	Check(Count, "P4: the tool-call count is blocks, not messages", () => {
		const Agent = FakeAgent({
			messages: [Call(["read", "edit"]), Say("assistant", "done"), Call([null])],
		});
		const Derived = Transcript(Agent);
		assert.equal(Derived.toolCalls, 3, "two calls in one step count twice");
		assert.equal(Derived.messages.length, 3, "three messages");
		assert.deepEqual(Derived.messages[2]?.content, [{ type: "tool-call" }], "a nameless call is still a call");
	});

	Check(Count, "G1: the tail never starts on a tool result", () => {
		const Digested = Digest(
			[Say("user", "one"), Say("assistant", "two"), Say("tool", "three"), Say("user", "four")],
			Limits(2),
		);
		assert.equal(Digested.kept, 3, "the tail grew by one to start on the assistant message");
		assert.equal(Digested.collapsed, 1, "and only the first turn collapsed");
		assert.deepEqual(
			Digested.text.split("\n"),
			[Header, "USER: one", "ASSISTANT: two", "TOOL: three", "USER: four"],
			"the kept run is verbatim and the summary precedes it",
		);
	});

	Check(Count, "G2: a transcript that fits in the tail is returned unchanged", () => {
		const Digested = Digest([Say("user", "one"), Say("assistant", "two")], Limits(24));
		assert.deepEqual(
			Digested,
			{ text: "USER: one\nASSISTANT: two", kept: 2, collapsed: 0 },
			"the no-op case invents no header",
		);
	});

	Check(Count, "G3: the older turns collapse into one summary section before the tail", () => {
		const Digested = Digest(
			[
				Say("user", "u1"),
				Say("assistant", "a1"),
				Say("user", "u2"),
				Say("assistant", "a2"),
				Say("user", "u3"),
				Say("assistant", "a3"),
			],
			Limits(2),
		);
		assert.equal(Digested.kept, 2, "the last two messages stay verbatim");
		assert.equal(Digested.collapsed, 4, "the four older messages collapse");
		assert.deepEqual(
			Digested.text.split("\n"),
			[Header, "USER: u1", "ASSISTANT: a1", "USER: u2", "ASSISTANT: a2", "USER: u3", "ASSISTANT: a3"],
			"one header, the summary lines, then the tail",
		);
		assert.equal(Digested.kept + Digested.collapsed, 6, "every message is accounted for");
	});

	Check(Count, "G4: the two per-line caps bound the summary and never the tail", () => {
		const Summary = Digest(
			[Say("user", "u".repeat(400)), Say("assistant", "a".repeat(300)), Say("user", "tail")],
			Limits(1),
		);
		const Lines = Summary.text.split("\n");
		assert.equal(Lines[1], `USER: ${"u".repeat(300)}`, "the user line is cut at digestUserChars");
		assert.equal(Lines[2], `ASSISTANT: ${"a".repeat(200)}`, "the assistant line is cut at digestAssistantChars");
		assert.equal(Lines[3], "USER: tail", "the tail follows");
		const Verbatim = Digest([Say("user", "u".repeat(400)), Say("user", "tail")], Limits(2));
		assert.equal(Verbatim.collapsed, 0, "nothing collapsed");
		assert.equal(
			Verbatim.text.split("\n")[0],
			`USER: ${"u".repeat(400)}`,
			"the tail is the reviewer's evidence and is kept whole",
		);
	});

	Check(Count, "G5: an assistant line names its tools and prints `?` for an absent name", () => {
		const Digested = Digest([Turn("done", ["read", null]), Say("user", "tail")], Limits(1));
		assert.deepEqual(
			Digested.text.split("\n"),
			[Header, "ASSISTANT[tools: read, ?]", "ASSISTANT: done", "USER: tail"],
			"the tool line then the text line",
		);
	});

	Check(Count, "G6: every role keeps its text and an empty text contributes no line", () => {
		const Digested = Digest([Say("system", "sys"), Say("tool", ""), Say("user", "tail")], Limits(1));
		assert.deepEqual(
			Digested.text.split("\n"),
			[Header, "SYSTEM: sys", "USER: tail"],
			"a non-empty text is rendered under its role, and an empty one is dropped",
		);
		assert.equal(Digested.collapsed, 2, "both older messages are in the summary");
		assert.deepEqual(
			Digest([], Limits(24)),
			{ text: "", kept: 0, collapsed: 0 },
			"an empty transcript digests to nothing",
		);
	});

	return Finish(Count, "Transcript-And-Digest");
};

// Standalone entry: `node Target/Test/Transcript-And-Digest/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	await runTest();
}
