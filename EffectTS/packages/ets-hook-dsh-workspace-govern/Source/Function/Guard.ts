// Guard - the recursion-prevention guard (Function/Guard): the operation
// identifier's gated count. Every proposal carries the operation identifier,
// the parent identifier and the event category (the distribution law), and
// an operation identifier gated more than the loop bound is DROPPED - the
// gate returns a pass-through and ledger `loop <operation> (recursion
// guard)`, so a self-feeding operation can never re-enter the gate without
// end. The count map is capped (the oldest entries dropped, the cap is
// ledgered) so a long session cannot grow it without end.
import type State from "@Interface/State.js";

const CAP = 256;

export default (State: State, Operation: string, Append: (Message: string) => void): boolean => {
	const Count = (State.Recent.get(Operation) ?? 0) + 1;
	State.Recent.set(Operation, Count);
	while (State.Recent.size > CAP) {
		const Oldest = State.Recent.keys().next().value;
		if (Oldest === undefined) {
			break;
		}
		State.Recent.delete(Oldest);
	}
	switch (true) {
		case Count > State.LoopBound:
			Append(`loop ${Operation} (recursion guard)`);
			return true;
		default:
			return false;
	}
};
