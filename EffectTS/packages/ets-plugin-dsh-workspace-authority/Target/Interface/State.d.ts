import type Capability from "./Capability.js";
import type FactoryHandle from "./Factory.js";
import type Lease from "./Lease.js";
import type PolicyRule from "./Policy.js";
import type Residency from "./Residency.js";
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
export default interface State extends Base, Extra {
}
export {};
