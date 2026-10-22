// Journal - the durable log writer (Function/Journal): one JSON line per
// apply event, appended to the ledger file (one log per module, the family
// convention). Best-effort: a ledger failure never breaks the service. The
// plan section 4: "the journal record before and after; the ledger line per
// target".
import { appendFileSync as Append, mkdirSync as Make } from "node:fs";
import { dirname as Parent } from "node:path";

import type State from "../Interface/State.js";

export default (
	State: State,
	Event: string,
	ProposalId: string,
	Path: string,
	Detail: string,
): void => {
	try {
		Make(Parent(State.Ledger), { recursive: true });
		Append(
			State.Ledger,
			`${JSON.stringify({
				at: Date.now(),
				event: Event,
				proposal: ProposalId,
				path: Path,
				detail: Detail,
			})}\n`,
		);
	} catch {
		/* ledger best-effort */
	}
};
