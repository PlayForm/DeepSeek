import type Adapter from "@Interface/Adapter.js";
import type DomainHandle from "@Interface/Domain.js";
import type FactoryHandle from "@Interface/Factory.js";
import type Model from "@Interface/Model.js";
import type { State as Base } from "@playform/plugin-dsh-factory";
interface Extra {
    /** The master switch (config `enabled` - the IDLE-forever posture). */
    On: boolean;
    /** Config `domain` - the KV domain NAME (volatile). Named DomainName to
     *  stay clear of the factory's shared `Domain` handle field. */
    DomainName: string;
    /** Config `maxEntries` - the index bound (volatile). */
    MaxEntries: number;
    /** The injected factory instance (the State builder, the ledger, the
     *  match, the Wire). */
    Factory: FactoryHandle;
    /** The injected `fs` facility (readText for the lazy model build). */
    Fs: unknown;
    /** The built models, keyed by path (the index). */
    Index: Map<string, Model>;
    /** The service's own monotonic index revision (never a wall clock). */
    Revision: number;
    /** The adapter registry, keyed by extension (with dot, lowercase). */
    Adapters: Map<string, Adapter>;
    /** The open storage domain handle; `undefined` while pending, after a
     *  silent skip (absent facility), or after the effect's disposer. */
    Handle: DomainHandle | undefined;
    /** The service's OWN actor marker object: an event carrying exactly this
     *  actor is the service's own and is ignored (the identity check). */
    Self: object;
}
export default interface State extends Base, Extra {
}
export {};
