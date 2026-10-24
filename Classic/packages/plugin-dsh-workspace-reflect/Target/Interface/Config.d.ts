import type { Allowlist } from "@playform/plugin-dsh-factory";
export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The default rename scope: the block span, or the whole file. */
    propagate: "block" | "file";
    /** The refusal bound on the file size. */
    maxFileBytes: number;
    /** The refusal bound on the span width. */
    maxBlockLines: number;
    /** The per-action allowlist (D6) - the shared factory block. A replace
     *  and a rename WRITE the file, so `write` defaults to `approve` and the
     *  operation is held before the file is read or written. A resolved
     *  pack's `policy` section overrides it per action. */
    policy: Allowlist;
}
