import type { Allowlist } from "@playform/ets-plugin-dsh-factory";
export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The batch key (multi-batch isolation). */
    batch: string;
    /** The KV domain name - the PRIMARY store. */
    domain: string;
    /** The well-known JSON state file - the FALLBACK store, engaged only when
     *  the storage facility is absent (or its open fails). */
    stateFile: string;
    /** The completions ring bound. */
    maxRecent: number;
    /** The spliced-proposal ring bound (the board's inbox memory). */
    maxProposals: number;
    /** The per-action allowlist (D6): the shared factory block. The board
     *  records and projects - `read`/`record`/`suggest` are automatic; the
     *  write/commit/spawn verdicts stay the shipped `approve`. A resolved
     *  pack's `policy` section overrides it per action. */
    policy: Allowlist;
}
