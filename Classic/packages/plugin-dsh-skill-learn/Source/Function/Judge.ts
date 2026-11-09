/**
 * @module Judge
 *
 * The sixteen deterministic rules between the model's reply and the corpus, one id
 * each, first refusal wins.
 *
 * @remarks
 * WHY A JUDGE AT ALL. Every rule here is a content rule the prompt states in prose
 * (SKILL-LEARN-PLUGIN.md:305-379) and that prose alone cannot enforce: a model that
 * ignores an instruction still produces a plausible artifact, and a plausible artifact
 * in the corpus is worse than no artifact. Each rule is a shape the corpus must never
 * contain, expressed as a test.
 *
 * THE ORDER IS SECTION 6.2's GUARD PRECEDENCE, not the table order of 4.5
 * (SKILL-LEARN-PLUGIN.md:427-445): the path rules (J11, J12, J10) run before the body
 * rules, because a write to the agreement or into the archive must be refused before
 * the judge spends a read on an anchor, and the content rules (J13-J15) run before the
 * result rules (J8, J9, J16) because the result is computed from text that has already
 * passed them. The ids and the strings are section 4.5's, byte for byte
 * (SKILL-LEARN-PLUGIN.md:267-284).
 *
 * WHAT THE JUDGE DOES NOT DO: it never repairs an operation into acceptability. A
 * refused operation is reported, not edited, and the first refusal is the only error
 * the model and the ledger see.
 *
 * The judge is SYNCHRONOUS on purpose. Its whole input is the read-only Corpus view,
 * so a rule that could wait would be a rule whose refusal can arrive after the write
 * it was meant to stop (Interface/Corpus.ts:1-13).
 */
import Path from "node:path";

import { Expand, Locate } from "@Function/Write.js";
import type Configuration from "@Interface/Configuration.js";
import type { Corpus } from "@Interface/Corpus.js";
import type { Operation } from "@Interface/Operation.js";
import type { ReviewRefusal, ReviewRule } from "@Interface/Review.js";

/** The corpus grammar: lowercase letters, digits, single hyphens (dsh-skill/lib/index.js:17). */
const Grammar = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The three roots a support file may live under (SKILL-LEARN-PLUGIN.md:278). */
const Roots: readonly string[] = ["references", "templates", "scripts"];

/** The 64-character ceiling the naming law states (SKILL-LEARN-PLUGIN.md:270). */
const Ceiling = 64;

/** The two legacy camelCase twins of the accepted kebab keys; the loader throws on them (DESIGN-BRIEF.md:60). */
const Legacy = /^(?:disableModelInvocation|userInvocable):/m;

/**
 * A date or a reference number: the incident narration a rule must stand without
 * (SKILL-LEARN-PLUGIN.md:281). Only the three classes the plan names are matched
 * - a date, a PR or issue number, and a quoted user sentence - because a wider
 * arm would refuse a charset name such as SHA-256 as a ticket id.
 */
const Reference =
	/(?:\b(?:19|20)\d{2}-\d{2}-\d{2}\b)|(?:\b(?:0?[1-9]|1[0-2])\/(?:0?[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}\b)|(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+(?:19|20)\d{2}\b)|(?:#\d+)|(?:\b(?:PR|Issue|pr|issue)\s*-?\s*#?\d+\b)/;

/** A quoted span longer than 40 characters: a user's sentence pasted in as content. */
const Quoted = /"[^"\n]{41,}"|'[^'\n]{41,}'/;

/** A negative claim about a tool or a feature (SKILL-LEARN-PLUGIN.md:282). */
const Negative =
	/\b(?:does not work|doesn't work|is broken|are broken|not supported|cannot be used|no longer works|fails to work)\b/i;

/** The fix that turns a negative claim into a rule instead of a standing refusal. */
const Fix =
	/\b(?:install|npm i|pnpm add|yarn add|bun add|export|environment variable|config(?:ure|uration)?|set the|enable|restart|update to|upgrade|use instead|workaround|add the)\b/i;

/** The frontmatter block of a file, or null when it carries no `---` fence. */
const Head = (Text: string): string | null => {
	switch (true) {
		case !Text.startsWith("---"):
			return null;
		default:
			break;
	}
	const End = Text.indexOf("\n---", 3);
	switch (true) {
		case End < 0:
			return null;
		default:
			return Text.slice(0, End);
	}
};

/** Why the result would not load as a skill file, or null when it would (DESIGN-BRIEF.md:56-62). */
const Parseable = (Result: string, Name: string): string | null => {
	const Block = Head(Result);
	// The fence is what every check below reads, so its absence is a refusal here
	// rather than a null that the switch would have to carry.
	if (Block === null) {
		return "no frontmatter fence";
	}
	switch (true) {
		case Legacy.test(Block):
			return "a legacy camelCase frontmatter key";
		case !new RegExp(`^name:\\s*${Name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(
			Block,
		):
			return `the frontmatter name is not '${Name}'`;
		case Result.slice(Block.length + 4).trim() === "":
			return "no body";
		default:
			return null;
	}
};

/** Whether the frontmatter carries a non-empty description. */
const Described = (Block: string): boolean => {
	const Value = /^description:\s*(.*)$/m.exec(Block);
	switch (true) {
		case Value === null:
			return false;
		default:
			return (Value[1] ?? "").trim().replace(/^["']|["']$/g, "") !== "";
	}
};

/** The non-blank lines of a text, trimmed, which is what the duplicate rule compares. */
const Lines = (Text: string): readonly string[] =>
	Text.split(/\r?\n/)
		.map((Line) => Line.trim())
		.filter((Line) => Line !== "");

/** Whether any non-blank line of the added text already occurs verbatim in the target. */
const Repeats = (Added: string, Existing: string): boolean => {
	const Seen = new Set(Lines(Existing));
	for (const Line of Lines(Added)) {
		switch (true) {
			case Seen.has(Line):
				return true;
			default:
				break;
		}
	}
	return false;
};

/** How many times the anchor occurs in the body. */
const Occurrences = (Body: string, Anchor: string): number => {
	switch (true) {
		case Anchor === "":
			return 0;
		default:
			return Body.split(Anchor).length - 1;
	}
};

/** Whether a support path is under one of the three roots and cannot leave the skill. */
const Support = (FilePath: string): boolean => {
	const Parts = FilePath.split("/");
	switch (true) {
		case Parts.length < 2:
			return false;
		case !Roots.includes(Parts[0] ?? ""):
			return false;
		case FilePath.includes("\\"):
			return false;
		case Parts.some((Part) => Part === "" || Part === "." || Part === ".."):
			return false;
		default:
			return true;
	}
};

/** One refusal, with the operation that earned it. */
const Refuse = (Rule: ReviewRule, Detail: string, Operation_: Operation): ReviewRefusal => ({
	operation: Operation_,
	rule: Rule,
	detail: Detail,
});

export default (
	Operation_: Operation,
	Corpus_: Corpus,
	Configuration_: Configuration,
): ReviewRefusal | null => {
	// The kind is read as a string so a caller that skipped the parse cannot slip a
	// fourth kind past the first rule.
	const Kind: string = Operation_.kind;
	const Name = Operation_.skill;
	// The three per-kind fields, read once, so no rule has to cast the union.
	const SupportPath = Operation_.kind === "support" ? Operation_.filePath : "";
	const Old = Operation_.kind === "patch" ? Operation_.oldString : "";
	const Added =
		Operation_.kind === "patch" || Operation_.kind === "support"
			? Operation_.newString
			: Operation_.content;
	switch (true) {
		case Kind !== "patch" && Kind !== "create" && Kind !== "support":
			return Refuse(
				"operation-known",
				`operation kind '${Kind}' is not one of patch, create, support`,
				Operation_,
			);
		case !Grammar.test(Name) || Name.length > Ceiling:
			return Refuse(
				"name-grammar",
				`skill name '${Name}' does not match the corpus grammar`,
				Operation_,
			);
		default:
			break;
	}
	// The path is computed only after the kind and the name are known good, so a
	// malformed operation cannot reach a path expression at all.
	const Located = Locate(Operation_, Corpus_, Configuration_);
	const Resolved = Corpus_.resolve(Name);
	const Body = Resolved === null ? null : Corpus_.body(Name);
	const Existing = Operation_.kind === "support" ? Corpus_.support(Name, SupportPath) : null;
	switch (true) {
		case Kind === "create" && Resolved !== null:
			return Refuse(
				"target-absent",
				`skill '${Name}' already exists; create refuses an existing path`,
				Operation_,
			);
		case Kind !== "create" && Resolved === null:
			return Refuse(
				"target-present",
				`skill '${Name}' is not in the catalog; patch needs an existing skill`,
				Operation_,
			);
		case Path.resolve(Located.path) === Path.resolve(Expand(Configuration_.agreementPath)):
			return Refuse(
				"never-agreement",
				"the target is the working agreement; it is never written",
				Operation_,
			);
		case Corpus_.contains(Expand(Configuration_.archiveRoot), Located.path):
			return Refuse(
				"never-archive",
				"the target is inside the archive; it is never written",
				Operation_,
			);
		case Kind === "support" && !Support(SupportPath):
			return Refuse(
				"support-path",
				`support path '${SupportPath}' is not a support file`,
				Operation_,
			);
		case Kind !== "create" && Corpus_.carried(Name) === null:
			return Refuse(
				"body-carried",
				`skill '${Name}' was not loaded in the confirm prompt; read before write`,
				Operation_,
			);
		default:
			break;
	}
	const Count = Body === null ? 0 : Occurrences(Body, Old);
	switch (true) {
		case Kind === "patch" && Old !== "" && Count !== 1:
			return Refuse(
				"anchor-unique",
				`oldString occurs ${Count} times in '${Name}'; the anchor must be unique`,
				Operation_,
			);
		case Kind === "patch" && (Old.trim() === "" || Added.trim() === "" || Old === Added):
			return Refuse(
				"anchor-changed",
				"oldString and newString are identical or blank",
				Operation_,
			);
		case Reference.test(Added) || Quoted.test(Added):
			return Refuse(
				"narrative-free",
				"the text carries a date, a reference number, or quoted user text",
				Operation_,
			);
		case Negative.test(Added) && !Fix.test(Added):
			return Refuse(
				"negative-claim",
				"the text asserts a tool is broken without the fix that makes it work",
				Operation_,
			);
		default:
			break;
	}
	// The duplicate rule compares against everything the file will still say: for a
	// patch that is the body with the anchor removed, for a support write the file
	// as it stands, and for a create there is nothing to repeat.
	const Remaining =
		Kind === "patch"
			? Body === null
				? null
				: Body.split(Old).join("")
			: Kind === "support"
				? Existing
				: null;
	switch (true) {
		case Remaining !== null && Repeats(Added, Remaining):
			return Refuse(
				"duplicate-rule",
				`the text repeats a line already present in '${Name}'`,
				Operation_,
			);
		default:
			break;
	}
	const Result =
		Kind === "support"
			? Added
			: Kind === "create"
				? Added
				: Body === null
					? null
					: Body.replace(Old, Added);
	const Block = Result === null ? null : Head(Result);
	const Reason = Result === null ? null : Parseable(Result, Name);
	const Length = Result === null ? 0 : Result.length;
	switch (true) {
		case Kind !== "support" && Reason !== null:
			return Refuse(
				"frontmatter-valid",
				`the result would not parse as a skill file: ${Reason ?? ""}`,
				Operation_,
			);
		case Kind !== "support" && Block !== null && !Described(Block):
			return Refuse(
				"description-present",
				"the frontmatter description is empty",
				Operation_,
			);
		case Length > Configuration_.maxSkillChars:
			return Refuse(
				"size-bound",
				`the result is ${Length} characters; the bound is ${Configuration_.maxSkillChars}`,
				Operation_,
			);
		default:
			return null;
	}
};
