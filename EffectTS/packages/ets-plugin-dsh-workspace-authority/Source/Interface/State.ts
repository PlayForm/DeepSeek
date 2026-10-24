// State - the service's per-apply state: the SHARED factory shape (Context,
// Module, Enabled/Ledger/List, the machinery maps, the P10 volatile refresh
// the factory's State builder registers) plus the service's own fields.
//
// Module is "authority" - the frozen ledger lines are `authority: ...` (the
// module-owned byte-stable contract), and the factory's Append prefixes with
// `<State.Module>: `. The npm identity lives in the package name and the
// `name` export (plugin-dsh-workspace-authority); the ledger prefix is the
// module's OWN contract string.
import type Capability from "@Interface/Capability.js";
import type FactoryHandle from "@Interface/Factory.js";
import type Lease from "@Interface/Lease.js";
import type PolicyRule from "@Interface/Policy.js";
import type Residency from "@Interface/Residency.js";
import type { Allowlist, State as Base } from "@playform/ets-plugin-dsh-factory";

interface Extra {
	/** Master switch (config `enabled`, volatile) - false = full no-op. */
	On: boolean;
	/** Config `defaultTtlMs` - the default lease TTL (volatile). */
	DefaultTtlMs: number;
	/** Config `maxLeasesPerHolder` - the lease ceiling (volatile). */
	MaxLeases: number;
	/** Config `maxCapabilitiesPerHolder` - the capability ceiling (volatile). */
	MaxCapabilities: number;
	/** Config `revocationGraceMs` - the revocation grace (volatile). */
	RevocationGraceMs: number;
	/** Config `policy` - the policy table (volatile). */
	PolicyRules: PolicyRule[];
	/** The per-action allowlist (config `automation`, volatile) - the D6
	 *  block. Keyed `automation` in the config because `policy` is the
	 *  residency rule table; named `Allow` here because the factory's shared
	 *  State already owns `Policy` (the configured global policy file path).
	 *  This package's actions are automatic; it has NO gated action. */
	Allow: Allowlist;
	/** The injected factory instance (the State builder, the ledger). */
	Factory: FactoryHandle;
	/** The capability records, keyed by id. */
	Capabilities: Map<string, Capability>;
	/** The lease records, keyed by id. */
	Leases: Map<string, Lease>;
	/** The residency records, keyed by resource. */
	Residency: Map<string, Residency>;
	/** The graveyard: residency records removed by an "evict" disposition,
	 *  kept keyed by resource so an eviction stays recoverable (a later
	 *  `residence` call on the same resource restores it fresh; a "discard"
	 *  disposition deletes the graveyard entry too). */
	Graveyard: Map<string, Residency>;
	/** The plugin's own monotonic sequence (record ids; never a wall clock
	 *  for identity - wall time appears only in expirations and the ledger). */
	Sequence: number;
}

export default interface State extends Base, Extra {}
