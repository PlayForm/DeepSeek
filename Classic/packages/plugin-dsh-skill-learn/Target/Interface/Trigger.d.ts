export type Outcome = "disabled" | "below-threshold" | "capped" | "busy" | "no-llm" | "no-route" | "empty-transcript" | "model-failed" | "unparsable" | "nothing" | "refused" | "applied";
/** The trigger's answer: it never throws, and it is always one class. */
export interface Trigger {
    /** The class the run ended in; exactly one of the twelve. */
    readonly outcome: Outcome;
    /** Whether the iteration counter said a review was due. */
    readonly due: boolean;
    /** The counter's value at the moment of the verdict. */
    readonly count: number;
    /** The session's spent write count, so the next run can prove the cap. */
    readonly writes: number;
}
