import type { Allowlist } from "@playform/plugin-dsh-factory";
export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The default lease TTL (ms). */
    defaultTtlMs: number;
    /** The lease ceiling per holder. */
    maxLeasesPerHolder: number;
    /** The capability ceiling per holder. */
    maxCapabilitiesPerHolder: number;
    /** The revocation grace (ms): how long a revoked capability still
     *  shields its resource's promote protection. */
    revocationGraceMs: number;
    /** The policy table (rules per resource kind). */
    policy: import("./Policy.js").default[];
    /** The per-action allowlist (D6) - the shared factory block. Keyed
     *  `automation` because `policy` is already the residency RULE TABLE
     *  above. This package's actions are read-only and record (automatic); it
     *  has NO gated action, so the block documents the posture without
     *  refusing anything. A resolved pack's `policy` section overrides it per
     *  action. */
    automation: Allowlist;
}
