import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
/**
 * @module Direct
 *
 * The raw-write tool's direct-govern entry: the module's two registered steps
 * for the "Cargo.toml" basename in the factory's GovernSteps registry.
 *
 * @remarks
 *
 * SCHEME.md §2.16-2.17. The steps reuse the event-path pieces - Function/
 * Transform (the TOML pipeline as a string-next factory transform), Function/
 * Dispatch (the update-stage envelope), Function/Filter, Function/Resolve,
 * Function/Decode, the factory's Discover/Parse/Continue - do NOT re-implement
 * machinery, and every ledger string stays the MODULE'S own, byte-identical.
 *
 * Both steps mirror the Observe path minus its gates (the factory's Govern
 * resolves and selects; the tool's write already happened - the observed
 * version arrives as the `version` argument):
 *
 * - Cargo - the g2 discovery (the same two skip lines the Observe composes, so
 *   the direct path matches the event-path behavior), the Stash seed (the
 *   idempotence gate - BEFORE the chain pass's guarded write, exactly the
 *   Observe's seeding), and the detached contained `Factory.Continue` with the
 *   module's transform - the chain + normalization pass WITHOUT the update
 *   stage.
 * - Update - the update stage alone: the same quiet g2 discovery, the Stash
 *   seed BEFORE the stage's writes, then the read + decode + the passage
 *   posture (the first-wins policy path picked here, exactly as the transform
 *   records it on the event path) + the Filter gate and the Dispatch handoff -
 *   the module's own in-flight/cooldown/breaker machinery is unchanged.
 *
 * Contained like the listener: a bug-level throw is logger-only (the CORE's
 * Suppress composer), never the ledger, never a rethrow - the silence
 * invariant; the async continuations catch their own.
 *
 * THE SEQUENTIAL FOLD (factory v0.2.1): each step RETURNS its chain promise
 * instead of discarding it, so the factory's Govern awaits one step's chain to
 * completion (its guarded write + its ledger line) before the next step reads
 * the file — the steps' version-guarded writes can never race.
 *
 * THE CALL-TIME MASTER SWITCH (the LIVE disabled posture): both steps read
 * State.On at the moment of the call (never captured at mount) and pass
 * through with ZERO ledger lines while disabled - the volatile live-flip law
 * makes a flip act on the very next call in both directions.
 */
/**
 * The chain + normalization pass WITHOUT the update stage: the direct-path
 * counterpart of the Observe's g2 + seed + Continue sequence.
 */
export declare const Cargo: (Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
/**
 * The update stage alone: the module's Dispatch path with its own
 * in-flight/cooldown/breaker machinery (quiet g2 - the chain-pass skip lines
 * describe a pass this step does not run).
 */
export declare const Update: (Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
