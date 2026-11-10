import assert from "node:assert/strict";
import * as Path from "node:path";

import Catalog from "../../../Target/Function/Catalog.js";
import Confirm from "../../../Target/Function/Confirm.js";
import Digest from "../../../Target/Function/Digest.js";
import Judge from "../../../Target/Function/Judge.js";
import Append, { Rows } from "../../../Target/Function/Ledger.js";
import Parse from "../../../Target/Function/Parse.js";
import Plan from "../../../Target/Function/Plan.js";
import Prompt from "../../../Target/Function/Prompt.js";
import Revert from "../../../Target/Function/Revert.js";
import Transcript from "../../../Target/Function/Transcript.js";
import Write from "../../../Target/Function/Write.js";
import {
	CheckAsync,
	CorpusView,
	FakeAgent,
	FakeFs,
	FakeLlm,
	FakeSkills,
	Finish,
	Home,
	Knobs,
	MakeCounter,
	Say,
	Seed,
	State,
	Turn,
} from "../Harness.js";

/**
 * @module Test
 *
 * The fence and the undo.
 *
 * @remarks
 *
 * The fence is asserted AS DATA, not as a message: which intent a write carried,
 * which version an edit carried, whether a write was attempted at all. That is
 * the only way to prove the three properties the whole write path rests on
 * (`Source/Function/Write.ts:4-32`):
 *
 * 1. a create uses `createIfAbsent`, so an existing path is refused rather than
 *    overwritten;
 * 2. a patch stats IMMEDIATELY before the edit and passes THAT version, so a
 *    stale body is refused by the harness before a character is matched;
 * 3. a body that drifted between the confirm prompt and the write is refused
 *    BEFORE any call, because the carried text and the disk text are compared
 *    byte for byte.
 *
 * THE REPLAY GATE lives in this folder (`W14`): one run of the whole pipeline -
 * transcript, digest, catalog, plan, parse, confirm, parse, judge, write,
 * ledger - over a recorded transcript and a recorded corpus, printing the digest
 * counts and the applied operations. It is not a ninth folder; it is one printed
 * run inside this one, so the count stays honest.
 */
/**
 * A SKILL.md body with matching frontmatter.
 */
const Body = (Name: string, Extra = ""): string =>
	`---\nname: ${Name}\ndescription: what it does\n---\n\n# ${Name}\n\n${Extra}`;

/**
 * The live `SKILL.md` of one skill, under the temp home's corpus root.
 */
const Live = (Name: string): string => Path.join(Home, ".dsh", "skills", Name, "SKILL.md");

/**
 * The archived copy of one skill.
 */
const Archived = (Name: string): string => Path.join(Home, ".dsh", "skills", ".archive", Name, "SKILL.md");

/**
 * The corpus root and the archive root, expanded exactly as the leaves expand them.
 */
const Root = Path.join(Home, ".dsh", "skills");
const ArchiveRoot = Path.join(Home, ".dsh", "skills", ".archive");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	await CheckAsync(Count, "W1: a create writes with `createIfAbsent`", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Content = Body("new-skill");
		const Result = await Write({
			operation: { kind: "create", skill: "new-skill", content: Content, reason: "r" },
			carried: null,
			corpus: CorpusView(Configuration_),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, true, "the write landed");
		assert.equal(Result.ok ? Result.applied.before : "unreachable", null, "a creation has no before side");
		assert.equal(Result.ok ? Result.applied.after : "", Content, "the applied text is the content");
		assert.equal(Fs_.Text(Live("new-skill")), Content, "the file holds the content");
		const Call = Fs_.Of("writeText")[0];
		assert.equal(Call?.intent, "createIfAbsent", "the intent is the existence check");
		assert.equal(Call?.path, Live("new-skill"));
	});

	await CheckAsync(Count, "W2: `createIfAbsent` refuses an existing path", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Content = Body("taken");
		Seed(Fs_, "taken", Content);
		const Result = await Write({
			operation: { kind: "create", skill: "taken", content: Content, reason: "r" },
			carried: null,
			corpus: CorpusView(Configuration_, { bodies: { taken: Content } }),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, false, "the create is refused");
		assert.equal(Result.ok === false ? Result.outcome : "unreachable", "failed");
		assert.equal(Result.ok === false ? Result.detail : "", "FS_NOT_OBSERVED", "the harness's own code");
		assert.equal(Fs_.Text(Live("taken")), Content, "the existing file is untouched");
	});

	await CheckAsync(Count, "W3: a patch stats immediately before the edit and passes THAT version", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Content = Body("alpha", "step one");
		Seed(Fs_, "alpha", Content);
		const Version = Fs_.Version(Live("alpha"));
		const Result = await Write({
			operation: { kind: "patch", skill: "alpha", oldString: "step one", newString: "step two", reason: "r" },
			carried: Content,
			corpus: CorpusView(Configuration_, { bodies: { alpha: Content }, carried: { alpha: Content } }),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, true, "the patch landed");
		const Edits = Fs_.Of("editText");
		assert.equal(Edits.length, 1, "one literal edit");
		assert.equal(Edits[0]?.version, Version, "the version came from the stat, never from the caller");
		assert.equal(Edits[0]?.replaceAll, false, "the harness itself enforces anchor-unique");
		assert.equal(Edits[0]?.oldString, "step one");
		assert.equal(Fs_.Of("stat").length, 1, "exactly one stat");
		assert.equal(Fs_.Of("stat")[0]?.path, Live("alpha"), "and it is the file the edit then writes");
		assert.equal(Fs_.Text(Live("alpha")), Body("alpha", "step two"), "the anchor was replaced once");
	});

	await CheckAsync(Count, "W4: a stale version is refused before the match", async () => {
		const Fs_ = FakeFs({ bumpAfterStat: true });
		const Configuration_ = Knobs();
		const Content = Body("alpha", "step one");
		Seed(Fs_, "alpha", Content);
		const Result = await Write({
			operation: { kind: "patch", skill: "alpha", oldString: "step one", newString: "step two", reason: "r" },
			carried: Content,
			corpus: CorpusView(Configuration_, { bodies: { alpha: Content }, carried: { alpha: Content } }),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, false, "the edit is refused");
		assert.equal(Result.ok === false ? Result.outcome : "unreachable", "failed");
		assert.equal(Result.ok === false ? Result.detail : "", "FS_STALE_VERSION", "the version guard fired first");
		assert.equal(Fs_.Text(Live("alpha")), Content, "nothing was written");
	});

	await CheckAsync(Count, "W5: `editText` refuses a non-unique anchor", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Content = Body("alpha", "repeat me\nrepeat me");
		Seed(Fs_, "alpha", Content);
		const Result = await Write({
			operation: { kind: "patch", skill: "alpha", oldString: "repeat me", newString: "once", reason: "r" },
			carried: Content,
			corpus: CorpusView(Configuration_, { bodies: { alpha: Content }, carried: { alpha: Content } }),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, false, "the ambiguous edit is refused");
		assert.equal(Result.ok === false ? Result.detail : "", "FS_AMBIGUOUS_EDIT");
		assert.equal(Fs_.Of("editText")[0]?.replaceAll, false, "replaceAll is never true");
		assert.equal(Fs_.Text(Live("alpha")), Content, "nothing was written");
	});

	await CheckAsync(Count, "W6: the root fence refuses a target outside `skillsRoot`", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Escaped = Path.join(Home, ".dsh", "escape", "SKILL.md");
		const Result = await Write({
			operation: { kind: "create", skill: "../escape", content: Body("escape"), reason: "r" },
			carried: null,
			corpus: CorpusView(Configuration_),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, false, "the write is refused");
		assert.equal(Result.ok === false ? Result.outcome : "unreachable", "foreign-root");
		assert.equal(Result.ok === false ? Result.detail : "", `${Escaped} is outside ${Root}`);
		assert.equal(Fs_.Of("writeText").length, 0, "no write is attempted at all");
	});

	await CheckAsync(Count, "W7: the root fence refuses the archive root", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Content = Body("alpha");
		const Result = await Write({
			operation: {
				kind: "support",
				skill: "alpha",
				filePath: "references/topic.md",
				newString: "a note\n",
				reason: "r",
			},
			carried: Content,
			corpus: CorpusView(Configuration_, {
				bodies: { alpha: Content },
				carried: { alpha: Content },
				resolved: { alpha: Archived("alpha") },
			}),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, false, "the write is refused");
		assert.equal(Result.ok === false ? Result.outcome : "unreachable", "foreign-root");
		assert.equal(
			Result.ok === false ? Result.detail : "",
			`${Path.join(ArchiveRoot, "alpha", "references/topic.md")} is inside the archive`,
		);
		assert.equal(Fs_.Of("writeText").length, 0, "the archive is never a write target");
	});

	await CheckAsync(Count, "W8: a support file stays inside its skill, and an escape is refused", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Content = Body("alpha");
		Seed(Fs_, "alpha", Content);
		const Corpus_ = CorpusView(Configuration_, { bodies: { alpha: Content }, carried: { alpha: Content } });
		const Good = await Write({
			operation: {
				kind: "support",
				skill: "alpha",
				filePath: "references/topic.md",
				newString: "# topic\n",
				reason: "r",
			},
			carried: Content,
			corpus: Corpus_,
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Good.ok, true, "a new support file lands");
		assert.equal(Fs_.Of("writeText")[0]?.intent, "createIfAbsent", "a new file is created, never overwritten");
		assert.equal(
			Fs_.Text(Path.join(Root, "alpha", "references", "topic.md")),
			"# topic\n",
			"inside its own skill directory",
		);
		const Escaped = await Write({
			operation: {
				kind: "support",
				skill: "alpha",
				filePath: "../other/SKILL.md",
				newString: "x\n",
				reason: "r",
			},
			carried: Content,
			corpus: Corpus_,
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Escaped.ok, false, "a support path may not leave its skill");
		assert.equal(Escaped.ok === false ? Escaped.outcome : "unreachable", "foreign-root");
		assert.equal(
			Escaped.ok === false ? Escaped.detail : "",
			`${Path.join(Root, "other", "SKILL.md")} is outside ${Path.join(Root, "alpha")}`,
		);
	});

	await CheckAsync(Count, "W9: a body that drifted is refused before any call", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Content = Body("alpha", "step one");
		Seed(Fs_, "alpha", Content);
		const Result = await Write({
			operation: { kind: "patch", skill: "alpha", oldString: "step one", newString: "step two", reason: "r" },
			carried: Body("alpha", "a different body"),
			corpus: CorpusView(Configuration_, { bodies: { alpha: Content }, carried: { alpha: Body("alpha", "a different body") } }),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, false, "the patch is refused");
		assert.equal(Result.ok === false ? Result.outcome : "unreachable", "body-carried");
		assert.equal(Result.ok === false ? Result.detail : "", "body-drifted", "the clause names the drift");
		assert.equal(Fs_.Of("editText").length, 0, "the write is never attempted");
		assert.equal(Fs_.Text(Live("alpha")), Content, "and the file still holds the body that moved");
	});

	await CheckAsync(Count, "W10: a patch whose body was never carried is `body-uncarried`", async () => {
		const Fs_ = FakeFs();
		const Configuration_ = Knobs();
		const Content = Body("alpha", "step one");
		Seed(Fs_, "alpha", Content);
		const Result = await Write({
			operation: { kind: "patch", skill: "alpha", oldString: "step one", newString: "step two", reason: "r" },
			carried: null,
			corpus: CorpusView(Configuration_, { bodies: { alpha: Content } }),
			seam: Fs_,
			configuration: Configuration_,
		});
		assert.equal(Result.ok, false, "the patch is refused");
		assert.equal(Result.ok === false ? Result.outcome : "unreachable", "body-carried");
		assert.equal(Result.ok === false ? Result.detail : "", "body-uncarried");
		assert.equal(Fs_.Of("editText").length, 0, "nothing is attempted");
	});

	await CheckAsync(Count, "W11: the ledger row's manifests are deltas", async () => {
		const Configuration_ = Knobs({ ...State("w11") });
		const Live_ = Live("alpha");
		const Sibling = Path.join(Root, "alpha", "references", "topic.md");
		const Appended = await Append(
			{
				actor: "agent",
				action: "patch",
				skill: "alpha",
				evidence: { session: "session-1", reason: "r", rule: "body-carried" },
				before: [
					{ path: Live_, text: "before text" },
					{ path: Sibling, text: "same text" },
				],
				after: [
					{ path: Live_, text: "after text" },
					{ path: Sibling, text: "same text" },
				],
			},
			Configuration_,
		);
		assert.match(Appended.id, /^[0-9a-f]{12}$/, "twelve hex characters name the row");
		const Rows_ = await Rows(Configuration_);
		assert.equal(Rows_.length, 1, "one row");
		const Row = Rows_[0];
		assert.equal(Row?.before.length, 1, "the unchanged sibling is dropped");
		assert.equal(Row?.after.length, 1, "on both sides");
		assert.equal(Row?.before[0]?.path, Live_, "the changed path survives");
		assert.equal(Row?.after[0]?.path, Live_);
		assert.notEqual(Row?.before[0]?.sha256, Row?.after[0]?.sha256, "with both content addresses");
		const Created = await Append(
			{
				actor: "agent",
				action: "create",
				skill: "beta",
				evidence: { session: "session-1", reason: "r", rule: "" },
				before: [{ path: Live("beta"), text: null }],
				after: [{ path: Live("beta"), text: "new text" }],
			},
			Configuration_,
		);
		assert.match(Created.id, /^[0-9a-f]{12}$/);
		const Later = await Rows(Configuration_);
		assert.equal(Later.length, 2, "two rows, oldest first");
		assert.equal(Later[1]?.before.length, 0, "a creation has no before side");
		assert.equal(Later[1]?.after.length, 1, "and keeps the path it created");
	});

	await CheckAsync(Count, "W12: a revert restores the bytes a patch row captured", async () => {
		const Configuration_ = Knobs({ ...State("w12") });
		const Fs_ = FakeFs();
		const Live_ = Live("alpha");
		Fs_.Put(Live_, "before text");
		const Appended = await Append(
			{
				actor: "agent",
				action: "patch",
				skill: "alpha",
				evidence: { session: "session-1", reason: "r", rule: "body-carried" },
				before: [{ path: Live_, text: "before text" }],
				after: [{ path: Live_, text: "after text" }],
			},
			Configuration_,
		);
		Fs_.Put(Live_, "after text");
		const Result = await Revert(Appended.id, Fs_, Configuration_);
		assert.equal(Result.ok, true, "the revert landed");
		assert.equal(Result.outcome, "reverted");
		assert.equal(Result.restored, 1, "one file was put back");
		assert.equal(Result.retained, 0, "and nothing was retained");
		assert.equal(Fs_.Text(Live_), "before text", "the blob is the content, so the bytes are exact");
	});

	await CheckAsync(Count, "W13: a revert of a create archives the skill instead of removing it", async () => {
		const Configuration_ = Knobs({ ...State("w13") });
		const Fs_ = FakeFs();
		const Live_ = Live("made");
		const Content = Body("made");
		Fs_.Put(Live_, Content);
		const Appended = await Append(
			{
				actor: "agent",
				action: "create",
				skill: "made",
				evidence: { session: "session-1", reason: "r", rule: "" },
				before: [{ path: Live_, text: null }],
				after: [{ path: Live_, text: Content }],
			},
			Configuration_,
		);
		const Result = await Revert(Appended.id, Fs_, Configuration_);
		assert.equal(Result.ok, true, "the revert landed");
		assert.equal(Result.restored, 0, "a create has no before file to put back");
		assert.equal(Result.retained, 1, "so the bytes are archived instead");
		assert.equal(Fs_.Text(Archived("made")), Content, "the archive holds the original copy");
		const LiveText = Fs_.Text(Live_) ?? "";
		// The body this scenario creates is `Body("made")`, which ends at "# made"
		// and carries no step line. The archive path only ADDS the neutralization
		// line, so dropping that one line must give back the created bytes exactly:
		// a deleted live package yields "", and a truncated one fails here too.
		assert.equal(
			LiveText.split("\n")
				.filter((Line) => !Line.startsWith("disable-model-invocation:"))
				.join("\n"),
			Content,
			"the live package is never deleted: only the neutralization line differs",
		);
		assert.equal(
			LiveText.includes("disable-model-invocation: true"),
			true,
			"and it is neutralized in place, so the catalog stops offering it",
		);
	});

	await CheckAsync(Count, "W14: the replay gate - one run over a recorded transcript and corpus", async () => {
		const Configuration_ = Knobs({ ...State("w14") });
		const Fs_ = FakeFs();
		const Content = Body("loader-flag", "The loader reads the flag before the config file.");
		Seed(Fs_, "loader-flag", Content);
		const Skills = FakeSkills({
			rows: [{ name: "loader-flag", description: "how the loader reads flags" }],
			skills: { "loader-flag": Content },
		});
		const Agent = FakeAgent({
			messages: [
				Say("user", "add the flag to the loader"),
				Turn("done", ["read"]),
				Say("tool", "the file"),
				Say("user", "remember the loader reads it before config"),
			],
		});
		const Llm = FakeLlm("", {
			replies: [
				JSON.stringify({
					views: ["loader-flag"],
					operations: [
						{
							kind: "patch",
							skill: "loader-flag",
							oldString: "before the config file",
							newString: "before the config file is parsed",
							reason: "the order matters",
						},
					],
				}),
				JSON.stringify({
					operations: [
						{
							kind: "patch",
							skill: "loader-flag",
							oldString: "before the config file",
							newString: "before the config file is parsed",
							reason: "the order matters",
						},
					],
				}),
			],
		});
		const Route_ = { provider: "fake-provider", model: "fake-model" };
		const Signal = new AbortController().signal;
		const Derived = Transcript(Agent);
		const Digested = Digest(Derived.messages, {
			digestTail: 2,
			digestUserChars: 300,
			digestAssistantChars: 200,
		});
		const Index_ = await Catalog(Skills, {});
		const Planned = await Plan(Llm, {
			route: Route_,
			system: Prompt(1),
			digest: Digested.text,
			index: Index_,
			maxTokens: 4000,
			signal: Signal,
		});
		const Plan_ = Parse(Planned, 1, Configuration_.maxOperations);
		assert.equal(Plan_.ok, true, "the recorded plan reply parses");
		const Views: string[] = [];
		if (Plan_.ok && "views" in Plan_.reply) {
			for (const Name of Plan_.reply.views) Views.push(Name);
		}
		const Carried = new Map<string, string>();
		for (const Name of Views) {
			const Loaded = await Skills.get(Name);
			if (Loaded !== undefined) Carried.set(Name, Loaded.content);
		}
		const Confirmed = await Confirm(Llm, {
			route: Route_,
			system: Prompt(2),
			digest: Digested.text,
			index: Index_,
			views: [...Carried.entries()].map(([Name, Text_]) => ({ name: Name, body: Text_ })),
			maxTokens: 4000,
			signal: Signal,
		});
		const Final = Parse(Confirmed, 2, Configuration_.maxOperations);
		assert.equal(Final.ok, true, "the recorded final reply parses");
		const Operations = Final.ok ? Final.reply.operations : [];
		const Corpus_ = CorpusView(Configuration_, {
			bodies: { "loader-flag": Content },
			carried: { "loader-flag": Carried.get("loader-flag") ?? "" },
		});
		const Applied: string[] = [];
		const Refused: string[] = [];
		for (const Operation_ of Operations) {
			const Refusal = Judge(Operation_, Corpus_, Configuration_);
			if (Refusal !== null) {
				Refused.push(`${Refusal.rule}: ${Refusal.detail}`);
				continue;
			}
			const Fenced = await Write({
				operation: Operation_,
				carried: Carried.get(Operation_.skill) ?? null,
				corpus: Corpus_,
				seam: Fs_,
				configuration: Configuration_,
			});
			if (!Fenced.ok) {
				Refused.push(`${Fenced.outcome}: ${Fenced.detail}`);
				continue;
			}
			Applied.push(`${Operation_.kind} ${Operation_.skill}`);
			await Append(
				{
					actor: "agent",
					action: Operation_.kind,
					skill: Operation_.skill,
					evidence: { session: "session-1", reason: Operation_.reason, rule: "body-carried" },
					before: [{ path: Fenced.applied.path, text: Fenced.applied.before }],
					after: [{ path: Fenced.applied.path, text: Fenced.applied.after }],
				},
				Configuration_,
			);
		}
		console.log(
			`replay: messages=${Derived.messages.length} toolCalls=${Derived.toolCalls} digest kept=${Digested.kept} collapsed=${Digested.collapsed}`,
		);
		console.log(`replay: applied ${Applied.length} (${Refused.length} refused) ${Applied.join(", ")}`);
		assert.equal(Derived.messages.length, 4, "four recorded messages");
		assert.equal(Derived.toolCalls, 1, "one recorded tool call");
		assert.equal(Digested.kept, 3, "the tail grew past the tool result");
		assert.equal(Digested.collapsed, 1, "one older turn collapsed");
		assert.equal(Llm.Calls.length, 2, "two calls, no third");
		assert.deepEqual(Applied, ["patch loader-flag"], "the recorded operation landed");
		assert.deepEqual(Refused, [], "nothing was refused");
		assert.equal(
			Fs_.Text(Live("loader-flag")),
			Body("loader-flag", "The loader reads the flag before the config file is parsed."),
			"the corpus holds the applied text",
		);
		const Rows_ = await Rows(Configuration_);
		assert.equal(Rows_.length, 1, "one ledger row for one applied operation");
		assert.equal(Rows_[0]?.action, "patch");
	});

	return Finish(Count, "Write-And-Revert");
};

// Standalone entry: `node Target/Test/Write-And-Revert/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	await runTest();
}
