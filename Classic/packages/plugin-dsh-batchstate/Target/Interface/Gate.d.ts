export type GateState = "green" | "red" | "unknown";
export default interface Gate {
    /** The gate name (e.g. `build`, `smokes`). */
    name: string;
    /** The gate's state. */
    state: GateState;
    /** The lane that owns the failure ("" when no owner is reported). */
    owner: string;
}
