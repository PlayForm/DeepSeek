/**
 * @module Duplicate
 *
 * The repeat-event guard: the coalescer for a repeated file state within the
 * window.
 *
 * @remarks
 * A repeat event for the same path that carries the SAME version within the
 * window on the module's clock announces a file state that was already
 * processed (the version token identifies the file state), so it is dropped
 * before any work: no sequence, no line, no storage put, no ledger line. A
 * different version - or a repeat outside the window - is processed
 * normally, so the LAST distinct version always wins. The clock is the
 * monitor's pattern: `State.Now` (the test seam) when set, otherwise the
 * wall clock; there is NO timer anywhere (the family's no-real-timers rule).
 *
 * The guard keeps one entry per path in `State.Seen` (the version plus the
 * clock stamp of the processing). The map is capped at `Limit` with a silent
 * eviction of the oldest entry: a MISSING entry always processes, so the cap
 * can never skip a first sighting. The guard lives on the fs/observed
 * listener only: the service's manual lines are explicit records and are
 * never coalesced.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Path: string, Version: string): boolean;
