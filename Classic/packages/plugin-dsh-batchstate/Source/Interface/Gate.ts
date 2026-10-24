// Gate - one arbiter gate's live state (BATCH-STATE-PLUGIN.md section 7.1,
// the Gates block): the build/smokes truth the compiler renders for every
// lane. The board never runs the gates itself - the parent reports them
// through setGate, and the compiled block carries the programmatic truth
// (green / red / unknown) plus the lane that owns the failure.
export type GateState = "green" | "red" | "unknown";

export default interface Gate {
	/** The gate name (e.g. `build`, `smokes`). */
	name: string;
	/** The gate's state. */
	state: GateState;
	/** The lane that owns the failure ("" when no owner is reported). */
	owner: string;
}
