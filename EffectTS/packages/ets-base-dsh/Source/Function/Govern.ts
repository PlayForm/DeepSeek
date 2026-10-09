// Govern - the direct-govern entry (Function/Govern in the service API, the
// factory's raw-write companion): the registered steps for the target's
// basename, filtered by the caller's selection and run in REGISTERED order,
// each step CONTAINED (`Effect.exit` per step - the family's silence
// invariant: never throws, never affects the caller, so a failing step can
// never turn a successful write into a tool error).
//
// THE SEQUENTIAL FOLD (v0.2.1), re-expressed as `Effect.forEach(...,
// { concurrency: 1, discard: true })`: the steps run one at a time - each
// step's chain completes (its guarded write + its ledger line) BEFORE the
// next step reads the file, so the compositional loop is deterministic: with
// several steps registered for one basename (e.g. the governor's
// canonicalize + update), the later step always reads the file as the
// earlier step left it, and the version-guarded `replaceIfVersion` writes
// can never race each other (the pre-fold detached/concurrent version let
// the chains race - the first write won, later ones failed
// FS_STALE_VERSION, and the file's final state plus the ledger lines were
// nondeterministic). The async signature is why the raw-write exec awaits
// the Govern call: the tool's result returns AFTER the fold completes.
//
// THE #14 PARALLEL MARKER (designed in from the start, the service's
// documented toggle): the Selection gains an OBJECT FORM alongside the
// legacy boolean/string/array form - `{ steps, parallel }`. The marker is a
// single switch here:
//   * sequential (the DEFAULT - the live-verified race fix; no parallel
//     hooks exist in the Classic code): `Effect.forEach(steps, run,
//     { concurrency: 1, discard: true })`;
//   * parallel (opt-in only): `Effect.all(steps.map(run), { concurrency:
//     "unbounded", mode: "default", discard: true })` - Effect's fiber
//     scheduling replaces `Promise.all`. Documented safety condition
//     (unchanged from #14): disjoint targets only; same-file steps race.
// In BOTH modes every step keeps its own contained error: a throwing run
// never propagates, and the steps after a throwing one still run.
//
// The registry is the SharedJournal pattern at the instance level: the
// governance modules register their steps at apply time
// (`RegisterGovern(basename, name, run)` - Library.ts), and each run closure
// captures its own State, so every ledger string stays the MODULE'S OWN,
// byte-identical (the factory never owns ledger strings). One basename maps
// to one ordered step list; unknown steps in a selection match nothing and
// are ignored by construction.
//
// Selection semantics (the per-call `govern` flag the raw-write tool passes):
//   * `true` or `"all"`   - every registered step for the basename;
//   * an array of names (or a single name) - ONLY the named steps, in the
//     registered order;
//   * `{ steps, parallel }` - the marker form: the inner selection resolved
//     exactly as above, `parallel: true` switching the fold to unbounded;
//   * `false`, `null` or absent - no governance at all (the escape hatch;
//     the raw-write tool omits the Govern call entirely for these).
import { Effect } from "effect";
import { basename as Base } from "node:path";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

/** One registered step: the module's name plus its run closure. The closure
 *  captures the module's own State (built in that module's apply), so the
 *  chain pass, the update stage and every ledger line stay module-owned. The
 *  run may return a promise (the sequential fold awaits it - the step's
 *  chain completes before the next step starts) or nothing (a synchronous
 *  step). */
export interface Step {
	name: string;
	run: (Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
}

/** The registry: basename → the registered steps in registration order. */
export type Registry = { [basename: string]: Step[] };

/** The selection: `true`/`"all"` = every registered step; an array (or a
 *  single name) = only the named steps; the #14 marker form `{ steps,
 *  parallel }` = the inner selection with the fold's concurrency switched;
 *  `false`/`null`/absent = none. */
export type Selection =
	| boolean
	| string
	| string[]
	| null
	| undefined
	| { steps: boolean | string | string[] | null | undefined; parallel?: boolean };

export default (
	Steps: Registry,
	Target: FsTarget,
	Select: Selection,
	Actor: object | undefined,
	Version: FsVersion,
): Effect.Effect<void> =>
	Effect.gen(function* () {
		// The #14 marker form: unwrap `{ steps, parallel }` (everything else is
		// resolved as before). The default stays sequential.
		let Inner: Selection = Select;
		let Parallel = false;
		switch (true) {
			case !!Select && typeof Select === "object" && !Array.isArray(Select): {
				const Marker = Select as { steps: Selection; parallel?: boolean };
				Parallel = Marker.parallel === true;
				Inner = Marker.steps;
				break;
			}
		}
		// The registered steps for the target's basename (none for a basename no
		// module claimed - the factory's registry is empty in the raw-write
		// smoke's posture, and `govern` is a contained no-op there).
		const Listed = Steps[Base(Target.displayPath)] ?? [];
		// Resolve the selection to the set of step names to run; `null` means
		// "all registered steps" (the filter below lets everything through).
		let Chosen: Set<string> | null;
		switch (true) {
			case Inner === true || Inner === "all":
				Chosen = null; // every registered step
				break;
			case Array.isArray(Inner):
				Chosen = new Set(Inner as string[]);
				break;
			case typeof Inner === "string" && Inner.length > 0:
				Chosen = new Set([Inner as string]);
				break;
			default:
				return; // false / null / absent - the designed no-op
		}
		// Registered order, one contained run per step (`Effect.exit` - the
		// family's silence invariant), the fold's concurrency switched by the
		// #14 marker: sequential by default, unbounded opt-in.
		const Run = (Step: Step) =>
			Effect.asVoid(
				Effect.exit(
					Effect.tryPromise<void, unknown>({
						try: async () => Step.run(Target, Actor, Version),
						catch: (error) => error,
					}).pipe(
						Effect.withSpan("dsh.govern.step", {
							attributes: { step: Step.name },
						}),
					),
				),
			);
		yield* Parallel
			? Effect.all(
					Listed.filter((Step) => Chosen === null || Chosen.has(Step.name)).map(Run),
					{
						concurrency: "unbounded",
						mode: "default",
						discard: true,
					},
				)
			: Effect.forEach(
					Listed.filter((Step) => Chosen === null || Chosen.has(Step.name)),
					Run,
					{ concurrency: 1, discard: true },
				);
	});
