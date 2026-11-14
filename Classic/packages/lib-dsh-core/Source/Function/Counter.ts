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
export default (Initial = 0) => {
	let Value = Initial;
	return {
		get Value(): number {
			return Value;
		},
		Next: (): number => (Value += 1),
		Restore: (Recovered: number): void => {
			switch (true) {
				case Recovered > Value:
					Value = Recovered;
					break;
			}
		},
	};
};
