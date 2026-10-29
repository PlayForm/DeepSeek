// Fold - the pure fold: the session log's records, in sequence order, become
// the conversation state of one session (the conversation spine's section
// 3.1). It reads exactly the shapes the harness records - session, turn/start,
// step/start, assistant/message, tool/call - and skips every other shape
// without throwing. The shared rules are imported, not re-written: the touch
// derivation is Function/Resolve's and the call fields are Function/Usage's,
// each imported here and by Function/Emits, so the rule lives in one module
// and both import it. The fold is pure: no I/O, no clock, no global state.
import type State from "@Interface/State.js";
import type { Call, Tool, Touch } from "@Interface/State.js";

import Resolve from "./Resolve.js";
import Usage from "./Usage.js";

// The field guards: a missing or alien field folds to its zero value, never
// thrown on (the same guards the projection keeps).
const TextOf = (Value: unknown): string => (typeof Value === "string" ? Value : "");
const WholeOf = (Value: unknown): number | null => (typeof Value === "number" ? Value : null);

export default (Events: readonly unknown[]): State => {
	const Calls: Call[] = [];
	const Tools: Tool[] = [];
	const Touches: Touch[] = [];
	const Seen = new Set<string>();
	let Turn = 0;
	let Step = 0;
	let Cwd = "";
	let LastSeq = -1;
	for (const Event of Events) {
		const Record = (Event ?? {}) as Record<string, unknown>;
		const Seq = WholeOf(Record["seq"]) ?? -1;
		// The sequence law: a record at or behind the newest sequence already
		// folded is stale delivery, skipped; a record without a sequence
		// number is always folded (the harness carries one, the law is for
		// the out-of-order replay).
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
		switch (true) {
			case Type === "session": {
				// The session header supplies the cwd the tool arguments
				// resolve against (the record's own field, else the data's).
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
				break;
			}
			case Type === "assistant/message": {
				const Call: Call = {
					Turn: TurnOf,
					Step: StepOf,
					...Usage(Data),
				};
				Calls.push(Call);
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
				Tools.push(Tool);
				for (const Touched of Resolve(Name, Data["arguments"], Cwd)) {
					const Touch: Touch = {
						Path: Touched.Path,
						Kind: Touched.Kind,
						Turn: TurnOf,
						Step: StepOf,
					};
					Touches.push(Touch);
					Seen.add(Touched.Path);
				}
				break;
			}
			default:
		}
	}
	return {
		Turn,
		Step,
		Calls,
		Tools,
		Touches,
		Files: [...Seen],
	};
};
