// Journal - the durable log writer (Function/Journal): one JSON line per
// recorded event, appended to the ledger file (one log per module, the
// family convention). Best-effort: a ledger failure never breaks the
// service. The session and the agent id are read from the block itself.
import { appendFileSync as Append, mkdirSync as Make } from "node:fs";
import { dirname as Parent } from "node:path";

import type FeedbackBlock from "../Interface/Block.js";
import type { Event } from "../Interface/Event.js";
import type State from "../Interface/State.js";

export default (State: State, Event: Event, Block: FeedbackBlock): void => {
	try {
		Make(Parent(State.Ledger), { recursive: true });
		Append(
			State.Ledger,
			`${JSON.stringify({
				at: Date.now(),
				event: Event,
				session: Block.session,
				agentId: Block.agentId,
				block: Block,
			})}\n`,
		);
	} catch {
		/* ledger best-effort */
	}
};
