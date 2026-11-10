import type State from "@Interface/State.js";
export default _default;
/**
 * @module Sweep
 *
 * The sweep form: the clock-based schedule, a deadline scan over the watch
 * map inside the event-driven checkpoints.
 *
 * @remarks
 *
 * Every fs/observed event calls the sweep from Function/Watch; nothing else
 * ever calls it. There is NO setTimeout and NO setInterval anywhere in the
 * module: the next event is the bound, exactly the live-containers monitor
 * precedent ("no real timers, the event-driven deadlines").
 *
 * An entry whose `nextSweepAt` deadline has passed on the Clock is swept: it
 * gets one `sweep <path> (<age>ms)` ledger line, its `lastSweepAt` stamp and
 * `sweeps` counter advance, and its next deadline is recomputed as
 * `now + sweepIntervalMs` (0 sweeps at every checkpoint). The pass itself
 * counts once (`LastSweepAt`, `Sweeps`) only when at least one entry was due,
 * so an all-quiet tree costs one Clock read and a loop - the quiet-ledger
 * discipline.
 */
declare function _default(State: State): void;
