// State - the service's per-apply state: the SHARED factory shape (Context,
// Module, Enabled/Ledger/List, the machinery maps, the P10 volatile refresh
// the factory's State builder registers) plus the service's own fields.
//
// Module is "context" - the module-owned ledger lines are `context: ...`
// (the byte-stable contract), and the factory's Append prefixes with
// `<State.Module>: `. The npm identity lives in the package name and the
// `name` export (plugin-dsh-workspace-context); the ledger prefix is the
// module's OWN contract string.
import type FactoryHandle from "@Interface/Factory.js";
import type Packet from "@Interface/Packet.js";
import type { Allowlist, State as Base } from "@playform/plugin-dsh-factory";

interface Extra {
	/** Master switch (config `enabled`, volatile) - false = full no-op. */
	On: boolean;
	/** Config `budgetTokens` - the budget target (volatile). */
	BudgetTokens: number;
	/** Config `budgetMaximum` - the budget hard cap (volatile). */
	BudgetMaximum: number;
	/** Config `lenses` - the available lens names (volatile). */
	Lenses: string[];
	/** Config `lensDefault` - the lens used when the caller names none
	 *  (volatile). */
	LensDefault: string;
	/** Config `neighborLimit` - the neighbor cap before budget cuts
	 *  (volatile). */
	NeighborLimit: number;
	/** Config `evidenceLimit` - the evidence line cap (volatile). */
	EvidenceLimit: number;
	/** Config `mapLimit` - the MAP line cap (volatile). */
	MapLimit: number;
	/** Config `workspaceName` - the packet header's workspace name
	 *  (volatile). */
	WorkspaceName: string;
	/** The per-action allowlist (config `policy`, volatile) - the D6 block.
	 *  Named `Allow` because the factory's shared State already owns `Policy`
	 *  (the configured global policy file path). This package's actions are
	 *  automatic; it has NO gated action. */
	Allow: Allowlist;
	/** The injected factory instance (the State builder, the ledger, the
	 *  match). */
	Factory: FactoryHandle;
	/** The injected sibling graph handle (probed; undefined while absent). */
	Graph: unknown | undefined;
	/** The focus tracker: caller -> { id, version } (Function/Focus). */
	Focus: Map<string, { id: string; version: string }>;
	/** The packet memo (Function/Cached), keyed by Function/CacheKey; cleared
	 *  by the trace's `graph/invalidated` consumer (Trace/Invalidate). */
	Cache: Map<string, Packet>;
	/** Performance counters: packets built. */
	Packets: number;
	/** Performance counters: packets that hit the budget clamp. */
	Clamped: number;
	/** Performance counters: packets that reported a stale caller view. */
	Stale: number;
	/** The optional token meter of the harness (probed once; undefined when
	 *  the facility is absent - the budget then estimates chars/4). */
	Meter: { estimate?: (text: string) => number } | undefined;
}

export default interface State extends Base, Extra {}
