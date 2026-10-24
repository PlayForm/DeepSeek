import type { Allowlist } from "@playform/ets-plugin-dsh-factory";
export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The KV domain name. */
    domain: string;
    /** The bound-ring capacity. */
    maxBindings: number;
    /** Whether a bind without constraints is rejected. */
    requireConstraints: boolean;
    /** The per-action allowlist (D6) - the shared factory block. This
     *  package's actions are record (automatic); it has NO gated action, so
     *  the block documents the posture without refusing anything. A resolved
     *  pack's `policy` section overrides it per action. */
    policy: Allowlist;
}
