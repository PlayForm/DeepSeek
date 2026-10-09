// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended
// with the file-content normalizer's own fields.
//
// The shared half comes from the factory's NAMED type export (`State` - the
// factory v0.1.1 declaration fix): the built Target/Library.d.ts ships
// RELATIVE specifiers now, so a consumer's tsconfig paths never hijack the
// declaration imports, and the extracted shared shape is the real one (the
// factory runtime object always carried the full shared machinery:
// Tool/Policy/PolicyName/List/Stash/Inflight/Subprocess/Seams/Queue/Journal,
// all inert here - the file-content normalizer is not an fs/observed module -
// and the TYPE says so too).
//
// The normalizer's own fields:
//
//   Replacement - the dash replacement (config `replacement`, volatile -
//                 the transform's only knob);
//   Factory     - the injected factory service itself, consumed by the tool
//                 (the ledger Append, the Journal record and the ONE shared
//                 write executor `Factory.Write` are consumed through it) -
//                 assigned once in Function/Apply, never a module-level
//                 global, so HMR reloads rebind it cleanly.
//
// There are NO Reasoning/ToolArgs fields: the tool registers NO event
// listener (the family's first listener-less flavor), so there is no stream
// dispatch to gate - the six-fold chain is applied whole, at write time.
//
// Test probes read the state through the `ctx.__hookDshNormalizeFileState`
// attachment (never a return value from `apply` - the loader treats apply
// returns specially, a live-verified lesson recorded in the plugin-development
// skill).
//
// THE EFFECT DELTA (R6, mirroring the R4 pinner pattern): the optional
// `Scope` field - the plugin's long-lived Effect `Scope.Closeable`, created
// once in Function/Apply (`Effect.runSync(Scope.make())` - apply is a sync
// seam). THE NORMALIZER HAS NO TYPED-EFFECT STAGE: it registers no event
// listener (the family's first listener-less flavor) and its whole behavior
// is the tool's exec (Function/Normalize), which stays shell-consumer code -
// so no `Scope.provide` call site consumes the field at runtime. It is kept
// for the family's uniform shape (every module's State carries the fiber
// home; a future Effect-native stage would provide it via `Scope.provide`),
// and it is OPTIONAL: a State built outside apply never dispatches anything,
// so the field stays undefined there with no effect on behavior. Not closed
// by the loader: the normalizer's disposal semantics stay the Classic ones
// (the tool unregisters with the plugin's fiber; the Scope holds nothing).
import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type { Scope } from "effect";

export default interface State extends Shared {
	/** The dash replacement - the transform's only knob (config `replacement`). */
	Replacement: string;
	/** The injected @playform/ets-plugin-dsh-factory service - the ledger
	 *  (Factory.Append), the P5 journal (Factory.Journal) and the ONE shared
	 *  write executor (Factory.Write) are consumed through it; assigned once in
	 *  Function/Apply. */
	Factory: Factory;
	/** THE EFFECT DELTA (R6): the plugin's long-lived Effect `Scope` - the
	 *  family's uniform fiber home, created in Function/Apply. Unused at
	 *  runtime (the normalizer has no typed-effect stage); optional so States
	 *  built outside apply stay valid. */
	Scope?: Scope.Closeable | undefined;
}
