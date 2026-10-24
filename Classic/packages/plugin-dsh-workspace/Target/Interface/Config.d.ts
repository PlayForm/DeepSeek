import type { NodeKind } from "./Graph.js";
import type { Allowlist } from "@playform/plugin-dsh-factory";
/** The agent's config (the family's surface knobs, all volatile). */
export default interface Config {
    /** The durable ledger toggle (the factory's shared cell). */
    log: boolean;
    /** The ledger file (the agent's SEPARATE ledger, one log per module). */
    logFile: string;
    /** Master switch - false = the shipped DISABLED posture, every tool no-ops. */
    enabled: boolean;
    /** The workspace_map default depth (the top modules traversal). */
    mapDepth: number;
    /** The workspace_map maximum module count in one answer. */
    mapMaxModules: number;
    /** The workspace_find default limit (passed to the graph find). */
    findLimit: number;
    /** The workspace_find maximum limit (hard cap, never exceeded). */
    findLimitMax: number;
    /** The workspace_expand default depth (capped at the graph's cap of 3). */
    expandDepth: number;
    /** The workspace_expand maximum neighbor count in one answer. */
    expandMaxNeighbors: number;
    /** The workspace_context packet target budget in tokens (V4-1 §3.5: 2k). */
    packetTokenBudget: number;
    /** The packet hard cap in tokens (configurable per the contract). */
    packetTokenMax: number;
    /** The characters-per-token estimate the packet budget uses (no token
     * counter is injected; the estimate is honest and documented). */
    tokenCharsPerToken: number;
    /** The node kinds the find/map answers include by default (empty = all). */
    kinds: NodeKind[];
    /** The per-action allowlist (D6) - the shared factory block. This
     * package's actions are read-only (automatic); it has NO gated action, so
     * the block documents the posture without refusing anything. A resolved
     * pack's `policy` section overrides it per action. */
    policy: Allowlist;
}
