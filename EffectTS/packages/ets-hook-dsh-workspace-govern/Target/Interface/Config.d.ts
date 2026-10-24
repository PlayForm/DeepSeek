import type { Allowlist } from "@playform/ets-plugin-dsh-factory";
export default interface Config {
    /** The durable ledger file (one log per module). */
    logFile: string;
    /** Ledger enabled - write the durable log file. */
    log: boolean;
    /** The master switch - the IDLE-forever posture: false by default. */
    enabled: boolean;
    /** The tool names whose calls the gate evaluates. */
    tools: string[];
    /** The authorized-scope allowlist (globs; empty = unrestricted). */
    scope: string[];
    /** The excluded target globs - never gated. */
    exclude: string[];
    /** The policy table (rules per proposal kind). */
    policy: import("./Policy.js").default[];
    /** The recovery-table overrides (per-obligation failure behavior). */
    recovery: import("./Recovery.js").default[];
    /** The loop bound: an operation identifier gated more than this many
     *  times is dropped (recursion prevention). */
    loopBound: number;
    /** The decision ring bound. */
    maxDecisions: number;
    /** The per-action allowlist (D6) - the shared factory block. Keyed
     *  `automation`, not `policy`, because this hook's `policy` is already the
     *  decision rule table (the plugin-dsh-route precedent). This package's
     *  action class is RECORD (automatic); it has NO gated action, so the
     *  block documents the posture without refusing anything. A resolved
     *  pack's `policy` section overrides it per action. */
    automation: Allowlist;
}
