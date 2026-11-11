import assert from "node:assert/strict";

import Catalog from "../../../Target/Function/Catalog.js";
import Confirm from "../../../Target/Function/Confirm.js";
import Judge from "../../../Target/Function/Judge.js";
import Parse from "../../../Target/Function/Parse.js";
import Plan from "../../../Target/Function/Plan.js";
import Prompt from "../../../Target/Function/Prompt.js";
import Route from "../../../Target/Function/Route.js";
import type { Operation } from "../../../Target/Interface/Operation.js";
import type { ConfirmReply, PlanReply } from "../../../Target/Interface/Reply.js";
import type { StreamRequest } from "../../../Target/Interface/Services.js";
import { FirstRequest, PromptOne, PromptTwo, Rules } from "../../../Target/Variable/Blocks.js";
import {
	Check,
	CheckAsync,
	CorpusView,
	FakeAgent,
	FakeLLM,
	FakeSkills,
	Finish,
	Knobs,
	MakeCounter,
} from "../Harness.js";

/**
 * @module Test
 *
 * The two requests: the plan call that carries the index and no bodies, and the
 * confirm call that carries every body the plan asked to see.
 *
 * @remarks
 *
 * The phase split IS the read-before-write property. Phase 1 can only name the
 * skills whose bodies it needs, phase 2 is the only request that may return the
 * final list, and the union the caller loads is `views` plus every patch and
 * support target. The union itself is computed in `Source/Library.ts` (a
 * parallel lane), so this folder proves the two halves the leaves own: phase 1
 * carries no body, phase 2 renders exactly the set it is handed, and a patch
 * target that was not carried cannot pass the judge.
 *
 * TWO CALLS MAXIMUM is asserted where it is enforceable: phase 1's reply may
 * carry `views`, phase 2's reply may not, so a third request is not expressible
 * rather than merely discouraged.
 */
/**
 * The user text of one request: a review call sends exactly one message.
 */
const Sent = (Request: StreamRequest | undefined): string => {
	const Message_ = Request?.messages[0];
	const Block = Message_?.content[0];
	if (Block === undefined) return "";
	return Block.type === "text" ? Block.text : "";
};

/**
 * The phase-1 marker, copied byte for byte from `Function/Plan.ts:47`.
 */
const First = "Phase 1 of 2: return the plan. Reply with one JSON object and nothing else.";

/**
 * The phase-2 marker, copied byte for byte from `Function/Confirm.ts:56-57`.
 */
const Second =
	"Phase 2 of 2: return the final list. The bodies above are the current text. Reply with one JSON object and nothing else.";

/**
 * The route every request in this folder uses.
 */
const Route_ = { provider: "fake-provider", model: "fake-model" };

/**
 * The views a phase-1 reply carries, or none for the phase-2 shape.
 */
const Views = (Reply: PlanReply | ConfirmReply): readonly string[] =>
	"views" in Reply ? Reply.views : [];

/**
 * A valid skill file with one unique anchor, for the union check.
 */
const Body =
	"---\nname: alpha\ndescription: what it does\n---\n\n# alpha\n\nstep one here\n";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	await CheckAsync(Count, "C1: the phase-1 request is one user message: digest, index, marker", async () => {
		const LLM = FakeLLM('{"views":[],"operations":[]}');
		await Plan(LLM, {
			route: Route_,
			system: Prompt(1),
			digest: "DIGEST",
			index: ["- a: one", "- b: two"],
			maxTokens: 4000,
			signal: new AbortController().signal,
		});
		assert.equal(LLM.Calls.length, 1, "exactly one call");
		assert.deepEqual(
			Sent(LLM.Calls[0]).split("\n"),
			["DIGEST", "", "Skill index:", "- a: one", "- b: two", "", First],
			"the digest, then the index, then the phase marker",
		);
	});

	await CheckAsync(Count, "C2: the phase-1 request carries the index and no body", async () => {
		const LLM = FakeLLM('{"views":[],"operations":[]}');
		await Plan(LLM, {
			route: Route_,
			system: Prompt(1),
			digest: "DIGEST",
			index: ["- a: one"],
			maxTokens: 4000,
			signal: new AbortController().signal,
		});
		const Text_ = Sent(LLM.Calls[0]);
		assert.equal(Text_.includes("File: "), false, "a body can only arrive in phase 2");
		assert.equal(Text_.includes("```"), false, "no fenced body in the plan request");
		const Empty = FakeLLM('{"views":[],"operations":[]}');
		await Plan(Empty, {
			route: Route_,
			system: Prompt(1),
			digest: "DIGEST",
			index: [],
			maxTokens: 4000,
			signal: new AbortController().signal,
		});
		assert.equal(
			Sent(Empty.Calls[0]).includes("Skill index: (the catalog is empty)"),
			true,
			"an empty catalog states its fallback",
		);
	});

	await CheckAsync(Count, "C3: the index is one line per skill, and a hidden row is filtered", async () => {
		const Skills = FakeSkills({
			rows: [
				{ name: "alpha", description: "first\nline" },
				{ name: "beta" },
				{ name: "hidden", description: "x", modelInvocable: false },
				{ name: "" },
			],
		});
		const Lines = await Catalog(Skills, {});
		assert.deepEqual(
			Lines,
			["- alpha: first line", "- beta"],
			"one line per skill, the name alone when the description is absent",
		);
		assert.deepEqual(Skills.Calls, ["list"], "the index costs one list and no get");
	});

	await CheckAsync(Count, "C4: the request carries exactly the six documented fields", async () => {
		const LLM = FakeLLM('{"views":[],"operations":[]}');
		await Plan(LLM, {
			route: Route_,
			system: Prompt(1),
			digest: "DIGEST",
			index: [],
			maxTokens: 4000,
			signal: new AbortController().signal,
		});
		const Request = LLM.Calls[0];
		assert.deepEqual(
			Object.keys(Request ?? {}).sort(),
			["maxTokens", "messages", "model", "provider", "signal", "system"],
			"purpose is deliberately unset: a review has no slot in its union",
		);
		assert.equal(Request?.provider, "fake-provider");
		assert.equal(Request?.model, "fake-model");
		assert.equal(Request?.system, Prompt(1));
		assert.equal(Request?.maxTokens, 4000);
		assert.equal(Request?.messages.length, 1, "one user message");
		assert.equal(Request?.messages[0]?.role, "user");
	});

	Check(Count, "C5: the system text is byte-stable and phase 2 removes one section", () => {
		assert.equal(Prompt(1), PromptOne, "phase 1 is the shipped text");
		assert.equal(Prompt(2), PromptTwo, "phase 2 is the shipped text");
		assert.equal(PromptOne.includes(FirstRequest), true, "phase 1 describes the first request");
		assert.equal(PromptTwo.includes(FirstRequest), false, "phase 2 does not");
		assert.equal(
			PromptOne.split(`${FirstRequest}\n\n`).join(""),
			PromptTwo,
			"the two prompts differ by exactly the first-request section",
		);
		assert.equal(PromptOne.endsWith(Rules), true, "both end with the shared rules");
		assert.equal(PromptTwo.endsWith(Rules), true);
		assert.equal(/[^\x00-\x7F]/.test(PromptOne), false, "the prompt is ASCII");
	});

	await CheckAsync(Count, "C6: the reply is read from `text-delta` frames only", async () => {
		const LLM = FakeLLM("", {
			frames: [
				{ type: "reasoning-delta", text: "REASON" },
				{ type: "text-delta", text: '{"operations"' },
				{ type: "tool-call-delta", text: "CALL" },
				{ type: "usage", text: "USAGE" },
				{ type: "text-delta", text: ":[]}" },
				{ type: "finish", text: "FINISH" },
			],
		});
		const Reply = await Plan(LLM, {
			route: Route_,
			system: Prompt(1),
			digest: "DIGEST",
			index: [],
			maxTokens: 4000,
			signal: new AbortController().signal,
		});
		assert.equal(Reply, '{"operations":[]}', "only the visible text is the reply");
	});

	await CheckAsync(Count, "C7: the phase-2 request carries every body it was handed", async () => {
		const LLM = FakeLLM('{"operations":[]}');
		await Confirm(LLM, {
			route: Route_,
			system: Prompt(2),
			digest: "DIGEST",
			index: ["- a: one"],
			views: [
				{ name: "alpha", body: "BODY-A" },
				{ name: "beta", body: "BODY-B" },
			],
			maxTokens: 4000,
			signal: new AbortController().signal,
		});
		assert.deepEqual(
			Sent(LLM.Calls[0]).split("\n"),
			[
				"DIGEST",
				"",
				"Skill index:",
				"- a: one",
				"",
				"File: alpha",
				"```",
				"BODY-A",
				"```",
				"",
				"File: beta",
				"```",
				"BODY-B",
				"```",
				"",
				Second,
			],
			"each body is labelled, fenced, and in the order the caller loaded it",
		);
	});

	await CheckAsync(Count, "C8: the fence is one backtick longer than the longest run in the body", async () => {
		const Body_ = "line\n```js\ncode\n```\nend";
		const LLM = FakeLLM('{"operations":[]}');
		await Confirm(LLM, {
			route: Route_,
			system: Prompt(2),
			digest: "DIGEST",
			index: [],
			views: [{ name: "alpha", body: Body_ }],
			maxTokens: 4000,
			signal: new AbortController().signal,
		});
		const Lines = Sent(LLM.Calls[0]).split("\n");
		const Start = Lines.indexOf("````");
		assert.equal(Start >= 0, true, "a body with a triple-backtick fence takes a four-backtick delimiter");
		assert.deepEqual(
			Lines.slice(Start + 1, Start + 6),
			["line", "```js", "code", "```", "end"],
			"the body is not truncated",
		);
		assert.equal(Lines[Start + 6], "````", "and the delimiter closes it");
	});

	await CheckAsync(Count, "C9: the digest and the index precede the bodies, and the marker is last", async () => {
		const LLM = FakeLLM('{"operations":[]}');
		await Confirm(LLM, {
			route: Route_,
			system: Prompt(2),
			digest: "DIGEST",
			index: ["- a: one"],
			views: [{ name: "alpha", body: "BODY-A" }],
			maxTokens: 4000,
			signal: new AbortController().signal,
		});
		const Lines = Sent(LLM.Calls[0]).split("\n");
		assert.equal(Lines[0], "DIGEST", "the digest is first");
		assert.equal(Lines[2], "Skill index:", "then the index");
		assert.equal(Lines.indexOf("File: alpha") > Lines.indexOf("Skill index:"), true, "then the bodies");
		assert.equal(Lines.at(-1), Second, "and the phase marker last");
	});

	Check(Count, "C10: the route is the knob override per half, then the agent's own options", () => {
		const Agent = FakeAgent({ provider: "agent-provider", model: "agent-model" });
		assert.deepEqual(
			Route(Agent, Knobs()),
			{ provider: "agent-provider", model: "agent-model" },
			"the shipped posture is the agent's route",
		);
		assert.deepEqual(
			Route(Agent, Knobs({ provider: "knob-provider", model: "knob-model" })),
			{ provider: "knob-provider", model: "knob-model" },
			"the override wins when it names both halves",
		);
		assert.deepEqual(
			Route(Agent, Knobs({ provider: "knob-provider" })),
			{ provider: "knob-provider", model: "agent-model" },
			"each half falls back on its own",
		);
		assert.equal(Route(FakeAgent(), Knobs()), undefined, "an empty pair is no route, never an empty one");
		assert.equal(
			Route(FakeAgent({ provider: "only-provider" }), Knobs()),
			undefined,
			"an incomplete pair is no route either",
		);
	});

	Check(Count, "C11: a patch target the caller did not carry is refused", () => {
		const Configuration_ = Knobs();
		const Operation_: Operation = {
			kind: "patch",
			skill: "alpha",
			oldString: "step one here",
			newString: "step two here",
			reason: "the order matters",
		};
		const Missing = Judge(
			Operation_,
			CorpusView(Configuration_, { bodies: { alpha: Body }, carried: {} }),
			Configuration_,
		);
		assert.equal(Missing?.rule, "body-carried", "the union is the only way a target gets carried");
		assert.equal(
			Missing?.detail,
			"skill 'alpha' was not loaded in the confirm prompt; read before write",
		);
		const Carried = Judge(
			Operation_,
			CorpusView(Configuration_, { bodies: { alpha: Body }, carried: { alpha: Body } }),
			Configuration_,
		);
		assert.equal(Carried, null, "the same operation passes once its body was carried");
	});

	Check(Count, "C12: phase 1 asks for views, phase 2 returns the list, and a third call is unrepresentable", () => {
		const Planned = Parse('{"views":["alpha"],"operations":[]}', 1, 8);
		assert.equal(Planned.ok, true, "the plan parses");
		assert.deepEqual(Planned.ok ? Views(Planned.reply) : [], ["alpha"], "phase 1 may ask for bodies");
		const Confirmed = Parse('{"operations":[]}', 2, 8);
		assert.equal(Confirmed.ok, true, "the final list parses");
		assert.deepEqual(Confirmed.ok ? Views(Confirmed.reply) : ["unreachable"], [], "phase 2 carries no views");
		const Third = Parse('{"views":["alpha"],"operations":[]}', 2, 8);
		assert.equal(Third.ok, false, "a phase-2 reply that asks for more bodies is refused");
		assert.equal(Third.ok === false ? Third.id : "", "unknown-key");
		assert.equal(Third.ok === false ? Third.detail : "", 'unknown top-level key "views"');
	});

	return Finish(Count, "Plan-And-Confirm");
};

// Standalone entry: `node Target/Test/Plan-And-Confirm/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	await runTest();
}
