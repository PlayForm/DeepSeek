// Apply - the plugin entry function: fail-loud validation, the State build
// (the factory's cell unwrap + the P10 volatile refresh), the activation
// proof, and the tools/pre-execute registration (Function/Guard - the
// intercept). The contract is ORCHESTRATION-PLUGINS.md section 3.
//
// THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
// and the bundle patch row). A cold mount logs `disabled (enabled=false)`
// and wires NOTHING - no listener, no ledger.
//
// The function returns NOTHING (the loader contract: a returned value
// silently kills event delivery). The test probe is the
// `ctx.__pluginDshGitguardState` attachment.
import type { Context } from "@deepseek-ai/cordis";
import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import Guard from "@Function/Guard.js";
import type Config from "@Interface/Config.js";
import type FactoryHandle from "@Interface/Factory.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** The fail-loud validation (runs BEFORE the State build so an invalid
 * config throws at load, never silently defaults). */
const Validate = (Options: unknown): void => {
	const Raw = (Options ?? {}) as Record<string, unknown>;
	const Fail = (Message: string): never => {
		throw new Error(`gitguard: ${Message}`);
	};
	const List = (Key: string): boolean =>
		Array.isArray(Cell(Raw[Key])) &&
		(Cell(Raw[Key]) as unknown[]).every((Item) => typeof Item === "string");
	switch (true) {
		case !(Array.isArray(Cell(Raw["denyPatterns"])) && List("denyPatterns")):
			Fail("denyPatterns must be an array of strings");
			break;
		case !(Array.isArray(Cell(Raw["allowPatterns"])) && List("allowPatterns")):
			Fail("allowPatterns must be an array of strings");
			break;
		case !(Array.isArray(Cell(Raw["exclude"])) && List("exclude")):
			Fail("exclude must be an array of strings");
			break;
		default:
	}
};

export default (Context: Context, Options: Config): void => {
	Validate(Options);
	const Factory = Context.pluginFactory as unknown as FactoryHandle;
	const State = Factory.State(Context, Options, {
		module: "gitguard",
		fields: {
			On: "enabled",
			Deny: "denyPatterns",
			Allow: "allowPatterns",
			Strict: "strict",
		},
	}) as State;
	State.Factory = Factory;
	switch (true) {
		case !State.On:
			// The cold mount: honest in the ledger, wired to nothing.
			Factory.Append(State, "disabled (enabled=false)");
			return;
		default:
	}
	// The activation proof (the module's own composed line).
	Factory.Append(
		State,
		Activate([
			["strict", String(State.Strict)],
			["denyPatterns", String(State.Deny.length)],
			["allowPatterns", String(State.Allow.length)],
		]),
	);
	// The tools/pre-execute registration: the intercept (the plan's
	// trigger surface - the same pre-execute hook the family's mutation
	// gating uses for file writes). The guard judges the terminal commands
	// and refuses the git mutations. The event key and the decision type come
	// from @deepseek-ai/dsh-tools' own augmentation (never re-declared here);
	// the guard's refusal payload is returned VERBATIM - the cast is
	// type-level only and changes no runtime bytes.
	Context.on(
		"tools/pre-execute",
		(Payload: ToolExecution, Next: () => Promise<PreToolDecision>) =>
			Guard(State, Payload, Next) as Promise<PreToolDecision>,
	);
	// The test probe (live-containers precedent): apply returns NOTHING; the
	// state is exposed through the context attachment.
	(Context as unknown as Record<string, unknown>)["__pluginDshGitguardState"] = State;
};
