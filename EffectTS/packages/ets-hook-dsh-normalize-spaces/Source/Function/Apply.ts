// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger<-logFile / Enabled<-log and the module's own
// fields via the setup `fields` map - factory SCHEME.md §2.10), create the
// plugin's long-lived Effect Scope (THE EFFECT DELTA, R7a - see Interface/
// State), emit the durable activation proof (the module's own string, via
// Factory.Append - the factory never owns ledger strings), and register the
// spaces hook's OWN llm/stream listener.
//
// NOT factory machinery, deliberately:
//   * Factory.Wire is fs/observed-hardwired (the family's SILENCE) - the
//     spaces hook's normalization must be VISIBLE (it IS the feature), so
//     the registration here is the plain `ctx.on("llm/stream", ...)` pattern,
//     fiber-owned, removed on unload, no manual bookkeeping.
//   * Factory.Attach (P1 jobs controller, P2 inflight disposal, P5 storage
//     domain) has no consumer here: the spaces hook runs no jobs and holds no
//     inflight continuations; its only journal traffic is the stream count
//     record - the `normalized` event of the shared governance domain,
//     journaled best-effort when the storage facility is present
//     (Function/Normalize; the human ledger stays the complete record).
//   * Factory.Schema is not used for Config: it hardcodes the family's
//     shared block (updateCooldownMs/mutationTools/policyFile/exclude -
//     fs/observed machinery the spaces hook has none of). The MODULE owns
//     its Config: Variable/Config.ts defines the spaces hook's own schema.
//
// THE EFFECT DELTA (R7a) - THE REAL STREAM PIPELINE (boundary 1 of the plan):
// the llm/stream listener is now a three-adapter waterfall around the CORE's
// Gate transformer, using these exact Effect v4 APIs:
//
//   Stream.fromAsyncIterable(Next(), onError)
//     - the plain harness seam INTO the typed world: Next() is called
//       synchronously, exactly once, at listener invocation (the waterfall
//       discipline: omitting it short-circuits the model call), and the
//       async iterable is adapted lazily - the generator body only starts
//       running at the first pull. The `onError` handler is the identity
//       `(Error) => Error`, which keeps the failure value UNCHANGED: the
//       object form of the underlying adaptation carries the raw iterator
//       error as the stream's typed `E`, so an upstream throw propagates to
//       the consumer with its message intact (the smoke asserts
//       `transport boom` verbatim) instead of surfacing wrapped.
//   Gate(stream, Replace, Reasoning, ToolArgs, OnCount)
//     - the CORE's real Stream transformer (Stream/Gate): the per-chunk
//       dispatch (which chunk types, which fields, the identity
//       passthroughs, the reasoning gate, the three-way tool-args gate with
//       the edit exemption and the per-call `{"__normalize":false` raw
//       marker) lives there; this file supplies only the FLAVOR - the
//       Spaces-class transform pinned to the configured replacement (read
//       from State at chunk time, so a volatile hot-edit takes effect
//       mid-listener exactly like the Classic per-chunk read), the two gate
//       flags, and the count callback (Function/Normalize) for the
//       post-stream ledger line. The Gate is a `Stream.suspend` value:
//       per-stream state (count, current tool-call id, raw-marker flag) is
//       created fresh per materialization, never module-level.
//   Stream.toAsyncIterable(gated)
//     - back OUT to the plain seam: the listener returns the plain
//       `AsyncIterable<StreamChunk>` the waterfall contract requires. On a
//       failure the async iterator throws the squashed cause, which for a
//       typed fail is the original error object itself - so the consumer's
//       `for await` sees the upstream throw untouched.
//
// The pipeline holds NO services and NO scope: it is a pure value-level
// transform created fresh per stream (the listener runs per model call), so
// no `Scope.provide` call site consumes State.Scope here - the same posture
// as the pinner (R4), with the field kept for the family's uniform shape.
//
// The behavioral contract is UNCHANGED from the Classic async-generator
// wrapper: chunk order preserved (one in, one out, strictly sequential),
// no buffering (each upstream chunk is pulled, dispatched and emitted before
// the next pull), upstream throws propagate, the count summary runs only
// after a NORMAL completion, and every ledger string is byte-identical.
//
// The function returns NOTHING - never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified, plugin-development skill pitfall 16). Test probes
// read the state through the `ctx.__hookDshSpacesState` attachment instead.
//
// `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
// service; the loader's PENDING state handles the ordering (the plugin loads
// only when the factory service exists), so bundle-layer order never
// matters. Nothing else is injected: the ledger append is the factory's own
// plain-fs exemption, and the chunk vocabulary arrives through the
// waterfall, not through an import.
import { Effect, Scope, Stream } from "effect";
import Normalize from "./Normalize.js";
import Replace from "./Replace.js";
import { Activate, StreamGate as Gate } from "@playform/ets-base-dsh";
import Overpass from "./Overpass.js";
import StepBatch from "./StepBatch.js";
import Command, {
	type CommandsService,
	type ConfigEditorService,
	type SettingsService,
} from "./Command.js";
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

	// THE EFFECT DELTA (R7a, see Interface/State): the plugin's long-lived
	// Effect Scope - a synchronous `Scope.make` run through `Effect.runSync`
	// (apply is a sync seam; a sync `Scope.make` under runSync is fully
	// synchronous, so no async boundary is introduced). Unused at runtime by
	// this module (the Stream pipeline runs with no services and no scope);
	// kept for the family's uniform State shape.
	State.Scope = Effect.runSync(Scope.make());

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone. Format (asserted by the smoke):
	//   hook-dsh-normalize-spaces: activated (replacement= , reasoning=on, toolArgs=off, logFile=...)
	// The line's string mechanics live in the core's Activate composer; the
	// FIELD LIST is the module's own. The toolArgs value is the EFFECTIVE
	// gate (`normalizeToolArguments` OR `scopes.toolInput` — the scope gate
	// OR-ed in per the compatibility decision); with the schema defaults the
	// value is identical to the old expression, so the line stays
	// byte-identical. The scopes themselves are NOT on the line.
	Factory.Append(
		State,
		Activate([
			["replacement", State.Replacement],
			["reasoning", State.Reasoning ? "on" : "off"],
			["toolArgs", State.ToolArgs || State.Scopes?.toolInput === true ? "on" : "off"],
			["logFile", State.Ledger],
		]),
	);

	// The spaces hook's own Wire: one llm/stream waterfall listener, owned by
	// the current fiber (removed on unload - no manual removeListener
	// bookkeeping, ever). The waterfall discipline:
	//   * next() is ALWAYS called, unconditionally, first - omitting it
	//     short-circuits the waterfall and the model call never happens (the
	//     `Stream.fromAsyncIterable(Next(), ...)` argument list evaluates
	//     Next() synchronously at listener invocation, before any iteration);
	//   * options (the request, `_Request` - never read, NEVER touched) is a
	//     LOOP-built deep-frozen object whose content is a pure function of
	//     the session log: listeners read it, never rewrite it;
	//   * the returned wrapped iterable is what every downstream consumer
	//     (live UI and durable transcript) sees - the normalization is
	//     VISIBLE by construction.
	// The effective scope gates (the granular scope control, defaults = the
	// previous behavior): read per DISPATCH (the listener body), so a volatile
	// scope flip applies from the next stream. The fallback object covers a
	// hand-built config that omits `scopes` entirely.
	const SCOPES_DEFAULT = {
		conversation: true,
		reasoning: true,
		toolInput: false,
		toolResults: false,
		files: true,
		batch: false,
	};
	const ScopesOf = () => State.Scopes ?? SCOPES_DEFAULT;
	Context.on("llm/stream", (_Request, Next) =>
		Stream.toAsyncIterable(
			Gate(
				// The plain harness seam in: Next() called exactly once,
				// synchronously; the identity onError keeps the upstream error
				// object intact so the consumer's `for await` rethrows it verbatim.
				Stream.fromAsyncIterable(Next(), (Error) => Error),
				// The FLAVOR: the core's Spaces class pinned to the configured
				// replacement - read from State per chunk, so a volatile hot-edit
				// takes effect on the next chunk exactly like the Classic read.
				(Text) => Replace(Text, State.Replacement),
				// The reasoning gate: `normalizeReasoning` AND the scope sub-gate.
				State.Reasoning && ScopesOf().reasoning,
				// The tool-args gate: the deprecated field OR-ed with the scope.
				State.ToolArgs || ScopesOf().toolInput,
				// The post-stream ledger line (only when anything was replaced).
				Normalize(State),
				// The conversation scope gate (the text paths).
				ScopesOf().conversation,
			),
		),
	);

	// THE OVERPASS ARMS (the plan's §4, both opt-in by default): the
	// tools/post-execute arm (Function/Overpass — the tool-results scope,
	// PREPENDED: the family's bundle order places the ccr hook before the
	// normalize hooks, so the arm that prepends later is OUTERMOST and the
	// ccr gate compresses the NORMALIZED bytes; the ccr marker guard makes
	// any load order safe) and the agent/pre-step arm (Function/StepBatch —
	// the step-batch scope plus the one-shot `Overpass` flag armed by the
	// command below). Both are gated at RUNTIME on the volatile scope cells
	// (off -> the downstream decision passes untouched), so their listeners
	// must exist even while their scopes are off: a scope flipped on later
	// lands through the P10 volatile-refresh without any re-registration.
	//
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
	(Context as { __hookDshSpacesState?: State }).__hookDshSpacesState = State;
};
