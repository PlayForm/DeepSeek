export default interface CheckSet {
    /** The path glob the set applies to (e.g. "**\/*.ts"). */
    glob: string;
    /** The command TEMPLATE the owning monitor would run; recorded for the
     *  accountability trail, never executed here. Substitution tokens
     *  {{path}}, {{basename}}, {{dir}} - template replace only, no eval. */
    command?: string;
    /** True for fast checks (per-edit cadence); false for slow checks. */
    fast: boolean;
    /** The optional slow cadence hint in milliseconds (informational). */
    intervalMs?: number;
}
