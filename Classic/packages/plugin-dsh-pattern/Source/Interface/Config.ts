import type { Allowlist } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The validated plugin-config shape for the pattern service.
 *
 * @remarks
 *
 * The schema that produces it lives in Variable/Config.ts. Every knob is a
 * volatile cell in the schema; the service reads them through its Configure
 * method, so a hot edit lands on the next call without a remount.
 */
export default interface Config {
	/**
	 * Master switch (default true in the schema - the shipped posture; a
	 * profile turns it off, which logs `disabled (enabled=false)` and leaves
	 * Match abstaining while the service stays resolvable).
	 */
	enabled: boolean;

	/**
	 * Ledger enabled - write the durable log file.
	 */
	log: boolean;

	/**
	 * The service's own ledger file, one log per module.
	 */
	logFile: string;

	/**
	 * The storage-domain name - the PRIMARY store (the KV domain).
	 */
	domain: string;

	/**
	 * The JSON snapshot path - the FALLBACK store, engaged only when the
	 * harness provides no storage facility (or its open fails).
	 */
	storagePath: string;

	/**
	 * Matches below this abstain (the empty result, never a guess).
	 */
	matchThreshold: number;

	/**
	 * Maximum matches returned by one Match call.
	 */
	maxMatches: number;

	/**
	 * Two matches within this epsilon are "equally matched" -> abstain.
	 */
	ambiguityEpsilon: number;

	/**
	 * Confidence half-life in days (the stale-pattern decay).
	 */
	decayHalfLifeDays: number;

	/**
	 * Confidence deltas per outcome.
	 */
	acceptBonus: number;
	rejectPenalty: number;
	appliedBonus: number;
	failedPenalty: number;

	/**
	 * The per-action allowlist (D6): the shared factory block. The service
	 * matches, records and decays - `read`/`record`/`suggest` are automatic;
	 * the write/commit/spawn verdicts stay the shipped `approve`. A resolved
	 * pack's `policy` section overrides it per action.
	 */
	policy: Allowlist;
}
