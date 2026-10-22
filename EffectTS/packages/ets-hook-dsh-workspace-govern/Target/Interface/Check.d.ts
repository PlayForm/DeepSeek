export type Outcome = "satisfied" | "denied" | `denied:${string}` | "n/a" | "recovery";
export interface Obligations {
    /** The contribution check's outcome. */
    contributes: Outcome;
    /** The scope check's outcome. */
    scope: Outcome;
    /** The preconditions check's outcome. */
    preconditions: Outcome;
}
