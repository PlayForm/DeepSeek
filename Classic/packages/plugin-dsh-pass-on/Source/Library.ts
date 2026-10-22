// Library - the entry module of the PASS-ON (@playform/plugin-dsh-pass-on,
// ctx.passOn), the prepare direction of the batch flow
// (Documentation/Plans/PASS-ON-AND-INGER.md). Class form (the factory's
// precedent): `export default class PassOn extends Service` with
// `super(Context, "passOn")`, registered immediately on construction and
// removed with its owning fiber.
//
// THE SERVICE SURFACE (ctx.passOn):
//
//   Prepare(intent)   - the batch proposal: resolve targets, synthesize the
//                       operations, render the bounded preview, compute the
//                       digest. Returns null when the proposal is empty or
//                       ambiguous - never an empty batch.
//   Get(id)           - fetch a prepared proposal (the decision's read).
//
// THE READ-ONLY LAW: the pass-on never writes a file. It computes; the
// decision decides; the ingester applies. The only disk writes are the
// plugin's own ledger lines (one log per module, the family convention).
import { homedir as Home } from "node:os";

import { Service, type Context } from "@deepseek-ai/cordis";

import JournalFn from "./Function/Journal.js";
import PrepareFn from "./Function/Prepare.js";
import type Config from "./Interface/Config.js";
import type Intent from "./Interface/Intent.js";
import type Proposal from "./Interface/Proposal.js";
import type State from "./Interface/State.js";
import Definition from "./Variable/Config.js";

export default class PassOn extends Service {
	static inject: string[] = [];

	static Config = Definition;

	private State: State;

	constructor(Context: Context, Config: Config) {
		super(Context, "passOn");
		const Ledger = Config.logFile.startsWith("~")
			? `${Home()}${Config.logFile.slice(1)}`
			: Config.logFile;
		this.State = {
			Config,
			Context,
			Module: "plugin-dsh-pass-on",
			Ledger,
			Enabled: Config.enabled,
			Proposals: new Map(),
		};
	}

	/** Prepare a batch proposal from an intent (READ-ONLY: no file writes;
	 *  null when empty or ambiguous). */
	Prepare(Intent: Intent): Proposal | null {
		const Proposal = PrepareFn(this.State, Intent);
		JournalFn(
			this.State,
			Proposal,
			Proposal === null
				? `rejected ${Intent?.kind}`
				: `prepared ${Proposal.targets.length} targets`,
		);
		return Proposal;
	}

	/** Fetch a prepared proposal by id (null when unknown or expired). */
	Get(Id: string): Proposal | null {
		const Proposal = this.State.Proposals.get(Id);
		if (Proposal === undefined) {
			return null;
		}
		if (Proposal.expiresAt <= Date.now()) {
			return null;
		}
		return Proposal;
	}
}
