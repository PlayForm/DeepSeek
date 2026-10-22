// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended
// with the workspace agent's own fields. Every config-derived field below
// is refreshed IN PLACE by the factory's P10 loader/volatile-update
// listener (every cell in the schema is volatile), so a flip takes effect
// on the next tool call without a remount.
//
// `Now` is the CLOCK SEAM (the smoke's fake-clock requirement): when set,
// every time read goes through it; production leaves it undefined.
//
// The debug attachment `ctx.__pluginDshWorkspaceState` (set in Apply) lets
// the end-phase smokes probe the built State - never a return value from
// `apply` (the loader treats apply returns specially).
import type { NodeKind, WorkspaceGraph } from "@Interface/Graph.js";
import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";

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
