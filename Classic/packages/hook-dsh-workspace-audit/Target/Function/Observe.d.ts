import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Observe
 *
 * The fs/observed listener: the SYNCHRONOUS RECORDER, registered on the ROOT
 * context through the factory's Wire.
 *
 * @remarks
 *
 * Discipline: NO awaits, NO I/O, NO throws, no file content ever read.
 *
 * Every observed write is an OutcomeEvidence line (the traceability graph's
 * outcome node): the operation is the path, the parent is the actor's tag when
 * the event carries one (the recursion-prevention law: every event carries the
 * operation identifier, the parent identifier, and the event category), the
 * category is "outcome-evidence", the outcome is "success" for a present
 * observation and "failure" for an absent one (an observed absence of a
 * previously-present path is the deletion evidence).
 *
 * Guard chain, in order (the CALL-TIME master switch FIRST: a disabled hook
 * reads State.On at the moment of the call and passes through with ZERO
 * ledger lines - the live-flip law):
 *
 * 0. disabled - pass through, silent;
 * 1. own actor, then excluded, then non-empty include. A malformed
 *   event is caught and ledgered "failed <path> (<reason>)".
 *
 * Repeat events (Function/Duplicate): the same path carrying the same version
 * within the coalescing window is dropped before any line - that observed
 * write was already recorded, and the last distinct version always wins. The
 * service's manual lines ride the same Write path and its call-time switch.
 */
declare function _default(State: State, Target: FsTarget | undefined, Observation: FsObservation | undefined, Actor: object | undefined): void;
