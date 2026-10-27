import type DomainHandle from "./Domain.js";
import type FactoryHandle from "./Factory.js";
import type { GraphHandle } from "./Graph.js";
import type Proposal from "./Proposal.js";
import type { Allowlist, State as Base } from "@playform/plugin-dsh-factory";
interface Extra {
    /** Config `enabled` - the master switch (volatile; the State builder's
     *  mapped `On` field). */
    On: boolean;
    /** Config `domain` - the KV domain NAME (volatile). Named DomainName to
     *  stay clear of the factory's shared `Domain` handle field. */
    DomainName: string;
    /** Config `maxProposals` - the live-table bound (volatile). */
    MaxProposals: number;
    /** Config `limitDefault` - the default list limit (volatile). */
    LimitDefault: number;
    /** Config `limitMaximum` - the hard list limit (volatile). */
    LimitMaximum: number;
    /** The injected factory instance (the State builder, the ledger, the
     *  match, the Wire). */
    Factory: FactoryHandle;
    /** The live proposal table (keyed by the proposal id, newest last). */
    Proposals: Map<string, Proposal>;
    /** The hook's own monotonic counter for ids and sequences. */
    Sequence: number;
    /** The number of refusals produced (the honest refusal metric). */
    Refused: number;
    /** The versions heard on fs/observed (path -> version) - the hook's own
     *  fence tracker, used by the staleness rule. */
    Observed: Map<string, string>;
    /** The probe-once workspaceGraph seam (the resolution rules' data
     *  source; `undefined` when the service is not mounted - the rules
     *  then refuse `graph-unavailable`, they never guess). */
    Graph: GraphHandle | undefined;
    /** The open storage domain handle; `undefined` while pending, after a
     *  silent skip (absent facility), or after the effect's disposer. */
    Handle: DomainHandle | undefined;
    /** The hook's OWN actor marker object (the identity check for the
     *  hook's own fs/observed emissions, if any). */
    Self: object;
    /** The per-action allowlist (config `policy`, volatile) - the D6 block.
     *  Named `Allow` because the factory's shared State already owns `Policy`
     *  (the configured global policy file path). This package's action class
     *  is SUGGEST (automatic); it has NO gated action. */
    Allow: Allowlist;
}
export default interface State extends Base, Extra {
}
export {};
