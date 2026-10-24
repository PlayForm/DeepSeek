// Decide - the decision splice (Function/Decide): record one decision the
// hook delivered into the same inbox channel. The board never decides; it
// reflects the decision onto the proposal's status so the compiled context
// stops showing an approved batch as pending.
//
// A decision for a proposal the board does not hold (a stale board after a
// restart, a decision that overtook its proposal) is refused with its own
// ledger line - never silently absorbed, never guessed.
import Emit from "@Function/Emit.js";
import Persist from "@Function/Persist.js";
import type State from "@Interface/State.js";

const OUTCOMES = ["approved", "denied", "expired"] as const;

export default (State: State, Payload: Record<string, unknown>): void => {
	const Id = typeof Payload["proposal"] === "string" ? (Payload["proposal"] as string) : "";
	const Outcome = OUTCOMES.find((One) => One === Payload["outcome"]);
	switch (true) {
		case Id.length === 0 || Outcome === undefined:
			State.Factory.Append(State, "decision rejected (malformed payload)");
			return;
		default:
			break;
	}
	const Entry = State.Proposals.get(Id);
	switch (true) {
		case Entry === undefined:
			State.Factory.Append(State, `decision ${Id} ignored (unknown proposal)`);
			return;
		default:
			break;
	}
	const By = Payload["by"] === "policy" ? "policy" : "user";
	Entry.status = Outcome;
	Entry.at = Date.now();
	State.Factory.Append(State, `proposal ${Id} decided ${Outcome} (by ${By})`);
	Persist(State);
	Emit(State, { batch: State.Batch, id: Id, kind: "decision" });
};
