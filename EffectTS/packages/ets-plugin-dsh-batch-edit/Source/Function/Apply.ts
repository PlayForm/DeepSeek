// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the durable
// activation proof, and the listener set. Registration ONLY - every behavior
// lives in its own Function module (Machine, Ops, Tools, Present, Ledger).
//
//   T1  the batch_edit tool registration (the tools seam, probed - the
//       live containers' register pattern)
//   L11 fs/observed via the factory's Wire (ROOT context): the stale-halt
//       observer - a SYNCHRONOUS cell flipper, no awaits, no I/O (the
//       event-loop hazard mitigation)
//   L2  tools/pre-execute (waterfall, next() FIRST, fail-open): the ADVISORY
//       bash intercept (config interceptBash, OFF by default in v1) - it
//       tags the exec and records the attempt, NEVER denies (the control
//       layer comes later as its own plugin)
//   L8  agent/pre-step (waterfall, next() FIRST, fail-open): the turn
//       boundary seam (the deadline scan and the settle fold - the inline
//       commit path leaves nothing in flight, so v1 is a pass-through that
//       holds the seam for the background-branch checkpoints)
//
// THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first; pass-through
// returns the downstream decision unchanged; FAIL-OPEN: every listener body
// is one try/catch - on any error a logger.warn records it and the
// downstream result is returned UNCHANGED. The function returns NOTHING
// (a returned value silently kills event delivery).
import type { Context } from "@deepseek-ai/cordis";
import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Config from "@Interface/Config.js";
import type FactoryService from "@Interface/Factory.js";
import type State from "@Interface/State.js";

import * as Machine from "./Machine.js";
import ShieldSync from "./ShieldSync.js";
import Tools from "./Tools.js";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.1.0";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value):
 * the loader hands volatile fields as cells, so every validation read goes
 * through this (the batch-decision Apply precedent). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation (the live containers' Validate precedent):
 *  every knob is checked, never silently defaulted. */
const Validate = (Options: Config): void => {
	const Fail = (Message: string): never => {
		throw new Error(`plugin-dsh-batch-edit: ${Message}`);
	};
	const Raw = Options as unknown as Record<string, unknown>;
	if (typeof Cell(Raw["logFile"]) !== "string" || String(Cell(Raw["logFile"])).length === 0) {
		Fail("logFile must be a non-empty string");
	}
	if (!(Number(Cell(Raw["machinesPerAgent"])) >= 1)) {
		Fail("machinesPerAgent must be >= 1");
	}
	if (!(Number(Cell(Raw["opsPerCommit"])) >= 1)) {
		Fail("opsPerCommit must be >= 1");
	}
	if (
		!(Number(Cell(Raw["deadlineMs"])) >= 1000) ||
		!(Number(Cell(Raw["deadlineMs"])) <= 120000)
	) {
		Fail(
			"deadlineMs must be >= 1000 and <= 120000 (the inline deadline - the composition contract)",
		);
	}
	if (typeof Cell(Raw["strictMode"]) !== "boolean") {
		Fail("strictMode must be a boolean");
	}
	if (typeof Cell(Raw["interceptBash"]) !== "boolean") {
		Fail("interceptBash must be a boolean");
	}
	if (!Array.isArray(Cell(Raw["monitorChecksets"]))) {
		Fail("monitorChecksets must be an array of check-set names");
	}
};

/** The advisory bash intercept (v1, interceptBash on): a bash/shell call
 *  whose command mentions a HELD file is tagged and recorded - the offer is
 *  advisory, the downstream decision passes through UNCHANGED (never
 *  denies). Returns the offer note, or undefined. */
const Intercept = (State: State, Exec: ToolExecution): string | undefined => {
	// The structural extras the waterfall's exec carries beyond the dsh-tools
	// execution identity (the local Events view): read through a guarded cast.
	const Raw = Exec as unknown as { tool?: unknown; args?: { command?: unknown } };
	const Name = String(Exec.name ?? Raw.tool ?? "");
	if (!["bash", "shell", "command"].includes(Name)) {
		return undefined;
	}
	const Command = String(Raw.args?.command ?? "");
	if (Command.length === 0) {
		return undefined;
	}
	const Held: string[] = [];
	for (const MachineRecord of Machine.AllMachines(State)) {
		for (const Path of MachineRecord.files.keys()) {
			if (Command.includes(Path)) {
				Held.push(Path);
			}
		}
	}
	if (Held.length === 0) {
		return undefined;
	}
	return `batch_edit advisory: your ${Name} call touches held file(s) ${Held.join(", ")} - consider action=commit on the open machine (advisory only, nothing was denied)`;
};

export default (Context: Context, Options: Config): void => {
	// Fail-loud validation BEFORE the State build: invalid config throws at
	// load, never silently defaults.
	Validate(Options);

	// The injected factory service (the Interface/Factory contract; the
	// cast keeps the PoC self-contained - the end-phase's declaration
	// merging re-types this access).
	const Factory = (Context as unknown as { pluginFactory: FactoryService }).pluginFactory;

	// The State: the factory's shared shape plus the plugin's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	// Every mapped field is volatile in the schema, so the factory's P10
	// loader/volatile-update listener refreshes them IN PLACE.
	const State: State = Factory.State<State>(Context, Options, {
		module: "plugin-dsh-batch-edit",
		fields: {
			On: "enabled",
			MachinesPerAgent: "machinesPerAgent",
			OpsPerCommit: "opsPerCommit",
			Deadline: "deadlineMs",
			Strict: "strictMode",
			Intercept: "interceptBash",
			Checksets: "monitorChecksets",
			Allow: "policy",
		},
	});
	State.Factory = Factory;
	State.Machines = new Map();
	State.Counter = 0;

	// The ledger sink every module receives (Factory.Append with the State
	// bound). The factory's append seam runs a spanned Effect whose tracer
	// samples the global Date.now internally - ShieldSync keeps those
	// internal samples out of the caller's deadline budget (Function/
	// ShieldSync).
	const Append = (Message: string): void => {
		ShieldSync(() => Factory.Append(State, Message));
	};

	// Durable activation proof - "did it activate" must be answerable from
	// the ledger alone (the master switch and the knobs on the line).
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			`activated bundle ${Version} (machinesPerAgent ${State.MachinesPerAgent}, opsPerCommit ${State.OpsPerCommit}, deadlineMs ${State.Deadline}, strictMode ${State.Strict}, interceptBash ${State.Intercept})`,
		);
	}

	// ------------------------------------------------------------------
	// T1: the batch_edit tool (the tools seam, probed - readonly after
	// registration; the definitions are built once here).
	// ------------------------------------------------------------------
	const Tools_ = (
		Context as unknown as { tools?: { register?: (definition: unknown) => () => void } }
	).tools;
	if (typeof Tools_?.register === "function") {
		Tools_.register(Tools(State, Append));
	}

	// ------------------------------------------------------------------
	// L11: fs/observed via the factory's Wire on the ROOT context. The
	// observer is a SYNCHRONOUS cell flipper (Machine.OnObserved): no
	// awaits, no throws, no I/O - the event-loop hazard mitigation.
	// ------------------------------------------------------------------
	Factory.Wire(Context, State, (Target, Observation, Actor) =>
		Machine.OnObserved(State, Target, Observation, Actor, Append),
	);

	// ------------------------------------------------------------------
	// L2: tools/pre-execute (the advisory bash intercept). next() FIRST;
	// the downstream decision passes through UNCHANGED in every branch
	// (advisory, never denies); fail-open.
	// ------------------------------------------------------------------
	if (State.Intercept) {
		Context.on(
			"tools/pre-execute",
			async (
				Exec: ToolExecution,
				Next: () => Promise<PreToolDecision>,
			): Promise<PreToolDecision> => {
				const Downstream = await Next();
				try {
					if (!State.On) {
						return Downstream;
					}
					const Offer = Intercept(State, Exec);
					if (Offer !== undefined) {
						(Exec as { batchEditOffer?: string }).batchEditOffer = Offer;
						Append(
							`advisory intercept ${String(Exec.name ?? (Exec as { tool?: unknown }).tool ?? "")} on a held file`,
						);
					}
					return Downstream;
				} catch (Error) {
					try {
						Context.logger?.warn(
							`plugin-dsh-batch-edit: ${String(Error)}; the intercept passes through`,
						);
					} catch {
						/* logger optional */
					}
					return Downstream;
				}
			},
		);
	}

	// ------------------------------------------------------------------
	// L8: agent/pre-step (the turn boundary seam). next() FIRST;
	// fail-open; the v1 body is the pass-through that holds the seam (the
	// deadline scan and settle fold ride the jobs subscription once the
	// background branch is exercised end-to-end).
	// ------------------------------------------------------------------
	Context.on("agent/pre-step", async (Payload, Next) => {
		const Downstream = await Next();
		try {
			if (!State.On) {
				return Downstream;
			}
			// The settle fold: nothing is in flight on the inline path; the
			// halted cells persist until the agent resumes them explicitly -
			// nothing is silently dropped.
			void Payload;
			return Downstream;
		} catch (Error) {
			try {
				Context.logger?.warn(
					`plugin-dsh-batch-edit: ${String(Error)}; the pre-step passes through`,
				);
			} catch {
				/* logger optional */
			}
			return Downstream;
		}
	});

	// The loader ignores any return value; the smoke harness probes the
	// built State through this debug attachment (the live containers'
	// precedent).
	(Context as unknown as { __pluginDshBatchEditState?: State }).__pluginDshBatchEditState = State;
};
