export default interface Outcome {
    /** The proposal id the outcome belongs to. */
    proposal: string;
    /** The outcome vocabulary (applied / rejected / denied / expired). */
    outcome: string;
    /** The honest one-line account (the counts, the reason). */
    detail: string;
    /** When the outcome was recorded (epoch ms). */
    at: number;
}
