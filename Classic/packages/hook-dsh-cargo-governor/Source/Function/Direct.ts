// Direct - the raw-write tool's DIRECT-GOVERN entry (the factory's
// GovernSteps registry, SCHEME.md §2.16-2.17): the module's two registered
// steps for the "Cargo.toml" basename, reusing the event-path pieces -
// Function/Transform (the TOML pipeline as a string-next factory transform),
// Function/Dispatch (the update-stage envelope), Function/Filter,
// Function/Resolve, Function/Decode, the factory's Discover/Parse/Continue -
// do NOT re-implement machinery, and every ledger string stays the MODULE'S
// own, byte-identical.
//
// Both steps mirror the Observe path minus its gates (the factory's Govern
// resolves and selects; the tool's write already happened - the observed
// version arrives as the `version` argument):
//
//   Cargo - the g2 discovery (the same two skip lines the Observe composes,
//     so the direct path matches the event-path behavior), the Stash seed
//     (the idempotence gate - BEFORE the chain pass's guarded write, exactly
//     the Observe's seeding), and the detached contained `Factory.Continue`
//     with the module's transform - the chain + normalization pass WITHOUT
//     the update stage.
//   Update - the update stage alone: the same quiet g2 discovery, the Stash
//     seed BEFORE the stage's writes, then the read + decode + the passage
//     posture (the first-wins policy path picked here, exactly as the
//     transform records it on the event path) + the Filter gate and the
//     Dispatch handoff - the module's own in-flight/cooldown/breaker
//     machinery is unchanged.
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
import Dispatch from "./Dispatch.js";
import Filter from "./Filter.js";
import Resolve from "./Resolve.js";
import Decode from "./Decode.js";
import { Suppress } from "@playform/hook-dsh-core";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type Passage from "@Interface/Passage.js";
import type PluginFactory from "@playform/dsh-plugin-factory";
import type Manifest from "@Interface/Manifest.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

// The chain + normalization pass WITHOUT the update stage: the direct-path
// counterpart of the Observe's g2 + seed + Continue sequence.
export const Cargo = (
	Factory: PluginFactory,
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Version: FsVersion,
): Promise<void> | void => {
	try {
		const Path = Target.displayPath;
		const Dir = Parent(Path);
		// g2 - governance context: nearest registry.json (walk up), with the two
		// designed skip lines (byte-identical with the Observe's).
		const Found = Factory.Discover(Dir);
		let Registry: Registry | null = null;
		switch (true) {
			case !!Found:
				Registry = Factory.Parse(Found) as Registry | null;
				break;
		}
		switch (true) {
			case !!Found && !Registry:
				Factory.Append(
					State,
					`unreadable registry.json at ${Found} — chain pass skipped for ${Path}`,
				);
				break;
			case !Found:
				Factory.Append(State, `no registry.json found for ${Path} — chain pass skipped`);
				break;
		}
		// The idempotence gate BEFORE the write: the direct path mirrors the
		// Observe's seeding (the factory's Gate READS the Stash; the caller
		// seeds it - the designed split).
		State.Stash.set(Target.targetKey, Version);
		// g3 - contained, AWAITED BY THE FOLD: the factory's Continue with the
		// module's transform, RETURNED as the step's chain promise. No update
		// stage: the cargo step is the chain pass only. (Continue contains its
		// own continuations, so the returned promise never rejects.)
		const Passage: Passage = { Manifest: null, Policy: "", Refused: false };
		return Factory.Continue(
			State,
			Target,
			Actor,
			Dir,
			Found,
			Version,
			Transform(Factory, State, Path, Dir, Found, Registry, Passage),
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

// The update stage alone: the module's Dispatch path with its own
// in-flight/cooldown/breaker machinery (quiet g2 - the chain-pass skip lines
// describe a pass this step does not run).
export const Update = (
	Factory: PluginFactory,
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Version: FsVersion,
): Promise<void> | void => {
	try {
		const Dir = Parent(Target.displayPath);
		// Quiet g2: the update stage's engine inputs (the registry for the
		// Filter gate, the first-wins policy path).
		const Found = Factory.Discover(Dir);
		let Registry: Registry | null = null;
		switch (true) {
			case !!Found:
				Registry = Factory.Parse(Found) as Registry | null;
				break;
		}
		// The idempotence gate BEFORE the stage's writes.
		State.Stash.set(Target.targetKey, Version);
		// Contained, RETURNED as the step's chain promise (the fold awaits it):
		// read + decode the manifest, resolve the policy path (the same
		// first-wins pick the transform records on the event path), open the
		// passage, and hand off through the Filter gate to the module's Dispatch
		// envelope. Dispatch resolves when the STAGE IS DISPATCHED — the
		// background job keeps running — so the awaited promise is fast, and the
		// ledger shows the progress exactly as before.
		return (async (): Promise<void> => {
			try {
				let Text: string | null = null;
				try {
					Text = await State.Context.fs.readText(Target);
				} catch {
					/* unreadable: handed to the decoder as null */
				}
				const Manifest: Manifest | null = Decode(Text);
				// Nothing to update-stage: the manifest is unreadable.
				switch (true) {
					case !Manifest:
						return;
				}
				// Nothing for cargo to do: every dep is chain-governed.
				switch (true) {
					case !Filter(Manifest, Registry):
						return;
				}
				const Passage: Passage = {
					Manifest,
					Policy: Resolve(State, Dir, Found),
					Refused: false,
				};
				await Dispatch(Factory, State, Target, Actor, Dir, Registry, Passage.Policy);
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
