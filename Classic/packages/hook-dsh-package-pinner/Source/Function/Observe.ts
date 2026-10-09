// Observe — the fs/observed listener body, THIN over the factory service.
// The critical path stays AWAIT-FREE and THROW-FREE (a throw inside an
// fs/observed listener fails the tool call AFTER the mutation already
// succeeded): the synchronous gate and discovery run inline, and the API-aware
// stage (g3) runs as the factory's DETACHED contained continuation —
// ctx.fs.readText/writeText are async by contract (subsystems/filesystem.md),
// and the listener must never await.
//
//   g1 — the factory's Gate (the trio's exact gate set: displayPath →
//        mutation-tool actor → kind "present" → Stash idempotence → basename
//        → exclusion-first). The gate LOGS NOTHING: the module composes its
//        own ledger lines — the only outcome it cares about is `excluded`.
//   g2 — policy context: the nearest registry.json walk-up (the factory's
//        Discover, an exempt plain-fs probe) exists ONLY as a location for
//        the co-operated pin-policy.json (the factory's ResolvePolicy inside
//        Continue); it feeds the Continue call directly. The idempotence
//        token is seeded right before detaching — the factory's
//        GuardedWrite/Refresh refresh it later.
//   g3 — the handoff: factory.Continue registers the pass's abort controller
//        (P2), reads the manifest through ctx.fs.readText, resolves the union
//        keep-list (with the P3 chain-keys interlock), and calls the MODULE'S
//        transform (Function/Transform — the range law).
import type Factory from "@playform/dsh-plugin-factory";
import type State from "@Interface/State.js";
import Transform from "./Transform.js";
import { Suppress } from "@playform/hook-dsh-core";
import type { FsTarget, FsObservation, FsVersion } from "@deepseek-ai/dsh-fs";
import { dirname as Parent } from "node:path";

export default (
	Furnace: Factory,
	State: State,
	Target: FsTarget,
	Observation: FsObservation,
	Actor: object | undefined,
): void => {
	try {
		// g1 — the factory gate (logs nothing; the module composes its lines).
		const Verdict = Furnace.Gate(State, Target, Observation, Actor, {
			basename: "package.json",
		});
		switch (true) {
			case Verdict.reason === "excluded": // exclusion-first: internals are never pinned
				Furnace.Append(State, `skipped (excluded) ${Verdict.path}`);
				return;
			case !Verdict.pass:
				return;
		}
		const Path = Verdict.path as string;
		// The factory gate passed ⇒ kind === "present" (it would have failed as
		// "kind" otherwise); the discriminated union is narrowed here for the
		// version accesses below.
		const Present = Observation as { kind: "present"; version: FsVersion };
		const Dir = Parent(Path);

		// Idempotence gate BEFORE detaching: our own re-emits within the async
		// window hit this and are skipped.
		State.Stash.set(Target.targetKey, Present.version);

		// g2+g3 — detached, contained, await-free on the listener path: the g2
		// registry walk-up (the factory's Discover, an exempt plain-fs probe —
		// the governed manifest is never read on this path) feeds the
		// continuation directly. The transform is built per pass: it closes over
		// the pass's target path (the factory's transform contract carries no
		// path — the module's ledger strings are path-bearing).
		void Furnace.Continue(
			State,
			Target,
			Actor,
			Dir,
			Furnace.Discover(Dir),
			Present.version,
			Transform(Furnace, State, Path),
		);
	} catch (Cause) {
		// NEVER rethrow: a throw inside an fs/observed listener fails the tool
		// call AFTER the mutation already succeeded. Logger-only, the CORE's
		// Suppress composer.
		try {
			State.Context.logger.error?.(Suppress(State.Module, "listener", Cause));
		} catch {
			/* logger optional */
		}
	}
};
