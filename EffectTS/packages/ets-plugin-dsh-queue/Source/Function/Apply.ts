// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the durable
// activation proof, the `dshQueue` service instantiation, and the tool
// registrations. The function returns NOTHING (the loader treats apply
// returns specially - a returned value silently kills event delivery).
//
// The queue is SERVICE-DRIVEN by design: the dispatcher's deterministic
// order and the seat/release bookkeeping are consumed by the orchestrator's
// tooling (the `queue_enqueue` / `queue_status` tools and the `dshQueue`
// service) rather than hooked to inferred lifecycle events - the exact pool
// semantics of the shared probe are an open item (SUBAGENT-QUEUE-PLUGIN.md
// section 3), and a wrong lifecycle hook would silently drop tasks. When the
// probe lands in the end-phase, the auto-dispatch trigger (a settle event
// calling Dispatch) rides the same service surface.
import type { Context } from "@deepseek-ai/cordis";
import Dispatcher from "@Function/Dispatcher.js";
import ToolEnqueue from "@Function/ToolEnqueue.js";
import ToolStatus from "@Function/ToolStatus.js";
import Validate from "@Function/Validate.js";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.1.0";

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
		},
	});
	State.Factory = Factory;
	State.Tasks = new Map();
	State.Seq = 0;
	State.Seats = new Map();

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

	// The loader ignores any return value; the smoke harness (end-phase)
	// probes the built State through this debug attachment instead.
	(Context as { __pluginDshQueueState?: State }).__pluginDshQueueState = State;
};
