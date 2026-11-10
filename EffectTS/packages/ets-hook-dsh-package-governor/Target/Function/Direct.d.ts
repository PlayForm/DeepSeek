import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
/**
 * @module Direct
 *
 * The raw-write tool's DIRECT-GOVERN entry: the module's two registered steps
 * for the "package.json" basename.
 *
 * @remarks
 *
 * Registered in the factory's GovernSteps registry (SCHEME.md §2.16-2.17). The
 * steps reuse the event-path pieces - Function/Transform (the chain pass),
 * Function/Follow (the update-stage trigger), Function/Decode, the factory's
 * Discover/Parse/Continue - they do NOT re-implement machinery, and every
 * ledger string stays the MODULE'S own, byte-identical.
 *
 * Both steps mirror the Observe path minus its gates (the factory's Govern
 * resolves and selects; the tool's write already happened - the observed
 * version arrives as the `version` argument):
 * - Canonicalize - the g2 discovery (the same two skip lines the Observe
 *   composes, so the direct path matches the event-path behavior), the Stash
 *   seed (the idempotence gate - BEFORE the chain pass's guarded write,
 *   exactly the Observe's seeding), and the detached contained
 *   `Factory.Continue` with the module's transform - WITHOUT the update follow
 *   (Observe.ts:88-102 minus the Follow).
 * - Update - the update stage alone: the same quiet g2 discovery, the Stash
 *   seed BEFORE the stage's writes, then the read + decode + the module's
 *   Follow path (its passage gate, the Filter gate, the first-wins policy pick
 *   and the Dispatch envelope - the module's own in-flight/cooldown/breaker
 *   machinery is unchanged).
 *
 * Contained like the listener: a bug-level throw is logger-only (the CORE's
 * Suppress composer), never the ledger, never a rethrow - the silence
 * invariant; the async continuations catch their own.
 *
 * THE SEQUENTIAL FOLD (factory v0.2.1): each step RETURNS its chain promise
 * instead of discarding it, so the factory's Govern awaits one step's chain to
 * completion (its guarded write + its ledger line) before the next step reads
 * the file - the steps' version-guarded writes can never race.
 */
/**
 * The chain pass WITHOUT the update follow: the direct-path counterpart of the
 * Observe's g2 + seed + Continue sequence.
 */
export declare const Canonicalize: (State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
/**
 * The update stage alone: the module's Follow/Dispatch path with its own
 * in-flight/cooldown/breaker machinery (quiet g2 - the chain-pass skip lines
 * describe a pass this step does not run).
 */
export declare const Update: (State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
