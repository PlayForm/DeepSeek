// Check - the obligation outcome vocabulary (the Check function's return
// contract). One entry per obligation:
//   "satisfied"        - the check evaluated and passed;
//   "denied"           - the check evaluated and failed;
//   "denied:<name>"    - a named precondition evaluated unsatisfied;
//   "n/a"              - the check does not apply to this proposal;
//   "recovery"         - the check could not evaluate and the recovery
//                        table's fail-open row was applied.
export type Outcome = "satisfied" | "denied" | `denied:${string}` | "n/a" | "recovery";

// The three obligations, typed as named properties (no index-signature
// access anywhere downstream).
export interface Obligations {
	/** The contribution check's outcome. */
	contributes: Outcome;
	/** The scope check's outcome. */
	scope: Outcome;
	/** The preconditions check's outcome. */
	preconditions: Outcome;
}
