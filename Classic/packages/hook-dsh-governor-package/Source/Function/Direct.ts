// Direct - the raw-write tool's DIRECT-GOVERN entry (the factory's
// GovernSteps registry, SCHEME.md §2.16-2.17): the module's two registered
// steps for the "package.json" basename, reusing the event-path pieces -
// Function/Transform (the chain pass), Function/Follow (the update-stage
// trigger), Function/Decode, the factory's Discover/Parse/Continue - do NOT
// re-implement machinery, and every ledger string stays the MODULE'S own,
// byte-identical.
//
// Both steps mirror the Observe path minus its gates (the factory's Govern
// resolves and selects; the tool's write already happened - the observed
// version arrives as the `version` argument):
//
//   Canonicalize - the g2 discovery (the same two skip lines the Observe
//     composes, so the direct path matches the event-path behavior), the
//     Stash seed (the idempotence gate - BEFORE the chain pass's guarded
//     write, exactly the Observe's seeding), and the detached contained
//     `Factory.Continue` with the module's transform - WITHOUT the update
//     follow (Observe.ts:88-102 minus the Follow).
//   Update - the update stage alone: the same quiet g2 discovery, the Stash
//     seed BEFORE the stage's writes, then the read + decode + the module's
//     Follow path (its passage gate, the Filter gate, the first-wins policy
//     pick and the Dispatch envelope - the module's own in-flight/cooldown/
//     breaker machinery is unchanged).
//
// Contained like the listener: a bug-level throw is logger-only (the CORE's
// Suppress composer), never the ledger, never a rethrow - the silence
// invariant; the async continuations catch their own.
//
// THE SEQUENTIAL FOLD (factory v0.2.1): each step RETURNS its chain promise
// instead of discarding it, so the factory's Govern awaits one step's chain
// to completion (its guarded write + its ledger line) before the next step
// reads the file — the steps' version-guarded writes can never race.
import { dirname as Parent } from "node:path";
import Transform from "./Transform.js";
import Follow from "./Follow.js";
import Decode from "./Decode.js";
import { Suppress } from "@playform/hook-dsh-core";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type Passage from "@Interface/Passage.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

// The chain pass WITHOUT the update follow: the direct-path counterpart of
// the Observe's g2 + seed + Continue sequence.
export const Canonicalize = (
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Version: FsVersion,
): Promise<void> | void => {
	try {
		const Path = Target.displayPath;
		const Dir = Parent(Path);
		// g2 - governance context: nearest registry.json (the same walk-up the
		// Observe runs, with its two skip lines - the direct path matches the
		// event-path behavior).
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
		// The idempotence gate BEFORE the write: the direct path mirrors the
		// Observe's seeding (our own re-emits within the async window hit the
		// Stash and are skipped).
		State.Stash.set(Target.targetKey, Version);
		// g3 - contained, AWAITED BY THE FOLD: the factory's Continue with the
		// module's transform, RETURNED as the step's chain promise. No Follow:
		// the canonicalize step is the chain pass only. (Continue contains its
		// own continuations, so the returned promise never rejects.)
		const Passage: Passage = { Current: null, Proceed: false };
		return State.Factory.Continue(
			State,
			Target,
			Actor,
			Dir,
			Found,
			Version,
			Transform(State, Target, Registry, Passage),
		);
	} catch (Cause) {
		// Contained: logger only, never the ledger, never a rethrow (the CORE's
		// Suppress composer).
		try {
			State.Context.logger.error?.(Suppress(State.Module, "listener", Cause));
		} catch {
			/* logger optional */
		}
	}
};

// The update stage alone: the module's Follow/Dispatch path with its own
// in-flight/cooldown/breaker machinery (quiet g2 - the chain-pass skip lines
// describe a pass this step does not run).
export const Update = (
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Version: FsVersion,
): Promise<void> | void => {
	try {
		const Dir = Parent(Target.displayPath);
		// Quiet g2: the update stage's engine inputs (the registry for the
		// Filter gate, the policy path resolved inside Follow/Resolve).
		const Found = State.Factory.Discover(Dir);
		let Registry: Registry | null = null;
		switch (true) {
			case !!Found:
				Registry = State.Factory.Parse(Found) as Registry | null;
				break;
		}
		// The idempotence gate BEFORE the stage's writes.
		State.Stash.set(Target.targetKey, Version);
		// Contained, RETURNED as the step's chain promise (the fold awaits it):
		// read + decode the manifest, open the passage on the no-chain-change
		// path's posture, and hand off to the module's Follow (the passage gate,
		// the Filter gate, the policy pick, Dispatch). The Dispatch envelope
		// resolves when the STAGE IS DISPATCHED — the background job keeps
		// running — so the awaited promise is fast, and the ledger shows the
		// progress exactly as before.
		return (async (): Promise<void> => {
			try {
				let Text: string | null = null;
				try {
					Text = await State.Context.fs.readText(Target);
				} catch {
					/* unreadable: handed to the decoder as null */
				}
				const Passage: Passage = { Current: Decode(Text), Proceed: true };
				await Follow(State, Target, Actor, Dir, Found, Registry, Passage);
			} catch (Cause) {
				// Contained continuation: logger only, never the ledger, never a
				// rethrow.
				try {
					State.Context.logger.error?.(Suppress(State.Module, "continuation", Cause));
				} catch {
					/* logger optional */
				}
			}
		})();
	} catch (Cause) {
		try {
			State.Context.logger.error?.(Suppress(State.Module, "listener", Cause));
		} catch {
			/* logger optional */
		}
	}
};
