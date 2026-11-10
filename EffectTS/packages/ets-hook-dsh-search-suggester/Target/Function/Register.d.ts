/**
 * @module Register
 *
 * The OPTIONAL registration of the hook's projection unit on
 * `ctx.sessionProjections`, the seam that receives every committed session
 * event once for every agent.
 *
 * @remarks
 * WHY `ctx.inject` AND NOT THE `inject` ARRAY: the registry is a service a
 * shipped composition provides, but the hook must LOAD without it (a bare
 * mount, a test ctx, an older profile). Declaring `sessionProjections` in the
 * plugin's `inject` would make the whole hook pending until the registry
 * exists; the documented optional-contributor form is
 * `ctx.inject(['sessionProjections'], ...)` ("Contributors may preserve
 * optional registration through `ctx.inject(['sessionProjections'], ...)`"),
 * which runs the callback when the service is available and disposes the
 * registration with the child fiber. A context without `inject` (a bare
 * object, an older fake) is skipped silently.
 *
 * THE AWAIT IS PART OF THE CONTRACT: "Callers must await registration before
 * publishing consumers; registration may perform asynchronous work." The
 * callback is async and awaits `register`, so the unit is installed before the
 * plugin's activation is considered finished.
 *
 * NO LEDGER LINE: the ledger strings are byte-exact and module-owned, and the
 * activation proof must stay one line, so a missing registry is a silent
 * degradation (the history stays empty and only an explicit pack may speak) -
 * the same posture as the `workingDirectory` and `workspaceGraph` probes in
 * Function/Apply.
 */
import type { Context } from "@deepseek-ai/cordis";
export default _default;
declare function _default(Context: Context): void;
