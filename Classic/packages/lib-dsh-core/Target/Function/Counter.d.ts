export default _default;
/**
 * @module Counter
 *
 * The monotonic counter: a sequence or revision that only moves forward.
 *
 * @remarks
 *
 * A counter that reissues an id after a restart corrupts the module's
 * records, so the machine has one rule: `Restore` raises the value and never
 * lowers it (the in-memory value is the floor), which is `Resume`'s rule
 * carried by the counter itself. `Next` is the only way to advance.
 *
 * Per instance, never module-level: a mount builds its own counter.
 *
 * Pure: no I/O, no clock, no timers.
 */
declare function _default(Initial?: number): {
    readonly Value: number;
    Next: () => number;
    Restore: (Recovered: number) => void;
};
