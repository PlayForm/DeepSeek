// Library - the entry module of the PASS-ON (@playform/plugin-dsh-pass-on,
// ctx.passOn), the prepare direction of the batch flow
// (Documentation/Plans/PASS-ON-AND-INGESTER.md). Class form (the factory's
// precedent): `export default class PassOn extends Service` with
// `super(Context, "passOn")`, registered immediately on construction and
// removed with its owning fiber.
//
// THE SERVICE SURFACE (ctx.passOn):
//
//   Prepare(intent, origin?) - the batch proposal: resolve targets,
//                              synthesize the operations, render the bounded
//                              preview, compute the digest; then EMIT the
//                              canonical proposal on `batch/proposed` (the
//                              decision hook records it) and DELIVER it into
//                              the harness inbox (the board splices it).
//                              Returns null when the proposal is empty or
//                              ambiguous - never an empty batch.
//   Get(id)                  - fetch a prepared proposal (the decision's read).
//
// THE REAL BATCH-CONTRACT WIRING (the plan's deferred caller side): the
// internal proposal is converted to the canonical contract
// (Function/Batch), emitted on the bus and delivered into the agent-team
// inbox (Function/Deliver) - the same channel plugin-dsh-batchstate
// consumes, so a proposal actually reaches the board.
//
// THE READ-ONLY LAW: the pass-on never writes a file. It computes; the
// decision decides; the ingester applies. The only disk writes are the
// plugin's own ledger lines (one log per module, the family convention).
import { homedir as Home } from "node:os";

import { Service, type Context } from "@deepseek-ai/cordis";
import type { Allowlist } from "@playform/plugin-dsh-factory";

import BatchFn from "./Function/Batch.js";
import DeliverFn from "./Function/Deliver.js";
import JournalFn from "./Function/Journal.js";
import OriginFn from "./Function/Origin.js";
import PrepareFn from "./Function/Prepare.js";
import type Batch from "./Interface/Batch.js";
import type Config from "./Interface/Config.js";
import type Intent from "./Interface/Intent.js";
import type Proposal from "./Interface/Proposal.js";
import type State from "./Interface/State.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export default class PassOn extends Service {
	static inject: string[] = [];

	static Config = Definition;

	private State: State;

	constructor(Context: Context, Config: Config) {
		super(Context, "passOn");
		const Ledger = Config.logFile.startsWith("~")
			? `${Home()}${Config.logFile.slice(1)}`
			: Config.logFile;
		// THE POLICY BLOCK (D6) is a VOLATILE cell in the schema (the factory's
		// shared block); the class form has no factory State builder to unwrap
		// it, so the block is normalized ONCE here - a config edit reloads the
		// plugin anyway (the class form's documented posture).
		const Allow: Allowlist =
			(Config.policy as unknown as { get?: () => Allowlist }).get?.() ?? Config.policy;
		this.State = {
			Config: { ...Config, policy: Allow },
			Context,
			Module: "plugin-dsh-pass-on",
			Ledger,
			Enabled: Config.enabled,
			Proposals: new Map(),
		};
	}

	/** Prepare a batch proposal from an intent (READ-ONLY: no file writes;
	 *  null when empty or ambiguous), then publish it: the canonical contract
	 *  goes on `batch/proposed` and into the harness inbox. */
	Prepare(Intent: Intent, Origin?: string): Proposal | null {
		const Proposal = PrepareFn(this.State, Intent);
		JournalFn(
			this.State,
			Proposal,
			Proposal === null
				? `rejected ${Intent?.kind}`
				: `prepared ${Proposal.targets.length} targets`,
		);
		switch (true) {
			case Proposal === null:
				return null;
			default:
				break;
		}
		const Batch = BatchFn(Proposal, OriginFn(this.State.Context, Origin));
		this.Publish(Batch);
		DeliverFn(this.State, Batch);
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

	/** The bus emission (structural: the `batch/proposed` event is declared by
	 *  the decision hook's package, which this package does not import - the
	 *  self-contained rule; a context without an emitter is a silent no-op). */
	private Publish(Batch: Batch): void {
		const Emit = (
			this.State.Context as unknown as {
				emit?: (Name: string, Payload: unknown) => void;
			}
		).emit;
		try {
			Emit?.call(this.State.Context, "batch/proposed", Batch);
		} catch {
			/* a dead consumer can never break the prepare */
		}
	}
}

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's names are unchanged
// (the class form's default export with static inject/Config), and Version
// is a standalone named export, not on the class.
export { Version };
