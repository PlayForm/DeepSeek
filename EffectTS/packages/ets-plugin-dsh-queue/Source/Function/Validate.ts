// Validate - the fail-loud validation (the tool-coach precedent): invalid
// configuration throws at load, never silently defaults. The schema already
// guarantees the types; this pass enforces the COMPOSITION contracts the
// schema cannot express:
//
//   - capacity.main >= 1 and capacity.child >= 1 (the two-active regime
//     needs a positive child cap);
//   - capacity.child <= capacity.main is NOT enforced (a spawned agent's
//     pool is its own lineage, not a share of the main pool).

const Fail = (Message: string): never => {
	throw new Error(`plugin-dsh-queue: ${Message}`);
};

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value):
 * the loader delivers every volatile knob as a cell object, and the
 * composition check needs the PLAIN value (the gitguard/batchstate pattern:
 * `Cell(Raw[...])` before the check). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

export default (Capacity: { main: number; child: number }): void => {
	const Plain = (Cell(Capacity) ?? {}) as { main: number; child: number };
	if (!(Number(Plain.main) >= 1)) {
		Fail("capacity.main must be >= 1");
	}
	if (!(Number(Plain.child) >= 1)) {
		Fail("capacity.child must be >= 1");
	}
};
