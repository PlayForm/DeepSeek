import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Watch
 *
 * The fs/observed listener: the INDEX MAINTAINER.
 *
 * @remarks
 *
 * Registered on the ROOT context through the factory's Wire (the exact
 * `Context.root.on("fs/observed", ...)` registration, the factory's
 * Function/Wire.ts - root registration is the posture that hears ALL
 * fs/observed emissions). The discipline, per the observe hook's frozen
 * contract:
 *
 * ```
 * NO awaits and NO file content is ever read - the event already carries the
 *     version token; the listener only INVALIDATES;
 * the revision is the service's own monotonic counter, never a wall clock;
 * the guard chain, in order:
 *     1. an event whose `actor` is the service's OWN actor object is ignored -
 *        ledger `ignored <path> (own actor)`;
 *     2. a path matching config `exclude` is ignored - ledger
 *        `ignored <path> (excluded)`;
 *     3. a REPEAT event - the same path carrying the same version within the
 *        coalescing window (Function/Duplicate) - is dropped silently: the
 *        model for that file state is already dropped, and a model rebuilt
 *        since was built from the same version, so it stays fresh;
 * a path with a built model gets the model dropped (the next resolve rebuilds
 *     from the new version) and the index revision advances - ledger
 *     `indexed <path> version <v> (revision <r>)`;
 * a path with no model still advances the revision (the index knows the file
 *     changed even before anyone resolves it);
 * the listener NEVER THROWS: the whole body is one try/catch - a malformed
 *     event is caught and ledgered as `failed <path> (<reason>)`.
 * ```
 */
declare function _default(State: State, Target: FsTarget | undefined, Observation: FsObservation | undefined, Actor: object | undefined): void;
