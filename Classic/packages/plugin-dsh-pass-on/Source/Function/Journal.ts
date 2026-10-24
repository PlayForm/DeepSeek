// Journal - the durable log writer (Function/Journal): one JSON line per
// prepared proposal, appended to the ledger file (one log per module, the
// family convention). Best-effort: a ledger failure never breaks the
// service. The plan section 3: "a ledger line for the proposal; nothing
// written" (to the targets - the pass-on's own log is not a target write).
//
// The event is `prepared` for the prepare paths (the byte-stable line the
// PoC shipped) and `delivered` for the inbox delivery
// (Function/Deliver) - the second line answers "did the proposal reach the
// channel the board listens on" from the ledger alone. The field order is
// the contract: at, event, proposal, digest, targets, note.
import { appendFileSync as Append, mkdirSync as Make } from "node:fs";
import { dirname as Parent } from "node:path";

import { Expand } from "@playform/lib-dsh-core";

import type State from "../Interface/State.js";

/** The fields the journal line reads (satisfied by both proposal shapes). */
interface Record {
	id: string;
	digest: string;
	targets: readonly unknown[];
}

export default (State: State, Proposal: Record | null, Note: string, Event = "prepared"): void => {
	try {
		const Ledger = Expand(State.Ledger);
		Make(Parent(Ledger), { recursive: true });
		Append(
			Ledger,
			`${JSON.stringify({
				at: Date.now(),
				event: Event,
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
