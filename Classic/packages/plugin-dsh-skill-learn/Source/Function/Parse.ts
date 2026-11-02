// Parse - the strict reply parser for both phases: one JSON object, a closed
// operation set, and nothing repaired.
//
// THE FAILURE MODE THIS PREVENTS: a lenient parser. A reviewer that answers with
// prose, a second fenced block, or an operation kind nobody implemented must be
// a FAILED review, not a silently empty one - an empty operation list and a
// broken reply look identical to the lifecycle, and the difference is the only
// signal that the prompt or the route needs attention. So the parser never
// repairs, never retries, and never coerces: a number where a string belongs is
// a failure, not a `String(...)` (plan section 4.3).
//
// THE TWO TOLERANCES ARE THE PLAN'S, AND THERE ARE NO OTHERS: a bare object, or
// exactly one ```json fence around the object. "One fenced json block around the
// object is accepted; anything else is rejected unread" (plan section 5), so
// prose before or after the fence is `fence`, and a fence that is not `json` is
// `fence` too. This is stricter than the sibling parser, which slices to the
// outermost object and therefore accepts a preamble
// (`Classic/packages/plugin-dsh-lesson-review/Source/Function/Parse.ts:36-43`).
//
// THE EVALUATION ORDER IS THIS FILE'S, AND IT IS STATED HERE BECAUSE THE PLAN
// LISTS THE NINE RULES RATHER THAN SCHEDULING THEM (plan section 4.3): empty,
// fence, json, shape, unknown-key, count, then per operation the field checks,
// the kind, the name grammar, and finally the `views` entries. The one placement
// worth defending is `count` before the per-operation work: the array's length is
// known the moment it is known to be an array, and a nine-operation reply should
// be refused without parsing nine objects.
//
// ONE BOUNDARY IS DELIBERATE AND NEEDS ITS REASON: a blank `oldString` or
// `newString` on a patch is NOT a parse failure. The judge's `anchor-changed`
// rule refuses it (plan section 4.5), and the two must not both claim it, or a
// blank anchor would end the run as `unparsable` instead of `refused` and the
// ledger would blame the model's syntax rather than its evidence. So this parser
// requires the anchors to be strings and leaves blankness to the judge.
import type { Operation } from "@Interface/Operation.js";
import type { ConfirmReply, ParseFailure, ParseResult, PlanReply } from "@Interface/Reply.js";

/** The corpus name grammar (`dsh-skill/lib/index.js:17`). */
const Grammar = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The three kinds the reply schema admits; there is no delete and no archive (plan section 5). */
const Kinds: readonly string[] = ["patch", "create", "support"];

/** The fence the plan accepts, and only this one. */
const Fenced = /^```json\r?\n([\s\S]*?)\r?\n?```$/;

/** One failure: the id and the detail both callers print. */
type Failure = { readonly ok: false; readonly id: ParseFailure; readonly detail: string };

/** A failure in the shape every result union carries. */
const Fail = (Id: ParseFailure, Detail: string): Failure => ({
	ok: false,
	id: Id,
	detail: Detail,
});

/** A missing, non-string or blank operation field. */
const Field = (Position: number, Name: string, What: string): Failure =>
	Fail("field", `operation ${Position} field "${Name}" ${What}`);

/** One operation, or the id and detail that stopped it. */
type OperationResult = { readonly ok: true; readonly operation: Operation } | Failure;

/** One operation entry: fields first, then the kind, then the name grammar. */
const Read = (Entry: unknown, Position: number): OperationResult => {
	switch (true) {
		case Entry === null || typeof Entry !== "object" || Array.isArray(Entry):
			return { ok: false, id: "field", detail: `operation ${Position} is not an object` };
		default:
			break;
	}
	const Value = Entry as Record<string, unknown>;
	const Skill = Value["skill"];
	const Reason = Value["reason"];
	switch (true) {
		case Skill === undefined:
			return Field(Position, "skill", "is missing");
		case typeof Skill !== "string":
			return Field(Position, "skill", "is not a string");
		case (Skill as string).trim() === "":
			return Field(Position, "skill", "is blank");
		case Reason === undefined:
			return Field(Position, "reason", "is missing");
		case typeof Reason !== "string":
			return Field(Position, "reason", "is not a string");
		case (Reason as string).trim() === "":
			return Field(Position, "reason", "is blank");
		default:
			break;
	}
	const Kind = Value["kind"];
	switch (true) {
		case typeof Kind !== "string" || !Kinds.includes(Kind):
			return {
				ok: false,
				id: "kind",
				detail: `kind "${String(Kind)}" is not one of patch, create, support`,
			};
		default:
			break;
	}
	const Name = (Skill as string).trim();
	const Sentence = (Reason as string).trim();
	switch (true) {
		case !Grammar.test(Name):
			return {
				ok: false,
				id: "name",
				detail: `"${Name}" is not a kebab-case skill name`,
			};
		default:
			break;
	}
	switch (true) {
		case Kind === "patch": {
			const Old = Value["oldString"];
			const Next = Value["newString"];
			switch (true) {
				case typeof Old !== "string":
					return Field(Position, "oldString", "is not a string");
				case typeof Next !== "string":
					return Field(Position, "newString", "is not a string");
				default:
					break;
			}
			return {
				ok: true,
				operation: {
					kind: "patch",
					skill: Name,
					oldString: Old as string,
					newString: Next as string,
					reason: Sentence,
				},
			};
		}
		case Kind === "create": {
			const Content = Value["content"];
			switch (true) {
				case typeof Content !== "string":
					return Field(Position, "content", "is not a string");
				case (Content as string).trim() === "":
					return Field(Position, "content", "is blank");
				default:
					break;
			}
			return {
				ok: true,
				operation: {
					kind: "create",
					skill: Name,
					content: Content as string,
					reason: Sentence,
				},
			};
		}
		default: {
			const FilePath = Value["filePath"];
			const Next = Value["newString"];
			switch (true) {
				case typeof FilePath !== "string":
					return Field(Position, "filePath", "is not a string");
				case (FilePath as string).trim() === "":
					return Field(Position, "filePath", "is blank");
				case typeof Next !== "string":
					return Field(Position, "newString", "is not a string");
				case (Next as string).trim() === "":
					return Field(Position, "newString", "is blank");
				default:
					break;
			}
			return {
				ok: true,
				operation: {
					kind: "support",
					skill: Name,
					filePath: FilePath as string,
					newString: Next as string,
					reason: Sentence,
				},
			};
		}
	}
};

export default (
	Reply: string,
	Phase: 1 | 2,
	MaxOperations: number,
): ParseResult<PlanReply | ConfirmReply> => {
	switch (true) {
		case typeof Reply !== "string" || Reply.trim() === "":
			return Fail("empty", "the reply is blank after trimming");
		default:
			break;
	}
	const Trimmed = Reply.trim();
	let Body = Trimmed;
	switch (true) {
		case Trimmed.startsWith("{") && Trimmed.endsWith("}"):
			break;
		default: {
			const Match = Trimmed.match(Fenced);
			if (Match === null || typeof Match[1] !== "string") {
				return Fail(
					"fence",
					"the reply is neither a bare object nor exactly one json fence",
				);
			}
			Body = Match[1].trim();
			break;
		}
	}
	let Raw: unknown;
	try {
		Raw = JSON.parse(Body);
	} catch (Cause) {
		return Fail("json", `JSON.parse failed: ${(Cause as Error).message}`);
	}
	switch (true) {
		case Raw === null || typeof Raw !== "object" || Array.isArray(Raw):
			return Fail("shape", "the reply is not a json object");
		default:
			break;
	}
	const Value = Raw as Record<string, unknown>;
	const Allowed: readonly string[] = Phase === 1 ? ["views", "operations"] : ["operations"];
	for (const Key of Object.keys(Value)) {
		switch (true) {
			case Allowed.includes(Key):
				continue;
			default:
				return Fail("unknown-key", `unknown top-level key "${Key}"`);
		}
	}
	const Listed = Value["operations"];
	switch (true) {
		case !Array.isArray(Listed):
			return Fail("shape", '"operations" is not an array');
		default:
			break;
	}
	const Bound = Math.max(1, MaxOperations);
	const Entries = Listed as readonly unknown[];
	switch (true) {
		case Entries.length > Bound:
			return Fail("count", `${Entries.length} operations exceed the bound of ${Bound}`);
		default:
			break;
	}
	// The views: a phase-1 field, validated before any operation is read.
	const Views: string[] = [];
	switch (true) {
		case Phase === 2:
			break;
		default: {
			const Declared = Value["views"];
			switch (true) {
				case Declared === undefined:
					return Fail("field", '"views" is missing');
				case !Array.isArray(Declared):
					return Fail("field", '"views" is not an array');
				default:
					break;
			}
			for (const Entry of Declared as readonly unknown[]) {
				switch (true) {
					case typeof Entry !== "string":
						return Fail("field", "a views entry is not a string");
					case (Entry as string).trim() === "":
						return Fail("field", "a views entry is blank");
					default:
						break;
				}
				const Name = (Entry as string).trim();
				switch (true) {
					case !Grammar.test(Name):
						return Fail("name", `"${Name}" is not a kebab-case skill name`);
					default:
						break;
				}
				Views.push(Name);
			}
		}
	}
	const Operations: Operation[] = [];
	for (const [Index, Entry] of Entries.entries()) {
		const Parsed = Read(Entry, Index + 1);
		if (!Parsed.ok) return Fail(Parsed.id, Parsed.detail);
		Operations.push(Parsed.operation);
	}
	switch (true) {
		case Phase === 2:
			return { ok: true, reply: { operations: Operations } };
		default:
			return { ok: true, reply: { views: Views, operations: Operations } };
	}
};
