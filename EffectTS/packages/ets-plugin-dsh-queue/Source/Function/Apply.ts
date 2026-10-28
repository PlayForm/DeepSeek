// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the durable
// activation proof, the `dshQueue` service instantiation, the tool
// registrations, and the unload effect that cancels in-flight spawned
// children. The function returns NOTHING (the loader treats apply returns
// specially - a returned value silently kills event delivery).
//
// THE SPAWN (the completion wave): the dispatcher assigns a seat and, when
// `autoSpawn` is on, starts the child through the harness's own subagent
// service (`ctx.subagents.startActivation`) - never a private spawn, never a
// shell. `autoSpawn` ships FALSE (the D6 approval posture: a spawn is a
// privileged action), so the default mount assigns and ledgers only. The
// idle-slot automation (a released seat pulls the next queued task) and the
// restart reconcile (`Reconcile`) live on the same service surface; both are
// gated so the manual posture's ledger stays byte-identical.
//
// The activation line is UNCHANGED (the byte-exact contract): the spawn
// posture is visible on the per-task lines (`spawned` / `spawn skipped` /
// `spawn failed`), not on the activation proof.
import type { Context } from "@deepseek-ai/cordis";
import Dispatcher from "@Function/Dispatcher.js";
import ToolEnqueue from "@Function/ToolEnqueue.js";
import ToolStatus from "@Function/ToolStatus.js";
import Validate from "@Function/Validate.js";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";
import Version from "@Variable/Version.js";

export default (Context: Context, Options: Config): void => {
	// Fail-loud validation BEFORE the State build: invalid config throws at
	// load, never silently defaults (the tool-coach precedent).
	Validate(Options.capacity);

	// The injected factory service (typed via Interface/Queue's augmentation
	// of the factory's own vocabulary).
	const Factory = Context.pluginFactory;

	// The State: the factory's shared shape plus the plugin's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	// Every mapped field is volatile in the schema, so the factory's P10
	// loader/volatile-update listener refreshes them IN PLACE - a capacity
	// edit lands on the next dispatch without a remount.
	const State: State = Factory.State<State>(Context, Options, {
		module: "plugin-dsh-queue",
		fields: {
			On: "enabled",
			Capacity: "capacity",
			AutoDispatch: "autoDispatch",
			RoutedDispatch: "routedDispatch",
			AutoSpawn: "autoSpawn",
			SpawnProvider: "spawnProvider",
			Allow: "policy",
		},
	});
	State.Factory = Factory;
	State.Tasks = new Map();
	State.Seq = 0;
	State.Seats = new Map();
	State.Spawns = new Set();
	State.Controllers = new Map();

	// Durable activation proof - "did it activate" must be answerable from
	// the ledger alone (the master switch and the capacity model on the line).
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["capacity", `main=${State.Capacity.main} child=${State.Capacity.child}`],
				["routedDispatch", String(State.RoutedDispatch)],
			]),
		);
	}

	// The service: registered immediately on construction, removed with the
	// owning fiber (the plugin's own). The State carries it for the tools.
	const Queue = new Dispatcher(Context, State);
	State.DshQueue = Queue;

	// The tools: the orchestrator's surface (queue_enqueue, queue_status).
	const Tools = (
		Context as unknown as { tools?: { register?: (definition: unknown) => () => void } }
	).tools;
	if (typeof Tools?.register === "function") {
		Tools.register(ToolEnqueue(State));
		Tools.register(ToolStatus(State));
	}

	// The unload effect: a spawned child is cancelled with the plugin's own
	// fiber (the activation's abort signal is the harness's cancellation
	// channel), so a disabled or reloaded plugin never leaves an orphan
	// running behind a dead queue.
	Context.effect(
		() => () => {
			for (const Controller of State.Controllers.values()) {
				Controller.abort();
			}
			State.Controllers.clear();
		},
		"plugin-dsh-queue.spawnControllers()",
	);

	// The loader ignores any return value; the smoke harness (end-phase)
	// probes the built State through this debug attachment instead.
	(Context as { __pluginDshQueueState?: State }).__pluginDshQueueState = State;
};
