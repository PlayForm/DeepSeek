import type State from "../Interface/State.js";
export default _default;
/**
 * @module Duplicate
 *
 * The repeat-event guard: the thin delegate over the core's coalescer
 * (`@playform/lib-dsh-core`, the `Coalesce` export).
 *
 * @remarks
 *
 * The machinery lives in the core: the 2000 ms window, the 2048-entry cap, the
 * silent eviction of the oldest entry, and the rule that a MISSING entry always
 * processes, so the cap can never skip a first sighting.
 *
 * This file supplies only the module's own two seams:
 *
 * - the clock - `State.Now` (the test seam) when set, otherwise the wall clock;
 *   there is NO timer anywhere (the family's no-real-timers rule);
 * - the Seen map - the module's own `State.Seen`, one entry per path (the
 *   version plus the clock stamp of the processing).
 *
 * A repeat event for the same path that carries the SAME version inside the
 * window announces a file state that was already processed, so it is dropped
 * before any work. A different version - or a repeat outside the window - is
 * processed normally, so the LAST distinct version always wins.
 */
declare function _default(State: State, Path: string, Version: string): boolean;
