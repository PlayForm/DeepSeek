export default interface Config {
    /** Ledger enabled — write the durable log file. */
    log: boolean;
    /** Ledger file (one SEPARATE ledger for the cargo module — never the
     *  package.json governor's log). */
    logFile: string;
    /** Cooldown between update-stage dispatches, per directory (epoch ms). */
    updateCooldownMs: number;
    /** Strict chain pass: strip unknown deps (the whole `name = "…"` entry) in
     *  a governed workspace — the documented Cargo-specific decision. */
    strict: boolean;
    /** Actor tool names whose fs/observed events trigger governing. */
    mutationTools: string[];
    /** Circuit breaker: consecutive update-stage failures per directory before pause. */
    maxUpdateFailures: number;
    /** cargo binary (bare name resolved by the subprocess seam, or an absolute
     *  path — the host PATH is not the user's shell PATH). */
    cargoBin: string;
    /** Global update-policy.json; empty means discovery + built-in default. */
    policyFile: string;
    /** Global pin-policy.json (the keep-list of the FULL-VERSION NORMALIZATION
     *  directive); empty means discovery (the file's own directory →
     *  registry-adjacent → built-in empty default). */
    keepFile: string;
    /** Update stage mode: "cargo" is the only implemented mode (the Rust-side
     *  CLI through ctx.subprocess). Kept as an open string for future modes. */
    updateMode: string;
    /** Excluded path segments (anywhere mode, exclusion-first). */
    exclude: string[];
}
