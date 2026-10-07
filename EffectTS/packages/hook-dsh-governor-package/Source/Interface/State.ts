// State — the per-apply plugin state: the FACTORY'S shared shape (built by
// `Factory.State(ctx, config, { … })` — SCHEME.md §1/§2.10) extended with the
// governor's own fields. The shared half comes from the factory's NAMED type
// export (`State` — the factory v0.1.1 declaration fix: the built
// Target/Library.d.ts ships RELATIVE specifiers, so a consumer's tsconfig
// paths never hijack the declaration imports, and the extracted shared shape
// is the real one — the leak-era structural mirror is gone).
//
// The factory builds Context/Module/Tool/Policy/PolicyName/Ledger/Enabled/
// List, the Stash (idempotence gate), Inflight (P2 disposal), the probe-once
// Seams cache with the P9 subprocess probe, and the P5 pre-open journal
// queue. The governor's own half (the `fields` map of the State setup + the
// built collections):
//
//   Strict  — strict chain pass (strip unknown deps in a governed workspace);
//   Wait    — cooldown between update-stage dispatches, per directory;
//   Limit   — circuit breaker: consecutive update-stage failures before pause;
//   Binary  — ncu binary for bin mode (binary name or absolute path);
//   Mode    — update stage: "programmatic" (ncu library) or "bin";
//   Stamp   — directory → epoch ms of the last update-stage dispatch;
//   Set     — directories with an update run in flight;
//   Count   — directory → consecutive update-stage failures (the breaker);
//   Factory — the injected factory service itself, consumed by every module
//             (built once in Function/Apply — never a module-level global,
//             so HMR reloads rebind it cleanly).
//
// The opaque identity types come from @deepseek-ai/dsh-fs: `FsTargetKey` and
// `FsVersion` are branded strings the backend owns — the factory stores and
// compares them but never parses or computes them
// (subsystems/filesystem.md). Test probes read the state through the
// `ctx.__hookDshGovernorPackageState` attachment (never a return value from `apply` — the
// loader treats apply returns specially, a live-verified lesson).
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scope } from "effect";
import type Factory from "@Interface/Factory.js";

export default interface State extends Shared {
	/** Strict chain pass: strip unknown deps in a governed workspace. */
	Strict: boolean;
	/** Cooldown between update-stage dispatches, per directory (epoch ms). */
	Wait: number;
	/** Circuit breaker: consecutive update-stage failures per directory. */
	Limit: number;
	/** ncu binary for bin mode (binary name or absolute path — resolved via
	 *  the host PATH). */
	Binary: string;
	/** Update stage mode: "programmatic" (ncu library in-process) or "bin". */
	Mode: string;
	/** Directory → epoch ms of the last update-stage dispatch (cooldown). */
	Stamp: Map<string, number>;
	/** Directories with an update run in flight. */
	Set: Set<string>;
	/** Directory → consecutive update-stage failures (circuit breaker). */
	Count: Map<string, number>;
	/** The injected @playform/plugin-dsh-factory service — every absorbed
	 *  primitive (Append/Journal/Gate/Discover/Parse/Continue/Refresh) is
	 *  consumed through it; assigned once in Function/Apply. */
	Factory: Factory;
	/** THE EFFECT DELTA (register #13, R3): the plugin's long-lived Effect
	 *  `Scope` — the fiber home of the CORE's typed-effect update envelope.
	 *  The envelope's `Dispatch: Effect<void, never, Scope.Scope>` requires
	 *  the CALLER's Scope in its environment: the module provides this one
	 *  (`Scope.provide`), so the detached fallback continuation is forked
	 *  INTO it (`Effect.forkIn` — the fiber is interrupted if the scope ever
	 *  closes, the interruption aborting the task-owned controller) and the
	 *  `dsh.update.dispatch` span runs under it. Created once in
	 *  Function/Apply (a synchronous `Scope.make` — apply is a sync seam);
	 *  Function/Dispatch lazily creates it defensively if a State arrives
	 *  without one (the smoke's sim States never dispatch, so the normal
	 *  path is always the apply-created scope). Not closed by the loader —
	 *  the Classic disposal semantics are preserved through the P2 Inflight
	 *  abort (the factory's Attach effect), which kills the child stages via
	 *  the task-owned signal; the scope-closing interruption is the
	 *  additional Effect-native lever. Optional: a State built without
	 *  apply (a test sim State) dispatches through the lazily-created one. */
	Scope?: Scope.Closeable | undefined;
}
