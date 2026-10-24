// State - the plugin's per-apply state (Interface/State): the SHARED factory
// shape (Context, Module, Enabled/Ledger, the machinery maps, the P10
// volatile refresh the factory's State builder registers) plus the
// batch-state's own fields.
//
// Module is "batchstate" - the module-owned ledger lines are `batchstate: ...`
// and the factory's Append prefixes with `<State.Module>: `. The npm identity
// lives in the package name and the `name` export (plugin-dsh-batchstate);
// the ledger prefix is the module's OWN contract string.
import type Entry from "@Interface/Entry.js";
import type FactoryHandle from "@Interface/Factory.js";
import type Gate from "@Interface/Gate.js";
import type Handle from "@Interface/Handle.js";
import type Member from "@Interface/Member.js";
import type { Allowlist, State as Base } from "@playform/plugin-dsh-factory";

interface Extra {
	/** The master switch (config `enabled` - the IDLE-forever posture). */
	On: boolean;
	/** Config `batch` - the batch key (multi-batch isolation; volatile). */
	Batch: string;
	/** Config `stateFile` - the well-known JSON state file, the FALLBACK
	 *  store (volatile). */
	StateFile: string;
	/** Config `domain` - the KV domain name, the PRIMARY store (volatile). */
	DomainName: string;
	/** Config `maxRecent` - the completions ring bound (volatile). */
	MaxRecent: number;
	/** Config `maxProposals` - the spliced-proposal ring bound (volatile). */
	MaxProposals: number;
	/** The injected factory instance (the State builder, the ledger). */
	Factory: FactoryHandle;
	/** The open KV domain (undefined in the JSON fallback). */
	Handle: Handle | undefined;
	/** The persistence chain: the open/recovery and every state write, in
	 *  order (the smokes await it - no sleep). */
	Pending: Promise<void>;
	/** Which store serves this mount: the KV domain, the JSON fallback, or the
	 *  open still in flight (Function/Persist decides on the chain). */
	Store: "domain" | "file" | "pending";
	/** The live members, keyed by the agent id. */
	Members: Map<string, Member>;
	/** The idle queue, in order (the member ids). Named IdleQueue to stay
	 *  clear of the factory's shared pre-open journal `Queue` field. */
	IdleQueue: string[];
	/** The completions ring, newest first, bounded by MaxRecent. */
	Recent: { id: string; status: string; task: string; at: number }[];
	/** The spliced batch proposals, in splice order, bounded by MaxProposals. */
	Proposals: Map<string, Entry>;
	/** The arbiter gates by name (the Gates block's live truth). */
	Gates: Map<string, Gate>;
	/** The message ids already spliced (the live emit and the durable splice
	 *  of one message must project once), bounded by MaxProposals * 2. */
	Seen: string[];
	/** The per-action allowlist (config `policy`, volatile) - the D6 block.
	 *  Named `Allow` because the factory's shared State already owns `Policy`
	 *  (the configured global policy file path); the board is a recorder/
	 *  projection, so its own classes are automatic and the write path stays
	 *  the shipped `approve`. */
	Allow: Allowlist;
}

export default interface State extends Base, Extra {}
