// Library - the entry module of the CONVERSATION library
// (@playform/ets-lib-dsh-conversation): the pure, harness-free vocabulary of the
// workspace family's conversation spine (Documentation/Plans/
// RFC-CONVERSATION-SPINE.md section 3.1). Named exports (the harness
// convention - the library is NOT a plugin bundle: no cordis patch, no loader
// contract, no Config, no inject, publishable on its own). The SERVICE lives
// in @playform/ets-plugin-dsh-factory (`ctx.conversation`); every adapting plugin
// carries its own adapter in its own Source/Conversation/ folder and imports
// this vocabulary, so no plugin imports another and the dependency arrow
// points at the library, never at a sibling.
//
// The halves:
//
//   Variable - the vocabulary: the service name and the event names (Names).
//
//   Function - the rules: the pure fold from the session log's records to the
//   conversation state (Fold) and the pure emission of one envelope per
//   state-changing event (Emits), both reusing the shared Resolve and Usage
//   derivations.
//
//   Interface - the types: the envelope (Envelope) and the folded state
//   (State).
export { default as Names } from "./Variable/Names.js";
export { default as Fold } from "./Function/Fold.js";
export { default as Emits } from "./Function/Emits.js";
export type { default as Envelope } from "./Interface/Envelope.js";
export type { default as State } from "./Interface/State.js";

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define). This is a LIBRARY, not a plugin bundle: no Config export
// and no inject - Version sits beside the other named exports.
export { default as Version } from "./Variable/Version.js";
