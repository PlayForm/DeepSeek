export default interface Config {
    /** Ledger enabled — write the durable log file. */
    log: boolean;
    /** Ledger file (one global log; defaults to the active profile's DSH_HOME). */
    logFile: string;
    /** Cooldown between update-stage dispatches, per directory (epoch ms). */
    updateCooldownMs: number;
    /** Strict chain pass: strip unknown deps in a governed workspace. */
    strict: boolean;
    /** Actor tool names whose fs/observed events trigger governing. */
    mutationTools: string[];
    /** Circuit breaker: consecutive update-stage failures per directory before pause. */
    maxUpdateFailures: number;
    /** Update stage mode: "programmatic" (ncu library in-process) or "bin". */
    updateMode: string;
    /** ncu binary for bin mode (binary name or absolute path — resolved via the host PATH). */
    ncuBin: string;
    /** Global update-policy.json; empty means discovery + built-in default. */
    policyFile: string;
    /** Excluded path segments (anywhere mode, exclusion-first). */
    exclude: string[];
}
