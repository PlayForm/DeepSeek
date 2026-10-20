// Apply — the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger←logFile / Enabled←log and the module's own
// fields via the setup `fields` map — factory SCHEME.md §2.10), emit the
// durable activation proof (the module's own string, via Factory.Append —
// the factory never owns ledger strings), and register the fullwidth hook's
// OWN llm/stream listener.
//
// NOT factory machinery, deliberately:
//   * Factory.Wire is fs/observed-hardwired (the family's SILENCE) — the
//     fullwidth hook's normalization must be VISIBLE (it IS the feature), so
//     the registration here is the plain `ctx.on("llm/stream", …)` pattern,
//     fiber-owned, removed on unload, no manual bookkeeping.
//   * Factory.Attach (P1 jobs controller, P2 inflight disposal, P5 storage
//     domain) has no consumer here: the fullwidth hook runs no jobs and
//     holds no inflight continuations; its only journal traffic is the
//     stream count record — the `normalized` event of the shared governance
//     domain, journaled best-effort when the storage facility is present
//     (Function/Normalize; the human ledger stays the complete record).
//   * Factory.Schema is not used for Config: it hardcodes the family's
//     shared block (updateCooldownMs/mutationTools/policyFile/exclude —
//     fs/observed machinery the fullwidth hook has none of). The MODULE owns
//     its Config: Variable/Config.ts defines the fullwidth hook's own schema.
//
// The function returns NOTHING — never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified, plugin-development skill pitfall 16). Test probes
// read the state through the `ctx.__hookDshFullwidthState` attachment instead.
//
// `inject: ["pluginFactory"]` (Library.ts) — the factory is a REQUIRED
// service; the loader's PENDING state handles the ordering (the plugin loads
// only when the factory service exists), so bundle-layer order never
// matters. Nothing else is injected: the ledger append is the factory's own
// plain-fs exemption, and the chunk vocabulary arrives through the
// waterfall, not through an import.
import type { Context } from "@deepseek-ai/cordis";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/hook-dsh-core";

import Command, {
	type CommandsService,
	type ConfigEditorService,
	type SettingsService,
} from "./Command.js";
import Normalize from "./Normalize.js";
import Overpass from "./Overpass.js";
import StepBatch from "./StepBatch.js";

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the fullwidth hook's own
	// fields, copied from the (cell-unwrapped) validated config by the setup
	// map. A MAP flavor has NO replacement field: the substitution is the
	// core's Fullwidth table, not a configured knob.
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-normalize-fullwidth",
		fields: {
			Reasoning: "normalizeReasoning",
			ToolArgs: "normalizeToolArguments",
			// The granular scope gates + the tool-results exemption list —
			// volatile, refreshed in place by the factory's P10
			// loader/volatile-update listener (no remount, no new activation
			// line — which is why the activation line below reports only the
			// mount-time effective values).
			Scopes: "scopes",
			Exempt: "toolResultsExempt",
		},
	});
	State.Factory = Factory;

	// Durable activation proof — "did it activate" must be answerable from the
	// ledger alone. Format (asserted by the smoke):
	//   hook-dsh-normalize-fullwidth: activated (reasoning=on, toolArgs=off, logFile=…)
	// The line's string mechanics live in the core's Activate composer; the
	// FIELD LIST is the module's own — a MAP flavor has NO replacement field,
	// so the `replacement=` pair is simply absent from the list. The toolArgs
	// value is the EFFECTIVE gate (`normalizeToolArguments` OR
	// `scopes.toolInput` — the scope gate OR-ed in per the compatibility
	// decision); with the schema defaults the value is identical to the old
	// expression, so the line stays byte-identical. The scopes themselves are
	// NOT on the line.
	Factory.Append(
		State,
		Activate([
			["reasoning", State.Reasoning ? "on" : "off"],
			["toolArgs", State.ToolArgs || State.Scopes?.toolInput === true ? "on" : "off"],
			["logFile", State.Ledger],
		]),
	);

	// The fullwidth hook's own Wire: one llm/stream waterfall listener, owned
	// by the current fiber (removed on unload — no manual removeListener
	// bookkeeping, ever). The waterfall discipline:
	//   * next() is ALWAYS called, unconditionally, first — omitting it
	//     short-circuits the waterfall and the model call never happens;
	//   * options (the request, `_Request` — never read, NEVER touched) is a
	//     LOOP-built deep-frozen object whose content is a pure function of
	//     the session log: listeners read it, never rewrite it;
	//   * the returned wrapped iterable is what every downstream consumer
	//     (live UI and durable transcript) sees — the normalization is
	//     VISIBLE by construction.
	Context.on("llm/stream", (_Request, Next) => Normalize(Next(), State));

	// THE OVERPASS ARMS (the plan's §4, both opt-in by default): the
	// tools/post-execute arm (Function/Overpass — the tool-results scope,
	// PREPENDED: the family's bundle order places the CCR hook before the
	// normalize hooks, so the arm that prepends later is OUTERMOST and the
	// CCR gate compresses the NORMALIZED bytes; the CCR marker guard makes
	// any load order safe) and the agent/pre-step arm (Function/StepBatch —
	// the step-batch scope plus the one-shot `Overpass` flag armed by the
	// command below). Both are gated at RUNTIME on the volatile scope cells
	// (off -> the downstream decision passes untouched), so their listeners
	// must exist even while their scopes are off: a scope flipped on later
	// lands through the P10 volatile-refresh without any re-registration.
	Context.on("tools/post-execute", (Exec, Result, Next) => Overpass(Exec, Result, Next, State), {
		prepend: true,
	});
	Context.on("agent/pre-step", (Payload, Next) => StepBatch(Payload, Next, State));

	// THE HUMAN COMMAND (`normalize-overpass`, the plan's §5): registered
	// through the probe-once Seam (never the dead accessor — a missing
	// commands service simply skips the registration, the command is a
	// convenience not a requirement). Name lowercase without the leading
	// slash (the registry's rule); the grammar lives in Function/Command.
	const Commands = Factory.Seam(State, "commands") as CommandsService | undefined;
	if (Commands && typeof Commands.register === "function") {
		// The config-writing seams are probed the same way — the command's
		// `results on|off` path uses them when present and falls back to
		// reporting the settings-UI path when absent.
		const Settings = Factory.Seam(State, "settings") as SettingsService | undefined;
		const Editor = Factory.Seam(State, "configEditor") as ConfigEditorService | undefined;
		// The fail-open duplicate gate: the seven flavors share ONE global
		// command name, so the second and later mounts hit the registry's
		// "command ... is already registered" throw (the dsh-commands
		// NamedEntries insert). A duplicate is a harmless no-op (the first
		// flavor's definition serves the command) and ANY register failure is
		// fail-open (the command is a convenience, not a requirement): log
		// ONE ledger line and continue the mount - the stream listeners and
		// the tool registration below must still attach.
		try {
			Commands.register({
				name: "normalize-overpass",
				description:
					"Arm a one-shot overpass: 'files' <path…> | 'batch' | 'results on|off' | 'scopes'",
				handler: (Invocation) => Command(State, Invocation, Settings, Editor),
			});
		} catch (Issue) {
			Factory.Append(
				State,
				`command "normalize-overpass" registration skipped (the mount continues): ${
					Issue instanceof Error ? Issue.message : String(Issue)
				}`,
			);
		}
	}

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead (a bare `return State` is
	// avoided: loader behavior on apply return values is untrusted).
	(Context as { __hookDshFullwidthState?: State }).__hookDshFullwidthState = State;
};
