import type { Allowlist } from "@playform/ets-plugin-dsh-factory";
export default interface Config {
    /** Master switch - the idle-forever posture: false is the default. */
    enabled: boolean;
    /** The hook's own workflow ledger file. */
    logFile: string;
    /** The auto-approve policy mode (conservative by default). */
    autoApprove: "off" | "on";
    /** The intent classes eligible for policy approval (the pattern's
     *  `allowlist` property feeds this at runtime; this list seeds it). */
    allowlist: string[];
    /** Maximum target count the policy may auto-approve. */
    maxAutoTargets: number;
    /** Minimum intent confidence the policy may auto-approve. */
    minConfidence: number;
    /** How long a decided/expired proposal stays in the pending map. */
    pendingTtlMs: number;
    /** The per-action allowlist (D6): the OUTER gate in front of
     * `autoApprove`. The shared factory block - `commit` defaults to
     * `approve`, so a policy auto-approval waits for the user until it is
     * opened. A resolved pack's `policy` section overrides it per action. */
    policy: Allowlist;
}
