// State — the per-apply plugin state. Since the factory refactor it is the
// FACTORY'S shared shape (the shape Function/State of
// @playform/ets-plugin-dsh-factory builds, consumed by every factory primitive)
// extended with the pinner's own field:
//
//   Section — the dependency sections the pinner may rewrite (config
//             `sections`, copied by the State builder's `fields` map).
//
// The shared shape comes from the factory's NAMED type export (`State` —
// the v0.1.1 declaration fix: the built Target/Library.d.ts ships RELATIVE
// specifiers, so the extracted shared shape is the real one; the pre-fix
// `Parameters<Factory["Append"]>[0]` derivation — which every factory
// primitive takes the same state from — resolved through the aliased
// declaration to THIS file and circled; the named export is the restored,
// leak-proof extraction), so there is no duplicated interface to keep in
// sync: the pinner's State IS assignable to every factory parameter by
// construction. The
// instance itself is built by `Furnace.State(ctx, config, { module:
// "hook-dsh-pinner-package", fields: { Section: "sections" }, policyFileName:
// "pin-policy.json" })` (Function/Apply) — never returned from `apply` (the
// loader treats apply return values specially, a live-verified lesson);
// Function/Apply exposes it via a context attachment for test probes.
//
// The factory's collections (identical semantics to the pre-refactor pinner):
//
//   Stash    — targetKey → the version token we last processed (idempotence
//              gate for our own re-emits within the async window);
//   Inflight — targetKey → the abort controller of the detached pass, aborted
//              and cleared by the Attach effect on unload (P2);
//   Seams    — the probe-once cache of optional services;
//   Queue    — the pre-open journal queue (P5), drained when the optional
//              storage domain opens.
//
// The opaque identity types come from @deepseek-ai/dsh-fs via the factory's
// contract: `FsTargetKey` and `FsVersion` are branded strings the backend owns
// — the pinner stores and compares them but never parses or computes them
// (subsystems/filesystem.md).
//
// THE EFFECT DELTA (R4, mirroring the R3 governor pattern): the optional
// `Scope` field — the plugin's long-lived Effect `Scope.Closeable`, created
// once in Function/Apply (`Effect.runSync(Scope.make())` — apply is a sync
// seam). The PINNER HAS NO UPDATE STAGE: it never uses the core's typed-effect
// Update envelope (its only core imports are the plain composers Activate /
// Suppress / Refusal), so — unlike the governor — no `Scope.provide` call site
// consumes the field at runtime. It is kept for the family's uniform shape
// (every module's State carries the fiber home; a future Effect-native stage
// would provide it via `Scope.provide`), and it is OPTIONAL: a State built
// outside apply (a test sim State — the smoke's `factory.State(...)` probes)
// never dispatches anything, so the field stays undefined there with no effect
// on behavior. Not closed by the loader: the pinner's disposal semantics stay
// the Classic ones (the P2 Inflight abort, the factory's Attach effect).
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type { Scope } from "effect";

export default interface State extends Shared {
	/** Dependency sections the pinner may rewrite (config `sections`). */
	Section: string[];
	/** THE EFFECT DELTA (R4): the plugin's long-lived Effect `Scope` — the
	 *  family's uniform fiber home, created in Function/Apply. Unused at
	 *  runtime (the pinner has no typed-effect stage); optional so sim States
	 *  built outside apply stay valid. */
	Scope?: Scope.Closeable | undefined;
}
