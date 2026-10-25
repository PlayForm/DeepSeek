// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the durable
// activation proof, the `dshRoute` service instantiation, and the launch-path
// listeners. The function returns NOTHING (the loader treats apply returns
// specially - a returned value silently kills event delivery).
//
// The listener set is exactly two, the two halves of one seam: Function/Inject
// on tools/pre-execute (the `subagent` tool's launch - the silent route
// injection plus the prompt hint), and Function/Launch on agent/pre-step (the
// child's first step - the hint for a child started straight through
// `ctx.subagents.startActivation`, which never passes through a tool).
// Everything else - the resolution, the classification, the escalation - is
// the `dshRoute` service surface consumed by the sibling orchestration
// plugins (the queue's routed dispatch) and by the user's audit.
import type { Context } from "@deepseek-ai/cordis";
import Enforcer from "@Function/Enforcer.js";
import Inject from "@Function/Inject.js";
import Launch from "@Function/Launch.js";
import Validate from "@Function/Validate.js";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/ets-base-dsh";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together).
const Version = "0.2.0";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

export default (Context: Context, Options: Config): void => {
	// Fail-loud validation BEFORE the State build: invalid config throws at
	// load, never silently defaults (the tool-coach precedent). The volatile
	// cells are unwrapped first — the loader hands apply stable `{ get }`
	// references and the State builder unwraps them later.
	Validate(
		Cell(Options.policy) as Parameters<typeof Validate>[0],
		Cell(Options.keywords) as Parameters<typeof Validate>[1],
	);

	// The injected factory service (typed via Interface/Service's
	// augmentation of the factory's own vocabulary).
	const Factory = Context.pluginFactory;

	// The State: the factory's shared shape plus the plugin's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	// Every mapped field is volatile in the schema, so the factory's P10
	// loader/volatile-update listener refreshes them IN PLACE - a policy
	// edit lands on the next launch without a remount.
	const State: State = Factory.State<State>(Context, Options, {
		module: "plugin-dsh-route",
		fields: {
			On: "enabled",
			RoutePolicy: "policy",
			Keywords: "keywords",
			DefaultRole: "defaultRole",
			Allow: "automation",
		},
	});
	State.Factory = Factory;
	State.Seq = 0;
	State.Hinted = new WeakSet();

	// The ledger sink (Factory.Append with the State bound).
	const Append = (Message: string): void => {
		Factory.Append(State, Message);
	};

	// Durable activation proof - "did it activate" must be answerable from
	// the ledger alone (the master switch and the policy identity on the line).
	if (!State.On) {
		Factory.Append(State, "disabled (enabled=false)");
	} else {
		Factory.Append(
			State,
			Activate([
				["", `bundle ${Version}`],
				["defaultRole", State.DefaultRole],
				["models", String(State.RoutePolicy.allowedModels.length)],
			]),
		);
	}

	// The service: registered immediately on construction, removed with the
	// owning fiber (the plugin's own).
	new Enforcer(Context, State);

	// The launch-path listeners, both halves of the seam: the silent injection
	// on the `subagent` TOOL (the model-facing launch), and the routing hint
	// on the child's first `agent/pre-step` (the SERVICE launch - the queue's
	// spawn never passes through a tool, so only the pre-step seam reaches it).
	Context.on("tools/pre-execute", (Exec, Next) => Inject(State, Exec, Next, Append));
	// The pre-step decision carries the harness's branded message identity,
	// which a structural shape cannot mint, so the listener crosses the
	// event's exact declaration through this one documented cast (the
	// Function/Launch smoke asserts the delivered decision's shape byte for
	// byte, including the message id).
	Context.on("agent/pre-step", ((Payload: never, Next: never) =>
		Launch(State, Payload, Next, Append)) as never);
};
