/**
 * @module CheckSet
 *
 * One check-set specification in the hook's classification catalog.
 *
 * @remarks
 *
 * The SHAPE is the live-containers monitor precedent
 * (Variable/DefaultCheckSets.ts there); the SEMANTICS differ by role: the
 * workspace-monitor hook CLASSIFIES and RECORDES - it never executes the
 * command (the check execution stays with the live-containers monitor; this
 * hook owns the watch state, the health accounting and the accountability).
 */
export default interface CheckSet {
	/**
	 * The path glob the set applies to (for example: a double star then a
	 * slash then a `*` then a `.ts` suffix).
	 */
	glob: string;

	/**
	 * The command TEMPLATE the owning monitor would run; recorded for the
	 * accountability trail, never executed here. Substitution tokens
	 * {{path}}, {{basename}}, {{dir}} - template replace only, no eval.
	 */
	command?: string;

	/**
	 * True for fast checks (per-edit cadence); false for slow checks.
	 */
	fast: boolean;

	/**
	 * The optional slow cadence hint in milliseconds (informational).
	 */
	intervalMs?: number;
}
