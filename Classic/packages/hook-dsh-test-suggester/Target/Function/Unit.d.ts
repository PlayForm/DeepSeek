/**
 * @module Unit
 *
 * The session-projection unit itself: the per-session touch history as a PURE
 * fold over the committed `tool/call` events of one session.
 *
 * @remarks
 * THE FRAMEWORK DRIVES, THE DOMAIN COMPUTES: the registry subscribes to
 * `session/event` once and passes every committed event through `apply`, so
 * this module holds no subscription, no timer and no WeakMap - the same
 * computation the retired `session/event` fold performed, moved onto the seam
 * that actually receives the log. The drive reaches events the old fold never
 * saw: a resumed session's inherited prefix, a call whose post-execute never
 * ran, a call another plugin canceled.
 *
 * THE TWO LOAD-BEARING LAWS:
 *
 * - PURITY. `apply` never mutates `state`: an event the unit ignores
 *   (`tool/result`, `turn/start`, a `tool/call` whose arguments name no path)
 *   returns the SAME reference, which is what tells the registry that nothing
 *   downstream changed. A folding event returns a NEW state object, because
 *   the registry compares by `Object.is` and the persisted cache clones the
 *   value.
 * - PLAIN JSON. The state is `{ Seq, Touches }` of numbers and strings - the
 *   persisted-cache precondition - and `init` returns a FRESH array per
 *   session, never a shared one.
 *
 * The fold reuses the pack library's `Fold`, so the touch derivation (the
 * first path-shaped argument, `file_path` then `path` then `filePath`,
 * backslashes normalized to slashes, a leading `./` stripped) is byte-for-byte
 * the one the package always used, and the current call's own touch is already
 * in the state when `tools/post-execute` runs: the harness commits `tool/call`
 * as the call's STARTED record (recovery names a durable `tool/call` with no
 * result `TOOL_OUTCOME_UNKNOWN`), before dispatch, so the anchor's prior
 * touches are present without any post-execute append.
 */
import type { ProjectionUnit, SessionHistory } from "@Interface/Projection.js";
/**
 * The unit: host-only (no `wire` block), versioned, and pure.
 */
declare const Unit: ProjectionUnit<SessionHistory>;
export default Unit;
