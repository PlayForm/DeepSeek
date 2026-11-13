import type Stamp from "../Interface/Stamp.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Manual
 *
 * The service's manual stamp path: resolve through ctx.fs, stat for the
 * version, record with origin "manual", ledger.
 *
 * @remarks
 *
 * Unlike the listener this path is async (the fs seam is) - it is a
 * deliberate, awaited call, not the synchronous recorder.
 *
 * An ABSENT target is honest: version "absent" (never a fabricated version
 * token). A fs failure throws to the caller (the service's async surface may
 * reject; the listener's silence invariant does not apply here) - but the
 * ledger line still lands first, so the durable record stays complete.
 *
 * The CALL-TIME master switch: a disabled hook refuses with `undefined` and
 * ZERO ledger lines (the live-flip law - State.On is read at the moment of
 * the call, never captured at mount).
 */
declare function _default(State: State, Path: string): Promise<Stamp | undefined>;
