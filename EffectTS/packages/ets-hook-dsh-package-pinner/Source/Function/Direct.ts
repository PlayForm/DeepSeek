// Direct - the raw-write tool's DIRECT-GOVERN entry (the factory's
// GovernSteps registry, SCHEME.md §2.16-2.17): the module's registered step
// for the "package.json" basename, reusing the event-path pieces - the
// factory's Continue and the module's Transform - do NOT re-implement
// machinery, and every ledger string stays the MODULE'S own, byte-identical.
//
// Pin - the chain pass alone (the Observe minus the event dependency): the
// Stash seed (the idempotence gate - BEFORE the pass's guarded write, exactly
// the Observe's seeding) and the detached contained `Furnace.Continue` with
// the module's transform. No gates here (the factory's Govern resolves and
// selects; the tool's write already happened - the observed version arrives
// as the `version` argument) and no g2 lines (this module's Observe composes
// none).
//
// Contained like the listener: a bug-level throw is logger-only (the CORE's
// Suppress composer), never the ledger, never a rethrow - the silence
// invariant; the async continuation catches its own.
//
// THE SEQUENTIAL FOLD (factory v0.2.1): the step RETURNS its chain promise
// instead of discarding it, so the factory's Govern awaits the chain to
// completion (its guarded write + its ledger line) before any other
// registered step reads the file — the version-guarded writes can never race.
import { dirname as Parent } from "node:path";
import type Factory from "@playform/ets-plugin-dsh-factory";
import Transform from "./Transform.js";
import { Suppress } from "@playform/ets-hook-dsh-core";
import type State from "@Interface/State.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

export const Pin = (
	Furnace: Factory,
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Version: FsVersion,
): Promise<void> | void => {
	try {
		// The idempotence gate BEFORE the write: the direct path mirrors the
		// Observe's seeding (our own re-emits within the async window hit the
		// Stash and are skipped).
		State.Stash.set(Target.targetKey, Version);
		// g2+g3 - contained, AWAITED BY THE FOLD: the g2 registry walk-up (the
		// factory's Discover, an exempt plain-fs probe) feeds the continuation
		// directly; the transform is built per pass (it closes over the pass's
		// path). The factory's Continue is RETURNED as the step's chain promise
		// (it contains its own continuations, so the returned promise never
		// rejects).
		const Dir = Parent(Target.displayPath);
		return Furnace.Continue(
			State,
			Target,
			Actor,
			Dir,
			Furnace.Discover(Dir),
			Version,
			Transform(Furnace, State, Target.displayPath),
		);
	} catch (Cause) {
		// NEVER a rethrow out of a govern step: logger only (the CORE's Suppress
		// composer).
		try {
			State.Context.logger.error?.(Suppress(State.Module, "listener", Cause));
		} catch {
			/* logger optional */
		}
	}
};
