// State - the hook's per-apply state: the SHARED factory shape (Context,
// Module, Enabled/Ledger/List, the machinery maps, the P10 volatile refresh
// the factory's State builder registers) plus the hook's own fields.
//
// Module is "journal" - the factory's Append prefixes with
// `<State.Module>: `, so the ledger lines render as "journal: opened ...".
// The npm identity lives in the package name and the `name` export
// (hook-dsh-workspace-journal); the ledger prefix is the module's OWN
// contract string.
import type BatchRecord from "@Interface/Batch.js";
import type DomainHandle from "@Interface/Domain.js";
import type EntryRecord from "@Interface/Entry.js";
import type FactoryHandle from "@Interface/Factory.js";
import type { Allowlist, State as Base } from "@playform/ets-plugin-dsh-factory";

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
	/** The per-action allowlist (config `policy`, volatile) - the D6 gate on
	 *  the revert. Named `Allow` because the factory's shared State already
	 *  owns `Policy` (the configured global policy file path); `write`
	 *  defaults to `approve`, so a revert is held and writes nothing. */
	Allow: Allowlist;
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

export default interface State extends Base, Extra {}
