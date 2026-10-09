// Observe — the fs/observed listener body, now a THIN MODULE RESIDUE (the
// factory owns the machinery): `Factory.Gate` for the whole g1 gate set (the
// exact pre-refactor order — target → actor → kind → Stash idempotence →
// basename → exclusion-first — logs nothing, SCHEME.md §2.6), the MODULE'S
// ledger lines for the outcomes it cares about, `Factory.Discover` +
// `Factory.Parse` for the g2 registry walk-up (the auxiliary plain-fs
// exemption), the Stash seed, and the hand-off to `Factory.Continue` with the
// MODULE'S transform (Function/Transform — SCHEME.md §2.9).
//
// The update stage follows the settled continuation (Function/Follow, chained
// onto the Continue promise) — the factory's refresh re-emit re-enters THIS
// listener, and the Stash token gate (checked inside Factory.Gate, seeded
// here after g2) makes it a no-op.
//
// The critical path stays AWAIT-FREE and THROW-FREE (a throw inside an
// fs/observed listener fails the tool call AFTER the mutation already
// succeeded): every step here is synchronous, and the async stages (the
// chain pass and the update stage) run detached and contained — the factory's
// Continue catches its own, and Function/Follow catches its own, so neither
// can ever surface as a tool error (the silence invariant).
import { dirname as Parent } from "node:path";
import Transform from "./Transform.js";
import Follow from "./Follow.js";
import { Suppress } from "@playform/ets-hook-dsh-core";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type Passage from "@Interface/Passage.js";
import type { FsTarget, FsObservation, FsVersion } from "@deepseek-ai/dsh-fs";

export default (
	State: State,
	Target: FsTarget,
	Observation: FsObservation,
	Actor: object | undefined,
): void => {
	try {
		// g1 — the trigger gate (all deterministic, all guarded, logs nothing).
		const Decision = State.Factory.Gate(State, Target, Observation, Actor, {
			basename: "package.json",
		});
		switch (true) {
			case Decision.reason === "excluded" && !!Decision.path:
				// exclusion-first: internals are never governed (the module's line).
				State.Factory.Append(State, `skipped (excluded) ${Decision.path}`);
				State.Factory.Journal(State, "excluded", Decision.path, "");
				return;
			case !Decision.pass:
				return; // every other gate outcome is silent (pre-refactor behavior)
		}
		const Path = Decision.path as string;
		const Dir = Parent(Path);

		// g2 — governance context: nearest registry.json (the walk-up is an
		// EXEMPT plain-fs discovery — auxiliary files only, never the governed
		// manifest). The parsed object feeds BOTH the readability line and the
		// transform's chain pass (the same pre-refactor g2 semantics).
		const Found = State.Factory.Discover(Dir);
		let Registry: Registry | null = null;
		switch (true) {
			case !!Found:
				Registry = State.Factory.Parse(Found) as Registry | null;
				break;
		}
		switch (true) {
			case !!Found && !Registry:
				State.Factory.Append(
					State,
					`unreadable registry.json at ${Found} — chain pass skipped for ${Path}`,
				);
				break;
			case !Found:
				State.Factory.Append(
					State,
					`no registry.json found for ${Path} — chain pass skipped`,
				);
				break;
		}

		// The observed version token — the gate's `kind === "present"` pass is
		// exactly the union member that carries it (an opaque `FsVersion` the
		// backend owns: stored, compared, never parsed).
		const Version = (Observation as { version?: FsVersion }).version as FsVersion;

		// Idempotence gate BEFORE detaching: our own re-emits within the
		// async window hit this and are skipped.
		State.Stash.set(Target.targetKey, Version);

		// g3+g4 — detached, contained, await-free on the listener path: the
		// factory's Continue (chain pass via the transform) followed by the
		// module's update stage (Follow), off the settled continuation.
		const Passage: Passage = { Current: null, Proceed: false };
		void State.Factory.Continue(
			State,
			Target,
			Actor,
			Dir,
			Found,
			Version,
			Transform(State, Target, Registry, Passage),
		).then(() => Follow(State, Target, Actor, Dir, Found, Registry, Passage));
	} catch (Cause) {
		// NEVER rethrow: a throw inside an fs/observed listener fails the
		// tool call AFTER the mutation already succeeded. Logger-only, the
		// CORE's Suppress composer (the module identity, never a hardcoded
		// prefix).
		try {
			State.Context.logger.error?.(Suppress(State.Module, "listener", Cause));
		} catch {
			/* logger optional */
		}
	}
};
