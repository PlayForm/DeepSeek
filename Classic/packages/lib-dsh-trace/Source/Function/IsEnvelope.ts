// IsEnvelope - the envelope guard: a complete envelope (the five fields, the
// payload an object). The bus validates what it dispatches; an adapter that
// receives a foreign value ignores it instead of crashing.
import type Envelope from "@Interface/Envelope.js";

export default (Value: unknown): Value is Envelope => {
	if (Value === null || typeof Value !== "object") {
		return false;
	}
	const Candidate = Value as Partial<Envelope>;
	switch (true) {
		case typeof Candidate.trace !== "string" || Candidate.trace.length === 0:
			return false;
		case typeof Candidate.kind !== "string" || Candidate.kind.length === 0:
			return false;
		case typeof Candidate.at !== "number":
			return false;
		case typeof Candidate.payload !== "object" || Candidate.payload === null:
			return false;
		default:
			return true;
	}
};
