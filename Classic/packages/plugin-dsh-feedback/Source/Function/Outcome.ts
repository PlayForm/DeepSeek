// Outcome - the batch outcome record (Function/Outcome): the caller-side
// orchestration integration the plan defers. The ingester (the outcome's
// owner) reports the apply's honest result; a decision that never reaches an
// apply (denied / expired) can be reported by whoever recorded it.
//
// The record is APPENDED to the session's outcome ring (never rewritten -
// the same honesty rule the blocks carry) and journaled as its own line:
//
//   {"at":<epoch>,"event":"batch","session":"<s>","agentId":"<a>",
//    "proposal":"<id>","outcome":"applied","detail":"applied 1, conflicts 0, recovery 0"}
//
// The journal line is its own shape (the block events carry a `block`); the
// two writers append to the same file, and both are best-effort - a ledger
// failure never breaks the service.
import { appendFileSync as Append, mkdirSync as Make } from "node:fs";
import { dirname as Parent } from "node:path";

import { Expand } from "@playform/lib-dsh-core";

import type Shape from "../Interface/Outcome.js";
import type State from "../Interface/State.js";

export default (
	State: State,
	Session: string,
	AgentId: string,
	Proposal: string,
	Outcome_: string,
	Detail: string,
): Shape | null => {
	switch (true) {
		case !State.Config.enabled:
			return null;
		case typeof Proposal !== "string" || Proposal.length === 0:
			return null;
		default:
			break;
	}
	const Key = typeof Session === "string" ? Session : "";
	const Entry: Shape = {
		proposal: Proposal,
		outcome: Outcome_,
		detail: Detail,
		at: Date.now(),
	};
	const Ring = State.Outcomes.get(Key) ?? [];
	Ring.push(Entry);
	while (Ring.length > Math.max(1, State.Config.maxOutcomes)) {
		Ring.shift();
	}
	State.Outcomes.set(Key, Ring);
	try {
		const Ledger = Expand(State.Ledger);
		Make(Parent(Ledger), { recursive: true });
		Append(
			Ledger,
			`${JSON.stringify({
				at: Entry.at,
				event: "batch",
				session: Key,
				agentId: typeof AgentId === "string" ? AgentId : "",
				proposal: Entry.proposal,
				outcome: Entry.outcome,
				detail: Entry.detail,
			})}\n`,
		);
	} catch {
		/* ledger best-effort */
	}
	return Entry;
};
