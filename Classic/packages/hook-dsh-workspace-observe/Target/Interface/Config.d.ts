import type { Allowlist } from "@playform/plugin-dsh-factory";
/**
 * @module Config
 *
 * The shape the schema (Variable/Config) produces, after the loader validates
 * and defaults it.
 *
 * @remarks
 *
 * Every field is a volatile cell (the values may arrive as `{ get }`
 * references; the factory's State builder unwraps and hot-refreshes them in
 * place).
 */
export default interface Config {
    /**
     * The master switch - the live disabled posture: false by default, and
     * every surface stays registered while disabled (the call-time checks).
     */
    enabled: boolean;
    /**
     * Ledger enabled - write the durable log file.
     */
    log: boolean;
    /**
     * The durable ledger file (one log per module).
     */
    logFile: string;
    /**
     * The KV domain name.
     */
    domain: string;
    /**
     * The ring bound.
     */
    maxStamps: number;
    /**
     * The optional allowlist; empty means every path.
     */
    include: string[];
    /**
     * The excluded path patterns.
     */
    exclude: string[];
    /**
     * The per-action allowlist (D6) - the shared factory block. This package's
     * action class is RECORD (automatic); it has NO gated action, so the block
     * documents the posture without refusing anything. A resolved pack's
     * `policy` section overrides it per action.
     */
    policy: Allowlist;
}
