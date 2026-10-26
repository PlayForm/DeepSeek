// Judge - the deterministic acceptance rules between the model's reply and the
// corpus. This module is the reason the review can run unattended: the model
// proposes, the judge disposes, and every refusal names the rule that refused
// it so the ledger and the report can say WHY.
//
// THE RULES ARE MECHANICAL ON PURPOSE. Every one of them is a rule the Hermes
// review states in prose (`_DO_NOT_CAPTURE_BLOCK`, the class-level naming rule,
// read-before-write) and that a prompt alone cannot enforce: a model that
// ignores an instruction produces a plausible artifact, and a plausible
// artifact in the corpus is worse than no artifact. Each rule below is a
// shape the corpus must never contain, expressed as a test.
//
// WHAT THE JUDGE DOES NOT DO: it never edits an operation into acceptability.
// A refused operation is reported, not repaired - a repaired write is a write
// nobody proposed.
import type { Corpus } from "@Interface/Corpus.js";
import type { Op, Proposal, Verdict } from "@Interface/Proposal.js";

/** The class-level name: kebab-case, starting with a letter. */
const Name = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** Session-artifact shapes: a year, an issue/PR number, a work-in-progress word. */
const Artifact = /((?:19|20)\d{2})|(#\d+)|^(?:fix|debug|audit|hotfix|temp|tmp|wip|test)(?:-|$)/;

/** The support-file path: one of the three kinds, one file deep. */
const Support =
	/^(?:references|templates|scripts)\/[a-z0-9][a-z0-9._-]*\.(?:md|ts|js|sh|json|ya?ml)$/;

/** Incident narration dressed as a rule. */
const Narrative = /(UPDATE:)|(\bthis session\b)|(^#{1,6}\s*\d{4}-\d{2}-\d{2})/im;

/** A negative claim about a tool or the environment. */
const Negative =
	/(does not work|is broken|not installed|command not found|is unavailable|no longer works)/i;

/** The FIX a negative claim must carry to be a rule instead of a constraint. */
const Fix =
	/(install|npm i |pnpm add|cargo install|export |environment variable|config(?:ure|uration)?\b)/i;

/** The frontmatter a SKILL.md body must carry, with this operation's name. */
const Frontmatter = (Body: string, OpName: string): boolean => {
	switch (true) {
		case !Body.startsWith("---"):
			return false;
		default:
			break;
	}
	const End = Body.indexOf("\n---", 3);
	switch (true) {
		case End < 0:
			return false;
		default:
			break;
	}
	const Head = Body.slice(0, End);
	return new RegExp(`^name:\\s*${OpName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(
		Head,
	);
};

/** One operation's verdict: `""` when accepted, else the rule id. */
const Rule = (Op: Op, Corpus: Corpus): string => {
	const Exists = Corpus.exists(Op.name);
	switch (true) {
		case !Name.test(Op.name):
			return "name-shape";
		case Artifact.test(Op.name):
			return "name-artifact";
		case Op.op === "create" && Exists:
			return "exists";
		case (Op.op === "patch" || Op.op === "support" || Op.op === "archive") && !Exists:
			return "missing";
		case Exists && Corpus.pinned(Op.name):
			return "pinned";
		default:
			break;
	}
	const Body = Op.body ?? "";
	switch (true) {
		case (Op.op === "create" || Op.op === "patch") && !Frontmatter(Body, Op.name):
			return "frontmatter";
		case Narrative.test(Body):
			return "narrative";
		case Negative.test(Body) && !Fix.test(Body):
			return "negative-claim";
		case Op.op === "support" && !Support.test(Op.file ?? ""):
			return "support-path";
		case Op.op === "archive" &&
			Op.absorbedInto !== undefined &&
			!Corpus.exists(Op.absorbedInto):
			return "absorbed-missing";
		case Op.op === "archive" && Op.absorbedInto === Op.name:
			return "absorbed-self";
		case Op.op === "agreement" && Body.trim().length > 400:
			return "agreement-long";
		default:
			return "";
	}
};

export default (Proposal_: Proposal, Corpus: Corpus): Verdict => {
	const Accepted: Op[] = [];
	const Rejected: { op: Op; rule: string }[] = [];
	const Seen = new Set<string>();
	for (const Op of Proposal_.ops) {
		const RuleId = Rule(Op, Corpus);
		switch (true) {
			case RuleId !== "":
				Rejected.push({ op: Op, rule: RuleId });
				break;
			// Two operations on one target in one reply is a reviewer that
			// contradicted itself; the second is refused, not merged.
			case Seen.has(`${Op.op}:${Op.name}:${Op.file ?? ""}`):
				Rejected.push({ op: Op, rule: "duplicate" });
				break;
			default:
				Seen.add(`${Op.op}:${Op.name}:${Op.file ?? ""}`);
				Accepted.push(Op);
		}
	}
	return { accepted: Accepted, rejected: Rejected };
};
