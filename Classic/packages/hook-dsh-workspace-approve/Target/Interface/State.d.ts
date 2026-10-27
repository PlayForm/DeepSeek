import type Binding from "./Binding.js";
import type DomainHandle from "./Domain.js";
import type FactoryHandle from "./Factory.js";
import type { Allowlist, State as Base } from "@playform/plugin-dsh-factory";
interface Extra {
    /** The master switch (mapped from config `enabled` by the State build's
     *  fields map). */
    On: boolean;
    /** Config `domain` - the KV domain NAME (volatile). Named DomainName to
     *  stay clear of the factory's shared `Domain` handle field. */
    DomainName: string;
    /** Config `maxBindings` - the ring bound (volatile). */
    MaxBindings: number;
    /** Config `requireConstraints` - whether a bind without constraints is
     *  rejected (volatile). */
    RequireConstraints: boolean;
    /** The per-action allowlist (config `policy`, volatile) - the D6 block.
     *  Named `Allow` because the factory's shared State already owns `Policy`
     *  (the configured global policy file path). This package's actions are
     *  automatic; it has NO gated action. */
    Allow: Allowlist;
    /** The injected factory instance (the State builder, the ledger, the
     *  Wire). */
    Factory: FactoryHandle;
    /** The bindings by id. */
    ById: Map<string, Binding>;
    /** The bounded ring of the last MaxBindings bindings (oldest first). */
    Ring: Binding[];
    /** The plugin's own monotonic sequence (never a wall clock). */
    Sequence: number;
    /** The open storage domain handle; `undefined` while pending, after a
     *  silent skip (absent facility), or after the effect's disposer. */
    Handle: DomainHandle | undefined;
    /** The hook's OWN actor marker object: an fs/observed event carrying
     *  exactly this actor is the hook's own and is ignored (the identity
     *  check). */
    Self: object;
}
export default interface State extends Base, Extra {
}
export {};
