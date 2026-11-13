import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
import type Factory from "@playform/plugin-dsh-factory";
export default _default;
/**
 * @module Observe
 *
 * The fs/observed listener body, THIN over the factory service.
 *
 * @remarks
 *
 * The critical path stays AWAIT-FREE and THROW-FREE (a throw inside an
 * fs/observed listener fails the tool call AFTER the mutation already
 * succeeded): the synchronous gate and discovery run inline, and the API-aware
 * stage (g3) runs as the factory's DETACHED contained continuation -
 * ctx.fs.readText/writeText are async by contract (subsystems/filesystem.md),
 * and the listener must never await.
 *
 * - g1 - the factory's Gate (the trio's exact gate set: displayPath to
 *   mutation-tool actor to kind "present" to Stash idempotence to basename to
 *   exclusion-first). The gate LOGS NOTHING: the module composes its own
 *   ledger lines - the only outcome it cares about is `excluded`.
 * - g2 - policy context: the nearest registry.json walk-up (the factory's
 *   Discover, an exempt plain-fs probe) exists ONLY as a location for the
 *   co-operated pin-policy.json (the factory's ResolvePolicy inside Continue);
 *   it feeds the Continue call directly. The idempotence token is seeded right
 *   before detaching - the factory's GuardedWrite/Refresh refresh it later.
 * - g3 - the handoff: factory.Continue registers the pass's abort controller
 *   (P2), reads the manifest through ctx.fs.readText, resolves the union
 *   keep-list (with the P3 chain-keys interlock), and calls the MODULE'S
 *   transform (Function/Transform - the range law).
 *
 * THE CALL-TIME MASTER SWITCH (the LIVE disabled posture): the listener reads
 * State.On at the moment of the call (never captured at mount); while disabled
 * it passes through with ZERO ledger lines, and the volatile live-flip law
 * makes a flip act on the very next call in both directions.
 */
declare function _default(Furnace: Factory, State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined): void;
