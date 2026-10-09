// State — the per-apply plugin state (CARGO MODULE), built once by the
// FACTORY's State builder (`ctx.pluginFactory.State(ctx, config, setup)` —
// Function/Apply) and probed by tests through the `ctx.__cargoGovernorState`
// attachment (never returned from `apply` — the loader treats apply return
// values specially, a live-verified lesson).
//
// THE SHAPE: the factory's shared State (its named type export `State` —
// the v0.1.1 declaration fix: the built Target/Library.d.ts ships RELATIVE
// specifiers, so the extracted shared shape is the real one and the
// leak-era STRUCTURAL MIRROR is gone) plus the module's own fields.
//
// The shared machinery collections implement loop control by construction:
//
//   Stash    — targetKey → the version token we last processed (the
//              idempotence gate for our own re-emits within the async window;
//              seeded by the factory's GuardedWrite / Refresh);
//   Inflight — targetKey → the abort controller of the detached work in
//              flight (P2: aborted and cleared by the factory's Attach effect
//              when the plugin unloads; the factory's Continue registers the
//              chain pass's controller under the PLAIN key, Dispatch the
//              update run's under the namespaced State.Factory.UpdateKey);
//   Seams    — the probe-once cache of optional services (the factory's
//              Function/Seam — the "subprocess" seam is probed ONCE at State
//              build time through it);
//   Queue    — the pre-open journal queue (the P5 storage sink, capped and
//              drained by the factory's Open).
//
// The opaque identity types come from @deepseek-ai/dsh-fs: `FsTargetKey` and
// `FsVersion` are branded strings the backend owns — the governor stores and
// compares them but never parses or computes them (subsystems/filesystem.md).
import type { Scope } from "effect";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";

export default interface State extends Shared {
	// ── the cargo module's own fields ────────────────────────────────────────
	/** The injected @playform/ets-plugin-dsh-factory service (the P2 UpdateKey
	 *  helper and the ledger/journal delegates; assigned once in
	 *  Function/Apply — the governor-family pattern). */
	Factory: PluginFactory;
	/** Cooldown between update-stage dispatches, per directory (epoch ms). */
	Wait: number;
	/** Circuit breaker: consecutive failures per directory before pause. */
	Limit: number;
	/** cargo binary (bare name or absolute path). */
	CargoBin: string;
	/** Global pin-policy.json (the keep-list of the full-version normalization
	 *  directive); "" means discovery + built-in empty default. Merged into the
	 *  factory-supplied union keep-list by the transform. */
	KeepFile: string;
	/** Strict chain pass: strip unknown deps in a governed workspace. */
	Strict: boolean;
	/** Update stage mode — "cargo" (the only implemented mode). */
	Mode: string;
	/** Directory → epoch ms of the last update-stage dispatch (cooldown). */
	Stamp: Map<string, number>;
	/** Directories with an update run in flight. */
	Set: Set<string>;
	/** Directory → consecutive update-stage failures (circuit breaker). */
	Count: Map<string, number>;
	/** The module's `Section` state field (the factory's Continue hands it to
	 *  the transform as the `section` argument). The cargo module maps config
	 *  key "sections", which the cargo config does not define — the field is
	 *  inert here (the identified dependency tables come from Variable/Section
	 *  plus the dynamic target walk, Function/Decode). */
	Section?: string[] | undefined;
	/** The module's `PinStyle` state field (mapped from config key "pinStyle",
	 *  which the cargo config does not define — the chain pass's canonical form
	 *  is policy-file-driven: `update-policy.json`'s `pinStyle`, "caret"
	 *  fallback). Inert here; kept for the State-builder contract. */
	PinStyle?: string | undefined;
	/** THE EFFECT DELTA (register #13, R5, mirroring the R3 governor
	 *  pattern): the plugin's long-lived Effect `Scope` — the fiber home of
	 *  the CORE's typed-effect update envelope. The envelope's `Dispatch:
	 *  Effect<void, never, Scope.Scope>` requires the CALLER's Scope in its
	 *  environment: the module provides this one (`Scope.provide`), so the
	 *  detached fallback continuation is forked INTO it (`Effect.forkIn` —
	 *  the fiber is interrupted if the scope ever closes, the interruption
	 *  aborting the task-owned controller) and the `dsh.update.dispatch` span
	 *  runs under it. Created once in Function/Apply (a synchronous
	 *  `Scope.make` — apply is a sync seam); Function/Dispatch lazily creates
	 *  it defensively if a State arrives without one (a State built outside
	 *  apply never dispatches in production). Not closed by the loader — the
	 *  Classic disposal semantics are preserved through the P2 Inflight abort
	 *  (the factory's Attach effect), which kills the child stages via the
	 *  task-owned signal; the scope-closing interruption is the additional
	 *  Effect-native lever. Optional: a State built without apply (a test sim
	 *  State) dispatches through the lazily-created one. */
	Scope?: Scope.Closeable | undefined;
}
