import assert from "node:assert/strict";
import * as Path from "node:path";

import Judge from "../../../Target/Function/Judge.js";
import Parse from "../../../Target/Function/Parse.js";
import type Configuration from "../../../Target/Interface/Configuration.js";
import type { Operation } from "../../../Target/Interface/Operation.js";
import type { ConfirmReply, ParseResult, PlanReply } from "../../../Target/Interface/Reply.js";
import type { CorpusSeed } from "../Harness.js";
import { Check, CorpusView, Finish, Home, Knobs, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * The gate: the strict reply parse and the sixteen deterministic rules between a
 * reply and the corpus.
 *
 * @remarks
 *
 * The parse decides whether a reply IS an operation list; the judge decides
 * whether one operation may land. Both are pure, both are asserted per rule, and
 * every refusal string is asserted BYTE FOR BYTE because it is what the ledger
 * and the report carry (`Source/Function/Judge.ts:183-304`,
 * `Source/Function/Parse.ts:182-291`). A rule with no test is a rule the next
 * refactor deletes.
 *
 * The parse is strict on purpose: prose around the object, a second fenced
 * block, a non-json fence, a coerced number and a fourth operation kind are all
 * FAILURES rather than silently empty replies, because an empty operation list
 * and a broken reply look identical to the lifecycle.
 *
 * ONE BOUNDARY IS DELIBERATE: a blank `oldString` or `newString` is not a parse
 * failure. The judge's `anchor-changed` owns it, so a blank anchor ends the run
 * as `refused` rather than `unparsable` - the model's evidence is blamed, not
 * its syntax.
 */
/**
 * A SKILL.md body with matching frontmatter.
 */
const Body = (Name: string, Extra = ""): string =>
	`---\nname: ${Name}\ndescription: what it does\n---\n\n# ${Name}\n\n${Extra}`;

/**
 * One parse result's id and detail, or `ok`.
 */
const Failure = (Result: ParseResult<PlanReply | ConfirmReply>): { readonly id: string; readonly detail: string } => {
	if (!Result.ok) return { id: Result.id, detail: Result.detail };
	return { id: "ok", detail: "" };
};

/**
 * The first operation a parse produced, or undefined when the parse refused.
 */
const First = (Result: ParseResult<PlanReply | ConfirmReply>): Operation | undefined => {
	if (!Result.ok) return undefined;
	return Result.reply.operations[0];
};

/**
 * The views a phase-1 reply carries, or none for the phase-2 shape.
 */
const Views = (Result: ParseResult<PlanReply | ConfirmReply>): readonly string[] => {
	if (!Result.ok) return [];
	if (!("views" in Result.reply)) return [];
	return Result.reply.views;
};

/**
 * One judge verdict's rule and detail, or `accepted`.
 */
const Verdict = (
	Operation_: Operation,
	Configuration_: Configuration,
	Seed: CorpusSeed = {},
): { readonly rule: string; readonly detail: string } => {
	const Answer = Judge(Operation_, CorpusView(Configuration_, Seed), Configuration_);
	if (Answer !== null) return { rule: Answer.rule, detail: Answer.detail };
	return { rule: "accepted", detail: "" };
};

/**
 * An operation built from data: the one rule that exists for a caller that skipped the parse.
 */
const Data = (Text: string): Operation => JSON.parse(Text);

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Configuration_ = Knobs();

	Check(Count, "P1: `empty` - a reply that is blank after trimming", () => {
		const Result = Failure(Parse("   \n\t ", 1, 8));
		assert.equal(Result.id, "empty");
		assert.equal(Result.detail, "the reply is blank after trimming");
	});

	Check(Count, "P2: `fence` - prose, a trailing note, or a non-json fence", () => {
		const Prose = Failure(Parse('Here is the plan:\n{"views":[],"operations":[]}', 1, 8));
		assert.equal(Prose.id, "fence");
		assert.equal(Prose.detail, "the reply is neither a bare object nor exactly one json fence");
		const Yaml = Failure(Parse('```yaml\n{"views":[],"operations":[]}\n```', 1, 8));
		assert.equal(Yaml.id, "fence");
		assert.equal(Yaml.detail, "the reply is neither a bare object nor exactly one json fence");
		const Trailing = Failure(Parse('```json\n{"views":[],"operations":[]}\n```\nDone.', 1, 8));
		assert.equal(Trailing.id, "fence");
	});

	Check(Count, "P3: `json` - JSON.parse threw", () => {
		const Result = Failure(Parse('{"views":[],"operations":[}', 1, 8));
		assert.equal(Result.id, "json");
		assert.equal(Result.detail.startsWith("JSON.parse failed: "), true);
	});

	Check(Count, "P4: `shape` - not an object, or no operations array", () => {
		// The value must reach JSON.parse through one of the two accepted forms,
		// and a bare non-object is not one of them: the plan accepts a bare
		// object and one json fence, and "everything else is `fence`". So the
		// array is fenced, and the parse that succeeds is what reaches `shape`.
		const Listed = Failure(Parse("```json\n[]\n```", 1, 8));
		assert.equal(Listed.id, "shape");
		assert.equal(Listed.detail, "the reply is not a json object");
		const Missing = Failure(Parse('{"views":[],"operations":"none"}', 1, 8));
		assert.equal(Missing.id, "shape");
		assert.equal(Missing.detail, '"operations" is not an array');
	});

	Check(Count, "P5: `unknown-key` - a top-level key the phase does not allow", () => {
		const Extra = Failure(Parse('{"views":[],"operations":[],"note":"x"}', 1, 8));
		assert.equal(Extra.id, "unknown-key");
		assert.equal(Extra.detail, 'unknown top-level key "note"');
		const Second = Failure(Parse('{"views":[],"operations":[]}', 2, 8));
		assert.equal(Second.id, "unknown-key");
		assert.equal(Second.detail, 'unknown top-level key "views"');
	});

	Check(Count, "P6: `field` - a missing, non-string or blank required field", () => {
		const Missing = Failure(
			Parse('{"views":[],"operations":[{"kind":"create","content":"x","reason":"r"}]}', 1, 8),
		);
		assert.equal(Missing.id, "field");
		assert.equal(Missing.detail, 'operation 1 field "skill" is missing');
		const Blank = Failure(
			Parse('{"views":[],"operations":[{"kind":"create","skill":"  ","content":"x","reason":"r"}]}', 1, 8),
		);
		assert.equal(Blank.id, "field");
		assert.equal(Blank.detail, 'operation 1 field "skill" is blank');
		const NoViews = Failure(Parse('{"operations":[]}', 1, 8));
		assert.equal(NoViews.id, "field");
		assert.equal(NoViews.detail, '"views" is missing');
		const NotString = Failure(Parse('{"views":[1],"operations":[]}', 1, 8));
		assert.equal(NotString.id, "field");
		assert.equal(NotString.detail, "a views entry is not a string");
	});

	Check(Count, "P7: `kind` - a fourth operation kind", () => {
		const Result = Failure(
			Parse('{"views":[],"operations":[{"kind":"delete","skill":"alpha","reason":"r"}]}', 1, 8),
		);
		assert.equal(Result.id, "kind");
		assert.equal(Result.detail, 'kind "delete" is not one of patch, create, support');
	});

	Check(Count, "P8: `count` - more operations than the bound", () => {
		const Nine = JSON.stringify({
			views: [],
			operations: Array.from({ length: 9 }, () => ({
				kind: "create",
				skill: "alpha",
				content: "x",
				reason: "r",
			})),
		});
		const Result = Failure(Parse(Nine, 1, 8));
		assert.equal(Result.id, "count");
		assert.equal(Result.detail, "9 operations exceed the bound of 8");
		const Lower = Failure(Parse(Nine, 1, 2));
		assert.equal(Lower.id, "count");
		assert.equal(Lower.detail, "9 operations exceed the bound of 2");
	});

	Check(Count, "P9: `name` - a skill or a views entry that is not kebab-case", () => {
		const Skill = Failure(
			Parse('{"views":[],"operations":[{"kind":"create","skill":"Bad_Name","content":"x","reason":"r"}]}', 1, 8),
		);
		assert.equal(Skill.id, "name");
		assert.equal(Skill.detail, '"Bad_Name" is not a kebab-case skill name');
		const View = Failure(Parse('{"views":["Bad_Name"],"operations":[]}', 1, 8));
		assert.equal(View.id, "name");
		assert.equal(View.detail, '"Bad_Name" is not a kebab-case skill name');
	});

	Check(Count, "P10: a bare object and one json fence are both accepted, in both phases", () => {
		const Bare = Parse(
			'{"views":["alpha"],"operations":[{"kind":"create","skill":"alpha","content":"x","reason":"r"}]}',
			1,
			8,
		);
		assert.equal(Bare.ok, true, "a bare object is one of the two tolerances");
		assert.deepEqual(Views(Bare), ["alpha"], "phase 1 carries the views it named");
		const Created = First(Bare);
		assert.equal(Created?.kind, "create");
		assert.equal(Created?.kind === "create" ? Created.content : "unreachable", "x");
		const Fenced = Parse('```json\n{"views":[],"operations":[]}\n```', 1, 8);
		assert.equal(Fenced.ok, true, "one json fence is the other tolerance");
		const Confirmed = Parse('{"operations":[]}', 2, 8);
		assert.equal(Confirmed.ok, true, "phase 2 parses the same three shapes");
		assert.deepEqual(Views(Confirmed), [], "and carries no views");
	});

	Check(Count, "P11: a blank anchor is not a parse failure - the judge owns it", () => {
		const Result = Parse(
			'{"views":[],"operations":[{"kind":"patch","skill":"alpha","oldString":"","newString":"  ","reason":"r"}]}',
			1,
			8,
		);
		assert.equal(Result.ok, true, "the parser requires a string, not a non-blank one");
		const Patched = First(Result);
		assert.equal(Patched?.kind, "patch");
		assert.equal(Patched?.kind === "patch" ? Patched.oldString : "unreachable", "");
		assert.equal(Patched?.kind === "patch" ? Patched.newString : "unreachable", "  ");
	});

	Check(Count, "J1: `operation-known` refuses a fourth kind", () => {
		const Result = Verdict(Data('{"kind":"delete","skill":"alpha","reason":"r"}'), Configuration_);
		assert.equal(Result.rule, "operation-known");
		assert.equal(Result.detail, "operation kind 'delete' is not one of patch, create, support");
	});

	Check(Count, "J2: `name-grammar` refuses a bad name and a 65-character one", () => {
		const Bad = Verdict(
			{ kind: "create", skill: "Bad_Name", content: Body("Bad_Name"), reason: "r" },
			Configuration_,
		);
		assert.equal(Bad.rule, "name-grammar");
		assert.equal(Bad.detail, "skill name 'Bad_Name' does not match the corpus grammar");
		const Long = "a".repeat(65);
		const Ceiling = Verdict(
			{ kind: "create", skill: Long, content: Body(Long), reason: "r" },
			Configuration_,
		);
		assert.equal(Ceiling.rule, "name-grammar", "the naming law's 64-character ceiling");
		assert.equal(Ceiling.detail, `skill name '${Long}' does not match the corpus grammar`);
	});

	Check(Count, "J3: `target-absent` and `target-present`", () => {
		const Existing = Verdict(
			{ kind: "create", skill: "taken", content: Body("taken"), reason: "r" },
			Configuration_,
			{ bodies: { taken: Body("taken") } },
		);
		assert.equal(Existing.rule, "target-absent");
		assert.equal(Existing.detail, "skill 'taken' already exists; create refuses an existing path");
		const Missing = Verdict(
			{ kind: "patch", skill: "absent", oldString: "x", newString: "y", reason: "r" },
			Configuration_,
		);
		assert.equal(Missing.rule, "target-present");
		assert.equal(Missing.detail, "skill 'absent' is not in the catalog; patch needs an existing skill");
	});

	Check(Count, "J4: `body-carried` refuses a patch whose body was never shown", () => {
		const Result = Verdict(
			{ kind: "patch", skill: "alpha", oldString: "step one", newString: "step two", reason: "r" },
			Configuration_,
			{ bodies: { alpha: Body("alpha", "step one") } },
		);
		assert.equal(Result.rule, "body-carried");
		assert.equal(Result.detail, "skill 'alpha' was not loaded in the confirm prompt; read before write");
	});

	Check(Count, "J5: `anchor-unique` refuses zero and two occurrences", () => {
		const Seed: CorpusSeed = {
			bodies: { alpha: Body("alpha", "step one and step one") },
			carried: { alpha: Body("alpha", "step one and step one") },
		};
		const Twice = Verdict(
			{ kind: "patch", skill: "alpha", oldString: "step one", newString: "step two", reason: "r" },
			Configuration_,
			Seed,
		);
		assert.equal(Twice.rule, "anchor-unique");
		assert.equal(Twice.detail, "oldString occurs 2 times in 'alpha'; the anchor must be unique");
		const Never = Verdict(
			{ kind: "patch", skill: "alpha", oldString: "absent anchor", newString: "step two", reason: "r" },
			Configuration_,
			Seed,
		);
		assert.equal(Never.rule, "anchor-unique");
		assert.equal(Never.detail, "oldString occurs 0 times in 'alpha'; the anchor must be unique");
	});

	Check(Count, "J6: `anchor-changed` refuses a blank or identical anchor", () => {
		const Seed: CorpusSeed = {
			bodies: { alpha: Body("alpha", "step one") },
			carried: { alpha: Body("alpha", "step one") },
		};
		const Blank = Verdict(
			{ kind: "patch", skill: "alpha", oldString: "", newString: "step two", reason: "r" },
			Configuration_,
			Seed,
		);
		assert.equal(Blank.rule, "anchor-changed");
		assert.equal(Blank.detail, "oldString and newString are identical or blank");
		const Same = Verdict(
			{ kind: "patch", skill: "alpha", oldString: "step one", newString: "step one", reason: "r" },
			Configuration_,
			Seed,
		);
		assert.equal(Same.rule, "anchor-changed");
		const Empty = Verdict(
			{ kind: "patch", skill: "alpha", oldString: "step one", newString: "   ", reason: "r" },
			Configuration_,
			Seed,
		);
		assert.equal(Empty.rule, "anchor-changed");
	});

	Check(Count, "J7: `frontmatter-valid` and `description-present` against a real file shape", () => {
		const Good = Verdict(
			{ kind: "create", skill: "good", content: Body("good", "a step"), reason: "r" },
			Configuration_,
		);
		assert.equal(Good.rule, "accepted", "a real skill file passes");
		const NoFence = Verdict(
			{ kind: "create", skill: "bare", content: "# bare\n\na step\n", reason: "r" },
			Configuration_,
		);
		assert.equal(NoFence.rule, "frontmatter-valid");
		assert.equal(NoFence.detail, "the result would not parse as a skill file: no frontmatter fence");
		const NoBody = Verdict(
			{
				kind: "create",
				skill: "hollow",
				content: "---\nname: hollow\ndescription: what it does\n---\n",
				reason: "r",
			},
			Configuration_,
		);
		assert.equal(NoBody.rule, "frontmatter-valid");
		assert.equal(NoBody.detail, "the result would not parse as a skill file: no body");
		const WrongName = Verdict(
			{ kind: "create", skill: "good", content: Body("other", "a step"), reason: "r" },
			Configuration_,
		);
		assert.equal(WrongName.rule, "frontmatter-valid");
		assert.equal(WrongName.detail, "the result would not parse as a skill file: the frontmatter name is not 'good'");
		const Legacy = Verdict(
			{
				kind: "create",
				skill: "legacy",
				content: "---\nname: legacy\ndescription: d\ndisableModelInvocation: true\n---\n\n# legacy\n",
				reason: "r",
			},
			Configuration_,
		);
		assert.equal(Legacy.rule, "frontmatter-valid");
		assert.equal(Legacy.detail, "the result would not parse as a skill file: a legacy camelCase frontmatter key");
		const Quiet = Verdict(
			{
				kind: "create",
				skill: "quiet",
				content: "---\nname: quiet\ndescription:\n---\n\n# quiet\n",
				reason: "r",
			},
			Configuration_,
		);
		assert.equal(Quiet.rule, "description-present");
		assert.equal(Quiet.detail, "the frontmatter description is empty");
	});

	Check(Count, "J8: `support-path` refuses a path outside the three roots", () => {
		const Seed: CorpusSeed = {
			bodies: { alpha: Body("alpha") },
			carried: { alpha: Body("alpha") },
		};
		const Result = Verdict(
			{ kind: "support", skill: "alpha", filePath: "notes/x.md", newString: "x\n", reason: "r" },
			Configuration_,
			Seed,
		);
		assert.equal(Result.rule, "support-path");
		assert.equal(Result.detail, "support path 'notes/x.md' is not a support file");
		const Good = Verdict(
			{
				kind: "support",
				skill: "alpha",
				filePath: "references/topic.md",
				newString: "a note\n",
				reason: "r",
			},
			Configuration_,
			Seed,
		);
		assert.equal(Good.rule, "accepted", "a real support path passes every rule");
	});

	Check(Count, "J9: `never-agreement` and `never-archive` refuse the two protected paths", () => {
		const Seed: CorpusSeed = {
			bodies: { alpha: Body("alpha", "step one") },
			carried: { alpha: Body("alpha", "step one") },
		};
		const Agreement = Path.join(Home, ".dsh", "AGENTS.md");
		const Refused = Verdict(
			{ kind: "patch", skill: "alpha", oldString: "step one", newString: "step two", reason: "r" },
			Configuration_,
			{ ...Seed, resolved: { alpha: Agreement } },
		);
		assert.equal(Refused.rule, "never-agreement");
		assert.equal(Refused.detail, "the target is the working agreement; it is never written");
		const Archived = Path.join(Home, ".dsh", "skills", ".archive", "alpha", "SKILL.md");
		const Inside = Verdict(
			{ kind: "patch", skill: "alpha", oldString: "step one", newString: "step two", reason: "r" },
			Configuration_,
			{ ...Seed, resolved: { alpha: Archived } },
		);
		assert.equal(Inside.rule, "never-archive");
		assert.equal(Inside.detail, "the target is inside the archive; it is never written");
	});

	Check(Count, "J10: `narrative-free`, `negative-claim` and `duplicate-rule`", () => {
		const Seed: CorpusSeed = {
			bodies: { alpha: Body("alpha", "step one\nalways run the type check") },
			carried: { alpha: Body("alpha", "step one\nalways run the type check") },
		};
		const Dated = Verdict(
			{
				kind: "patch",
				skill: "alpha",
				oldString: "step one",
				newString: "Run it on 2026-11-02 before the build.",
				reason: "r",
			},
			Configuration_,
			Seed,
		);
		assert.equal(Dated.rule, "narrative-free");
		assert.equal(Dated.detail, "the text carries a date, a reference number, or quoted user text");
		const Numbered = Verdict(
			{
				kind: "patch",
				skill: "alpha",
				oldString: "step one",
				newString: "See #42 for the change.",
				reason: "r",
			},
			Configuration_,
			Seed,
		);
		assert.equal(Numbered.rule, "narrative-free");
		const Quoted = Verdict(
			{
				kind: "patch",
				skill: "alpha",
				oldString: "step one",
				newString: `The user said "${"x".repeat(45)}" about it.`,
				reason: "r",
			},
			Configuration_,
			Seed,
		);
		assert.equal(Quoted.rule, "narrative-free");
		const Broken = Verdict(
			{
				kind: "patch",
				skill: "alpha",
				oldString: "step one",
				newString: "The formatter is broken.",
				reason: "r",
			},
			Configuration_,
			Seed,
		);
		assert.equal(Broken.rule, "negative-claim");
		assert.equal(Broken.detail, "the text asserts a tool is broken without the fix that makes it work");
		const Fixed = Verdict(
			{
				kind: "patch",
				skill: "alpha",
				oldString: "step one",
				newString: "The formatter is broken until `npm install` runs in the root.",
				reason: "r",
			},
			Configuration_,
			Seed,
		);
		assert.equal(Fixed.rule, "accepted", "the fix makes it a rule rather than a standing refusal");
		const Repeated = Verdict(
			{
				kind: "patch",
				skill: "alpha",
				oldString: "step one",
				newString: "always run the type check",
				reason: "r",
			},
			Configuration_,
			Seed,
		);
		assert.equal(Repeated.rule, "duplicate-rule");
		assert.equal(Repeated.detail, "the text repeats a line already present in 'alpha'");
	});

	Check(Count, "J11: `size-bound` refuses a result past `maxSkillChars`", () => {
		const Small = Knobs({ maxSkillChars: 40 });
		const Content = Body("big", "a line that makes the file longer than forty characters");
		const Result = Verdict({ kind: "create", skill: "big", content: Content, reason: "r" }, Small);
		assert.equal(Result.rule, "size-bound");
		assert.equal(Result.detail, `the result is ${Content.length} characters; the bound is 40`);
	});

	return Finish(Count, "Parse-And-Judge");
};

// Standalone entry: `node Target/Test/Parse-And-Judge/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	await runTest();
}
