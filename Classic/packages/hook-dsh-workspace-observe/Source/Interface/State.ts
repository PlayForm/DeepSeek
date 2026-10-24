// State - the hook's per-apply state: the SHARED factory shape (Context,
// Module, Enabled/Ledger/List, the machinery maps, the P10 volatile refresh
// the factory's State builder registers) plus the hook's own fields.
//
// Module is "observe" - the frozen ledger lines are `observe: ...` (the brief's
// section 5.7 contract), and the factory's Append prefixes with
// `<State.Module>: `. The npm identity lives in the package name and the
// `name` export (hook-dsh-workspace-observe); the ledger prefix is the
// module's OWN contract string.
import type DomainHandle from "@Interface/Domain.js";
import type Stamp from "@Interface/Stamp.js";
import type Factory from "@playform/plugin-dsh-factory";
import type { Allowlist, State as Base } from "@playform/plugin-dsh-factory";

interface Extra {
	/** The master switch (config `enabled` - the IDLE-forever posture). */
	On: boolean;
	/** Config `domain` - the KV domain NAME (volatile). Named DomainName to
	 *  stay clear of the factory's shared `Domain` handle field. */
	DomainName: string;
	/** Config `maxStamps` - the ring bound (volatile). */
	MaxStamps: number;
	/** Config `include` - the optional allowlist (volatile; empty = all). */
	Include: string[];
	/** The injected factory instance (the State builder, the ledger, the
	 *  match, the Wire). */
	Factory: Factory;
	/** The latest stamp per path (keyed by the path). */
	Latest: Map<string, Stamp>;
	/** The bounded ring of the last MaxStamps stamps (oldest first). */
	Ring: Stamp[];
	/** The plugin's own monotonic sequence (never a wall clock). */
	Sequence: number;
	/** The open storage domain handle; `undefined` while pending, after a
	 *  silent skip (absent facility), or after the effect's disposer. */
	Handle: DomainHandle | undefined;
	/** The hook's OWN actor marker object: an event carrying exactly this
	 *  actor is the hook's own and is ignored (the identity check). */
	Self: object;
	/** The per-action allowlist (config `policy`, volatile) - the D6 block.
	 *  Named `Allow` because the factory's shared State already owns `Policy`
	 *  (the configured global policy file path). This package's action class
	 *  is RECORD (automatic); it has NO gated action. */
	Allow: Allowlist;
}

export default interface State extends Base, Extra {}
