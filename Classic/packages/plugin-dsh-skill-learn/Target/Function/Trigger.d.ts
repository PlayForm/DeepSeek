/**
 * @module Trigger
 *
 * The idle-edge gate: the iteration counter, the threshold, both write caps counted on
 * successes, and the maintenance claim.
 *
 * @remarks
 * THE FILE IS NAMED AFTER THE VERDICT, the class after the job. `Trigger` is the
 * twelve-class answer (Interface/Trigger.ts), so the gate that produces it is `Gate`.
 *
 * THE COUNTER IS A DELTA, NOT A LIFETIME TOTAL. The Hermes review fires from a
 * per-tool-iteration counter (`skills.creation_nudge_interval: 15`, consumed at
 * `agent/turn_finalizer.py:864-865`), so `count` is the number of tool-call blocks
 * since the last review and `intervalIterations` is the threshold it must reach. The
 * ledger prints the two as `<n>/<m>` (SKILL-LEARN-PLUGIN.md:506), which only reads
 * correctly when n is the delta.
 *
 * BOTH CAPS COUNT SUCCESSES. The existing nudge hook increments before the work and
 * never decrements, which is why its ledger holds eight `cap reached` lines against
 * zero completed reviews (DSH-Skill-Surface.md:153-157). Here the session counter
 * advances only when the review reports a write that landed, so a refused or failed
 * operation never spends the budget a real write needs (SKILL-LEARN-PLUGIN.md:486-496).
 *
 * THE CLAIM IS THE HARNESS'S OWN IDLE PHASE, not a lock of the plugin's own invention:
 * `runMaintenance` starts the task synchronously after claiming the phase and throws
 * synchronously when a turn or another maintenance task already owns the agent
 * (dsh-agent/lib/types/runtime-types.d.ts:165-174). That throw is the only `busy` this
 * file can report, and it is reported, never retried.
 *
 * THE INTERVAL ADVANCES ON A CLAIMED RUN, not on a write: the counter bounds how often
 * the review may RUN, and the caps bound how much it may WRITE. Advancing it on a
 * successful write would make a corpus with nothing to learn re-run on every idle edge
 * and flood the ledger with the same refusal.
 */
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
