// Govern - the DIRECT-GOVERN SERVICE (Source/Service/Govern.ts): the
// `Context.Service` behind the Library's `Govern` method. The sequential
// fold (the raw-write tool's post-write call) re-expressed as a typed
// effect over the Function/Govern.ts body, wrapped in the `dsh.govern` root
// span (target + basename as read-only attributes) with one
// `dsh.govern.step` child span per step.
//
// THE #14 PARALLEL MARKER, designed in from the start (the plan's single
// switch): the Selection gains an OBJECT FORM alongside the legacy
// boolean/string/array form - `{ steps, parallel }`. Implementation:
//   * sequential (the DEFAULT, the live-verified race fix):
//     `Effect.forEach(steps, run, { concurrency: 1, discard: true })` -
//     each step's chain completes before the next step reads the file, so
//     the version-guarded writes can never race (unchanged semantics);
//   * parallel (opt-in, `{ steps, parallel: true }`):
//     `Effect.all(steps.map(run), { concurrency: "unbounded", mode:
//     "default", discard: true })` - Effect's fiber scheduling replaces
//     `Promise.all`. Documented safety condition (unchanged from #14):
//     disjoint targets only; same-file steps race.
// Every step keeps its own contained error (`Effect.exit` per step - the
// family's silence invariant), so a throwing step never propagates and
// later steps still run, in both modes.
import { Context, Effect, Layer } from "effect";
import { basename as Base } from "node:path";
import GovernFn from "../Function/Govern.js";
import type { Registry, Selection } from "../Function/Govern.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

// Govern - the service tag.
export class Govern extends Context.Service<
	Govern,
	{
		/** The direct-govern entry: resolve the registered steps for the
		 *  target's basename, filter by the selection, run each contained - the
		 *  sequential fold by default, the #14 parallel marker opt-in. */
		run(
			Steps: Registry,
			Target: FsTarget,
			Selection: Selection,
			Actor: object | undefined,
			Version: FsVersion,
		): Effect.Effect<void>;
	}
>()("dsh.factory.Govern") {}

// The service implementation: `Layer.succeed` over the stateless fold (the
// registry is passed per call - it lives on the shell instance).
export const layer = (): Layer.Layer<Govern> =>
	Layer.succeed(Govern, {
		run: (Steps, Target, Selection, Actor, Version) =>
			GovernFn(Steps, Target, Selection, Actor, Version).pipe(
				Effect.withSpan("dsh.govern", {
					attributes: {
						target: Target.displayPath,
						basename: Base(Target.displayPath),
					},
				}),
			),
	});
