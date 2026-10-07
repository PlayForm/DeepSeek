// Settle - the post-completion stage of the update continuation: updates the
// per-dir circuit breaker, reports the failure line (the module's own ledger
// string, via the FACTORY's Append - State.Module supplies the
// "hook-dsh-governor-cargo" prefix), then runs U₂ so the observation-policy's version
// record tracks whatever cargo upgrade/verifyCommand wrote to the manifest
// (or the lockfile). Returns the code it was given so the Dispatch chain can
// map it. Never rejects.
//
// U₂ goes through the FACTORY's Refresh: the version is supplied by the
// caller, so the stat-based variant stats first (`ctx.fs.stat(Target)` -
// metadata, never content; the token is never computed or parsed locally)
// and passes the stat's version - the factory registers it in the Stash and
// re-emits fs/observed with the SAME actor (the author's next guarded
// write/edit never fails FS_STALE_VERSION). Best-effort: any failure is
// swallowed here.
//
// All of that is the CORE's shared update-stage envelope
// (@playform/hook-dsh-core, Function/Update) - the family's one flow, shared
// with the parent governor. This module is the delegate: the behavior comes
// from the envelope built in Function/Dispatch (its injected Dependencies -
// the State's maps, the factory delegates and the module's own ledger
// strings, byte-identical: the smokes are the arbiter); the explicit Factory
// parameter stays the module's.
//
// THE EFFECT-TS DELTA (register #13, R5, mirroring the R3 governor): the
// export returns the envelope's TYPED EFFECT half - `Effect<number>` (never
// fails: the U₂ stat is best-effort, `Effect.exit` - the Classic try/catch),
// built from the caller's factory through the module's `Envelope(Factory)`
// shape. The core runs it inside the contained dispatch chain, and the
// module never invokes it standalone, so no runPromise boundary is added
// here - the settlement half of the same pair.
import type PluginFactory from "@playform/plugin-dsh-factory";
import { Envelope } from "./Dispatch.js";
import type State from "@Interface/State.js";
import type { FsTarget } from "@deepseek-ai/dsh-fs";

export default (
	Factory: PluginFactory,
	State: State,
	Dir: string,
	Target: FsTarget,
	Actor: object | undefined,
	Code: number,
) => Envelope(Factory).Settle(State, Dir, Target, Actor, Code);
