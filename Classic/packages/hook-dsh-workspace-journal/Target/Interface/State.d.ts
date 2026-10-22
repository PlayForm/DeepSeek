import type BatchRecord from "@Interface/Batch.js";
import type DomainHandle from "@Interface/Domain.js";
import type EntryRecord from "@Interface/Entry.js";
import type FactoryHandle from "@Interface/Factory.js";
import type { State as Base } from "@playform/plugin-dsh-factory";
interface Extra {
    /** The master switch (config `enabled` - the IDLE-forever posture). */
    On: boolean;
    /** Config `domain` - the KV domain NAME (volatile). Named DomainName to
     *  stay clear of the factory's shared `Domain` handle field. */
    DomainName: string;
    /** Config `maxBatches` - the ring bound (volatile). */
    MaxBatches: number;
    /** Config `maxEntryBytes` - the pre-image size cap (volatile). */
    MaxEntryBytes: number;
    /** The injected factory instance (State, Append, Match, Wire, Write). */
    Factory: FactoryHandle;
    /** The open batch records, keyed by batchId. */
    Batches: Map<string, BatchRecord>;
    /** The open batch's entries, keyed `batchId:path` (the revert data). */
    Entries: Map<string, EntryRecord>;
    /** The bounded ring of batchIds (oldest first; the eviction order). */
    Ring: string[];
    /** The open storage domain handle; `undefined` while pending, after a
     *  silent skip (absent facility), or after the effect's disposer. */
    Handle: DomainHandle | undefined;
    /** The hook's OWN actor marker object: an event carrying exactly this
     *  actor is the hook's own and is ignored (the identity check). */
    Self: object;
}
export default interface State extends Base, Extra {
}
export {};
