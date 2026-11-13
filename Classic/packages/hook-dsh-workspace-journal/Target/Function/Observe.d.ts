import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Observe
 *
 * The fs/observed listener: the SYNCHRONOUS RECORDER.
 *
 * @remarks
 *
 * Registered on the ROOT context through the factory's Wire (the exact
 * `Context.root.on("fs/observed", ...)` registration). Discipline:
 * NO awaits, NO I/O, NO throws, no file content ever read.
 *
 * The listener is the RECOVERY CHECKPOINT: a write observed on a path that
 * belongs to a batch still in the `applying` state bumps that batch's
 * progress counter (how far the crash got, persisted as an updated batch
 * record) and ledger lines "observed <path> in <batchId> (progress <n>)".
 * Events outside any open batch are not the journal's concern (the observe
 * hook owns those stamps) - they are silently passed through, no line.
 *
 * Guard chain, in order (the CALL-TIME master switch FIRST: a disabled hook
 * reads State.On at the moment of the call and passes through with ZERO
 * ledger lines - the live-flip law): own actor → excluded. A malformed event
 * is caught and ledgered "failed <path> (<reason>)" (never thrown into the
 * emitter).
 */
declare function _default(State: State, Target: FsTarget | undefined, _Observation: FsObservation | undefined, Actor: object | undefined): void;
