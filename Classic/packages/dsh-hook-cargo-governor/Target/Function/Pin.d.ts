import type Plan from "@Interface/Plan.js";
export interface Outcome {
    /** The rewritten text (unchanged when nothing matched or on refusal). */
    Text: string;
    /** Whether any line was modified. */
    Changed: boolean;
    /** Refusal message when the rewrite was aborted, else null. */
    Refusal: string | null;
}
export default _default;
declare function _default(Text: string, Plan: Plan, Path: string): Outcome;
