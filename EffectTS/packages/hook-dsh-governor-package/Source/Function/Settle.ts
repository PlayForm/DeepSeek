// Settle — the post-completion stage of the update continuation (replaces
// the old child's `exit` callback): updates the per-dir circuit breaker,
// reports the failure line, then runs U₂ — stat the mutated manifest
// (metadata, never content — subsystems/filesystem.md) and hand the stat's
// version to the FACTORY'S Refresh (SCHEME.md §2.8: the Stash registration +
// the same-actor fs/observed re-emit), so the observation-policy's version
// record tracks whatever ncu/verifyCommand wrote. Also removes the in-flight
// disposal registration (P2) and appends the storage journal's
// `update-failed` record (P5). Returns the code it was given so the Dispatch
// chain can map it. Never rejects. Ledger/journal lines go through the
// FACTORY — the strings are the module's.
//
// All of that is the CORE's shared update-stage envelope
// (@playform/hook-dsh-core, Function/Update) — the family's one flow, shared
// with the cargo governor. This module is the delegate: the behavior comes
// from the envelope built in Function/Dispatch (its injected Dependencies -
// the State's maps, the factory delegates and the module's own ledger
// strings, byte-identical: the smokes are the arbiter).
//
// THE EFFECT-TS DELTA (register #13, R3): the export is now the envelope's
// TYPED EFFECT half — `Settle: Effect<number>` (never fails: the U₂ stat is
// best-effort, `Effect.exit` — the Classic try/catch). It stays an
// unadorned re-export (the settlement half of the same pair): the core runs
// it inside the contained dispatch chain, and the module never invokes it
// standalone, so no runPromise boundary is added here.
import { Envelope } from "./Dispatch.js";

export default Envelope.Settle;
