// Parse - the strict reply parser: one JSON object, a closed operation set,
// and nothing repaired.
//
// THE FAILURE MODE THIS PREVENTS: a lenient parser. A reviewer that answers
// with prose, a fenced block, or an operation kind nobody implemented must be
// a FAILED review, not a silently empty one - an empty proposal and a broken
// reply look identical to the lifecycle, and the difference is the only signal
// that the prompt or the route needs attention.
//
// THREE TOLERANCES, all deliberate and all bounded:
//
//   * a ```json fence (models add one reflexively) - stripped, because the
//     content is otherwise exactly the contract;
//   * surrounding prose - sliced to the outermost object, because a one-line
//     preamble carries no meaning for the judge;
//   * a missing `ops` on an otherwise valid object - read as "no operations",
//     which is the same answer as the explicit `Nothing to save.`.
//
// EVERYTHING ELSE IS REFUSED: an unknown `op`, a non-string name, a `support`
// without a `file`, or more operations than the cap.
import type { Op, Operation, Proposal } from "@Interface/Proposal.js";

/** The closed operation set (the judge's vocabulary; Parse owns admission). */
export const Operations: readonly Operation[] = [
	"create",
	"patch",
	"support",
	"archive",
	"agreement",
];

/** The parse result: a proposal, or the reason there is none. */
export type ParseResult = { ok: true; proposal: Proposal } | { ok: false; error: string };

/** Strip a ```json fence (and any prose around the object). */
const Unwrap = (Reply: string): string => {
	const Trimmed = Reply.trim();
	const Fenced = Trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
	const Body = Fenced?.[1]?.trim() ?? Trimmed;
	const Start = Body.indexOf("{");
	const End = Body.lastIndexOf("}");
	return Start >= 0 && End > Start ? Body.slice(Start, End + 1) : Body;
};

/** One operation, or the reason it is not one. */
const Read = (Raw: unknown): { ok: true; op: Op } | { ok: false; error: string } => {
	const Value = (Raw ?? {}) as Record<string, unknown>;
	const Kind = typeof Value["op"] === "string" ? (Value["op"] as Operation) : undefined;
	switch (true) {
		case Kind === undefined || !Operations.includes(Kind):
			return { ok: false, error: `unknown operation kind \`${String(Value["op"])}\`` };
		case typeof Value["name"] !== "string" || (Value["name"] as string).trim() === "":
			return { ok: false, error: `\`${Kind}\` operation without a \`name\`` };
		default:
			break;
	}
	const Op: Op = { op: Kind, name: (Value["name"] as string).trim() };
	switch (true) {
		case typeof Value["file"] === "string":
			Op.file = (Value["file"] as string).trim();
			break;
		default:
			break;
	}
	switch (true) {
		case typeof Value["body"] === "string":
			Op.body = Value["body"] as string;
			break;
		case Kind === "archive":
			break;
		default:
			return { ok: false, error: `\`${Kind}\` operation without a \`body\`` };
	}
	switch (true) {
		case typeof Value["reason"] === "string":
			Op.reason = (Value["reason"] as string).trim();
			break;
		default:
			break;
	}
	switch (true) {
		case typeof Value["absorbedInto"] === "string":
			Op.absorbedInto = (Value["absorbedInto"] as string).trim();
			break;
		default:
			break;
	}
	switch (true) {
		case Kind === "support" && Op.file === undefined:
			return { ok: false, error: "`support` operation without a `file`" };
		default:
			return { ok: true, op: Op };
	}
};

export default (Reply: string, MaxProposals: number): ParseResult => {
	switch (true) {
		case typeof Reply !== "string" || Reply.trim() === "":
			return { ok: false, error: "empty reply" };
		default:
			break;
	}
	let Raw: unknown;
	try {
		Raw = JSON.parse(Unwrap(Reply));
	} catch (Cause) {
		return { ok: false, error: `unparseable reply: ${(Cause as Error).message}` };
	}
	switch (true) {
		case Raw === null || typeof Raw !== "object" || Array.isArray(Raw):
			return { ok: false, error: "reply is not a JSON object" };
		default:
			break;
	}
	const Value = Raw as Record<string, unknown>;
	const Listed = Value["ops"];
	switch (true) {
		case Listed === undefined:
			return {
				ok: true,
				proposal: {
					ops: [],
					note: typeof Value["note"] === "string" ? Value["note"] : undefined,
				},
			};
		case !Array.isArray(Listed):
			return { ok: false, error: "`ops` is not an array" };
		default:
			break;
	}
	const Ops: Op[] = [];
	for (const Entry of (Listed as unknown[]).slice(0, Math.max(1, MaxProposals))) {
		const Read_ = Read(Entry);
		switch (true) {
			case !Read_.ok:
				return { ok: false, error: Read_.error };
			default:
				Ops.push(Read_.op);
		}
	}
	return {
		ok: true,
		proposal: {
			ops: Ops,
			note: typeof Value["note"] === "string" ? Value["note"] : undefined,
		},
	};
};
