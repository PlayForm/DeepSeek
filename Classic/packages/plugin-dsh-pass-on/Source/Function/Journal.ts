// Journal - the durable log writer (Function/Journal): one JSON line per
// prepared proposal, appended to the ledger file (one log per module, the
// family convention). Best-effort: a ledger failure never breaks the
// service. The plan section 3: "a ledger line for the proposal; nothing
// written" (to the targets - the pass-on's own log is not a target write).
import { appendFileSync as Append, mkdirSync as Make } from "node:fs";
import { dirname as Parent } from "node:path";

import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";

export default (State: State, Proposal: Proposal | null, Note: string): void => {
	try {
		Make(Parent(State.Ledger), { recursive: true });
		Append(
			State.Ledger,
			`${JSON.stringify({
				at: Date.now(),
				event: "prepared",
				proposal: Proposal?.id ?? null,
				digest: Proposal?.digest ?? null,
				targets: Proposal?.targets.length ?? 0,
				note: Note,
			})}\n`,
		);
	} catch {
		/* ledger best-effort */
	}
};
