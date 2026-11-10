import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
import type Factory from "@playform/ets-plugin-dsh-factory";
/**
 * @module Direct
 *
 * The raw-write tool's DIRECT-GOVERN entry: the module's registered step for
 * the "package.json" basename.
 *
 * @remarks
 *
 * Registered in the factory's GovernSteps registry (SCHEME.md §2.16-2.17). The
 * step reuses the event-path pieces - the factory's Continue and the module's
 * Transform - they do NOT re-implement machinery, and every ledger string
 * stays the MODULE'S own, byte-identical.
 *
 * Pin - the chain pass alone (the Observe minus the event dependency): the
 * Stash seed (the idempotence gate - BEFORE the pass's guarded write, exactly
 * the Observe's seeding) and the detached contained `Furnace.Continue` with
 * the module's transform. No gates here (the factory's Govern resolves and
 * selects; the tool's write already happened - the observed version arrives as
 * the `version` argument) and no g2 lines (this module's Observe composes
 * none).
 *
 * Contained like the listener: a bug-level throw is logger-only (the CORE's
 * Suppress composer), never the ledger, never a rethrow - the silence
 * invariant; the async continuation catches its own.
 *
 * THE SEQUENTIAL FOLD (factory v0.2.1): the step RETURNS its chain promise
 * instead of discarding it, so the factory's Govern awaits the chain to
 * completion (its guarded write + its ledger line) before any other registered
 * step reads the file - the version-guarded writes can never race.
 */
export declare const Pin: (Furnace: Factory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
