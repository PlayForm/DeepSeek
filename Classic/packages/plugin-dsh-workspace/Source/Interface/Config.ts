// Config - the validated plugin-config shape the loader hands to `apply`.
// Cordis validates the exported Schemastery schema while the plugin loads
// and fills every default, so `apply` receives a plain object of exactly
// this shape. The schema that produces it lives in Variable/Config.ts.
//
// EVERY cell is volatile: hot edits commit without remounting the plugin
// (the family's P10 volatile-refresh rule). The agent's own Config = the
// family's surface knobs (WORKSPACE-AGENT.md section 1) - the navigation
// contract's tunables (the map depth, the find limits, the packet budget),
// NOT the graph machinery's knobs (those live in the graph service's own
// Config, WAVE-1-BRIEF.md section 4.5 - the distribution law: each
// package's Config its own).
import type { NodeKind } from "@Interface/Graph.js";

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
}
