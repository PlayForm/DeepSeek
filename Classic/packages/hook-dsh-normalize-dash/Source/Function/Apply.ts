// Apply — the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger←logFile / Enabled←log and the module's own
// fields via the setup `fields` map — factory SCHEME.md §2.10), emit the
// durable activation proof (the module's own string, via Factory.Append —
// the factory never owns ledger strings), register the hook-dsh-normalize-dash's OWN
// llm/stream listener, and register the family's `raw-write` TOOL (the
// plugin-registered write wrapper with the explicit `normalize` parameter —
// the tool is exempt from the stream normalization by name, so its content
// decisions happen at execution time, Function/Write).
//
// NOT factory machinery, deliberately:
//   * Factory.Wire is fs/observed-hardwired (the family's SILENCE) — the
//     hook-dsh-normalize-dash's normalization must be VISIBLE (it IS the feature), so the
//     registration here is the plain `ctx.on("llm/stream", …)` pattern,
//     fiber-owned, removed on unload, no manual bookkeeping.
//   * Factory.Attach (P1 jobs controller, P2 inflight disposal, P5 storage
//     domain) has no consumer here: the hook-dsh-normalize-dash runs no jobs and holds no
//     inflight continuations; its only journal traffic is the stream count
//     record — the `normalized` event of the shared governance domain,
//     journaled best-effort when the storage facility is present
//     (Function/Normalize; the human ledger stays the complete record).
//   * Factory.Schema is not used for Config: it hardcodes the family's
//     shared block (updateCooldownMs/mutationTools/policyFile/exclude —
//     fs/observed machinery the hook-dsh-normalize-dash has none of). The MODULE owns its
//     Config: Variable/Config.ts defines the hook-dsh-normalize-dash's own schema.
//
// The function returns NOTHING — never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified, plugin-development skill pitfall 16). Test probes
// read the state through the `ctx.__hookDshNormalizeDashState` attachment instead.
//
// `inject: ["pluginFactory", "fs", "tools"]` (Library.ts) — the factory is a
// REQUIRED service; the loader's PENDING state handles the ordering (the
// plugin loads only when every injected service exists), so bundle-layer
// order never matters. `fs` + `tools` serve the raw-write tool (the tool
// registry receives the definition; the fs service carries the write path
// and the fs/observed emit — the fs VOCABULARY (FsTarget/FsWriteOutcome, the
// fs/write-intent and fs/observed events) arrives type-only through the
// factory's own declarations, which import @deepseek-ai/dsh-fs). Nothing
// else is injected: the ledger append is the factory's own plain-fs
// exemption, and the chunk vocabulary arrives through the waterfall, not
// through an import.
import Normalize from "./Normalize.js";
import Write from "./Write.js";
import { Activate } from "@playform/hook-dsh-core";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the hook-dsh-normalize-dash's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-normalize-dash",
		fields: {
			Replacement: "replacement",
			Reasoning: "normalizeReasoning",
			ToolArgs: "normalizeToolArguments",
		},
	});
	State.Factory = Factory;

	// Durable activation proof — "did it activate" must be answerable from the
	// ledger alone. Format (asserted by the smoke):
	//   hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=…)
	// The line's string mechanics (the `activated (` prefix, the `k=v` join,
	// the `)` suffix) live in the core's Activate composer; the FIELD LIST is
	// the module's own (the replacement-less flavors just omit the pair).
	Factory.Append(
		State,
		Activate([
			["replacement", State.Replacement],
			["reasoning", State.Reasoning ? "on" : "off"],
			["toolArgs", State.ToolArgs ? "on" : "off"],
			["logFile", State.Ledger],
		]),
	);

	// The hook-dsh-normalize-dash's own Wire: one llm/stream waterfall listener, owned by the
	// current fiber (removed on unload — no manual removeListener
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

	// The family's raw-write TOOL: the definition is built (never mutated
	// after registration — the registration is READONLY per the skill) and
	// registered on the same fiber as the Wire, so unloading the plugin
	// unregisters the tool with it. The tool's exec does its own fs work
	// (Function/Write mirrors the built-in write's fs path: resolve →
	// fs/write-intent → writeText → fs/observed) — this file only registers.
	Context.tools.register(Write(Context, State));

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead (a bare `return State` is
	// avoided: loader behavior on apply return values is untrusted).
	(Context as { __hookDshNormalizeDashState?: State }).__hookDshNormalizeDashState = State;
};
