import type { Allowlist } from "@playform/ets-plugin-dsh-factory";
export default interface Config {
    /** The service's own ledger file (one log per module). */
    logFile: string;
    /** The IDLE-forever posture: false by default; an explicit ACTIVATE. */
    enabled: boolean;
    /** The budget target in tokens (V4-1: target 2k). */
    budgetTokens: number;
    /** The budget hard cap in tokens (configurable; the clamped floor). */
    budgetMaximum: number;
    /** The available lens names (the catalog is Variable/DefaultLens.ts). */
    lenses: string[];
    /** The lens used when the caller names none. */
    lensDefault: string;
    /** The maximum neighbors carried before ranking cuts for budget. */
    neighborLimit: number;
    /** The maximum evidence lines. */
    evidenceLimit: number;
    /** The maximum MAP lines. */
    mapLimit: number;
    /** The workspace name the packet header carries. */
    workspaceName: string;
    /** The per-action allowlist (D6) - the shared factory block. This
     * package's actions are read-only (automatic); it has NO gated action, so
     * the block documents the posture without refusing anything. A resolved
     * pack's `policy` section overrides it per action. */
    policy: Allowlist;
}
