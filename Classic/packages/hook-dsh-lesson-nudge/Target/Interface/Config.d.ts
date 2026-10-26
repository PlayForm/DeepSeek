import type { Allowlist } from "@playform/plugin-dsh-factory";
export default interface Config {
    /** Master switch (default FALSE in the schema - the idle-forever posture). */
    enabled: boolean;
    /** The hook's own ledger file. */
    logFile: string;
    /** The hard cap on reviews one agent may trigger in its lifetime. */
    maxReviewsPerSession: number;
    /** The per-action allowlist (D6): the shared factory block. The nudge READS
     *  the agent's status and SPAWNS the maintenance task, so `read`/`message`
     *  are automatic and `spawn` stays the shipped `approve` - a review is not a
     *  subagent, and this hook never creates one. */
    policy: Allowlist;
}
