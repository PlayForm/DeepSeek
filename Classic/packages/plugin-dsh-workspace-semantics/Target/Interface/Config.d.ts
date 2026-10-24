import type { Allowlist } from "@playform/plugin-dsh-factory";
export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The KV domain name. */
    domain: string;
    /** The maximum number of built models kept in the index. */
    maxEntries: number;
    /** The excluded path patterns (no model is built for a matched path). */
    exclude: string[];
    /** The workspace root the deepener's queries run against ("" = the
     *  process working directory). */
    root: string;
    /** Register the harness LSP deepener (the primary TypeScript reference
     *  answer); false keeps the model purely lexical. */
    lsp: boolean;
    /** The opt-in any-file adapter names (`json`, `yaml`, `markdown`,
     *  `package`); empty means the TypeScript/JavaScript adapter only. */
    adapters: string[];
    /** The per-action allowlist (D6) - the shared factory block. This
     *  package's actions are read-only (automatic); it has NO gated action,
     *  so the block documents the posture without refusing anything. A
     *  resolved pack's `policy` section overrides it per action. */
    policy: Allowlist;
}
