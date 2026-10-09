// Library - the entry module of the BASE (@playform/ets-base-dsh), the
// single owner of the shared Effect-TS plumbing of the ets-* group: the
// runtime wiring (Source/Service - the Context services, the layer graph
// and the materialize() runtime assembled for the factory shell), the
// fiber/stream machinery (Source/Stream - the Gate transformer and the pure
// reducers; Source/Function/Update - the update envelope) and the hook
// contract types (Source/Interface - the structural contracts the factory
// re-exports to its consumers). Every ets-* package depends on this base;
// the ten consumers additionally depend on ets-hook-dsh-core and
// ets-plugin-dsh-factory. Usable outside the harness entirely (the PlayForm
// ecosystem).
//
// The named exports (the contract surface): the structural types keep the
// names the factory's consumers already use (State/Options/Gate/Transform/
// Output/Journal - plus Actor/Jobs for the factory's own modules); the
// stream machinery keeps the core's public names (Update/Activate/Block/
// Chunk) with the Gate transformer exposed as `StreamGate` - the Interface
// contract's `Gate` (the apply decision type) owns the plain name here,
// exactly as the factory's public API has always used it.

// The structural contracts (moved from the factory's Source/Interface -
// the factory re-exports them unchanged, so its public API is identical):
export type { default as State } from "./Interface/State.js";
export type { default as Options } from "./Interface/Options.js";
export type { default as Gate } from "./Interface/Gate.js";
export type { default as Transform } from "./Interface/Transform.js";
export type { default as Output } from "./Interface/Output.js";
export type { default as Journal } from "./Interface/Journal.js";
export type { default as Actor } from "./Interface/Actor.js";
export type { default as Jobs } from "./Interface/Jobs.js";

// The fiber/stream machinery (moved from the core's Source/Stream and
// Source/Function - the core re-exports them unchanged, so its public API
// is identical):
export { default as Update } from "./Function/Update.js";
export { default as Append } from "./Function/Append.js";
export { default as Activate } from "./Function/Activate.js";
export { default as Block } from "./Stream/Block.js";
export { default as Chunk } from "./Stream/Chunk.js";
export { default as StreamGate } from "./Stream/Gate.js";

// The runtime wiring (moved from the factory's Source/Service and the
// Function modules the services delegate to - the factory imports them from
// here and its public method surface is unchanged):
export { Ledger as LedgerService } from "./Service/Ledger.js";
export { Journal as JournalService } from "./Service/Journal.js";
export { Write as WriteService } from "./Service/Write.js";
export { Govern as GovernService } from "./Service/Govern.js";
export { EVENTS, DOMAIN } from "./Service/Journal.js";
export type { Host } from "./Service/Journal.js";
export { materialize } from "./Service/Runtime.js";
export type { Tags, Services } from "./Service/Runtime.js";
export type { Registry, Selection, Step } from "./Function/Govern.js";
export type { Over } from "./Function/Write.js";
