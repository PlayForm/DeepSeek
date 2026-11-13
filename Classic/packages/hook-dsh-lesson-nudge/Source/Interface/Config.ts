import type { Allowlist } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The lesson-nudge hook's validated config shape.
 *
 * @remarks
 *
 * THE INTERVAL IS NOT HERE. How OFTEN a review may run is the review service's knob
 * (`ctx.lesson`, `intervalTurns`), because the service owns the counter and the corpus. This
 * hook owns only its own posture: whether it listens at all, how many reviews one session may
 * trigger (a runaway guard on a service whose interval was misconfigured to 1), and whether it
 * should review at all when the service reports itself unavailable.
 */
export default interface Config {
	/**
	 * Master switch (default TRUE in the schema - the shipped posture; a
	 * profile turns it off, which registers everything and writes only the
	 * `disabled (enabled=false)` ledger line).
	 */
	enabled: boolean;

	/**
	 * Ledger enabled - write the durable log file.
	 */
	log: boolean;

	/**
	 * The hook's own ledger file.
	 */
	logFile: string;

	/**
	 * The hard cap on reviews one agent may trigger in its lifetime.
	 */
	maxReviewsPerSession: number;

	/**
	 * The per-action allowlist (D6): the shared factory block.
	 *
	 * @remarks
	 *
	 * The nudge READS the agent's status and SPAWNS the maintenance task, so `read`/`message` are
	 * automatic and `spawn` stays the shipped `approve` - a review is not a subagent, and this
	 * hook never creates one.
	 */
	policy: Allowlist;
}
