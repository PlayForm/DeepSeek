// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the durable
// activation proof, the listeners, and the tool registration.
//
//   L1  batch/proposed  (emit, structural registration, host scope): the
//       synchronous recorder. One proposal at a time: record it (a lower
//       revision than the recorded one is ignored), evaluate expiry, and
//       evaluate the auto-approve policy. An auto-approval is a pure
//       in-memory decision: the decision is recorded, emitted as
//       batch/decision (the ingester and the live view listen for it), and
//       logged. No awaits, no I/O, no throws - a listener failure logs and
//       no-ops.
//
//       THE POLICY GATE (D6): the policy block's `commit` verdict is the
//       OUTER gate in front of `autoApprove` (the INNER one). An `approve`
//       verdict - the shipped default - refuses the policy auto-approval and
//       records the byte-exact `decision held <id> (policy commit=approve)`
//       line: the proposal stays pending and waits for the user's
//       batch_decision approval. The precedence is policy approve > knob: the
//       knob can never widen an approve verdict, while a knob that is off
//       still requires the user and writes no held line.
//   T1  batch_decision tool: the user's approve/deny/list entry point
//       (Function/Tool).
//
// THE DECISION IS THE HOOK'S PRODUCT, NOT THE INGESTER: the hook never
// writes files. The ingester handoff happens through the service seam
// (Interface/Siblings, resolved via Context.get at use time) from the tool
// path, and event-side by the ingester listening for batch/decision. The
// hook emits only; the emit dispatch is fire-and-forget by contract.
//
// THE EMIT DISCIPLINE: the batch/proposed listener is a synchronous
// recorder - no awaits, no throws, no file I/O. The waterfall family is not
// touched by this hook.
import type { Context } from "@deepseek-ai/cordis";
import Gate from "@Function/Gate.js";
import Inbox from "@Function/Inbox.js";
import Policy from "@Function/Policy.js";
import { Now, Record, Sweep } from "@Function/Proposals.js";
import Tool from "@Function/Tool.js";
import type { BatchProposal } from "@Interface/Batch.js";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";
import { Decide } from "@playform/ets-plugin-dsh-factory";
import Version from "@Variable/Version.js";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation (the schema always fills these; a hand-built
 *  config without them is invalid). */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`hook-dsh-batch-decision: ${Message}`);
	};
	const Number_ = (Key: string): number =>
		typeof Cell(Raw[Key]) === "number" && Number.isFinite(Cell(Raw[Key]))
			? (Cell(Raw[Key]) as number)
			: -1;
	if (!["off", "on"].includes(String(Cell(Raw["autoApprove"])))) {
		Fail('autoApprove must be one of "off" | "on"');
	}
	if (!Array.isArray(Cell(Raw["allowlist"]))) {
		Fail("allowlist must be an array of intent strings");
	}
	if (!(Number_("maxAutoTargets") >= 1)) {
		Fail("maxAutoTargets must be >= 1");
	}
	if (!(Number_("minConfidence") >= 0 && Number_("minConfidence") <= 1)) {
		Fail("minConfidence must be between 0 and 1");
	}
	if (!(Number_("pendingTtlMs") >= 1000)) {
		Fail("pendingTtlMs must be >= 1000");
	}
};

export default (Context: Context, Options: Config): void => {
	// Fail-loud validation BEFORE the State build: invalid config throws at
	// load, never silently defaults (the tool-coach precedent).
	Validate(Options);

	// The injected factory service (typed via Interface/State's augmentation
	// of the factory's shared shape through the State build).
	const Factory = Context.pluginFactory;

	const State_: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-batch-decision",
		fields: {
			On: "enabled",
			AutoApprove: "autoApprove",
			Allowlist: "allowlist",
			MaxAutoTargets: "maxAutoTargets",
			MinConfidence: "minConfidence",
			PendingTtlMs: "pendingTtlMs",
			Allow: "policy",
		},
	});
	State_.Factory = Factory;
	State_.Pending = new Map();
	State_.SeenIntents = new Map();

	// The ledger sink the modules receive (Factory.Append with the State bound).
	const Append = (Message: string): void => {
		Factory.Append(State_, Message);
	};

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone (the master switch and the policy knobs on the line).
	if (!State_.On) {
		Factory.Append(State_, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State_,
			Activate([
				["", `bundle ${Version}`],
				["autoApprove", State_.AutoApprove],
				["allowlist", String(State_.Allowlist.length)],
			]),
		);
	}

	// ------------------------------------------------------------------
	// Listener L1: batch/proposed (emit mode, structural registration). The
	// synchronous recorder: one proposal in, zero or one decision out.
	// ------------------------------------------------------------------
	Context.on("batch/proposed", (Proposal: BatchProposal): void => {
		try {
			if (!State_.On) {
				return;
			}
			if (Proposal === null || typeof Proposal !== "object") {
				return;
			}
			const At = Now(State_);
			Sweep(State_);
			if (!Record(State_, Proposal, At)) {
				Append(`proposal ${Proposal.id} ignored (revision not newer)`);
				return;
			}
			Append(
				`proposal ${Proposal.id} recorded (intent ${Proposal.intent}, targets ${Proposal.targets.length}, rev ${Proposal.revision})`,
			);
			// The auto-approve policy: pure arithmetic on the recorded state,
			// behind the D6 policy block's OUTER `commit` gate.
			switch (true) {
				case Policy(State_, Proposal) !== "auto-approve":
					break;
				case Decide(State_.Allow, "commit") !== "auto":
					// The policy gate is CLOSED (the shipped default): the
					// proposal waits for the user's batch_decision approval.
					Append(`decision held ${Proposal.id} (policy commit=approve)`);
					break;
				default: {
					const Decision = Gate(State_, Proposal, "approved", "policy");
					if (Decision !== undefined) {
						Append(`decision ${Decision.outcome} ${Proposal.id} (by policy)`);
						Context.emit?.("batch/decision", Decision);
						// THE HANDOFF: the decision also goes into the inbox the
						// board consumes (the same channel the proposal came
						// through) - the bus emit is for the ingester and the live
						// view, the inbox write is for the board.
						Inbox(Context, Decision, Proposal.origin, Append);
					}
				}
			}
		} catch (Error) {
			// Fail-open: the recorder never throws into the emit dispatch.
			try {
				Context.logger?.warn(
					`hook-dsh-batch-decision: ${String(Error)}; the proposal is skipped`,
				);
			} catch {
				/* logger optional */
			}
		}
	});

	// ------------------------------------------------------------------
	// Tool T1: batch_decision (the user's entry point). Registration is
	// readonly after registration; the definition is built once here.
	// ------------------------------------------------------------------
	const Tools = (
		Context as unknown as { tools?: { register?: (definition: unknown) => () => void } }
	).tools;
	if (typeof Tools?.register === "function") {
		Tools.register(Tool(Context, State_, Append));
	}

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead.
	(Context as { __hookDshBatchDecisionState?: State }).__hookDshBatchDecisionState = State_;
};
