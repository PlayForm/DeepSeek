// Library - the entry module of the TRACE library (@playform/ets-lib-dsh-trace):
// the pure, harness-free vocabulary of the workspace family's trace bus (the
// completion spec's D5). Named exports (the harness convention - the library
// is NOT a plugin bundle: no cordis patch, no loader contract, publishable on
// its own). The SERVICE lives in @playform/ets-plugin-dsh-factory (`ctx.trace`);
// every adapting plugin carries its own adapter in its own Source/Trace/
// folder and imports this vocabulary, so no plugin imports another and the
// indexer is INFERRED from the bus rather than being a separate process or a
// separate package.
//
// The halves:
//
//   Variable - the vocabulary: the service name and the event names (Names)
//   and the ring bound (Bound).
//
//   Function - the mechanics: the envelope completion (Complete), the type
//   guards (IsEnvelope, IsStamp), the coalescing key (Key) and the detached
//   loop (Loop: a coalescing queue keyed by path, ONE in-flight task per key,
//   no timers in the hot path, fail-open, a Flush promise for deterministic
//   smokes, a disposer).
//
//   Interface - the types: the envelope (Envelope), the emitter's draft
//   (Draft), the bus contract (Adapter), the observe/stamp payload (Stamp) and
//   the detached loop's contract (Queue).
import Version from "./Variable/Version.js";

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define). This package has NO loader contract and NO Config - the
// version sits beside the other named exports; it is not a loader key.
export { Version };

export { default as Names } from "./Variable/Names.js";
export { default as Bound } from "./Variable/Bound.js";
export { default as Complete } from "./Function/Complete.js";
export { default as IsEnvelope } from "./Function/IsEnvelope.js";
export { default as IsStamp } from "./Function/IsStamp.js";
export { default as Key } from "./Function/Key.js";
export { default as Loop } from "./Function/Loop.js";
export type { default as Envelope } from "./Interface/Envelope.js";
export type { default as Draft } from "./Interface/Draft.js";
export type { default as Adapter } from "./Interface/Adapter.js";
export type { default as Stamp } from "./Interface/Stamp.js";
export type { default as Queue } from "./Interface/Queue.js";
