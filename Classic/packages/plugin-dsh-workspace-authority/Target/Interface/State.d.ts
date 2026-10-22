import type Capability from "./Capability.js";
import type FactoryHandle from "./Factory.js";
import type Lease from "./Lease.js";
import type PolicyRule from "./Policy.js";
import type Residency from "./Residency.js";
import type { State as Base } from "@playform/plugin-dsh-factory";
interface Extra {
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
