// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended
// with the spaces hook's own fields.
//
// The shared half comes from the factory's NAMED type export (`State` - the
// factory v0.1.1 declaration fix): the built Target/Library.d.ts ships
// RELATIVE specifiers now, so a consumer's tsconfig paths never hijack the
// declaration imports, and the extracted shared shape is the real one (the
// factory runtime object always carried the full shared machinery:
// Tool/Policy/PolicyName/List/Stash/Inflight/Subprocess/Seams/Queue/Journal,
// all inert here - the spaces hook is not an fs/observed module - and the
// TYPE says so too).
//
// The spaces hook's own fields:
//
//   Replacement - the space replacement (config `replacement`, volatile -
//                 the transform's only knob; default the ASCII space);
//   Reasoning   - normalize reasoning deltas/assembled blocks too (config
//                 `normalizeReasoning`);
//   ToolArgs    - normalize tool-call arguments too (config
//                 `normalizeToolArguments`; IMPLEMENTED - schema default
//                 OFF, this profile's patch yml enables it);
//   Factory     - the injected factory service itself, consumed by the count
//                 callback (the post-stream ledger line) - assigned once in
//                 Function/Apply, never a module-level global, so HMR
//                 reloads rebind it cleanly.
//
// THE EFFECT DELTA (R7a, mirroring the R4 pinner pattern): the optional
// `Scope` field - the plugin's long-lived Effect `Scope.Closeable`, created
// once in Function/Apply (`Effect.runSync(Scope.make())` - apply is a sync
// seam, and a sync `Scope.make` run through `Effect.runSync` is fully
// synchronous, so no async boundary is introduced). The SPACES FLAVOR'S
// typed-effect stage is the STREAM PIPELINE itself (the llm/stream listener's
// `Stream.fromAsyncIterable -> Gate -> Stream.toAsyncIterable` waterfall), but
// that pipeline runs with NO services and NO scope of its own - it is a pure
// value-level transform, created fresh per stream - so, like the pinner, no
// `Scope.provide` call site consumes the field at runtime. It is kept for the
// family's uniform State shape (every module's State carries the fiber home;
// a future Effect-native stage - e.g. a scope-finite per-stream listener that
// tears down per-stream resources on stream end - would provide it via
// `Scope.provide`), and it is OPTIONAL: a State built outside apply (a test
// sim State) never dispatches anything, so the field stays undefined there
// with no effect on behavior. Not closed by the loader: the spaces hook's
// disposal semantics stay the Classic ones (the fiber-owned `ctx.on`
// listener, removed on unload; the per-stream pipeline holds no resources of
// its own - the upstream iterator's `return` finalizer is owned by the
// stream's own Channel scope).
//
// Test probes read the state through the `ctx.__hookDshSpacesState` attachment
// (never a return value from `apply` - the loader treats apply returns
// specially, a live-verified lesson recorded in the plugin-development
// skill).
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scope } from "effect";

export default interface State extends Shared {
	/** The space replacement - the transform's only knob (config `replacement`). */
	Replacement: string;
	/** Normalize reasoning deltas and the assembled reasoning block too. */
	Reasoning: boolean;
	/** Normalize tool-call arguments too (config `normalizeToolArguments`;
	 *  schema default OFF - this profile's patch yml enables it). */
	ToolArgs: boolean;
	/** The injected @playform/plugin-dsh-factory service - the ledger
	 *  (Factory.Append) is consumed through it; assigned once in
	 *  Function/Apply. */
	Factory: Factory;
	/** THE EFFECT DELTA (R7a): the plugin's long-lived Effect `Scope` - the
	 *  family's uniform fiber home, created in Function/Apply. Unused at
	 *  runtime (the Stream pipeline runs with no services and no scope);
	 *  optional so sim States built outside apply stay valid. */
	Scope?: Scope.Closeable | undefined;
}
