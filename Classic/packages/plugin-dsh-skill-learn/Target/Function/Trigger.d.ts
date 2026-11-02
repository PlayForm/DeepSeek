import type Agent from "../Interface/Agent.js";
import type Configuration from "../Interface/Configuration.js";
import type { ReviewResult } from "../Interface/Review.js";
import type { Trigger } from "../Interface/Trigger.js";
/** What the review body may spend and re-read while it runs. */
export interface Session {
    /** The session's spent write count, re-read before every operation (SKILL-LEARN-PLUGIN.md:492). */
    readonly writes: number;
    /** Count one write that landed; returns the new session total. */
    spend(): number;
}
/** One trip through the gate: the agent, the transcript's count, and the review body. */
export interface Attempt {
    /** The agent the idle edge reported; the cap is keyed on this object (SKILL-LEARN-PLUGIN.md:838). */
    readonly agent: Agent;
    /**
     * The tool-call blocks the session has produced (`Function/Transcript` reports
     * them as `toolCalls`); the counter's input.
     */
    readonly count: number;
    readonly configuration: Configuration;
    /**
     * The review itself, run inside the claimed idle phase. It must never throw:
     * every degradation is an outcome class on its result.
     */
    readonly review: (signal: AbortSignal, session: Session) => Promise<ReviewResult>;
}
export default class Gate {
    /** The tool-call count at each agent's last claimed run, which is the counter's origin. */
    private Reviewed;
    /** The successful writes each agent has spent; the session cap's whole state. */
    private Spent;
    /**
     * Claim the idle phase and run the review inside it, or stop at the first gate
     * that refuses. Never throws, and always answers one of the twelve classes.
     */
    Run(Attempt_: Attempt): Promise<Trigger>;
    /** Start the review in the true idle phase, or report that another owner held the agent. */
    private Claim;
}
