// Apply — the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger←logFile / Enabled←log and the module's own
// fields via the setup `fields` map — factory SCHEME.md §2.10), emit the
// durable activation proof (the module's own string, via Factory.Append —
// the factory never owns ledger strings), and register the spaces hook's
// OWN llm/stream listener.
//
// NOT factory machinery, deliberately:
//   * Factory.Wire is fs/observed-hardwired (the family's SILENCE) — the
//     spaces hook's normalization must be VISIBLE (it IS the feature), so
//     the registration here is the plain `ctx.on("llm/stream", …)` pattern,
//     fiber-owned, removed on unload, no manual bookkeeping.
//   * Factory.Attach (P1 jobs controller, P2 inflight disposal, P5 storage
//     domain) has no consumer here: the spaces hook runs no jobs and holds no
//     inflight continuations; its only journal traffic is the stream count
//     record — the `normalized` event of the shared governance domain,
//     journaled best-effort when the storage facility is present
//     (Function/Normalize; the human ledger stays the complete record).
//   * Factory.Schema is not used for Config: it hardcodes the family's
//     shared block (updateCooldownMs/mutationTools/policyFile/exclude —
//     fs/observed machinery the spaces hook has none of). The MODULE owns
//     its Config: Variable/Config.ts defines the spaces hook's own schema.
//
// The function returns NOTHING — never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified, plugin-development skill pitfall 16). Test probes
// read the state through the `ctx.__hookDshSpacesState` attachment instead.
//
// `inject: ["pluginFactory"]` (Library.ts) — the factory is a REQUIRED
// service; the loader's PENDING state handles the ordering (the plugin loads
// only when the factory service exists), so bundle-layer order never
// matters. Nothing else is injected: the ledger append is the factory's own
// plain-fs exemption, and the chunk vocabulary arrives through the
// waterfall, not through an import.
import Normalize from "./Normalize.js";
import { Activate } from "@playform/hook-dsh-core";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the spaces hook's own
	// fields, copied from the (cell-unwrapped) validated config by the setup
	// map.
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-normalize-spaces",
		fields: {
			Replacement: "replacement",
			Reasoning: "normalizeReasoning",
			ToolArgs: "normalizeToolArguments",
		},
	});
	State.Factory = Factory;

	// Durable activation proof — "did it activate" must be answerable from the
	// ledger alone. Format (asserted by the smoke):
	//   hook-dsh-normalize-spaces: activated (replacement= , reasoning=on, toolArgs=off, logFile=…)
	// The line's string mechanics live in the core's Activate composer; the
	// FIELD LIST is the module's own.
	Factory.Append(
		State,
		Activate([
			["replacement", State.Replacement],
			["reasoning", State.Reasoning ? "on" : "off"],
			["toolArgs", State.ToolArgs ? "on" : "off"],
			["logFile", State.Ledger],
		]),
	);

	// The spaces hook's own Wire: one llm/stream waterfall listener, owned by
	// the current fiber (removed on unload — no manual removeListener
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

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead (a bare `return State` is
	// avoided: loader behavior on apply return values is untrusted).
	(Context as { __hookDshSpacesState?: State }).__hookDshSpacesState = State;
};
