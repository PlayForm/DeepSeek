import type { Allowlist } from "@playform/plugin-dsh-factory";
/**
 * @module Config
 *
 * The schema's runtime shape (Variable/Config.ts produces it).
 */
export default interface Options {
    /**
     * The master switch (the LIVE DISABLED posture: the registration stays
     * in place; a disabled call passes through with zero ledger lines).
     */
    enabled: boolean;
    /**
     * The durable ledger toggle (the Journal gate reads it).
     */
    log: boolean;
    logFile: string;
    maxBlockBytes: number;
    maxChain: number;
    maxSessions: number;
    summaryTerms: number;
    /**
     * The per-session batch-outcome ring bound.
     */
    maxOutcomes: number;
    /**
     * The per-action allowlist (D6): the shared factory block. The member is a
     * passive collector - `record`/`suggest` are automatic; the
     * write/commit/spawn verdicts stay the shipped `approve`. A resolved
     * pack's `policy` section overrides it per action.
     */
    policy: Allowlist;
}
