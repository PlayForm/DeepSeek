import type DomainHandle from "@Interface/Domain.js";
import type FactoryHandle from "@Interface/Factory.js";
import type Record from "@Interface/Record.js";
import type { Allowlist, State as Base } from "@playform/plugin-dsh-factory";
interface Extra {
    /** Config `enabled` - the master switch (volatile; the State builder's
     *  mapped `On` field). */
    On: boolean;
    /** Config `domain` - the KV domain NAME (volatile). */
    DomainName: string;
    /** Config `mode` - the atomicity mode (volatile). */
    Mode: "all-or-nothing" | "survivors";
    /** Config `maxFiles` - the batch size gate (volatile). */
    MaxFiles: number;
    /** Config `maxTotalBytes` - the batch byte gate (volatile). */
    MaxTotalBytes: number;
    /** The per-action allowlist (config `policy`, volatile) - the D6 gate on
     *  the commit. Named `Allow` because the factory's shared State already
     *  owns `Policy` (the configured global policy file path); `commit`
     *  defaults to `approve`, so a batch is held and writes nothing. */
    Allow: Allowlist;
    /** The injected factory instance (the State builder, the ledger, the
     *  Write executor). */
    Factory: FactoryHandle;
    /** The persisted batch records (keyed by the batch id). */
    Batches: Map<string, Record>;
    /** The hook's own monotonic counter for ids and sequences. */
    Sequence: number;
    /** The open storage domain handle; `undefined` while pending, after a
     *  silent skip (absent facility), or after the effect's disposer. */
    Handle: DomainHandle | undefined;
    /** The hook's OWN actor marker object (the identity check for the
     *  hook's own fs/observed emissions). */
    Self: object;
}
export default interface State extends Base, Extra {
}
export {};
