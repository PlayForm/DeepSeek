// Emits - the pure emission: the session log's records, in sequence order,
// become the conversation envelopes the factory's service emits on the bus
// (the conversation spine's section 3.1) - one envelope per state-changing
// event: the turn start, the step start, the assistant message, the tool
// call, each resolved touch, and the session end (`session/disposed` or
// `turn/end`). It reads exactly the shapes the harness records and skips
// every other shape without throwing. The shared rules are imported, not
// re-written: the touch derivation is Function/Resolve's and the call fields
// are Function/Usage's - the same modules Function/Fold imports - so the rule
// lives in one module and all three use it. The emission is pure: no I/O, no
// clock, no global state.
import type Envelope from "@Interface/Envelope.js";
import type { Call, Tool, Touch } from "@Interface/State.js";
import Names from "@Variable/Names.js";

import Resolve from "./Resolve.js";
import Usage from "./Usage.js";

// The field guards: a missing or alien field folds to its zero value, never
// thrown on (the same guards the fold keeps).
const TextOf = (Value: unknown): string => (typeof Value === "string" ? Value : "");
const WholeOf = (Value: unknown): number | null => (typeof Value === "number" ? Value : null);

export default (Events: readonly unknown[]): readonly Envelope[] => {
	const Out: Envelope[] = [];
	let SessionId = "";
	let Turn = 0;
	let Step = 0;
	let Cwd = "";
	let LastSeq = -1;
	for (const Event of Events) {
		const Record = (Event ?? {}) as Record<string, unknown>;
		const Seq = WholeOf(Record["seq"]) ?? -1;
		// The sequence law, Fold's: a record at or behind the newest sequence
		// already read is stale delivery, skipped; a record without a sequence
		// number is always read.
		switch (true) {
			case Seq >= 0 && Seq <= LastSeq:
				continue;
			default:
		}
		if (Seq > LastSeq) {
			LastSeq = Seq;
		}
		const Type = TextOf(Record["type"]);
		const Data = (Record["data"] ?? {}) as Record<string, unknown>;
		// A derived record's turn and step: the event's own fields when it
		// carries them, else the state's current ones.
		const TurnOf = WholeOf(Data["turn"]) ?? Turn;
		const StepOf = WholeOf(Data["step"]) ?? Step;
		// The one envelope constructor: Seq and At copied from the source
		// record (0 when it carried none - the emission is pure, so it never
		// reads a clock), Kind from Names, Turn and Step per the envelope's
		// own rule.
		const EnvelopeOf = (Kind: string, Payload: unknown): Envelope => ({
			SessionId,
			Seq: Seq < 0 ? 0 : Seq,
			Turn: TurnOf,
			Step: StepOf,
			At: WholeOf(Record["time"]) ?? 0,
			Kind,
			Data: Payload,
		});
		switch (true) {
			case Type === "session": {
				// The session header: the id the envelopes carry and the cwd the
				// tool arguments resolve against (the record's own field, else
				// the data's). No envelope - the header is context, not an event.
				const Own = TextOf(Record["id"]) !== "" ? TextOf(Record["id"]) : TextOf(Data["id"]);
				if (Own !== "") {
					SessionId = Own;
				}
				const Home = Data["cwd"] ?? Record["cwd"];
				if (typeof Home === "string" && Home.length > 0) {
					Cwd = Home;
				}
				break;
			}
			case Type === "turn/start": {
				const StartTurn = WholeOf(Data["turn"]);
				if (StartTurn !== null) {
					Turn = StartTurn;
				}
				Out.push(EnvelopeOf(Names.turn, Data));
				break;
			}
			case Type === "step/start": {
				const StartTurn = WholeOf(Data["turn"]);
				const StartStep = WholeOf(Data["step"]);
				if (StartTurn !== null) {
					Turn = StartTurn;
				}
				if (StartStep !== null) {
					Step = StartStep;
				}
				Out.push(EnvelopeOf(Names.step, Data));
				break;
			}
			case Type === "assistant/message": {
				const Call: Call = {
					Turn: TurnOf,
					Step: StepOf,
					...Usage(Data),
				};
				Out.push(EnvelopeOf(Names.call, Call));
				break;
			}
			case Type === "tool/call": {
				const Name = TextOf(Data["name"]);
				const Tool: Tool = {
					Turn: TurnOf,
					Step: StepOf,
					CallId: TextOf(Data["callId"]),
					Name,
				};
				Out.push(EnvelopeOf(Names.tool, Tool));
				// Each resolved touch is its own envelope, Resolve's rule, in
				// argument order.
				for (const Touched of Resolve(Name, Data["arguments"], Cwd)) {
					const Touch: Touch = {
						Path: Touched.Path,
						Kind: Touched.Kind,
						Turn: TurnOf,
						Step: StepOf,
					};
					Out.push(EnvelopeOf(Names.touch, Touch));
				}
				break;
			}
			case Type === "session/disposed" || Type === "turn/end": {
				Out.push(EnvelopeOf(Names.end, Data));
				break;
			}
			default:
		}
	}
	return Out;
};
