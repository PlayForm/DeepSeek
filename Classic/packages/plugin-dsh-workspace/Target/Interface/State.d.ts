import type { NodeKind, WorkspaceGraph } from "./Graph.js";
import type Factory from "@playform/plugin-dsh-factory";
import type { Allowlist, State as Shared } from "@playform/plugin-dsh-factory";
export default interface State extends Shared {
    /** Master switch (config `enabled`, volatile) - false = full no-op. */
    On: boolean;
    /** The workspace_map default depth (config `mapDepth`, volatile). */
    MapDepth: number;
    /** The workspace_map maximum module count (config `mapMaxModules`, volatile). */
    MapMaxModules: number;
    /** The workspace_find default limit (config `findLimit`, volatile). */
    FindLimit: number;
    /** The workspace_find maximum limit (config `findLimitMax`, volatile). */
    FindLimitMax: number;
    /** The workspace_expand default depth (config `expandDepth`, volatile). */
    ExpandDepth: number;
    /** The workspace_expand maximum neighbor count (config `expandMaxNeighbors`, volatile). */
    ExpandMaxNeighbors: number;
    /** The packet token budget (config `packetTokenBudget`, volatile). */
    PacketTokenBudget: number;
    /** The packet token hard cap (config `packetTokenMax`, volatile). */
    PacketTokenMax: number;
    /** The characters-per-token estimate (config `tokenCharsPerToken`, volatile). */
    TokenCharsPerToken: number;
    /** The node kinds filter (config `kinds`, volatile; empty = all). */
    Kinds: NodeKind[];
    /** The per-action allowlist (config `policy`, volatile) - the D6 block.
     * Named `Allow` because the factory's shared State already owns `Policy`
     * (the configured global policy file path). This package's actions are
     * automatic; it has NO gated action. */
    Allow: Allowlist;
    /** The injected factory service itself (the ledger) - set once in Apply. */
    Factory: Factory;
    /** The injected graph service (the query layer's data source) - set once in Apply. */
    Graph: WorkspaceGraph;
    /** The clock seam: an optional override of the time source (the fake clock). */
    Now?: (() => number) | undefined;
    /** The last packet's token estimate (the operational view's own gauge). */
    LastPacketTokens: number;
}
/** The module-owned ledger sink type (the factory's Append with the State bound). */
export type Log = (Message: string) => void;
