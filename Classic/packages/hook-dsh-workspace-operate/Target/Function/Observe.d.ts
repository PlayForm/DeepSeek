import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Observe
 *
 * The operate hook's fs/observed listener: it maintains the hook's own fence
 * tracker of heard versions.
 *
 * @remarks
 *
 * The listener is registered on the ROOT context through the factory's Wire.
 * It is NOT a stamp recorder (that is the observe hook's role): it only
 * maintains the hook's own fence tracker - path -> the latest heard version -
 * which the staleness rule reads to refuse a proposal made against a version
 * the workspace has already moved past.
 *
 * The discipline is the observe hook's: NO awaits, NO I/O, no file content
 * is ever read, the listener NEVER THROWS, and the identity check ignores
 * the hook's own actor. Silent by design - the ledger line for every
 * observed write already comes from the observe hook; a second line would
 * be noise.
 *
 * The CALL-TIME master switch: a disabled hook reads State.On at the moment
 * of the call and passes through with ZERO tracker updates (the live-flip
 * law - a volatile flip acts on the very next event).
 */
declare function _default(State: State, Target: FsTarget | undefined, Observation: FsObservation | undefined, Actor: object | undefined): void;
